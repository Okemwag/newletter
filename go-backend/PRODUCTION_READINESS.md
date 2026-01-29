# Backend Production Readiness Audit

This document summarizes the current state of the Go backend and what is required to be **100% production ready**.

---

## Executive Summary

| Category              | Status   | Notes |
|----------------------|----------|--------|
| **Critical (must fix)** | 3 items | Auth refresh API mismatch, config validation, migrations strategy |
| **High**            | 6 items  | Graceful shutdown, DB pool, health depth, M-Pesa webhook, secrets, logging |
| **Medium**          | 5 items  | CORS/env, pagination caps, error sanitization, request ID, .env.example |
| **Nice to have**    | 4 items  | Metrics, API versioning, docs, verification code entropy |

---

## 1. Critical (Must Fix Before Production)

### 1.1 Auth refresh request/response mismatch (bug)

**Current:** Token refresh is broken between client and backend.

- **Request:** Client sends `refresh_token` (snake_case). Backend expects `refreshToken` (camelCase) and fails with 400 if missing.
- **Response:** Backend returns `TokenPair` with `accessToken`, `refreshToken`, `expiresIn`. Client expects `access_token`, `refresh_token` and will not persist new tokens.

**Fix:** Either:

- **Option A (recommended):** In `internal/handlers/auth.go`, accept both names and return snake_case for compatibility:
  - Request: accept `refresh_token` or `refreshToken` (e.g. struct with `json:"refresh_token"` and also bind from query/header if needed, or a custom struct that checks both).
  - Response: return a map or a response struct that serializes as `access_token` and `refresh_token` (e.g. `json:"access_token"` / `json:"refresh_token"`).
- **Option B:** Change the client to send `refreshToken` and read `accessToken`/`refreshToken` from the response.

**Files:** `go-backend/internal/handlers/auth.go`, `go-backend/pkg/utils/jwt.go` (TokenPair json tags) or client `client/lib/api.ts`.

---

### 1.2 Config: no production validation

**Current:** `internal/config/config.go` uses defaults for everything. In production:

- `JWT_SECRET` can remain `"default-secret-key"` if not set → **critical security risk**.
- `DB_SSLMODE` can stay `disable` → unencrypted DB traffic.
- No validation that required vars are set and safe.

**Fix:**

- Require `JWT_SECRET` in production (e.g. when `APP_ENV=production` or when `JWT_SECRET` is empty, fail startup with a clear error).
- Enforce minimum length for `JWT_SECRET` (e.g. 32 bytes).
- In production, reject `DB_SSLMODE=disable` or require explicit `DB_SSLMODE=require` (or equivalent).
- Add an `APP_ENV` (or similar) and skip strict checks only for `development`/`local`.

**File:** `internal/config/config.go`.

---

### 1.3 Database: dual migration strategy

**Current:** Two conflicting approaches:

- `cmd/server/main.go` runs **GORM AutoMigrate** on every startup (adds/alters tables from Go models).
- `internal/database/migrations.go` and `migrations/*.sql` provide **versioned SQL migrations** but are not invoked in `main.go`.

AutoMigrate in production is risky (no rollback, no controlled change history, potential drift with SQL migrations).

**Fix (choose one and stick to it):**

- **Recommended:** Use **only SQL migrations** in production:
  - In `main.go`, remove the `db.AutoMigrate(...)` block.
  - At startup, call `database.RunMigrations()` (or run migrations in a separate step before starting the API).
  - Ensure all schema changes are done via new migration files (e.g. `000002_xxx.up.sql` / `.down.sql`), and that GORM models stay in sync with the migrated schema.
- **Alternative:** Use only GORM AutoMigrate and remove the golang-migrate SQL flow; then document that rollbacks are not supported. Not recommended for production.

**Files:** `cmd/server/main.go`, `internal/database/migrations.go`, and migration SQL files.

---

## 2. High Priority

### 2.1 No graceful shutdown

**Current:** `main.go` starts the server with `r.Run(":" + port)`. On SIGTERM/SIGINT the process exits without:

- Stopping the HTTP server (no drain of in-flight requests).
- Stopping the background worker cleanly (worker has `defer worker.Stop()` but the process may exit before it runs).

**Fix:**

- Use `http.Server` and `srv.ListenAndServe()` instead of `r.Run()`.
- On `context.Canceled` or OS signal, call `srv.Shutdown(ctx)` with a timeout (e.g. 30s), then call `worker.Stop()` and wait for the worker to exit before exiting the process.

**File:** `cmd/server/main.go`.

---

### 2.2 Database connection pool

**Current:** GORM is used with default pool settings. No explicit `SetMaxIdleConns`, `SetMaxOpenConns`, or `SetConnMaxLifetime`.

**Fix:** After `gorm.Open`, get the underlying `*sql.DB` and set:

- `SetMaxOpenConns` (e.g. 25–50).
- `SetMaxIdleConns` (e.g. 5–10).
- `SetConnMaxLifetime` (e.g. 5 minutes).

**File:** `internal/database/database.go`.

---

### 2.3 Health check does not verify DB/Redis

**Current:** `GET /health` returns static JSON and only reports `redis: database.IsRedisConnected()`. It does not actually ping the database or Redis.

**Fix:**

- Ping PostgreSQL (e.g. `db.Exec("SELECT 1")` or equivalent).
- If Redis is required in production, ping Redis; otherwise document that Redis is optional and health can stay “ok” when Redis is down.
- Return 503 if DB (or required Redis) is down so orchestrators can mark the instance unhealthy.

**File:** `cmd/server/main.go` (health handler) or a small helper in `internal/database`.

---

### 2.4 M-Pesa callback not verified

**Current:** Paystack webhook validates signature via `ValidateWebhookSignature`. M-Pesa callback (`POST /api/webhooks/mpesa`) has no signature or authentication check; anyone who can reach the URL can POST fake callbacks.

**Fix:** Implement M-Pesa callback verification (e.g. per Safaricom docs: validate signature or use a shared secret/validation URL). Reject requests that fail verification with 401/403.

**Files:** `internal/handlers/payments.go`, `internal/services/mpesa.go`.

---

### 2.5 Secrets and defaults in config

**Current:**

- `JWT_SECRET` defaults to `"default-secret-key"` (see §1.2).
- `DB_PASSWORD` defaults to `"password"`.
- No `.env.example` in `go-backend` (only `.env`, which should be gitignored).

**Fix:**

- No default for `JWT_SECRET` in production; fail fast if missing or weak.
- No default for `DB_PASSWORD` in production (or document that default is dev-only).
- Add `go-backend/.env.example` listing every required and optional variable with safe placeholders and comments.

**Files:** `internal/config/config.go`, new `go-backend/.env.example`.

---

### 2.6 Structured logging and log level

**Current:** Uses `log` and `log.Printf`. No request ID, no structured (JSON) logs, no log level (e.g. debug vs production). Gin’s default logger prints full request paths and client IPs, which is acceptable but not structured.

**Fix:**

- Introduce a small structured logger (e.g. JSON to stdout with level, message, request_id, error).
- Add a request ID middleware (generate or propagate `X-Request-Id`) and add it to logs and optionally to response headers.
- Make log level configurable (e.g. `LOG_LEVEL=info` in production, `debug` in dev).

**Files:** New `pkg/logger` or similar, `internal/middleware/request_id.go`, `cmd/server/main.go`.

---

## 3. Medium Priority

### 3.1 CORS origins from env

**Current:** CORS uses `CORS_ALLOWED_ORIGINS` with a default that includes localhost. Good; ensure production deployments set this explicitly and do not allow `*` with credentials.

**Fix:** Document in `.env.example`. Optionally in production reject empty or overly broad values.

**File:** `internal/middleware/cors.go`, `.env.example`.

---

### 3.2 Pagination and export caps

**Current:**

- Subscriber list: `PageSize` capped at 100 in service — good.
- Subscriber export: hardcoded `PageSize: 10000` — can be heavy for large lists and may time out.

**Fix:** Cap export (e.g. 5k or 10k) and document, or implement streaming export so the response is bounded. Ensure other list endpoints have a max page size (many already do).

**File:** `internal/handlers/subscribers.go`, `internal/services/subscribers.go`.

---

### 3.3 Error responses and panic recovery

**Current:** Gin’s default Recovery middleware returns 500 with a body that can include stack traces or internal details in debug mode.

**Fix:** In production (`GIN_MODE=release` or `APP_ENV=production`), use a custom Recovery that logs the panic but returns a generic JSON error (e.g. `{"error":"internal server error"}`) without stack traces. Ensure `GIN_MODE=release` is set in production.

**File:** `cmd/server/main.go`.

---

### 3.4 Request ID / tracing

**Current:** No request ID or distributed tracing. Hard to correlate logs and support issues.

**Fix:** Add middleware that sets a request ID (UUID or from `X-Request-Id`), stores it in context, and adds it to response header (e.g. `X-Request-Id`). Use it in structured logs (see §2.6).

**File:** New `internal/middleware/request_id.go`, wire in `main.go`.

---

### 3.5 .env.example

**Current:** No `.env.example` in `go-backend`.

**Fix:** Add `go-backend/.env.example` with:

- All required variables (e.g. `DB_*`, `JWT_SECRET`, `SERVER_PORT`).
- Optional ones (e.g. `REDIS_URL`, `CORS_ALLOWED_ORIGINS`, `PAYSTACK_*`, M-Pesa vars, `LOG_LEVEL`, `APP_ENV`).
- Placeholder values and short comments. Do not put real secrets.

**File:** New `go-backend/.env.example`.

---

## 4. Nice to Have

- **Metrics:** Expose Prometheus metrics (e.g. request duration, status codes, DB pool usage) and a `/metrics` endpoint (or separate port).
- **API versioning:** Prefix routes with `/api/v1/` (or similar) so you can evolve the API without breaking clients.
- **API docs:** OpenAPI/Swagger for public and internal APIs.
- **Verification code entropy:** `generateVerificationCode()` in auth service uses `time.Now().UnixNano()` and sleep; use `crypto/rand` for secure random digits.

**Files:** New metrics middleware + router, `internal/services/auth.go` (verification code).

---

## 5. What Is Already in Good Shape

- **Auth:** JWT + refresh tokens, email verification flow, role-based access (admin middleware).
- **Security:** Password hashing with bcrypt (cost 10), Paystack webhook signature verification, rate limiting (global + auth-specific, Redis-backed when available).
- **CORS:** Configurable origins, credentials support, no wildcard with credentials by default.
- **Docker:** Multi-stage build, non-root user, HEALTHCHECK on `/health`.
- **Payments:** Paystack init/verify and webhook handling; M-Pesa STK push and status (callback verification still needed).
- **Handlers:** Consistent use of bind/validate and HTTP status codes; list endpoints use pagination with caps in many places.
- **Worker:** Scheduled campaigns and subscription expiry run on a ticker; clean separation of worker and HTTP server.

---

## 6. Checklist for 100% Production Ready

Use this as a short checklist after implementing the fixes above.

- [ ] **Auth refresh** works end-to-end (client sends token, receives and stores new tokens).
- [ ] **Config** validates production (JWT_SECRET required and strong, DB_SSLMODE safe, no unsafe defaults in prod).
- [ ] **Migrations:** Single strategy (SQL migrations only, no AutoMigrate in prod) and documented.
- [ ] **Graceful shutdown:** Server and worker stop cleanly on SIGTERM/SIGINT.
- [ ] **DB pool:** MaxOpenConns, MaxIdleConns, ConnMaxLifetime set.
- [ ] **Health:** `/health` pings DB (and required Redis); returns 503 when unhealthy.
- [ ] **M-Pesa webhook:** Callback verified (signature or documented verification method).
- [ ] **Secrets:** No default JWT_SECRET/DB password in production; `.env.example` present.
- [ ] **Logging:** Structured logs, configurable level, request ID in logs and response.
- [ ] **CORS:** Production origins set via env and documented.
- [ ] **Errors:** Production panic recovery does not leak stack traces.
- [ ] **Export/pagination:** Export capped or streamed; all list endpoints have max page size.
- [ ] **GIN_MODE=release** (or equivalent) set in production.
- [ ] **Optional:** Metrics, API versioning, API docs, crypto/rand for verification codes.

---

## 7. Suggested Order of Work

1. Fix auth refresh request/response (§1.1) and config validation (§1.2).
2. Unify migrations and remove AutoMigrate in prod (§1.3).
3. Add graceful shutdown (§2.1), DB pool (§2.2), and real health checks (§2.3).
4. Add `.env.example` and production config validation (§2.5).
5. Secure M-Pesa callback (§2.4).
6. Add request ID and structured logging (§2.6, §3.4).
7. Harden error responses and CORS docs (§3.1, §3.3).
8. Cap export / document limits (§3.2).

After that, the backend is in a strong position for production; the “nice to have” items can be added incrementally.
