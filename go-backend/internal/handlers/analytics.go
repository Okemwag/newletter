package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/services"
)

type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: services.NewAnalyticsService(),
	}
}

// GET /api/analytics/overview
func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	userID, _ := c.Get("userID")

	stats, err := h.analyticsService.GetOverview(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /api/analytics/growth
func (h *AnalyticsHandler) GetGrowth(c *gin.Context) {
	userID, _ := c.Get("userID")

	days := 30
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 && parsed <= 365 {
			days = parsed
		}
	}

	data, err := h.analyticsService.GetGrowthData(userID.(uuid.UUID), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GET /api/analytics/top-campaigns
func (h *AnalyticsHandler) GetTopCampaigns(c *gin.Context) {
	userID, _ := c.Get("userID")

	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
			limit = parsed
		}
	}

	campaigns, err := h.analyticsService.GetTopCampaigns(userID.(uuid.UUID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, campaigns)
}

// GET /api/track/open/:campaignId/:subscriberId (Public - tracking pixel)
func (h *AnalyticsHandler) TrackOpen(c *gin.Context) {
	campaignID, err := uuid.Parse(c.Param("campaignId"))
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	subscriberID, err := uuid.Parse(c.Param("subscriberId"))
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// Record the event
	event := &models.EmailEvent{
		CampaignID:   campaignID,
		SubscriberID: subscriberID,
		EventType:    models.EmailEventOpen,
		IPAddress:    strPtr(c.ClientIP()),
		UserAgent:    strPtr(c.GetHeader("User-Agent")),
	}
	h.analyticsService.RecordEvent(event)

	// Return 1x1 transparent GIF
	c.Header("Content-Type", "image/gif")
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	transparentGIF := []byte{
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
		0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
		0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
		0x02, 0x44, 0x01, 0x00, 0x3b,
	}
	c.Data(http.StatusOK, "image/gif", transparentGIF)
}

// GET /api/track/click/:campaignId/:subscriberId (Public - link tracking)
func (h *AnalyticsHandler) TrackClick(c *gin.Context) {
	campaignID, err := uuid.Parse(c.Param("campaignId"))
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	subscriberID, err := uuid.Parse(c.Param("subscriberId"))
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	url := c.Query("url")
	if url == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	// Record the event
	metadata := `{"url": "` + url + `"}`
	event := &models.EmailEvent{
		CampaignID:   campaignID,
		SubscriberID: subscriberID,
		EventType:    models.EmailEventClick,
		Metadata:     &metadata,
		IPAddress:    strPtr(c.ClientIP()),
		UserAgent:    strPtr(c.GetHeader("User-Agent")),
	}
	h.analyticsService.RecordEvent(event)

	// Redirect to actual URL
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func strPtr(s string) *string {
	return &s
}
