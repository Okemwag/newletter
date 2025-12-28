package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/services"
)

type ReferralHandler struct {
	referralService *services.ReferralService
}

func NewReferralHandler() *ReferralHandler {
	return &ReferralHandler{
		referralService: services.NewReferralService(),
	}
}

// ========== Program Endpoints ==========

// POST /api/referrals/program
func (h *ReferralHandler) CreateProgram(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.CreateProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	program, err := h.referralService.CreateProgram(&req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, program)
}

// GET /api/referrals/program
func (h *ReferralHandler) GetProgram(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, program)
}

// PUT /api/referrals/program
func (h *ReferralHandler) UpdateProgram(c *gin.Context) {
	userID, _ := c.Get("userID")

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	program, err := h.referralService.UpdateProgram(userID.(uuid.UUID), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, program)
}

// ========== Code Endpoints ==========

// POST /api/referrals/code
func (h *ReferralHandler) GenerateCode(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Get program for this creator
	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Referral program not found"})
		return
	}

	code, err := h.referralService.GenerateCode(program.ID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, code)
}

// GET /api/referrals/code/:code (Public)
func (h *ReferralHandler) GetCode(c *gin.Context) {
	code := c.Param("code")

	referralCode, err := h.referralService.GetCodeByCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, referralCode)
}

// PUT /api/referrals/code/:id/slug
func (h *ReferralHandler) SetCustomSlug(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid code ID"})
		return
	}

	var req struct {
		Slug string `json:"slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.referralService.SetCustomSlug(id, userID.(uuid.UUID), req.Slug); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Custom slug set successfully"})
}

// ========== Tracking Endpoints ==========

// POST /api/referrals/track (Public)
func (h *ReferralHandler) TrackEvent(c *gin.Context) {
	var req services.TrackEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add IP and User-Agent
	ip := c.ClientIP()
	ua := c.GetHeader("User-Agent")
	req.IPAddress = &ip
	req.UserAgent = &ua

	event, err := h.referralService.TrackEvent(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

// GET /api/r/:code (Public - redirect endpoint)
func (h *ReferralHandler) TrackClick(c *gin.Context) {
	code := c.Param("code")

	// Track the click
	ip := c.ClientIP()
	ua := c.GetHeader("User-Agent")
	source := c.Query("utm_source")
	medium := c.Query("utm_medium")
	campaign := c.Query("utm_campaign")

	h.referralService.TrackEvent(&services.TrackEventRequest{
		Code:      code,
		EventType: "click",
		IPAddress: &ip,
		UserAgent: &ua,
		Source:    strPtrRef(source),
		Medium:    strPtrRef(medium),
		Campaign:  strPtrRef(campaign),
	})

	// Redirect to landing page with code
	redirect := c.Query("redirect")
	if redirect == "" {
		redirect = "/"
	}

	c.Redirect(http.StatusTemporaryRedirect, redirect+"?ref="+code)
}

// ========== Analytics Endpoints ==========

// GET /api/referrals/stats
func (h *ReferralHandler) GetStats(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program not found"})
		return
	}

	stats, err := h.referralService.GetStats(program.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /api/referrals/metrics
func (h *ReferralHandler) GetViralMetrics(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program not found"})
		return
	}

	metrics, err := h.referralService.CalculateViralMetrics(program.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

// GET /api/referrals/leaderboard
func (h *ReferralHandler) GetLeaderboard(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program not found"})
		return
	}

	period := c.DefaultQuery("period", "all_time")
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	leaderboard, err := h.referralService.GetLeaderboard(program.ID, period, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, leaderboard)
}

// ========== A/B Testing Endpoints ==========

// POST /api/referrals/ab-test
func (h *ReferralHandler) CreateABVariant(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program not found"})
		return
	}

	var req services.CreateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	variant, err := h.referralService.CreateABVariant(program.ID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, variant)
}

// GET /api/referrals/ab-test
func (h *ReferralHandler) GetABVariants(c *gin.Context) {
	userID, _ := c.Get("userID")

	program, err := h.referralService.GetProgram(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program not found"})
		return
	}

	variants, err := h.referralService.GetVariants(program.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, variants)
}

// GET /api/referrals/ab-test/select (Public)
func (h *ReferralHandler) SelectABVariant(c *gin.Context) {
	programID := c.Query("programId")
	if programID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "programId required"})
		return
	}

	id, err := uuid.Parse(programID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid program ID"})
		return
	}

	variant, err := h.referralService.SelectVariant(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, variant)
}

func strPtrRef(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
