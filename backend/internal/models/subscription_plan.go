package models

import (
	"time"

	"github.com/google/uuid"
)

type SubscriptionTier string

const (
	SubscriptionTierFree    SubscriptionTier = "free"
	SubscriptionTierBasic   SubscriptionTier = "basic"
	SubscriptionTierPro     SubscriptionTier = "pro"
	SubscriptionTierPremium SubscriptionTier = "premium"
)

type BillingCycle string

const (
	BillingCycleMonthly BillingCycle = "monthly"
	BillingCycleYearly  BillingCycle = "yearly"
	BillingCycleOneTime BillingCycle = "one_time"
)

type SubscriptionPlan struct {
	ID             uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID      uuid.UUID        `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator        User             `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Name           string           `gorm:"size:100;not null" json:"name"`
	Description    *string          `gorm:"size:500" json:"description,omitempty"`
	Tier           SubscriptionTier `gorm:"type:varchar(20);default:'basic'" json:"tier"`
	PriceMonthly   int64            `gorm:"column:price_monthly;default:0" json:"priceMonthly"` // In cents
	PriceYearly    int64            `gorm:"column:price_yearly;default:0" json:"priceYearly"`
	Currency       string           `gorm:"size:3;default:'KES'" json:"currency"` // KES, NGN, USD
	Features       *string          `gorm:"type:jsonb" json:"features,omitempty"` // JSON array of features
	MaxSubscribers *int             `gorm:"column:max_subscribers" json:"maxSubscribers,omitempty"`
	IsActive       bool             `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt      time.Time        `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time        `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (SubscriptionPlan) TableName() string {
	return "subscription_plans"
}
