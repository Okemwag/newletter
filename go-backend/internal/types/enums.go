package types

type UserRole string

const (
	UserRoleCreator    UserRole = "creator"
	UserRoleSubscriber UserRole = "subscriber"
	UserRoleAdmin      UserRole = "admin"
)

type ContentStatus string

const (
	ContentStatusDraft     ContentStatus = "draft"
	ContentStatusPublished ContentStatus = "published"
	ContentStatusScheduled ContentStatus = "scheduled"
)

type SubscriptionStatus string

const (
	SubscriptionFree    SubscriptionStatus = "free"
	SubscriptionPremium SubscriptionStatus = "premium"
)

// CreatorStatus tracks onboarding and activation state
type CreatorStatus string

const (
	CreatorStatusDraft              CreatorStatus = "draft"
	CreatorStatusEmailVerified      CreatorStatus = "email_verified"
	CreatorStatusProfileCreated     CreatorStatus = "profile_created"
	CreatorStatusPricingSet         CreatorStatus = "pricing_set"
	CreatorStatusPayoutPendingReview CreatorStatus = "payout_pending_review"
	CreatorStatusActiveEarning      CreatorStatus = "active_earning"
	CreatorStatusPayoutsEnabled     CreatorStatus = "payouts_enabled"
	CreatorStatusSuspended          CreatorStatus = "suspended"
)

// PayoutStatus tracks payout request states
type PayoutStatus string

const (
	PayoutStatusPending    PayoutStatus = "pending"
	PayoutStatusProcessing PayoutStatus = "processing"
	PayoutStatusCompleted  PayoutStatus = "completed"
	PayoutStatusFailed     PayoutStatus = "failed"
	PayoutStatusCancelled  PayoutStatus = "cancelled"
)

// FraudFlagType categorizes fraud signals
type FraudFlagType string

const (
	FraudFlagVelocity         FraudFlagType = "velocity"
	FraudFlagPriceAnomaly     FraudFlagType = "price_anomaly"
	FraudFlagDevicePattern    FraudFlagType = "device_pattern"
	FraudFlagSubscriberDiversity FraudFlagType = "subscriber_diversity"
	FraudFlagChargeback       FraudFlagType = "chargeback"
	FraudFlagPayoutEdit       FraudFlagType = "payout_edit"
)

// FraudSeverity levels
type FraudSeverity string

const (
	FraudSeverityLow      FraudSeverity = "low"
	FraudSeverityMedium   FraudSeverity = "medium"
	FraudSeverityHigh     FraudSeverity = "high"
	FraudSeverityCritical FraudSeverity = "critical"
)
