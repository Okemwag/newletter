# Newsletter Platform

A production-ready newsletter platform backend built with Go (Gin + GORM) featuring subscriber management, email campaigns, analytics, payment integrations, and a robust referral system.

## ✨ Features

### Core
- **Authentication**: JWT with refresh tokens, role-based access control
- **Subscribers**: CRUD, bulk import/export, segmentation with tags
- **Campaigns**: Draft, schedule, send via SendGrid, tag targeting
- **Analytics**: Open/click tracking, growth charts, campaign performance

### Payments
- **Paystack**: Nigeria, Ghana, South Africa (card payments)
- **M-Pesa**: Kenya, Tanzania (mobile money STK push)
- **Subscriptions**: Plans, user subscriptions, revenue tracking

### Marketing
- **Referral System**: Viral coefficient (K-factor), multi-tier rewards
- **Gamification**: Levels, badges, leaderboards
- **A/B Testing**: Statistical confidence calculation
- **Attribution**: UTM parameter tracking

### Infrastructure
- **Rate Limiting**: Redis-based, per-endpoint configuration
- **Background Workers**: Scheduled campaigns, subscription expiry
- **Webhooks**: Event notifications with HMAC signing
- **Email Templates**: 5 beautiful HTML templates included

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL 14+
- Redis (optional, for rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/okemwag/newsletter.git
cd newsletter/go-backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run the server
go run cmd/server/main.go
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=newsletter
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION_DAYS=7

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=newsletter@yourdomain.com

# Payments
PAYSTACK_SECRET_KEY=sk_test_xxx
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
```

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Subscribers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscribers` | List all subscribers |
| POST | `/api/subscribers` | Create subscriber |
| POST | `/api/subscribers/import` | Bulk import (CSV) |
| GET | `/api/subscribers/export` | Export to CSV |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/:id/send` | Send now |
| POST | `/api/campaigns/:id/schedule` | Schedule for later |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/paystack/initialize` | Start Paystack payment |
| POST | `/api/payments/mpesa/stkpush` | Initiate M-Pesa STK |

### Referrals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/referrals/program` | Create referral program |
| GET | `/api/referrals/metrics` | Get viral metrics |
| GET | `/api/referrals/leaderboard` | View leaderboard |

## 🏗️ Project Structure

```
go-backend/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/              # Configuration management
│   ├── database/            # Database & Redis connections
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # Auth, rate limiting
│   ├── models/              # GORM models
│   ├── services/            # Business logic
│   ├── types/               # Custom types & enums
│   └── workers/             # Background job workers
├── pkg/
│   └── utils/               # JWT, password utilities
├── templates/               # Email HTML templates
└── migrations/              # SQL migration files
```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/services/...
```

## 📊 Metrics

The platform calculates viral growth metrics including:

- **Viral Coefficient (K)**: Average referrals per user × conversion rate
- **Effective K**: K adjusted for churn rate
- **Projected Growth**: Weekly growth rate based on viral cycle time

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM](https://gorm.io/)
- [SendGrid](https://sendgrid.com/)
- [Paystack](https://paystack.com/)
- [Safaricom M-Pesa](https://developer.safaricom.co.ke/)
