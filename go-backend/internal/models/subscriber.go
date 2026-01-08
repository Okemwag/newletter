package models

import (
	"time"

	"github.com/google/uuid"
)

type SubscriberStatus string

const (
	SubscriberStatusActive       SubscriberStatus = "active"
	SubscriberStatusUnsubscribed SubscriberStatus = "unsubscribed"
	SubscriberStatusBounced      SubscriberStatus = "bounced"
	SubscriberStatusComplaint    SubscriberStatus = "complaint"
)

type Subscriber struct {
	ID               uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email            string           `gorm:"size:255;not null;index:idx_subscriber_email_creator,unique" json:"email"`
	FirstName        *string          `gorm:"column:first_name;size:100" json:"firstName,omitempty"`
	LastName         *string          `gorm:"column:last_name;size:100" json:"lastName,omitempty"`
	Status           SubscriberStatus `gorm:"type:varchar(20);default:'active'" json:"status"`
	CreatorID        uuid.UUID        `gorm:"column:creator_id;type:uuid;not null;index:idx_subscriber_email_creator,unique" json:"creatorId"`
	Creator          User             `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	UnsubscribeToken string           `gorm:"column:unsubscribe_token;size:64;uniqueIndex" json:"-"`
	Source           *string          `gorm:"size:100" json:"source,omitempty"` // e.g., "import", "form", "api"
	Tags             []Tag            `gorm:"many2many:subscriber_tags;" json:"tags,omitempty"`
	Metadata         *string          `gorm:"type:jsonb" json:"metadata,omitempty"`
	SubscribedAt     time.Time        `gorm:"column:subscribed_at;autoCreateTime" json:"subscribedAt"`
	UnsubscribedAt   *time.Time       `gorm:"column:unsubscribed_at" json:"unsubscribedAt,omitempty"`
	CreatedAt        time.Time        `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time        `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`

	// Bounce tracking fields
	BounceCount    int        `gorm:"column:bounce_count;default:0" json:"bounceCount"`
	LastBounceAt   *time.Time `gorm:"column:last_bounce_at" json:"lastBounceAt,omitempty"`
	BounceReason   *string    `gorm:"column:bounce_reason;size:500" json:"bounceReason,omitempty"`

	// Engagement tracking fields
	LastOpenedAt    *time.Time `gorm:"column:last_opened_at;index" json:"lastOpenedAt,omitempty"`
	LastClickedAt   *time.Time `gorm:"column:last_clicked_at" json:"lastClickedAt,omitempty"`
	EngagementScore float64    `gorm:"column:engagement_score;default:50" json:"engagementScore"` // 0-100 scale
	EmailsSent      int        `gorm:"column:emails_sent;default:0" json:"emailsSent"`
	EmailsOpened    int        `gorm:"column:emails_opened;default:0" json:"emailsOpened"`
	EmailsClicked   int        `gorm:"column:emails_clicked;default:0" json:"emailsClicked"`
}

func (Subscriber) TableName() string {
	return "subscribers"
}
