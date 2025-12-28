package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type SubscriptionService struct {
	db *gorm.DB
}

func NewSubscriptionService() *SubscriptionService {
	return &SubscriptionService{
		db: database.GetDB(),
	}
}

type CreatePlanRequest struct {
	Name           string  `json:"name" binding:"required,max=100"`
	Description    *string `json:"description,omitempty"`
	Tier           string  `json:"tier" binding:"required"`
	PriceMonthly   int64   `json:"priceMonthly"`
	PriceYearly    int64   `json:"priceYearly"`
	Currency       string  `json:"currency"`
	Features       *string `json:"features,omitempty"`
	MaxSubscribers *int    `json:"maxSubscribers,omitempty"`
}

type UpdatePlanRequest struct {
	Name           *string `json:"name,omitempty"`
	Description    *string `json:"description,omitempty"`
	PriceMonthly   *int64  `json:"priceMonthly,omitempty"`
	PriceYearly    *int64  `json:"priceYearly,omitempty"`
	Features       *string `json:"features,omitempty"`
	MaxSubscribers *int    `json:"maxSubscribers,omitempty"`
	IsActive       *bool   `json:"isActive,omitempty"`
}

// Plan CRUD
func (s *SubscriptionService) CreatePlan(req *CreatePlanRequest, creatorID uuid.UUID) (*models.SubscriptionPlan, error) {
	currency := req.Currency
	if currency == "" {
		currency = "KES"
	}

	plan := &models.SubscriptionPlan{
		CreatorID:      creatorID,
		Name:           req.Name,
		Description:    req.Description,
		Tier:           models.SubscriptionTier(req.Tier),
		PriceMonthly:   req.PriceMonthly,
		PriceYearly:    req.PriceYearly,
		Currency:       currency,
		Features:       req.Features,
		MaxSubscribers: req.MaxSubscribers,
		IsActive:       true,
	}

	if err := s.db.Create(plan).Error; err != nil {
		return nil, errors.New("failed to create plan")
	}

	return plan, nil
}

func (s *SubscriptionService) GetPlans(creatorID uuid.UUID) ([]models.SubscriptionPlan, error) {
	var plans []models.SubscriptionPlan
	if err := s.db.Where("creator_id = ?", creatorID).Order("price_monthly ASC").Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func (s *SubscriptionService) GetPlanByID(id uuid.UUID) (*models.SubscriptionPlan, error) {
	var plan models.SubscriptionPlan
	if err := s.db.First(&plan, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("plan not found")
		}
		return nil, err
	}
	return &plan, nil
}

func (s *SubscriptionService) UpdatePlan(id uuid.UUID, req *UpdatePlanRequest, creatorID uuid.UUID) (*models.SubscriptionPlan, error) {
	var plan models.SubscriptionPlan
	if err := s.db.Where("id = ? AND creator_id = ?", id, creatorID).First(&plan).Error; err != nil {
		return nil, errors.New("plan not found")
	}

	if req.Name != nil {
		plan.Name = *req.Name
	}
	if req.Description != nil {
		plan.Description = req.Description
	}
	if req.PriceMonthly != nil {
		plan.PriceMonthly = *req.PriceMonthly
	}
	if req.PriceYearly != nil {
		plan.PriceYearly = *req.PriceYearly
	}
	if req.Features != nil {
		plan.Features = req.Features
	}
	if req.MaxSubscribers != nil {
		plan.MaxSubscribers = req.MaxSubscribers
	}
	if req.IsActive != nil {
		plan.IsActive = *req.IsActive
	}

	if err := s.db.Save(&plan).Error; err != nil {
		return nil, errors.New("failed to update plan")
	}

	return &plan, nil
}

func (s *SubscriptionService) DeletePlan(id uuid.UUID, creatorID uuid.UUID) error {
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).Delete(&models.SubscriptionPlan{})
	if result.RowsAffected == 0 {
		return errors.New("plan not found")
	}
	return result.Error
}

// Subscription management
func (s *SubscriptionService) CreateSubscription(userID, creatorID, planID uuid.UUID, paymentID *uuid.UUID, billingCycle models.BillingCycle) (*models.UserSubscription, error) {
	// Check if subscription already exists
	var existing models.UserSubscription
	if s.db.Where("user_id = ? AND creator_id = ?", userID, creatorID).First(&existing).Error == nil {
		// Update existing subscription
		existing.PlanID = planID
		existing.PaymentID = paymentID
		existing.Status = "active"
		existing.StartedAt = time.Now()
		
		// Calculate expiry
		if billingCycle == models.BillingCycleYearly {
			expiresAt := time.Now().AddDate(1, 0, 0)
			existing.ExpiresAt = &expiresAt
		} else if billingCycle == models.BillingCycleMonthly {
			expiresAt := time.Now().AddDate(0, 1, 0)
			existing.ExpiresAt = &expiresAt
		}
		
		return &existing, s.db.Save(&existing).Error
	}

	// Calculate expiry
	var expiresAt *time.Time
	if billingCycle == models.BillingCycleYearly {
		exp := time.Now().AddDate(1, 0, 0)
		expiresAt = &exp
	} else if billingCycle == models.BillingCycleMonthly {
		exp := time.Now().AddDate(0, 1, 0)
		expiresAt = &exp
	}

	subscription := &models.UserSubscription{
		UserID:    userID,
		CreatorID: creatorID,
		PlanID:    planID,
		PaymentID: paymentID,
		Status:    "active",
		ExpiresAt: expiresAt,
	}

	if err := s.db.Create(subscription).Error; err != nil {
		return nil, errors.New("failed to create subscription")
	}

	return subscription, nil
}

func (s *SubscriptionService) GetUserSubscription(userID, creatorID uuid.UUID) (*models.UserSubscription, error) {
	var sub models.UserSubscription
	if err := s.db.Preload("Plan").Where("user_id = ? AND creator_id = ?", userID, creatorID).First(&sub).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &sub, nil
}

func (s *SubscriptionService) GetCreatorSubscribers(creatorID uuid.UUID) ([]models.UserSubscription, error) {
	var subs []models.UserSubscription
	if err := s.db.Preload("Plan").Preload("User").Where("creator_id = ? AND status = ?", creatorID, "active").Find(&subs).Error; err != nil {
		return nil, err
	}
	return subs, nil
}

func (s *SubscriptionService) CancelSubscription(userID, creatorID uuid.UUID) error {
	return s.db.Model(&models.UserSubscription{}).
		Where("user_id = ? AND creator_id = ?", userID, creatorID).
		Update("status", "cancelled").Error
}

// Payment tracking
func (s *SubscriptionService) GetUserPayments(userID uuid.UUID) ([]models.Payment, error) {
	var payments []models.Payment
	if err := s.db.Preload("Plan").Where("user_id = ?", userID).Order("created_at DESC").Find(&payments).Error; err != nil {
		return nil, err
	}
	return payments, nil
}

func (s *SubscriptionService) GetPaymentByID(id uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.Preload("Plan").First(&payment, "id = ?", id).Error; err != nil {
		return nil, errors.New("payment not found")
	}
	return &payment, nil
}

func (s *SubscriptionService) GetPaymentByRef(providerRef string) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.Preload("Plan").First(&payment, "provider_ref = ?", providerRef).Error; err != nil {
		return nil, errors.New("payment not found")
	}
	return &payment, nil
}

// Revenue stats
func (s *SubscriptionService) GetRevenueStats(creatorID uuid.UUID) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total revenue
	var totalRevenue int64
	s.db.Model(&models.Payment{}).
		Joins("JOIN subscription_plans ON subscription_plans.id = payments.plan_id").
		Where("subscription_plans.creator_id = ? AND payments.status = ?", creatorID, models.PaymentStatusSuccess).
		Select("COALESCE(SUM(payments.amount), 0)").
		Scan(&totalRevenue)
	stats["totalRevenue"] = totalRevenue

	// This month revenue
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	var monthlyRevenue int64
	s.db.Model(&models.Payment{}).
		Joins("JOIN subscription_plans ON subscription_plans.id = payments.plan_id").
		Where("subscription_plans.creator_id = ? AND payments.status = ? AND payments.paid_at >= ?", 
			creatorID, models.PaymentStatusSuccess, startOfMonth).
		Select("COALESCE(SUM(payments.amount), 0)").
		Scan(&monthlyRevenue)
	stats["monthlyRevenue"] = monthlyRevenue

	// Active subscribers count
	var activeCount int64
	s.db.Model(&models.UserSubscription{}).
		Where("creator_id = ? AND status = ?", creatorID, "active").
		Count(&activeCount)
	stats["activeSubscribers"] = activeCount

	// Total payments count
	var paymentCount int64
	s.db.Model(&models.Payment{}).
		Joins("JOIN subscription_plans ON subscription_plans.id = payments.plan_id").
		Where("subscription_plans.creator_id = ? AND payments.status = ?", creatorID, models.PaymentStatusSuccess).
		Count(&paymentCount)
	stats["totalPayments"] = paymentCount

	return stats, nil
}
