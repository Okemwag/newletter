package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
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

type PaystackService struct {
	db        *gorm.DB
	secretKey string
	publicKey string
	baseURL   string
}

func NewPaystackService() *PaystackService {
	return &PaystackService{
		db:        database.GetDB(),
		secretKey: os.Getenv("PAYSTACK_SECRET_KEY"),
		publicKey: os.Getenv("PAYSTACK_PUBLIC_KEY"),
		baseURL:   "https://api.paystack.co",
	}
}

type InitializePaymentRequest struct {
	Email       string  `json:"email" binding:"required,email"`
	Amount      int64   `json:"amount" binding:"required"` // In kobo/cents
	Currency    string  `json:"currency"`                  // NGN, GHS, ZAR, USD
	PlanID      *string `json:"planId,omitempty"`
	CallbackURL string  `json:"callbackUrl"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

type PaystackInitResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		AuthorizationURL string `json:"authorization_url"`
		AccessCode       string `json:"access_code"`
		Reference        string `json:"reference"`
	} `json:"data"`
}

type PaystackVerifyResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		ID              int64  `json:"id"`
		Status          string `json:"status"`
		Reference       string `json:"reference"`
		Amount          int64  `json:"amount"`
		Currency        string `json:"currency"`
		Channel         string `json:"channel"`
		GatewayResponse string `json:"gateway_response"`
		PaidAt          string `json:"paid_at"`
		Customer        struct {
			Email string `json:"email"`
		} `json:"customer"`
	} `json:"data"`
}

func (s *PaystackService) InitializePayment(userID uuid.UUID, req *InitializePaymentRequest) (*models.Payment, string, error) {
	if s.secretKey == "" {
		return nil, "", errors.New("Paystack not configured")
	}

	// Generate reference
	reference := fmt.Sprintf("PAY_%s_%d", uuid.New().String()[:8], time.Now().Unix())

	// Prepare request payload
	payload := map[string]interface{}{
		"email":     req.Email,
		"amount":    req.Amount,
		"currency":  req.Currency,
		"reference": reference,
	}

	if req.CallbackURL != "" {
		payload["callback_url"] = req.CallbackURL
	}

	if req.Metadata != nil {
		payload["metadata"] = req.Metadata
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, "", err
	}

	// Make API request
	httpReq, err := http.NewRequest("POST", s.baseURL+"/transaction/initialize", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, "", err
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.secretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}

	var result PaystackInitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, "", err
	}

	if !result.Status {
		return nil, "", errors.New(result.Message)
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
	email := req.Email
	payment := &models.Payment{
		UserID:       userID,
		PlanID:       planID,
		Amount:       req.Amount,
		Currency:     req.Currency,
		Status:       models.PaymentStatusPending,
		Provider:     models.PaymentProviderPaystack,
		ProviderRef:  result.Data.Reference,
		Email:        &email,
		BillingCycle: models.BillingCycleMonthly,
	}

	if err := s.db.Create(payment).Error; err != nil {
		return nil, "", errors.New("failed to create payment record")
	}

	return payment, result.Data.AuthorizationURL, nil
}

func (s *PaystackService) VerifyPayment(reference string) (*models.Payment, error) {
	if s.secretKey == "" {
		return nil, errors.New("Paystack not configured")
	}

	// Find payment by reference
	var payment models.Payment
	if err := s.db.Where("provider_ref = ?", reference).First(&payment).Error; err != nil {
		return nil, errors.New("payment not found")
	}

	// Make verification request
	httpReq, err := http.NewRequest("GET", s.baseURL+"/transaction/verify/"+reference, nil)
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.secretKey)

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

	var result PaystackVerifyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if !result.Status {
		return nil, errors.New(result.Message)
	}

	// Update payment status
	switch result.Data.Status {
case "success":
		payment.Status = models.PaymentStatusSuccess
		txnID := fmt.Sprintf("%d", result.Data.ID)
		payment.ProviderTxnID = &txnID
		now := time.Now()
		payment.PaidAt = &now

		// Set expiry based on billing cycle
		expiresAt := now.AddDate(0, 1, 0) // Default 1 month
		payment.ExpiresAt = &expiresAt
	case "failed":
		payment.Status = models.PaymentStatusFailed
		payment.FailureReason = &result.Data.GatewayResponse
	}

	s.db.Save(&payment)

	return &payment, nil
}

func (s *PaystackService) ValidateWebhookSignature(body []byte, signature string) bool {
	mac := hmac.New(sha512.New, []byte(s.secretKey))
	mac.Write(body)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expectedMAC))
}

func (s *PaystackService) HandleWebhook(eventType string, data map[string]interface{}) error {
	switch eventType {
	case "charge.success":
		reference, ok := data["reference"].(string)
		if !ok {
			return errors.New("invalid reference")
		}
		_, err := s.VerifyPayment(reference)
		return err

	case "charge.failed":
		reference, ok := data["reference"].(string)
		if !ok {
			return errors.New("invalid reference")
		}
		var payment models.Payment
		if err := s.db.Where("provider_ref = ?", reference).First(&payment).Error; err != nil {
			return err
		}
		payment.Status = models.PaymentStatusFailed
		s.db.Save(&payment)
		return nil

	default:
		return nil
	}
}

func (s *PaystackService) IsConfigured() bool {
	return s.secretKey != ""
}
