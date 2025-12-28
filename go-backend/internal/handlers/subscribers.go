package handlers

import (
	"encoding/csv"
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/services"
)

type SubscriberHandler struct {
	subscriberService *services.SubscriberService
}

func NewSubscriberHandler() *SubscriberHandler {
	return &SubscriberHandler{
		subscriberService: services.NewSubscriberService(),
	}
}

// POST /api/subscribers
func (h *SubscriberHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.CreateSubscriberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subscriber, err := h.subscriberService.Create(&req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, subscriber)
}

// GET /api/subscribers
func (h *SubscriberHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")

	filter := &services.SubscriberFilter{}

	// Parse status filter
	if status := c.Query("status"); status != "" {
		s := models.SubscriberStatus(status)
		filter.Status = &s
	}

	// Parse tag filter
	if tagID := c.Query("tagId"); tagID != "" {
		if id, err := uuid.Parse(tagID); err == nil {
			filter.TagID = &id
		}
	}

	// Parse search
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	// Parse pagination
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			filter.Page = p
		}
	}
	if pageSize := c.Query("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			filter.PageSize = ps
		}
	}

	subscribers, total, err := h.subscriberService.FindAll(userID.(uuid.UUID), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  subscribers,
		"total": total,
		"page":  filter.Page,
	})
}

// GET /api/subscribers/:id
func (h *SubscriberHandler) GetOne(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscriber ID"})
		return
	}

	subscriber, err := h.subscriberService.FindByID(id, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, subscriber)
}

// PUT /api/subscribers/:id
func (h *SubscriberHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscriber ID"})
		return
	}

	var req services.UpdateSubscriberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subscriber, err := h.subscriberService.Update(id, &req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, subscriber)
}

// DELETE /api/subscribers/:id
func (h *SubscriberHandler) Delete(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscriber ID"})
		return
	}

	if err := h.subscriberService.Delete(id, userID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscriber deleted successfully"})
}

// POST /api/subscribers/import
func (h *SubscriberHandler) Import(c *gin.Context) {
	userID, _ := c.Get("userID")

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)

	// Read header
	header, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CSV format"})
		return
	}

	// Find column indices
	emailIdx := -1
	firstNameIdx := -1
	lastNameIdx := -1
	for i, col := range header {
		switch col {
		case "email", "Email", "EMAIL":
			emailIdx = i
		case "first_name", "firstName", "First Name":
			firstNameIdx = i
		case "last_name", "lastName", "Last Name":
			lastNameIdx = i
		}
	}

	if emailIdx == -1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV must have an 'email' column"})
		return
	}

	// Parse rows
	var subscribers []services.CreateSubscriberRequest
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		req := services.CreateSubscriberRequest{
			Email: record[emailIdx],
		}
		if firstNameIdx >= 0 && firstNameIdx < len(record) {
			req.FirstName = &record[firstNameIdx]
		}
		if lastNameIdx >= 0 && lastNameIdx < len(record) {
			req.LastName = &record[lastNameIdx]
		}

		subscribers = append(subscribers, req)
	}

	created, skipped, err := h.subscriberService.BulkCreate(subscribers, userID.(uuid.UUID), "import")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Import completed",
		"created": created,
		"skipped": skipped,
	})
}

// GET /api/subscribers/export
func (h *SubscriberHandler) Export(c *gin.Context) {
	userID, _ := c.Get("userID")

	subscribers, _, err := h.subscriberService.FindAll(userID.(uuid.UUID), &services.SubscriberFilter{PageSize: 10000})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=subscribers.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write header
	writer.Write([]string{"email", "first_name", "last_name", "status", "subscribed_at"})

	// Write data
	for _, sub := range subscribers {
		firstName := ""
		lastName := ""
		if sub.FirstName != nil {
			firstName = *sub.FirstName
		}
		if sub.LastName != nil {
			lastName = *sub.LastName
		}
		writer.Write([]string{
			sub.Email,
			firstName,
			lastName,
			string(sub.Status),
			sub.SubscribedAt.Format("2006-01-02 15:04:05"),
		})
	}
}

// GET /api/subscribers/stats
func (h *SubscriberHandler) GetStats(c *gin.Context) {
	userID, _ := c.Get("userID")

	stats, err := h.subscriberService.GetStats(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /api/unsubscribe/:token (Public endpoint)
func (h *SubscriberHandler) Unsubscribe(c *gin.Context) {
	token := c.Param("token")

	if err := h.subscriberService.Unsubscribe(token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully unsubscribed"})
}
