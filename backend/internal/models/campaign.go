package models

import (
	"time"

	"github.com/google/uuid"
)

type CampaignStatus string

const (
	CampaignStatusDraft     CampaignStatus = "draft"
	CampaignStatusScheduled CampaignStatus = "scheduled"
	CampaignStatusSending   CampaignStatus = "sending"
	CampaignStatusSent      CampaignStatus = "sent"
	CampaignStatusFailed    CampaignStatus = "failed"
)

type CampaignStats struct {
	TotalRecipients int `json:"totalRecipients"`
	Sent            int `json:"sent"`
	Delivered       int `json:"delivered"`
	Opens           int `json:"opens"`
	UniqueOpens     int `json:"uniqueOpens"`
	Clicks          int `json:"clicks"`
	UniqueClicks    int `json:"uniqueClicks"`
	Bounces         int `json:"bounces"`
	Complaints      int `json:"complaints"`
	Unsubscribes    int `json:"unsubscribes"`
}

type Campaign struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title        string         `gorm:"size:300;not null" json:"title"`
	Subject      string         `gorm:"size:500;not null" json:"subject"`
	PreviewText  *string        `gorm:"column:preview_text;size:200" json:"previewText,omitempty"`
	Content      string         `gorm:"type:text;not null" json:"content"`
	HTMLContent  *string        `gorm:"column:html_content;type:text" json:"htmlContent,omitempty"`
	Status       CampaignStatus `gorm:"type:varchar(20);default:'draft'" json:"status"`
	CreatorID    uuid.UUID      `gorm:"column:creator_id;type:uuid;not null" json:"creatorId"`
	Creator      User           `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	TargetTags   []Tag          `gorm:"many2many:campaign_tags;" json:"targetTags,omitempty"`
	ScheduledAt  *time.Time     `gorm:"column:scheduled_at" json:"scheduledAt,omitempty"`
	SentAt       *time.Time     `gorm:"column:sent_at" json:"sentAt,omitempty"`
	Stats        *string        `gorm:"type:jsonb" json:"stats,omitempty"` // CampaignStats as JSON
	CreatedAt    time.Time      `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Campaign) TableName() string {
	return "campaigns"
}
