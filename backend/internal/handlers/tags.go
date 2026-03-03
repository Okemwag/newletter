package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/services"
)

type TagHandler struct {
	tagService *services.TagService
}

func NewTagHandler() *TagHandler {
	return &TagHandler{
		tagService: services.NewTagService(),
	}
}

// POST /api/tags
func (h *TagHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag, err := h.tagService.Create(&req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

// GET /api/tags
func (h *TagHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")

	tags, err := h.tagService.FindAll(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// GET /api/tags/:id
func (h *TagHandler) GetOne(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
		return
	}

	tag, err := h.tagService.FindByID(id, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Get subscriber count
	count, _ := h.tagService.GetSubscriberCount(id)

	c.JSON(http.StatusOK, gin.H{
		"tag":             tag,
		"subscriberCount": count,
	})
}

// PUT /api/tags/:id
func (h *TagHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
		return
	}

	var req services.UpdateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag, err := h.tagService.Update(id, &req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tag)
}

// DELETE /api/tags/:id
func (h *TagHandler) Delete(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
		return
	}

	if err := h.tagService.Delete(id, userID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag deleted successfully"})
}
