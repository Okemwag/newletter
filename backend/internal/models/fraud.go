package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/types"
)

// FraudFlag tracks suspicious activity for manual review
type FraudFlag struct {
	ID          uuid.UUID           `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID   uuid.UUID           `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator     User                `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Type        types.FraudFlagType `gorm:"type:varchar(30);not null" json:"type"`
	Severity    types.FraudSeverity `gorm:"type:varchar(20);not null" json:"severity"`
	Details     string              `gorm:"type:jsonb" json:"details"` // JSON with specifics
	Status      string              `gorm:"size:20;default:'open'" json:"status"` // open, reviewed, cleared, confirmed
	Score       int                 `gorm:"default:0" json:"score"` // Risk score 0-100
	ReviewedBy  *uuid.UUID          `gorm:"column:reviewed_by;type:uuid" json:"reviewedBy,omitempty"`
	ReviewedAt  *time.Time          `gorm:"column:reviewed_at" json:"reviewedAt,omitempty"`
	ReviewNote  *string             `gorm:"column:review_note;size:1000" json:"reviewNote,omitempty"`
	AutoCleared bool                `gorm:"column:auto_cleared;default:false" json:"autoCleared"`
	CreatedAt   time.Time           `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time           `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (FraudFlag) TableName() string {
	return "fraud_flags"
}

// EmailVerification tracks email verification codes
type EmailVerification struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"userId"`
	User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Code      string    `gorm:"size:6;not null" json:"-"`
	ExpiresAt time.Time `gorm:"column:expires_at;not null" json:"expiresAt"`
	Verified  bool      `gorm:"default:false" json:"verified"`
	Attempts  int       `gorm:"default:0" json:"attempts"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (EmailVerification) TableName() string {
	return "email_verifications"
}

// PhoneVerification tracks phone verification for payouts
type PhoneVerification struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"userId"`
	User        User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	PhoneNumber string    `gorm:"column:phone_number;size:20;not null" json:"phoneNumber"`
	Code        string    `gorm:"size:6;not null" json:"-"`
	ExpiresAt   time.Time `gorm:"column:expires_at;not null" json:"expiresAt"`
	Verified    bool      `gorm:"default:false" json:"verified"`
	Attempts    int       `gorm:"default:0" json:"attempts"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (PhoneVerification) TableName() string {
	return "phone_verifications"
}

// CreatorEarning tracks individual earnings (from subscriptions)
type CreatorEarning struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID      uuid.UUID  `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator        User       `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	SubscriberID   uuid.UUID  `gorm:"column:subscriber_id;type:uuid;not null" json:"subscriberId"`
	Subscriber     User       `gorm:"foreignKey:SubscriberID;constraint:OnDelete:SET NULL" json:"-"`
	PaymentID      uuid.UUID  `gorm:"column:payment_id;type:uuid;not null" json:"paymentId"`
	GrossAmount    int64      `gorm:"column:gross_amount;not null" json:"grossAmount"` // Original payment
	PlatformFee    int64      `gorm:"column:platform_fee;not null" json:"platformFee"` // Our cut
	NetAmount      int64      `gorm:"column:net_amount;not null" json:"netAmount"`     // Creator gets
	ClearsAt       time.Time  `gorm:"column:clears_at;not null" json:"clearsAt"`       // When available
	ClearedAt      *time.Time `gorm:"column:cleared_at" json:"clearedAt,omitempty"`
	Status         string     `gorm:"size:20;default:'pending'" json:"status"` // pending, cleared, refunded
	RefundedAt     *time.Time `gorm:"column:refunded_at" json:"refundedAt,omitempty"`
	RefundReason   *string    `gorm:"column:refund_reason;size:255" json:"refundReason,omitempty"`
	CreatedAt      time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (CreatorEarning) TableName() string {
	return "creator_earnings"
}
