package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/services"
	"github.com/okemwag/newsletter/internal/types"
)

type AdminHandler struct {
	adminService *services.AdminService
}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		adminService: services.NewAdminService(),
	}
}

// GET /api/admin/stats
func (h *AdminHandler) GetPlatformStats(c *gin.Context) {
	stats, err := h.adminService.GetPlatformStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /api/admin/users
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	filter := &services.UserFilter{}

	if role := c.Query("role"); role != "" {
		r := types.UserRole(role)
		filter.Role = &r
	}

	if active := c.Query("active"); active != "" {
		isActive := active == "true"
		filter.IsActive = &isActive
	}

	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

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

	users, total, err := h.adminService.GetAllUsers(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": total,
	})
}

// PUT /api/admin/users/:id/role
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := types.UserRole(req.Role)
	if role != types.UserRoleCreator && role != types.UserRoleSubscriber && role != types.UserRoleAdmin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	user, err := h.adminService.UpdateUserRole(id, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// PUT /api/admin/users/:id/status
func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		IsActive bool `json:"isActive"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.adminService.UpdateUserStatus(id, req.IsActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GET /api/admin/campaigns
func (h *AdminHandler) GetAllCampaigns(c *gin.Context) {
	page := 1
	pageSize := 50

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil {
			page = parsed
		}
	}

	if ps := c.Query("pageSize"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil {
			pageSize = parsed
		}
	}

	campaigns, total, err := h.adminService.GetAllCampaigns(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  campaigns,
		"total": total,
	})
}

// DELETE /api/admin/content/:id
func (h *AdminHandler) DeleteContent(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	if err := h.adminService.DeleteContent(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Content deleted successfully"})
}

// GET /api/admin/revenue
func (h *AdminHandler) GetRevenue(c *gin.Context) {
	byProvider, _ := h.adminService.GetRevenueByProvider()

	days := 30
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 && parsed <= 365 {
			days = parsed
		}
	}

	timeline, _ := h.adminService.GetRevenueTimeline(days)

	c.JSON(http.StatusOK, gin.H{
		"byProvider": byProvider,
		"timeline":   timeline,
	})
}

// GET /api/admin/top-creators
func (h *AdminHandler) GetTopCreators(c *gin.Context) {
	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	creators, err := h.adminService.GetTopCreators(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, creators)
}
