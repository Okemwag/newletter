package models

import (
	"time"

	"github.com/google/uuid"
)

// BounceType represents the type of email bounce
type BounceType string

const (
	BounceTypeHard BounceType = "hard" // Permanent delivery failure
	BounceTypeSoft BounceType = "soft" // Temporary delivery failure
)

// DeliverabilityMetrics tracks email deliverability metrics per creator
type DeliverabilityMetrics struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID        uuid.UUID `gorm:"column:creator_id;type:uuid;not null;uniqueIndex" json:"creatorId"`
	Creator          User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`

	// Email counts (rolling 30-day metrics)
	TotalSent       int64 `gorm:"column:total_sent;default:0" json:"totalSent"`
	TotalDelivered  int64 `gorm:"column:total_delivered;default:0" json:"totalDelivered"`
	TotalOpened     int64 `gorm:"column:total_opened;default:0" json:"totalOpened"`
	TotalClicked    int64 `gorm:"column:total_clicked;default:0" json:"totalClicked"`
	TotalBounced    int64 `gorm:"column:total_bounced;default:0" json:"totalBounced"`
	TotalComplaints int64 `gorm:"column:total_complaints;default:0" json:"totalComplaints"`

	// Rates (calculated)
	DeliveryRate   float64 `gorm:"column:delivery_rate;default:100" json:"deliveryRate"`
	OpenRate       float64 `gorm:"column:open_rate;default:0" json:"openRate"`
	ClickRate      float64 `gorm:"column:click_rate;default:0" json:"clickRate"`
	BounceRate     float64 `gorm:"column:bounce_rate;default:0" json:"bounceRate"`
	ComplaintRate  float64 `gorm:"column:complaint_rate;default:0" json:"complaintRate"`
	
	// Sender reputation score (0-100)
	ReputationScore float64 `gorm:"column:reputation_score;default:100" json:"reputationScore"`

	// Hard/Soft bounce breakdown
	HardBounces int64 `gorm:"column:hard_bounces;default:0" json:"hardBounces"`
	SoftBounces int64 `gorm:"column:soft_bounces;default:0" json:"softBounces"`

	// Timestamps
	LastCalculatedAt time.Time `gorm:"column:last_calculated_at" json:"lastCalculatedAt"`
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (DeliverabilityMetrics) TableName() string {
	return "deliverability_metrics"
}

// DNSRecord stores DNS configuration status for custom domains
type DNSRecord struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID uuid.UUID `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator   User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Domain    string    `gorm:"column:domain;size:255;not null" json:"domain"`

	// DNS Record Types
	RecordType  string `gorm:"column:record_type;size:10;not null" json:"recordType"` // SPF, DKIM, DMARC
	RecordName  string `gorm:"column:record_name;size:255" json:"recordName"`
	RecordValue string `gorm:"column:record_value;type:text" json:"recordValue"`

	// Verification status
	IsVerified   bool       `gorm:"column:is_verified;default:false" json:"isVerified"`
	VerifiedAt   *time.Time `gorm:"column:verified_at" json:"verifiedAt,omitempty"`
	LastChecked  *time.Time `gorm:"column:last_checked" json:"lastChecked,omitempty"`
	ErrorMessage *string    `gorm:"column:error_message;size:500" json:"errorMessage,omitempty"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (DNSRecord) TableName() string {
	return "dns_records"
}

// InboxPlacement tracks inbox vs spam placement per provider
type InboxPlacement struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID  uuid.UUID `gorm:"column:creator_id;type:uuid;not null;index" json:"creatorId"`
	Creator    User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	CampaignID uuid.UUID `gorm:"column:campaign_id;type:uuid;not null;index" json:"campaignId"`
	Campaign   Campaign  `gorm:"foreignKey:CampaignID;constraint:OnDelete:CASCADE" json:"-"`

	// Provider (gmail, outlook, yahoo, etc.)
	Provider string `gorm:"column:provider;size:50;not null;index" json:"provider"`

	// Placement stats
	TotalSent   int `gorm:"column:total_sent;default:0" json:"totalSent"`
	InboxCount  int `gorm:"column:inbox_count;default:0" json:"inboxCount"`
	SpamCount   int `gorm:"column:spam_count;default:0" json:"spamCount"`
	UnknownCount int `gorm:"column:unknown_count;default:0" json:"unknownCount"`

	// Calculated placement rate
	InboxRate float64 `gorm:"column:inbox_rate;default:0" json:"inboxRate"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (InboxPlacement) TableName() string {
	return "inbox_placements"
}

// EngagementTier represents engagement level categories
type EngagementTier string

const (
	EngagementTierHighly    EngagementTier = "highly_engaged"   // 80-100 score
	EngagementTierModerate  EngagementTier = "moderately_engaged" // 50-79 score
	EngagementTierLow       EngagementTier = "low_engagement"     // 20-49 score
	EngagementTierUnengaged EngagementTier = "unengaged"          // 0-19 score or no activity in 90 days
)
