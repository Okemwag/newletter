package models

import (
	"time"

	"github.com/google/uuid"
)

// ReferralProgram defines the referral program settings for a creator
type ReferralProgram struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatorID         uuid.UUID `gorm:"column:creator_id;type:uuid;not null;uniqueIndex" json:"creatorId"`
	Creator           User      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Name              string    `gorm:"size:100;not null" json:"name"`
	Description       *string   `gorm:"size:500" json:"description,omitempty"`
	IsActive          bool      `gorm:"column:is_active;default:true" json:"isActive"`
	
	// Reward Configuration
	RewardType        string    `gorm:"column:reward_type;size:20;default:'discount'" json:"rewardType"` // discount, cash, credit, free_month
	ReferrerReward    int64     `gorm:"column:referrer_reward;default:0" json:"referrerReward"`           // Amount/percentage
	RefereeReward     int64     `gorm:"column:referee_reward;default:0" json:"refereeReward"`
	RewardCurrency    string    `gorm:"column:reward_currency;size:3;default:'KES'" json:"rewardCurrency"`
	
	// Multi-tier rewards (JSON)
	TierRewards       *string   `gorm:"column:tier_rewards;type:jsonb" json:"tierRewards,omitempty"`
	
	// Viral mechanics
	ViralCoefficient  float64   `gorm:"column:viral_coefficient;default:0" json:"viralCoefficient"`
	ConversionRate    float64   `gorm:"column:conversion_rate;default:0" json:"conversionRate"`
	
	// Limits
	MaxRewardsPerUser int       `gorm:"column:max_rewards_per_user;default:10" json:"maxRewardsPerUser"`
	MinPurchaseAmount *int64    `gorm:"column:min_purchase_amount" json:"minPurchaseAmount,omitempty"`
	
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ReferralProgram) TableName() string {
	return "referral_programs"
}

// ReferralCode stores unique referral codes
type ReferralCode struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProgramID     uuid.UUID  `gorm:"column:program_id;type:uuid;not null" json:"programId"`
	Program       ReferralProgram `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE" json:"-"`
	ReferrerID    uuid.UUID  `gorm:"column:referrer_id;type:uuid;not null" json:"referrerId"`
	Referrer      User       `gorm:"foreignKey:ReferrerID;constraint:OnDelete:CASCADE" json:"-"`
	Code          string     `gorm:"size:20;not null;uniqueIndex" json:"code"`
	CustomSlug    *string    `gorm:"column:custom_slug;size:50;uniqueIndex" json:"customSlug,omitempty"`
	
	// Stats
	Clicks        int64      `gorm:"default:0" json:"clicks"`
	Signups       int64      `gorm:"default:0" json:"signups"`
	Conversions   int64      `gorm:"default:0" json:"conversions"`
	RevenueGenerated int64   `gorm:"column:revenue_generated;default:0" json:"revenueGenerated"`
	
	// Tracking
	IsActive      bool       `gorm:"column:is_active;default:true" json:"isActive"`
	ExpiresAt     *time.Time `gorm:"column:expires_at" json:"expiresAt,omitempty"`
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (ReferralCode) TableName() string {
	return "referral_codes"
}

// ReferralEvent tracks all referral activities
type ReferralEvent struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CodeID        uuid.UUID  `gorm:"column:code_id;type:uuid;not null" json:"codeId"`
	Code          ReferralCode `gorm:"foreignKey:CodeID;constraint:OnDelete:CASCADE" json:"-"`
	EventType     string     `gorm:"column:event_type;size:30;not null" json:"eventType"` // click, signup, conversion, reward_claimed
	RefereeID     *uuid.UUID `gorm:"column:referee_id;type:uuid" json:"refereeId,omitempty"`
	Referee       *User      `gorm:"foreignKey:RefereeID" json:"-"`
	
	// Attribution data
	IPAddress     *string    `gorm:"column:ip_address;size:45" json:"ipAddress,omitempty"`
	UserAgent     *string    `gorm:"column:user_agent;size:500" json:"userAgent,omitempty"`
	Source        *string    `gorm:"size:100" json:"source,omitempty"`       // social media, email, etc.
	Medium        *string    `gorm:"size:100" json:"medium,omitempty"`       // organic, paid, etc.
	Campaign      *string    `gorm:"size:100" json:"campaign,omitempty"`     // specific campaign
	
	// Value tracking
	Value         *int64     `gorm:"" json:"value,omitempty"`                // Revenue/value associated
	Metadata      *string    `gorm:"type:jsonb" json:"metadata,omitempty"`
	
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (ReferralEvent) TableName() string {
	return "referral_events"
}

// ReferralReward tracks rewards given
type ReferralReward struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProgramID     uuid.UUID  `gorm:"column:program_id;type:uuid;not null" json:"programId"`
	Program       ReferralProgram `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE" json:"-"`
	UserID        uuid.UUID  `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	User          User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	RewardType    string     `gorm:"column:reward_type;size:20" json:"rewardType"`
	Amount        int64      `gorm:"not null" json:"amount"`
	Currency      string     `gorm:"size:3;default:'KES'" json:"currency"`
	Status        string     `gorm:"size:20;default:'pending'" json:"status"` // pending, approved, paid, expired
	
	// Tier info
	Tier          int        `gorm:"default:1" json:"tier"`
	TriggerEvent  *uuid.UUID `gorm:"column:trigger_event;type:uuid" json:"triggerEvent,omitempty"`
	
	ExpiresAt     *time.Time `gorm:"column:expires_at" json:"expiresAt,omitempty"`
	ClaimedAt     *time.Time `gorm:"column:claimed_at" json:"claimedAt,omitempty"`
	CreatedAt     time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (ReferralReward) TableName() string {
	return "referral_rewards"
}

// ReferralLeaderboard for gamification
type ReferralLeaderboard struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProgramID     uuid.UUID `gorm:"column:program_id;type:uuid;not null" json:"programId"`
	Program       ReferralProgram `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE" json:"-"`
	UserID        uuid.UUID `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	User          User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Period        string    `gorm:"size:20;not null" json:"period"` // weekly, monthly, all_time
	PeriodStart   time.Time `gorm:"column:period_start" json:"periodStart"`
	
	// Metrics
	TotalReferrals    int64   `gorm:"column:total_referrals;default:0" json:"totalReferrals"`
	TotalConversions  int64   `gorm:"column:total_conversions;default:0" json:"totalConversions"`
	TotalRevenue      int64   `gorm:"column:total_revenue;default:0" json:"totalRevenue"`
	Score             float64 `gorm:"default:0" json:"score"` // Weighted score
	Rank              int     `gorm:"default:0" json:"rank"`
	
	// Gamification
	Level             int     `gorm:"default:1" json:"level"`
	Badges            *string `gorm:"type:jsonb" json:"badges,omitempty"`
	
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ReferralLeaderboard) TableName() string {
	return "referral_leaderboards"
}

// ABTestVariant for testing different referral offers
type ABTestVariant struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProgramID     uuid.UUID `gorm:"column:program_id;type:uuid;not null" json:"programId"`
	Program       ReferralProgram `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE" json:"-"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Description   *string   `gorm:"size:500" json:"description,omitempty"`
	
	// Variant config
	ReferrerReward    int64   `gorm:"column:referrer_reward" json:"referrerReward"`
	RefereeReward     int64   `gorm:"column:referee_reward" json:"refereeReward"`
	LandingPageCopy   *string `gorm:"column:landing_page_copy;type:text" json:"landingPageCopy,omitempty"`
	EmailCopy         *string `gorm:"column:email_copy;type:text" json:"emailCopy,omitempty"`
	
	// Traffic allocation
	TrafficPercentage int     `gorm:"column:traffic_percentage;default:50" json:"trafficPercentage"`
	IsControl         bool    `gorm:"column:is_control;default:false" json:"isControl"`
	
	// Results
	Impressions       int64   `gorm:"default:0" json:"impressions"`
	Clicks            int64   `gorm:"default:0" json:"clicks"`
	Signups           int64   `gorm:"default:0" json:"signups"`
	Conversions       int64   `gorm:"default:0" json:"conversions"`
	Revenue           int64   `gorm:"default:0" json:"revenue"`
	
	// Statistical significance
	ConversionRate    float64 `gorm:"column:conversion_rate;default:0" json:"conversionRate"`
	Confidence        float64 `gorm:"default:0" json:"confidence"` // Statistical confidence level
	
	IsActive      bool      `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (ABTestVariant) TableName() string {
	return "ab_test_variants"
}
