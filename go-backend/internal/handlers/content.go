package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/services"
	"github.com/okemwag/newsletter/internal/types"
)

type ContentHandler struct {
	contentService *services.ContentService
}

func NewContentHandler() *ContentHandler {
	return &ContentHandler{
		contentService: services.NewContentService(),
	}
}

// POST /api/content
func (h *ContentHandler) Create(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req services.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	content, err := h.contentService.Create(&req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, content)
}

// GET /api/content
func (h *ContentHandler) GetAll(c *gin.Context) {
	// Optional: filter by creator
	creatorIDParam := c.Query("creatorId")
	var creatorID *uuid.UUID
	if creatorIDParam != "" {
		id, err := uuid.Parse(creatorIDParam)
		if err == nil {
			creatorID = &id
		}
	}

	contents, err := h.contentService.FindAll(creatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contents)
}

// GET /api/content/:id
func (h *ContentHandler) GetOne(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	content, err := h.contentService.FindOne(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, content)
}

// PUT /api/content/:id
func (h *ContentHandler) Update(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	var req services.UpdateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	content, err := h.contentService.Update(id, &req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "you do not have permission to update this content" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "content not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, content)
}

// DELETE /api/content/:id
func (h *ContentHandler) Delete(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	if err := h.contentService.Remove(id, userID.(uuid.UUID)); err != nil {
		if err.Error() == "you do not have permission to delete this content" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "content not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Content deleted successfully"})
}

// GET /api/content/status/:status
func (h *ContentHandler) GetByStatus(c *gin.Context) {
	statusParam := c.Param("status")
	status := types.ContentStatus(statusParam)

	// Validate status
	if status != types.ContentStatusDraft &&
		status != types.ContentStatusPublished &&
		status != types.ContentStatusScheduled {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// Optional: filter by creator
	creatorIDParam := c.Query("creatorId")
	var creatorID *uuid.UUID
	if creatorIDParam != "" {
		id, err := uuid.Parse(creatorIDParam)
		if err == nil {
			creatorID = &id
		}
	}

	contents, err := h.contentService.FindByStatus(status, creatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contents)
}

// GET /api/content/published
func (h *ContentHandler) GetPublished(c *gin.Context) {
	// Check subscription status from user preferences if authenticated
	var subscriptionStatus *types.SubscriptionStatus

	// Try to get user's subscription status
	_, exists := c.Get("userID")
	if exists {
		// Could enhance to get actual subscription status from user preferences
		// For now, default to free
		free := types.SubscriptionFree
		subscriptionStatus = &free
	}

	contents, err := h.contentService.FindPublishedContent(subscriptionStatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contents)
}
