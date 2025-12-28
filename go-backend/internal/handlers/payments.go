package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/services"
)

type PaymentHandler struct {
	paystackService     *services.PaystackService
	mpesaService        *services.MpesaService
	subscriptionService *services.SubscriptionService
}

func NewPaymentHandler() *PaymentHandler {
	return &PaymentHandler{
		paystackService:     services.NewPaystackService(),
		mpesaService:        services.NewMpesaService(),
		subscriptionService: services.NewSubscriptionService(),
	}
}

// ===== Subscription Plans =====

// POST /api/plans
func (h *PaymentHandler) CreatePlan(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan, err := h.subscriptionService.CreatePlan(&req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

// GET /api/plans
func (h *PaymentHandler) GetPlans(c *gin.Context) {
	userID, _ := c.Get("userID")

	plans, err := h.subscriptionService.GetPlans(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// GET /api/plans/:id
func (h *PaymentHandler) GetPlan(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	plan, err := h.subscriptionService.GetPlanByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// PUT /api/plans/:id
func (h *PaymentHandler) UpdatePlan(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	var req services.UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan, err := h.subscriptionService.UpdatePlan(id, &req, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// DELETE /api/plans/:id
func (h *PaymentHandler) DeletePlan(c *gin.Context) {
	userID, _ := c.Get("userID")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	if err := h.subscriptionService.DeletePlan(id, userID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted successfully"})
}

// ===== Paystack Payments =====

// POST /api/payments/paystack/initialize
func (h *PaymentHandler) InitializePaystack(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.InitializePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Currency == "" {
		req.Currency = "NGN"
	}

	payment, authURL, err := h.paystackService.InitializePayment(userID.(uuid.UUID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment":          payment,
		"authorizationUrl": authURL,
	})
}

// GET /api/payments/paystack/verify/:reference
func (h *PaymentHandler) VerifyPaystack(c *gin.Context) {
	reference := c.Param("reference")

	payment, err := h.paystackService.VerifyPayment(reference)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If payment successful and has plan, create subscription
	if payment.Status == models.PaymentStatusSuccess && payment.PlanID != nil {
		plan, _ := h.subscriptionService.GetPlanByID(*payment.PlanID)
		if plan != nil {
			h.subscriptionService.CreateSubscription(
				payment.UserID,
				plan.CreatorID,
				plan.ID,
				&payment.ID,
				payment.BillingCycle,
			)
		}
	}

	c.JSON(http.StatusOK, payment)
}

// POST /api/webhooks/paystack
func (h *PaymentHandler) PaystackWebhook(c *gin.Context) {
	signature := c.GetHeader("x-paystack-signature")

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// Validate signature
	if !h.paystackService.ValidateWebhookSignature(body, signature) {
		c.Status(http.StatusUnauthorized)
		return
	}

	var payload struct {
		Event string                 `json:"event"`
		Data  map[string]interface{} `json:"data"`
	}

	if err := json.Unmarshal(body, &payload); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := h.paystackService.HandleWebhook(payload.Event, payload.Data); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

// ===== M-Pesa Payments =====

// POST /api/payments/mpesa/stkpush
func (h *PaymentHandler) InitiateMpesa(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req services.STKPushRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payment, err := h.mpesaService.InitiateSTKPush(userID.(uuid.UUID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment": payment,
		"message": "STK push sent. Please check your phone.",
	})
}

// GET /api/payments/mpesa/status/:checkoutId
func (h *PaymentHandler) MpesaStatus(c *gin.Context) {
	checkoutID := c.Param("checkoutId")

	payment, err := h.mpesaService.QuerySTKStatus(checkoutID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// POST /api/webhooks/mpesa
func (h *PaymentHandler) MpesaCallback(c *gin.Context) {
	var callback services.MpesaCallbackBody

	if err := c.ShouldBindJSON(&callback); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := h.mpesaService.HandleCallback(&callback); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	// If payment successful, create subscription
	checkoutID := callback.Body.StkCallback.CheckoutRequestID
	payment, _ := h.subscriptionService.GetPaymentByRef(checkoutID)
	if payment != nil && payment.Status == models.PaymentStatusSuccess && payment.PlanID != nil {
		plan, _ := h.subscriptionService.GetPlanByID(*payment.PlanID)
		if plan != nil {
			h.subscriptionService.CreateSubscription(
				payment.UserID,
				plan.CreatorID,
				plan.ID,
				&payment.ID,
				payment.BillingCycle,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"ResultCode": 0, "ResultDesc": "Accepted"})
}

// ===== Subscriptions =====

// GET /api/subscriptions/my
func (h *PaymentHandler) GetMySubscriptions(c *gin.Context) {
	userID, _ := c.Get("userID")

	payments, err := h.subscriptionService.GetUserPayments(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

// GET /api/subscriptions/subscribers
func (h *PaymentHandler) GetMySubscribers(c *gin.Context) {
	userID, _ := c.Get("userID")

	subs, err := h.subscriptionService.GetCreatorSubscribers(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, subs)
}

// GET /api/subscriptions/revenue
func (h *PaymentHandler) GetRevenue(c *gin.Context) {
	userID, _ := c.Get("userID")

	stats, err := h.subscriptionService.GetRevenueStats(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /api/payments/providers
func (h *PaymentHandler) GetProviders(c *gin.Context) {
	providers := gin.H{
		"paystack": h.paystackService.IsConfigured(),
		"mpesa":    h.mpesaService.IsConfigured(),
	}

	c.JSON(http.StatusOK, providers)
}
