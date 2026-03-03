package models

import (
	"time"

	"github.com/google/uuid"
)

type APIKey struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID   uuid.UUID  `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator     User       `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Name        string     `gorm:"size:100;not null" json:"name"`
	KeyHash     string     `gorm:"column:key_hash;size:64;not null;uniqueIndex" json:"-"` // SHA256 hash
	KeyPrefix   string     `gorm:"column:key_prefix;size:12" json:"keyPrefix"`            // First 8 chars for identification
	Permissions []string   `gorm:"type:jsonb;serializer:json" json:"permissions"`
	LastUsedAt  *time.Time `gorm:"column:last_used_at" json:"lastUsedAt,omitempty"`
	ExpiresAt   *time.Time `gorm:"column:expires_at" json:"expiresAt,omitempty"`
	IsActive    bool       `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt   time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (APIKey) TableName() string {
	return "api_keys"
}

type EmailTemplate struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID   uuid.UUID `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator     User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Description *string   `gorm:"size:500" json:"description,omitempty"`
	Subject     string    `gorm:"size:500" json:"subject"`
	HTMLContent string    `gorm:"column:html_content;type:text;not null" json:"htmlContent"`
	TextContent *string   `gorm:"column:text_content;type:text" json:"textContent,omitempty"`
	Variables   []string  `gorm:"type:jsonb;serializer:json" json:"variables"` // Available template variables
	Category    *string   `gorm:"size:50" json:"category,omitempty"`           // e.g., "welcome", "newsletter", "promotion"
	IsDefault   bool      `gorm:"column:is_default;default:false" json:"isDefault"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (EmailTemplate) TableName() string {
	return "email_templates"
}

type Referral struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReferrerID    uuid.UUID  `gorm:"column:referrer_id;type:uuid;not null" json:"referrerId"`
	Referrer      User       `gorm:"foreignKey:ReferrerID;constraint:OnDelete:CASCADE" json:"-"`
	ReferralCode  string     `gorm:"column:referral_code;size:20;uniqueIndex" json:"referralCode"`
	ReferredEmail *string    `gorm:"column:referred_email;size:255" json:"referredEmail,omitempty"`
	ReferredID    *uuid.UUID `gorm:"column:referred_id;type:uuid" json:"referredId,omitempty"`
	Referred      *User      `gorm:"foreignKey:ReferredID" json:"-"`
	Status        string     `gorm:"size:20;default:'pending'" json:"status"` // pending, verified, rewarded
	RewardAmount  *int64     `gorm:"column:reward_amount" json:"rewardAmount,omitempty"`
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	VerifiedAt    *time.Time `gorm:"column:verified_at" json:"verifiedAt,omitempty"`
}

func (Referral) TableName() string {
	return "referrals"
}
