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
	CreatedAt      time.Time              `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time              `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (User) TableName() string {
	return "users"
}
