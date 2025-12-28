package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/types"
)

// CreatorBalance tracks creator earnings and available funds
type CreatorBalance struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID        uuid.UUID `gorm:"column:creator_id;type:uuid;not null;uniqueIndex" json:"creatorId"`
	Creator          User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	AvailableBalance int64     `gorm:"column:available_balance;default:0" json:"availableBalance"` // Can withdraw (in cents KES)
	PendingBalance   int64     `gorm:"column:pending_balance;default:0" json:"pendingBalance"`     // Waiting for clearance
	LockedBalance    int64     `gorm:"column:locked_balance;default:0" json:"lockedBalance"`       // Held for disputes
	TotalEarned      int64     `gorm:"column:total_earned;default:0" json:"totalEarned"`
	TotalWithdrawn   int64     `gorm:"column:total_withdrawn;default:0" json:"totalWithdrawn"`
	TotalRefunded    int64     `gorm:"column:total_refunded;default:0" json:"totalRefunded"`
	LastEarningAt    *time.Time `gorm:"column:last_earning_at" json:"lastEarningAt,omitempty"`
	FirstEarningAt   *time.Time `gorm:"column:first_earning_at" json:"firstEarningAt,omitempty"`
	CreatedAt        time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (CreatorBalance) TableName() string {
	return "creator_balances"
}

// CreatorPayout tracks payout requests
type CreatorPayout struct {
	ID             uuid.UUID          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID      uuid.UUID          `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator        User               `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Amount         int64              `gorm:"not null" json:"amount"` // KES in cents
	Fee            int64              `gorm:"default:0" json:"fee"`   // Platform fee
	NetAmount      int64              `gorm:"column:net_amount" json:"netAmount"` // Amount after fee
	Status         types.PayoutStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PayoutMethod   string             `gorm:"column:payout_method;size:20;not null;default:'mpesa'" json:"payoutMethod"` // mpesa, bank
	PayoutPhone    string             `gorm:"column:payout_phone;size:20" json:"payoutPhone"`
	BankName       *string            `gorm:"column:bank_name;size:100" json:"bankName,omitempty"`
	BankAccount    *string            `gorm:"column:bank_account;size:50" json:"bankAccount,omitempty"`
	ProviderRef    *string            `gorm:"column:provider_ref;size:255" json:"providerRef,omitempty"`
	ProviderTxnID  *string            `gorm:"column:provider_txn_id;size:255" json:"providerTxnId,omitempty"`
	FailureReason  *string            `gorm:"column:failure_reason;size:500" json:"failureReason,omitempty"`
	RequestedAt    time.Time          `gorm:"column:requested_at;autoCreateTime" json:"requestedAt"`
	ProcessedAt    *time.Time         `gorm:"column:processed_at" json:"processedAt,omitempty"`
	CompletedAt    *time.Time         `gorm:"column:completed_at" json:"completedAt,omitempty"`
	ReviewedBy     *uuid.UUID         `gorm:"column:reviewed_by;type:uuid" json:"reviewedBy,omitempty"`
	ReviewNote     *string            `gorm:"column:review_note;size:500" json:"reviewNote,omitempty"`
	CreatedAt      time.Time          `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time          `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (CreatorPayout) TableName() string {
	return "creator_payouts"
}

// PayoutCap tracks dynamic payout limits per creator
type PayoutCap struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID   uuid.UUID  `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator     User       `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	WeekNumber  int        `gorm:"column:week_number;not null" json:"weekNumber"` // Weeks since activation
	MaxAmount   int64      `gorm:"column:max_amount;not null" json:"maxAmount"`   // KES in cents
	UsedAmount  int64      `gorm:"column:used_amount;default:0" json:"usedAmount"`
	StartsAt    time.Time  `gorm:"column:starts_at;not null" json:"startsAt"`
	ExpiresAt   time.Time  `gorm:"column:expires_at;not null" json:"expiresAt"`
	CreatedAt   time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (PayoutCap) TableName() string {
	return "payout_caps"
}
