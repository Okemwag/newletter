package models

import (
	"time"

	"github.com/google/uuid"
)

type WebhookEventType string

const (
	WebhookEventSubscriberCreated   WebhookEventType = "subscriber.created"
	WebhookEventSubscriberDeleted   WebhookEventType = "subscriber.deleted"
	WebhookEventCampaignSent        WebhookEventType = "campaign.sent"
	WebhookEventPaymentSuccess      WebhookEventType = "payment.success"
	WebhookEventPaymentFailed       WebhookEventType = "payment.failed"
	WebhookEventSubscriptionCreated WebhookEventType = "subscription.created"
	WebhookEventSubscriptionExpired WebhookEventType = "subscription.expired"
)

type Webhook struct {
	ID         uuid.UUID          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID  uuid.UUID          `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator    User               `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	URL        string             `gorm:"size:500;not null" json:"url"`
	Secret     string             `gorm:"size:64" json:"-"` // For HMAC signing
	Events     []WebhookEventType `gorm:"type:jsonb;serializer:json" json:"events"`
	IsActive   bool               `gorm:"column:is_active;default:true" json:"isActive"`
	LastError  *string            `gorm:"column:last_error;size:500" json:"lastError,omitempty"`
	LastSentAt *time.Time         `gorm:"column:last_sent_at" json:"lastSentAt,omitempty"`
	CreatedAt  time.Time          `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time          `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Webhook) TableName() string {
	return "webhooks"
}

type WebhookLog struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	WebhookID   uuid.UUID `gorm:"column:webhook_id;type:uuid;not null" json:"webhookId"`
	Webhook     Webhook   `gorm:"foreignKey:WebhookID;constraint:OnDelete:CASCADE" json:"-"`
	EventType   string    `gorm:"column:event_type;size:50" json:"eventType"`
	Payload     string    `gorm:"type:text" json:"payload"`
	StatusCode  int       `gorm:"column:status_code" json:"statusCode"`
	Response    *string   `gorm:"type:text" json:"response,omitempty"`
	Error       *string   `gorm:"size:500" json:"error,omitempty"`
	SentAt      time.Time `gorm:"column:sent_at;autoCreateTime" json:"sentAt"`
}

func (WebhookLog) TableName() string {
	return "webhook_logs"
}
