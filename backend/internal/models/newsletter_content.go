package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/types"
)

type NewsletterContent struct {
	ID          uuid.UUID           `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title       string              `gorm:"size:300;not null" json:"title"`
	Content     string              `gorm:"type:text;not null" json:"content"`
	Excerpt     *string             `gorm:"size:500" json:"excerpt,omitempty"`
	Status      types.ContentStatus `gorm:"type:varchar(20);default:'draft'" json:"status"`
	IsPremium   bool                `gorm:"column:is_premium;default:false" json:"isPremium"`
	CreatorID   uuid.UUID           `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator     User                `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"creator,omitempty"`
	PublishedAt *time.Time          `gorm:"column:published_at" json:"publishedAt,omitempty"`
	CreatedAt   time.Time           `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time           `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (NewsletterContent) TableName() string {
	return "newsletter_content"
}
