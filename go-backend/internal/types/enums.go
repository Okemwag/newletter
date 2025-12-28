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
