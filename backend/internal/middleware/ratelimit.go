package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
)

type RateLimitConfig struct {
	Requests int           // Max requests allowed
	Window   time.Duration // Time window
	Message  string        // Error message
}

// Default rate limit configurations
var (
	DefaultRateLimit = RateLimitConfig{
		Requests: 100,
		Window:   time.Minute,
		Message:  "Too many requests, please try again later",
	}

	AuthRateLimit = RateLimitConfig{
		Requests: 10,
		Window:   time.Minute,
		Message:  "Too many authentication attempts",
	}

	WebhookRateLimit = RateLimitConfig{
		Requests: 1000,
		Window:   time.Minute,
		Message:  "Webhook rate limit exceeded",
	}

	StrictRateLimit = RateLimitConfig{
		Requests: 20,
		Window:   time.Minute,
		Message:  "Rate limit exceeded",
	}
)

// RateLimiter creates a rate limiting middleware
func RateLimiter(config RateLimitConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if Redis not connected
		if !database.IsRedisConnected() {
			c.Next()
			return
		}

		// Get identifier (user ID if authenticated, otherwise IP)
		var identifier string
		if userID, exists := c.Get("userID"); exists {
			identifier = userID.(uuid.UUID).String()
		} else {
			identifier = c.ClientIP()
		}

		key := fmt.Sprintf("ratelimit:%s:%s", c.FullPath(), identifier)

		// Get current count
		count, err := database.CacheIncr(key)
		if err != nil {
			c.Next()
			return
		}

		// Set expiry on first request
		if count == 1 {
			database.CacheExpire(key, config.Window)
		}

		// Check if over limit
		if count > int64(config.Requests) {
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", config.Requests))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("Retry-After", fmt.Sprintf("%d", int(config.Window.Seconds())))

			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":      config.Message,
				"retryAfter": int(config.Window.Seconds()),
			})
			c.Abort()
			return
		}

		// Set rate limit headers
		remaining := config.Requests - int(count)
		if remaining < 0 {
			remaining = 0
		}
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", config.Requests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

		c.Next()
	}
}

// GlobalRateLimiter applies default rate limiting
func GlobalRateLimiter() gin.HandlerFunc {
	return RateLimiter(DefaultRateLimit)
}

// IPRateLimiter specifically limits by IP (for public endpoints)
func IPRateLimiter(requests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !database.IsRedisConnected() {
			c.Next()
			return
		}

		ip := c.ClientIP()
		key := fmt.Sprintf("ratelimit:ip:%s:%s", c.FullPath(), ip)

		count, err := database.CacheIncr(key)
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			database.CacheExpire(key, window)
		}

		if count > int64(requests) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		c.Next()
	}
}
