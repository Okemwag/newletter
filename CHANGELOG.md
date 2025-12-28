# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2024-12-28

### Added

#### Backend (go-backend)
- User authentication with JWT and refresh tokens
- Role-based access control (admin, creator, subscriber)
- Subscriber management with bulk import/export
- Campaign creation, scheduling, and sending
- SendGrid email integration with tracking
- Paystack payment integration (Nigeria, Ghana, SA)
- M-Pesa STK push integration (Kenya)
- Referral system with viral metrics and gamification
- A/B testing with statistical confidence
- Rate limiting with Redis
- Background workers for scheduled tasks
- Webhook system with HMAC signing
- 5 HTML email templates
- Admin dashboard endpoints

#### Infrastructure
- Docker and docker-compose setup
- PostgreSQL database with migrations
- Redis for caching and rate limiting
