package models

import (
	"time"

	"github.com/google/uuid"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusSuccess   PaymentStatus = "success"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusCancelled PaymentStatus = "cancelled"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

type PaymentProvider string

const (
	PaymentProviderPaystack PaymentProvider = "paystack"
	PaymentProviderMpesa    PaymentProvider = "mpesa"
)

type Payment struct {
	ID                uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID        `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	User              User             `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	PlanID            *uuid.UUID       `gorm:"column:plan_id;type:uuid" json:"planId,omitempty"`
	Plan              *SubscriptionPlan `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	Amount            int64            `gorm:"not null" json:"amount"` // In smallest currency unit
	Currency          string           `gorm:"size:3;not null;default:'KES'" json:"currency"`
	Status            PaymentStatus    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Provider          PaymentProvider  `gorm:"column:provider;type:varchar(20);not null" json:"provider"`
	ProviderRef       string           `gorm:"column:provider_ref;size:255" json:"providerRef"`         // Paystack reference or M-Pesa CheckoutRequestID
	ProviderTxnID     *string          `gorm:"column:provider_txn_id;size:255" json:"providerTxnId,omitempty"` // Actual transaction ID
	BillingCycle      BillingCycle     `gorm:"column:billing_cycle;type:varchar(20)" json:"billingCycle"`
	PhoneNumber       *string          `gorm:"column:phone_number;size:20" json:"phoneNumber,omitempty"` // For M-Pesa
	Email             *string          `gorm:"size:255" json:"email,omitempty"`
	Metadata          *string          `gorm:"type:jsonb" json:"metadata,omitempty"`
	FailureReason     *string          `gorm:"column:failure_reason;size:500" json:"failureReason,omitempty"`
	PaidAt            *time.Time       `gorm:"column:paid_at" json:"paidAt,omitempty"`
	ExpiresAt         *time.Time       `gorm:"column:expires_at" json:"expiresAt,omitempty"` // Subscription expiry
	CreatedAt         time.Time        `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time        `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Payment) TableName() string {
	return "payments"
}

// UserSubscription tracks active subscriptions
type UserSubscription struct {
	ID        uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID        `gorm:"column:user_id;type:uuid;not null;uniqueIndex:idx_user_creator_sub" json:"userId"`
	User      User             `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	CreatorID uuid.UUID        `gorm:"column:creator_id;type:uuid;not null;uniqueIndex:idx_user_creator_sub" json:"creatorId"`
	Creator   User             `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	PlanID    uuid.UUID        `gorm:"column:plan_id;type:uuid;not null" json:"planId"`
	Plan      SubscriptionPlan `gorm:"foreignKey:PlanID" json:"plan"`
	PaymentID *uuid.UUID       `gorm:"column:payment_id;type:uuid" json:"paymentId,omitempty"`
	Status    string           `gorm:"size:20;default:'active'" json:"status"` // active, cancelled, expired
	StartedAt time.Time        `gorm:"column:started_at;autoCreateTime" json:"startedAt"`
	ExpiresAt *time.Time       `gorm:"column:expires_at" json:"expiresAt,omitempty"`
	CreatedAt time.Time        `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time        `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (UserSubscription) TableName() string {
	return "user_subscriptions"
}
