# Newsletter Platform

A full-stack newsletter platform with a Go backend and client frontend, featuring subscriber management, email campaigns, analytics, African payment integrations, and a robust referral marketing system.

## 📦 Project Structure

```
newsletter/
├── backend/             # Go API server
│   ├── cmd/server/      # Application entry point
│   ├── internal/        # Private application code
│   ├── pkg/utils/       # Shared utilities
│   ├── templates/       # Email HTML templates
│   └── migrations/      # Database migrations
├── client/              # Frontend application
├── docker-compose.yml   # Local development setup
└── README.md            # This file
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT with refresh tokens, role-based access |
| **Subscribers** | CRUD, bulk import/export, tag segmentation |
| **Campaigns** | Draft, schedule, send via SendGrid |
| **Analytics** | Open/click tracking, growth charts |
| **Payments** | Paystack (Nigeria), M-Pesa (Kenya) |
| **Referrals** | Viral metrics, gamification, A/B testing |
| **Admin** | Platform stats, user management, revenue |

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+ (for client)
- PostgreSQL 14+
- Redis (optional)

### Using Docker

```bash
# Start all services
docker-compose up -d

# API available at http://localhost:8080
# Frontend at http://localhost:3000
```

### Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
go mod download
go run cmd/server/main.go
```

#### Frontend
```bash
cd client
pnpm install
pnpm dev
```

## 📚 API Endpoints

| Category | Count | Examples |
|----------|-------|----------|
| Auth | 4 | `/api/auth/login`, `/api/auth/signup` |
| Subscribers | 8 | `/api/subscribers`, `/api/subscribers/import` |
| Campaigns | 8 | `/api/campaigns`, `/api/campaigns/:id/send` |
| Payments | 10 | `/api/payments/paystack/initialize` |
| Referrals | 14 | `/api/referrals/metrics`, `/api/referrals/leaderboard` |
| Admin | 8 | `/api/admin/stats`, `/api/admin/revenue` |

## 🔧 Environment Variables

See `backend/.env.example` for all configuration options.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.
