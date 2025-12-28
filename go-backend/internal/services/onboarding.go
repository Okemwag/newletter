package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/types"
	"gorm.io/gorm"
)

// Onboarding price limits (KES)
const (
	MinSubscriptionPrice = 10000  // KES 100 in cents
	MaxSubscriptionPrice = 1000000 // KES 10,000 in cents
	VerificationCodeExpiry = 15 * time.Minute
	MaxVerificationAttempts = 5
)

type OnboardingService struct {
	db *gorm.DB
}

func NewOnboardingService(db *gorm.DB) *OnboardingService {
	return &OnboardingService{db: db}
}

// --- Step 1: Account Creation ---

type CreateAccountRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Country   string `json:"country"`
}

func (s *OnboardingService) CreateAccount(req CreateAccountRequest, hashedPassword string) (*models.User, error) {
	country := req.Country
	if country == "" {
		country = "KE"
	}

	user := &models.User{
		Email:         req.Email,
		Password:      hashedPassword,
		FirstName:     req.FirstName,
		LastName:      req.LastName,
		Role:          types.UserRoleCreator,
		Country:       country,
		CreatorStatus: types.CreatorStatusDraft,
		OnboardingStep: 1,
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	// Create balance record
	balance := &models.CreatorBalance{CreatorID: user.ID}
	if err := s.db.Create(balance).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// --- Step 2: Email Verification ---

func (s *OnboardingService) SendEmailVerification(userID uuid.UUID) (*models.EmailVerification, error) {
	code := generateCode(6)
	
	verification := &models.EmailVerification{
		UserID:    userID,
		Code:      code,
		ExpiresAt: time.Now().Add(VerificationCodeExpiry),
	}

	if err := s.db.Create(verification).Error; err != nil {
		return nil, err
	}

	// TODO: Send email with code
	return verification, nil
}

func (s *OnboardingService) VerifyEmail(userID uuid.UUID, code string) error {
	var verification models.EmailVerification
	err := s.db.Where("user_id = ? AND verified = false", userID).
		Order("created_at DESC").
		First(&verification).Error
	if err != nil {
		return errors.New("no pending verification found")
	}

	if verification.Attempts >= MaxVerificationAttempts {
		return errors.New("too many attempts, please request a new code")
	}

	if time.Now().After(verification.ExpiresAt) {
		return errors.New("verification code has expired")
	}

	if verification.Code != code {
		s.db.Model(&verification).UpdateColumn("attempts", verification.Attempts+1)
		return errors.New("invalid verification code")
	}

	// Mark verified
	s.db.Model(&verification).Update("verified", true)

	// Update user status
	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"email_verified":   true,
		"creator_status":   types.CreatorStatusEmailVerified,
		"onboarding_step":  2,
	}).Error
}

// --- Step 3: Newsletter Profile ---

type SetupProfileRequest struct {
	NewsletterName string `json:"newsletterName" binding:"required,min=3,max=200"`
	NewsletterDesc string `json:"newsletterDesc" binding:"max=1000"`
	SenderName     string `json:"senderName" binding:"required,max=100"`
	SenderEmail    string `json:"senderEmail"` // Optional, auto-generate if empty
}

func (s *OnboardingService) SetupProfile(userID uuid.UUID, req SetupProfileRequest) error {
	updates := map[string]interface{}{
		"newsletter_name": req.NewsletterName,
		"newsletter_desc": req.NewsletterDesc,
		"sender_name":     req.SenderName,
		"creator_status":  types.CreatorStatusProfileCreated,
		"onboarding_step": 3,
	}

	if req.SenderEmail != "" {
		updates["sender_email"] = req.SenderEmail
	}

	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
}

// --- Step 4: Pricing Setup ---

type SetPricingRequest struct {
	SubscriptionPrice int64 `json:"subscriptionPrice" binding:"required,min=10000,max=1000000"` // KES in cents
}

func (s *OnboardingService) SetPricing(userID uuid.UUID, req SetPricingRequest) error {
	if req.SubscriptionPrice < MinSubscriptionPrice {
		return fmt.Errorf("minimum price is KES %d", MinSubscriptionPrice/100)
	}
	if req.SubscriptionPrice > MaxSubscriptionPrice {
		return fmt.Errorf("maximum price is KES %d", MaxSubscriptionPrice/100)
	}

	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"subscription_price": req.SubscriptionPrice,
		"creator_status":     types.CreatorStatusPricingSet,
		"onboarding_step":    4,
	}).Error
}

// --- Step 5: Payout Method Setup ---

type SetupPayoutRequest struct {
	PayoutPhone string `json:"payoutPhone" binding:"required"` // Format: 254XXXXXXXXX
}

func (s *OnboardingService) SetupPayout(userID uuid.UUID, req SetupPayoutRequest) (*models.PhoneVerification, error) {
	// Validate phone format (Kenya)
	if len(req.PayoutPhone) != 12 || req.PayoutPhone[:3] != "254" {
		return nil, errors.New("phone must be in format 254XXXXXXXXX")
	}

	// Update payout phone
	if err := s.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"payout_phone":    req.PayoutPhone,
		"onboarding_step": 5,
	}).Error; err != nil {
		return nil, err
	}

	// Create phone verification
	code := generateCode(6)
	verification := &models.PhoneVerification{
		UserID:      userID,
		PhoneNumber: req.PayoutPhone,
		Code:        code,
		ExpiresAt:   time.Now().Add(VerificationCodeExpiry),
	}

	if err := s.db.Create(verification).Error; err != nil {
		return nil, err
	}

	// TODO: Send SMS with code
	return verification, nil
}

func (s *OnboardingService) VerifyPayoutPhone(userID uuid.UUID, code string) error {
	var verification models.PhoneVerification
	err := s.db.Where("user_id = ? AND verified = false", userID).
		Order("created_at DESC").
		First(&verification).Error
	if err != nil {
		return errors.New("no pending phone verification found")
	}

	if verification.Attempts >= MaxVerificationAttempts {
		return errors.New("too many attempts")
	}

	if time.Now().After(verification.ExpiresAt) {
		return errors.New("code expired")
	}

	if verification.Code != code {
		s.db.Model(&verification).UpdateColumn("attempts", verification.Attempts+1)
		return errors.New("invalid code")
	}

	s.db.Model(&verification).Update("verified", true)

	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"payout_phone_verified": true,
		"creator_status":        types.CreatorStatusPayoutPendingReview,
	}).Error
}

// --- Step 6: Soft KYC ---

type SubmitKYCRequest struct {
	LegalName   string `json:"legalName" binding:"required,min=3,max=200"`
	PhoneNumber string `json:"phoneNumber" binding:"required"` // Personal phone
}

func (s *OnboardingService) SubmitKYC(userID uuid.UUID, req SubmitKYCRequest) error {
	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"legal_name":      req.LegalName,
		"phone_number":    req.PhoneNumber,
		"onboarding_step": 6,
	}).Error
}

// --- Step 7: Activate Creator ---

func (s *OnboardingService) ActivateCreator(userID uuid.UUID) error {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return err
	}

	// Verify all requirements
	if !user.EmailVerified {
		return errors.New("email not verified")
	}
	if user.NewsletterName == nil || *user.NewsletterName == "" {
		return errors.New("newsletter profile not set")
	}
	if user.SubscriptionPrice < MinSubscriptionPrice {
		return errors.New("pricing not set")
	}
	if !user.PayoutPhoneVerified {
		return errors.New("payout phone not verified")
	}

	now := time.Now()
	return s.db.Model(&user).Updates(map[string]interface{}{
		"creator_status":   types.CreatorStatusActiveEarning,
		"onboarding_step":  7,
		"activated_at":     now,
	}).Error
}

// --- Get Onboarding Status ---

type OnboardingStatus struct {
	Step             int                  `json:"step"`
	Status           types.CreatorStatus  `json:"status"`
	EmailVerified    bool                 `json:"emailVerified"`
	ProfileSet       bool                 `json:"profileSet"`
	PricingSet       bool                 `json:"pricingSet"`
	PayoutVerified   bool                 `json:"payoutVerified"`
	KYCSubmitted     bool                 `json:"kycSubmitted"`
	Activated        bool                 `json:"activated"`
}

func (s *OnboardingService) GetStatus(userID uuid.UUID) (*OnboardingStatus, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	return &OnboardingStatus{
		Step:            user.OnboardingStep,
		Status:          user.CreatorStatus,
		EmailVerified:   user.EmailVerified,
		ProfileSet:      user.NewsletterName != nil && *user.NewsletterName != "",
		PricingSet:      user.SubscriptionPrice >= MinSubscriptionPrice,
		PayoutVerified:  user.PayoutPhoneVerified,
		KYCSubmitted:    user.LegalName != nil && *user.LegalName != "",
		Activated:       user.ActivatedAt != nil,
	}, nil
}

// --- Helper ---

func generateCode(length int) string {
	const digits = "0123456789"
	code := make([]byte, length)
	for i := range code {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		code[i] = digits[n.Int64()]
	}
	return string(code)
}
