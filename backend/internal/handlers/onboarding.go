package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/services"
	"github.com/okemwag/newsletter/pkg/utils"
)

type OnboardingHandler struct {
	onboardingService *services.OnboardingService
	fraudService      *services.FraudService
}

func NewOnboardingHandler(onboardingService *services.OnboardingService, fraudService *services.FraudService) *OnboardingHandler {
	return &OnboardingHandler{
		onboardingService: onboardingService,
		fraudService:      fraudService,
	}
}

// CreateAccount handles POST /api/onboarding/start
func (h *OnboardingHandler) CreateAccount(c *gin.Context) {
	var req services.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process password"})
		return
	}

	user, err := h.onboardingService.CreateAccount(req, hashedPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Send verification email
	_, err = h.onboardingService.SendEmailVerification(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send verification email"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created. Please check your email for verification code.",
		"userId":  user.ID,
	})
}

// VerifyEmail handles POST /api/onboarding/verify-email
func (h *OnboardingHandler) VerifyEmail(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Code string `json:"code" binding:"required,len=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.onboardingService.VerifyEmail(userID.(uuid.UUID), req.Code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

// ResendVerification handles POST /api/onboarding/resend-verification
func (h *OnboardingHandler) ResendVerification(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	_, err := h.onboardingService.SendEmailVerification(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send verification email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verification code sent"})
}

// SetupProfile handles PUT /api/onboarding/profile
func (h *OnboardingHandler) SetupProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req services.SetupProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.onboardingService.SetupProfile(userID.(uuid.UUID), req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}

// SetPricing handles PUT /api/onboarding/pricing
func (h *OnboardingHandler) SetPricing(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req services.SetPricingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.onboardingService.SetPricing(userID.(uuid.UUID), req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check for price anomaly
	h.fraudService.CheckPriceAnomaly(userID.(uuid.UUID), req.SubscriptionPrice)

	c.JSON(http.StatusOK, gin.H{"message": "Pricing set"})
}

// SetupPayout handles PUT /api/onboarding/payout
func (h *OnboardingHandler) SetupPayout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req services.SetupPayoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.onboardingService.SetupPayout(userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verification code sent to your phone"})
}

// VerifyPayout handles POST /api/onboarding/verify-payout
func (h *OnboardingHandler) VerifyPayout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Code string `json:"code" binding:"required,len=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.onboardingService.VerifyPayoutPhone(userID.(uuid.UUID), req.Code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payout phone verified"})
}

// SubmitKYC handles PUT /api/onboarding/kyc
func (h *OnboardingHandler) SubmitKYC(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req services.SubmitKYCRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.onboardingService.SubmitKYC(userID.(uuid.UUID), req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "KYC submitted"})
}

// Activate handles POST /api/onboarding/activate
func (h *OnboardingHandler) Activate(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.onboardingService.ActivateCreator(userID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Creator activated! You can now accept payments."})
}

// GetStatus handles GET /api/onboarding/status
func (h *OnboardingHandler) GetStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	status, err := h.onboardingService.GetStatus(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, status)
}
