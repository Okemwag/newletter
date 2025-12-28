package models

import (
	"time"

	"github.com/google/uuid"
)

type EmailEventType string

const (
	EmailEventDelivered    EmailEventType = "delivered"
	EmailEventOpen         EmailEventType = "open"
	EmailEventClick        EmailEventType = "click"
	EmailEventBounce       EmailEventType = "bounce"
	EmailEventComplaint    EmailEventType = "complaint"
	EmailEventUnsubscribe  EmailEventType = "unsubscribe"
)

type EmailEvent struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CampaignID   uuid.UUID      `gorm:"column:campaign_id;type:uuid;not null;index" json:"campaignId"`
	Campaign     Campaign       `gorm:"foreignKey:CampaignID;constraint:OnDelete:CASCADE" json:"-"`
	SubscriberID uuid.UUID      `gorm:"column:subscriber_id;type:uuid;not null;index" json:"subscriberId"`
	Subscriber   Subscriber     `gorm:"foreignKey:SubscriberID;constraint:OnDelete:CASCADE" json:"-"`
	EventType    EmailEventType `gorm:"column:event_type;type:varchar(20);not null;index" json:"eventType"`
	Metadata     *string        `gorm:"type:jsonb" json:"metadata,omitempty"` // URL clicked, bounce reason, etc.
	IPAddress    *string        `gorm:"column:ip_address;size:45" json:"ipAddress,omitempty"`
	UserAgent    *string        `gorm:"column:user_agent;size:500" json:"userAgent,omitempty"`
	CreatedAt    time.Time      `gorm:"column:created_at;autoCreateTime;index" json:"createdAt"`
}

func (EmailEvent) TableName() string {
	return "email_events"
}
