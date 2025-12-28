package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type MpesaService struct {
	db              *gorm.DB
	consumerKey     string
	consumerSecret  string
	shortcode       string
	passkey         string
	callbackURL     string
	baseURL         string
	environment     string // sandbox or production
}

func NewMpesaService() *MpesaService {
	env := os.Getenv("MPESA_ENVIRONMENT")
	if env == "" {
		env = "sandbox"
	}

	baseURL := "https://sandbox.safaricom.co.ke"
	if env == "production" {
		baseURL = "https://api.safaricom.co.ke"
	}

	return &MpesaService{
		db:             database.GetDB(),
		consumerKey:    os.Getenv("MPESA_CONSUMER_KEY"),
		consumerSecret: os.Getenv("MPESA_CONSUMER_SECRET"),
		shortcode:      os.Getenv("MPESA_SHORTCODE"),
		passkey:        os.Getenv("MPESA_PASSKEY"),
		callbackURL:    os.Getenv("MPESA_CALLBACK_URL"),
		baseURL:        baseURL,
		environment:    env,
	}
}

type STKPushRequest struct {
	PhoneNumber string  `json:"phoneNumber" binding:"required"` // Format: 254XXXXXXXXX
	Amount      int64   `json:"amount" binding:"required"`
	PlanID      *string `json:"planId,omitempty"`
	Description string  `json:"description"`
}

type MpesaAuthResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

type MpesaSTKResponse struct {
	MerchantRequestID   string `json:"MerchantRequestID"`
	CheckoutRequestID   string `json:"CheckoutRequestID"`
	ResponseCode        string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage     string `json:"CustomerMessage"`
}

type MpesaCallbackBody struct {
	Body struct {
		StkCallback struct {
			MerchantRequestID string `json:"MerchantRequestID"`
			CheckoutRequestID string `json:"CheckoutRequestID"`
			ResultCode        int    `json:"ResultCode"`
			ResultDesc        string `json:"ResultDesc"`
			CallbackMetadata  *struct {
				Item []struct {
					Name  string      `json:"Name"`
					Value interface{} `json:"Value"`
				} `json:"Item"`
			} `json:"CallbackMetadata,omitempty"`
		} `json:"stkCallback"`
	} `json:"Body"`
}

func (s *MpesaService) getAccessToken() (string, error) {
	if s.consumerKey == "" || s.consumerSecret == "" {
		return "", errors.New("M-Pesa not configured")
	}

	credentials := base64.StdEncoding.EncodeToString(
		[]byte(s.consumerKey + ":" + s.consumerSecret),
	)

	req, err := http.NewRequest("GET", s.baseURL+"/oauth/v1/generate?grant_type=client_credentials", nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Basic "+credentials)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result MpesaAuthResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	return result.AccessToken, nil
}

func (s *MpesaService) generatePassword() (string, string) {
	timestamp := time.Now().Format("20060102150405")
	password := base64.StdEncoding.EncodeToString(
		[]byte(s.shortcode + s.passkey + timestamp),
	)
	return password, timestamp
}

func (s *MpesaService) InitiateSTKPush(userID uuid.UUID, req *STKPushRequest) (*models.Payment, error) {
	accessToken, err := s.getAccessToken()
	if err != nil {
		return nil, err
	}

	password, timestamp := s.generatePassword()

	// Prepare STK push payload
	payload := map[string]interface{}{
		"BusinessShortCode": s.shortcode,
		"Password":          password,
		"Timestamp":         timestamp,
		"TransactionType":   "CustomerPayBillOnline",
		"Amount":            req.Amount,
		"PartyA":            req.PhoneNumber,
		"PartyB":            s.shortcode,
		"PhoneNumber":       req.PhoneNumber,
		"CallBackURL":       s.callbackURL,
		"AccountReference":  fmt.Sprintf("Newsletter_%s", uuid.New().String()[:8]),
		"TransactionDesc":   req.Description,
	}

	if req.Description == "" {
		payload["TransactionDesc"] = "Newsletter Subscription"
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", s.baseURL+"/mpesa/stkpush/v1/processrequest", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Authorization", "Bearer "+accessToken)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result MpesaSTKResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if result.ResponseCode != "0" {
		return nil, errors.New(result.ResponseDescription)
	}

	// Parse plan ID if provided
	var planID *uuid.UUID
	if req.PlanID != nil {
		id, err := uuid.Parse(*req.PlanID)
		if err == nil {
			planID = &id
		}
	}

	// Create payment record
	phone := req.PhoneNumber
	payment := &models.Payment{
		UserID:       userID,
		PlanID:       planID,
		Amount:       req.Amount,
		Currency:     "KES",
		Status:       models.PaymentStatusPending,
		Provider:     models.PaymentProviderMpesa,
		ProviderRef:  result.CheckoutRequestID,
		PhoneNumber:  &phone,
		BillingCycle: models.BillingCycleMonthly,
	}

	if err := s.db.Create(payment).Error; err != nil {
		return nil, errors.New("failed to create payment record")
	}

	return payment, nil
}

func (s *MpesaService) HandleCallback(callback *MpesaCallbackBody) error {
	checkoutID := callback.Body.StkCallback.CheckoutRequestID

	var payment models.Payment
	if err := s.db.Where("provider_ref = ?", checkoutID).First(&payment).Error; err != nil {
		return errors.New("payment not found")
	}

	if callback.Body.StkCallback.ResultCode == 0 {
		// Payment successful
		payment.Status = models.PaymentStatusSuccess
		now := time.Now()
		payment.PaidAt = &now

		// Extract M-Pesa receipt number from callback metadata
		if callback.Body.StkCallback.CallbackMetadata != nil {
			for _, item := range callback.Body.StkCallback.CallbackMetadata.Item {
				if item.Name == "MpesaReceiptNumber" {
					if receipt, ok := item.Value.(string); ok {
						payment.ProviderTxnID = &receipt
					}
				}
			}
		}

		// Set expiry
		expiresAt := now.AddDate(0, 1, 0)
		payment.ExpiresAt = &expiresAt
	} else {
		// Payment failed
		payment.Status = models.PaymentStatusFailed
		reason := callback.Body.StkCallback.ResultDesc
		payment.FailureReason = &reason
	}

	return s.db.Save(&payment).Error
}

func (s *MpesaService) QuerySTKStatus(checkoutRequestID string) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.Where("provider_ref = ?", checkoutRequestID).First(&payment).Error; err != nil {
		return nil, errors.New("payment not found")
	}
	return &payment, nil
}

func (s *MpesaService) IsConfigured() bool {
	return s.consumerKey != "" && s.consumerSecret != "" && s.shortcode != ""
}
