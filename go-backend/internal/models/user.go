package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/types"
	"gorm.io/datatypes"
)

type UserPreferences struct {
	EmailNotifications   *bool                     `json:"emailNotifications,omitempty"`
	ContentNotifications *bool                     `json:"contentNotifications,omitempty"`
	WeeklyDigest         *bool                     `json:"weeklyDigest,omitempty"`
	SubscriptionStatus   *types.SubscriptionStatus `json:"subscriptionStatus,omitempty"`
}

type User struct {
	ID             uuid.UUID              `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email          string                 `gorm:"uniqueIndex;size:255;not null" json:"email"`
	Password       string                 `gorm:"column:password_hash;size:255;not null" json:"-"`
	Role           types.UserRole         `gorm:"type:varchar(20);default:'subscriber'" json:"role"`
	FirstName      string                 `gorm:"column:first_name;size:100;not null" json:"firstName"`
	LastName       string                 `gorm:"column:last_name;size:100;not null" json:"lastName"`
	AvatarURL      *string                `gorm:"column:avatar_url;size:500" json:"avatarUrl,omitempty"`
	Bio            *string                `gorm:"type:text" json:"bio,omitempty"`
	NewsletterName *string                `gorm:"column:newsletter_name;size:200" json:"newsletterName,omitempty"`
	IsActive       bool                   `gorm:"column:is_active;default:true" json:"isActive"`
	EmailVerified  bool                   `gorm:"column:email_verified;default:false" json:"emailVerified"`
	Preferences    datatypes.JSONType[UserPreferences] `gorm:"type:jsonb" json:"preferences,omitempty"`
	RefreshTokens  []RefreshToken         `gorm:"foreignKey:UserID" json:"-"`

	// Creator onboarding fields
	CreatorStatus       types.CreatorStatus `gorm:"column:creator_status;type:varchar(30);default:'draft'" json:"creatorStatus,omitempty"`
	LegalName           *string             `gorm:"column:legal_name;size:200" json:"legalName,omitempty"`
	PhoneNumber         *string             `gorm:"column:phone_number;size:20" json:"phoneNumber,omitempty"`
	Country             string              `gorm:"column:country;size:3;default:'KE'" json:"country"`
	NewsletterDesc      *string             `gorm:"column:newsletter_desc;type:text" json:"newsletterDesc,omitempty"`
	SenderEmail         *string             `gorm:"column:sender_email;size:255" json:"senderEmail,omitempty"`
	SenderName          *string             `gorm:"column:sender_name;size:100" json:"senderName,omitempty"`
	SubscriptionPrice   int64               `gorm:"column:subscription_price;default:0" json:"subscriptionPrice"` // KES in cents
	PayoutPhone         *string             `gorm:"column:payout_phone;size:20" json:"payoutPhone,omitempty"`
	PayoutPhoneVerified bool                `gorm:"column:payout_phone_verified;default:false" json:"payoutPhoneVerified"`
	OnboardingStep      int                 `gorm:"column:onboarding_step;default:1" json:"onboardingStep"`
	ActivatedAt         *time.Time          `gorm:"column:activated_at" json:"activatedAt,omitempty"`
	SuspendedAt         *time.Time          `gorm:"column:suspended_at" json:"suspendedAt,omitempty"`
	SuspendReason       *string             `gorm:"column:suspend_reason;size:500" json:"suspendReason,omitempty"`

	CreatedAt      time.Time              `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time              `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (User) TableName() string {
	return "users"
}
