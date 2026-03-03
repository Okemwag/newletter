# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-28

### Added

#### Core Features
- User authentication with JWT and refresh tokens
- Role-based access control (admin, creator, subscriber)
- Newsletter content management (CRUD, publish, draft)
- Subscriber management with bulk import/export
- Tag-based segmentation for targeted campaigns

#### Email & Campaigns
- Campaign creation, scheduling, and sending
- SendGrid integration for email delivery
- Open and click tracking with analytics
- 5 beautiful HTML email templates

#### Payments
- Paystack integration (Nigeria, Ghana, SA)
- M-Pesa STK push integration (Kenya)
- Subscription plans with tiered pricing
- Payment receipt and webhook handling
- Revenue tracking and statistics

#### Referral System
- Viral coefficient (K-factor) calculation
- Multi-tier reward system with milestones
- Gamification with levels and badges
- Leaderboards (weekly, monthly, all-time)
- A/B testing with statistical confidence
- UTM attribution tracking

#### Analytics
- Dashboard overview statistics
- Subscriber growth charts
- Top performing campaigns
- Revenue analytics by provider

#### Infrastructure
- Redis-based rate limiting
- Background workers for scheduled tasks
- Webhook system with HMAC signing
- PostgreSQL with GORM ORM
- Versioned SQL migrations

### Security
- Password hashing with bcrypt
- JWT token validation
- Paystack webhook signature verification
- Rate limiting per endpoint and user

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-12-28 | Initial release with full feature set |
