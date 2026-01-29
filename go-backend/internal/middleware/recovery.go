package middleware

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/okemwag/newsletter/internal/config"
)

// Recovery returns a Gin recovery middleware that logs panics and returns
// a generic error in production (no stack trace in response).
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID, _ := c.Get(RequestIDKey)
				slog.Error("panic recovered",
					"error", err,
					"path", c.Request.URL.Path,
					"method", c.Request.Method,
					"request_id", requestID,
				)

				if config.IsProduction() {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
						"error": "internal server error",
					})
				} else {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
						"error": err,
					})
				}
			}
		}()
		c.Next()
	}
}
