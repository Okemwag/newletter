package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/okemwag/newsletter/internal/config"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/handlers"
	"github.com/okemwag/newsletter/internal/middleware"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/services"
	"github.com/okemwag/newsletter/internal/types"
	"github.com/okemwag/newsletter/internal/workers"
)

func main() {
	config.Load()

	// Structured logging level
	setLogLevel(config.AppConfig.LogLevel)
	if config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	database.Connect()
	database.ConnectRedis()

	// Run SQL migrations first (versioned schema)
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Auto-migrate for tables/columns not yet in SQL migrations (remove when 000002+ is complete)
	db := database.GetDB()
	if err := db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.NewsletterContent{},
		&models.Subscriber{},
		&models.Tag{},
		&models.Campaign{},
		&models.EmailEvent{},
		&models.SubscriptionPlan{},
		&models.Payment{},
		&models.UserSubscription{},
		&models.Webhook{},
		&models.WebhookLog{},
		&models.APIKey{},
		&models.EmailTemplate{},
		&models.ReferralProgram{},
		&models.ReferralCode{},
		&models.ReferralEvent{},
		&models.ReferralReward{},
		&models.ReferralLeaderboard{},
		&models.ABTestVariant{},
		&models.CreatorBalance{},
		&models.CreatorPayout{},
		&models.PayoutCap{},
		&models.FraudFlag{},
		&models.EmailVerification{},
		&models.PhoneVerification{},
		&models.CreatorEarning{},
	); err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	worker := workers.NewWorker()
	worker.Start()

	r := gin.New()
	r.Use(middleware.RequestID())
	r.Use(middleware.Recovery())
	r.Use(gin.Logger())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.GlobalRateLimiter())

	// Health: ping DB (and optionally Redis); return 503 if DB unhealthy
	r.GET("/health", func(c *gin.Context) {
		if err := database.PingDB(); err != nil {
			slog.Warn("health check: database ping failed", "error", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status":  "unhealthy",
				"message": "database unavailable",
				"db":      "down",
				"redis":   database.IsRedisConnected(),
			})
			return
		}
		redisOK := database.IsRedisConnected()
		if database.GetRedis() != nil {
			if err := database.PingRedis(); err != nil {
				redisOK = false
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Newsletter API is running",
			"db":      "up",
			"redis":   redisOK,
		})
	})

	authHandler := handlers.NewAuthHandler()
	userHandler := handlers.NewUserHandler()
	contentHandler := handlers.NewContentHandler()
	subscriberHandler := handlers.NewSubscriberHandler()
	tagHandler := handlers.NewTagHandler()
	campaignHandler := handlers.NewCampaignHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()
	paymentHandler := handlers.NewPaymentHandler()
	adminHandler := handlers.NewAdminHandler()
	webhookHandler := handlers.NewWebhookHandler()
	referralHandler := handlers.NewReferralHandler()
	templateHandler := handlers.NewTemplateHandler()

	r.GET("/api/unsubscribe/:token", subscriberHandler.Unsubscribe)
	r.GET("/api/track/open/:campaignId/:subscriberId", analyticsHandler.TrackOpen)
	r.GET("/api/track/click/:campaignId/:subscriberId", analyticsHandler.TrackClick)

	r.POST("/api/webhooks/paystack", paymentHandler.PaystackWebhook)
	r.POST("/api/webhooks/mpesa", paymentHandler.MpesaCallback)

	r.GET("/api/r/:code", referralHandler.TrackClick)
	r.GET("/api/referrals/code/:code", referralHandler.GetCode)
	r.POST("/api/referrals/track", referralHandler.TrackEvent)
	r.GET("/api/referrals/ab-test/select", referralHandler.SelectABVariant)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		auth.Use(middleware.RateLimiter(middleware.AuthRateLimit))
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/register", authHandler.Signup)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddlewareAllowUnverified(), authHandler.Me)
		}

		onboardingService := services.NewOnboardingService(db)
		fraudService := services.NewFraudService(db)
		onboardingHandler := handlers.NewOnboardingHandler(onboardingService, fraudService)

		onboarding := api.Group("/onboarding")
		onboarding.Use(middleware.AuthMiddlewareAllowUnverified())
		{
			onboarding.POST("/verify-email", onboardingHandler.VerifyEmail)
			onboarding.POST("/resend-verification", onboardingHandler.ResendVerification)
			onboarding.PUT("/profile", onboardingHandler.SetupProfile)
			onboarding.PUT("/pricing", onboardingHandler.SetPricing)
			onboarding.PUT("/payout", onboardingHandler.SetupPayout)
			onboarding.POST("/verify-payout", onboardingHandler.VerifyPayout)
			onboarding.PUT("/kyc", onboardingHandler.SubmitKYC)
			onboarding.POST("/activate", onboardingHandler.Activate)
			onboarding.GET("/status", onboardingHandler.GetStatus)
		}

		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
			users.GET("", middleware.RoleMiddleware(types.UserRoleAdmin), userHandler.GetAllUsers)
		}

		content := api.Group("/content")
		{
			content.GET("/published", contentHandler.GetPublished)
			content.GET("/:id", contentHandler.GetOne)

			protected := content.Group("")
			protected.Use(middleware.AuthMiddleware())
			{
				protected.POST("", contentHandler.Create)
				protected.GET("", contentHandler.GetAll)
				protected.PUT("/:id", contentHandler.Update)
				protected.DELETE("/:id", contentHandler.Delete)
				protected.GET("/status/:status", contentHandler.GetByStatus)
			}
		}

		subscribers := api.Group("/subscribers")
		subscribers.Use(middleware.AuthMiddleware())
		{
			subscribers.POST("", subscriberHandler.Create)
			subscribers.GET("", subscriberHandler.GetAll)
			subscribers.GET("/stats", subscriberHandler.GetStats)
			subscribers.GET("/export", subscriberHandler.Export)
			subscribers.POST("/import", subscriberHandler.Import)
			subscribers.GET("/:id", subscriberHandler.GetOne)
			subscribers.PUT("/:id", subscriberHandler.Update)
			subscribers.DELETE("/:id", subscriberHandler.Delete)
		}

		tags := api.Group("/tags")
		tags.Use(middleware.AuthMiddleware())
		{
			tags.POST("", tagHandler.Create)
			tags.GET("", tagHandler.GetAll)
			tags.GET("/:id", tagHandler.GetOne)
			tags.PUT("/:id", tagHandler.Update)
			tags.DELETE("/:id", tagHandler.Delete)
		}

		campaigns := api.Group("/campaigns")
		campaigns.Use(middleware.AuthMiddleware())
		{
			campaigns.POST("", campaignHandler.Create)
			campaigns.GET("", campaignHandler.GetAll)
			campaigns.GET("/:id", campaignHandler.GetOne)
			campaigns.PUT("/:id", campaignHandler.Update)
			campaigns.DELETE("/:id", campaignHandler.Delete)
			campaigns.POST("/:id/schedule", campaignHandler.Schedule)
			campaigns.POST("/:id/send", campaignHandler.SendNow)
			campaigns.GET("/:id/stats", campaignHandler.GetStats)
		}

		analytics := api.Group("/analytics")
		analytics.Use(middleware.AuthMiddleware())
		{
			analytics.GET("/overview", analyticsHandler.GetOverview)
			analytics.GET("/growth", analyticsHandler.GetGrowth)
			analytics.GET("/top-campaigns", analyticsHandler.GetTopCampaigns)
		}

		plans := api.Group("/plans")
		plans.Use(middleware.AuthMiddleware())
		{
			plans.POST("", paymentHandler.CreatePlan)
			plans.GET("", paymentHandler.GetPlans)
			plans.GET("/:id", paymentHandler.GetPlan)
			plans.PUT("/:id", paymentHandler.UpdatePlan)
			plans.DELETE("/:id", paymentHandler.DeletePlan)
		}

		payments := api.Group("/payments")
		payments.Use(middleware.AuthMiddleware())
		{
			payments.GET("/providers", paymentHandler.GetProviders)
			payments.POST("/paystack/initialize", paymentHandler.InitializePaystack)
			payments.GET("/paystack/verify/:reference", paymentHandler.VerifyPaystack)
			payments.POST("/mpesa/stkpush", paymentHandler.InitiateMpesa)
			payments.GET("/mpesa/status/:checkoutId", paymentHandler.MpesaStatus)
		}

		subscriptions := api.Group("/subscriptions")
		subscriptions.Use(middleware.AuthMiddleware())
		{
			subscriptions.GET("/my", paymentHandler.GetMySubscriptions)
			subscriptions.GET("/subscribers", paymentHandler.GetMySubscribers)
			subscriptions.GET("/revenue", paymentHandler.GetRevenue)
		}

		webhooks := api.Group("/webhooks")
		webhooks.Use(middleware.AuthMiddleware())
		{
			webhooks.POST("", webhookHandler.Create)
			webhooks.GET("", webhookHandler.GetAll)
			webhooks.GET("/:id", webhookHandler.GetOne)
			webhooks.PUT("/:id", webhookHandler.Update)
			webhooks.DELETE("/:id", webhookHandler.Delete)
			webhooks.POST("/:id/regenerate-secret", webhookHandler.RegenerateSecret)
			webhooks.GET("/:id/logs", webhookHandler.GetLogs)
		}

		referrals := api.Group("/referrals")
		referrals.Use(middleware.AuthMiddleware())
		{
			referrals.POST("/program", referralHandler.CreateProgram)
			referrals.GET("/program", referralHandler.GetProgram)
			referrals.PUT("/program", referralHandler.UpdateProgram)
			referrals.POST("/code", referralHandler.GenerateCode)
			referrals.PUT("/code/:id/slug", referralHandler.SetCustomSlug)
			referrals.GET("/stats", referralHandler.GetStats)
			referrals.GET("/metrics", referralHandler.GetViralMetrics)
			referrals.GET("/leaderboard", referralHandler.GetLeaderboard)
			referrals.POST("/ab-test", referralHandler.CreateABVariant)
			referrals.GET("/ab-test", referralHandler.GetABVariants)
		}

		templates := api.Group("/templates")
		templates.Use(middleware.AuthMiddleware())
		{
			templates.POST("", templateHandler.Create)
			templates.GET("", templateHandler.GetAll)
			templates.GET("/defaults", templateHandler.GetDefaults)
			templates.POST("/initialize", templateHandler.InitializeDefaults)
			templates.GET("/category/:category", templateHandler.GetByCategory)
			templates.GET("/:id", templateHandler.GetOne)
			templates.PUT("/:id", templateHandler.Update)
			templates.DELETE("/:id", templateHandler.Delete)
			templates.POST("/:id/duplicate", templateHandler.Duplicate)
			templates.GET("/:id/preview", templateHandler.Preview)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware(types.UserRoleAdmin))
		{
			admin.GET("/stats", adminHandler.GetPlatformStats)
			admin.GET("/users", adminHandler.GetAllUsers)
			admin.PUT("/users/:id/role", adminHandler.UpdateUserRole)
			admin.PUT("/users/:id/status", adminHandler.UpdateUserStatus)
			admin.GET("/campaigns", adminHandler.GetAllCampaigns)
			admin.DELETE("/content/:id", adminHandler.DeleteContent)
			admin.GET("/revenue", adminHandler.GetRevenue)
			admin.GET("/top-creators", adminHandler.GetTopCreators)
		}
	}

	port := config.AppConfig.ServerPort
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("Server starting", "port", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")
	worker.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	slog.Info("Server stopped")
}

func setLogLevel(level string) {
	var l slog.Level
	switch level {
	case "debug":
		l = slog.LevelDebug
	case "warn":
		l = slog.LevelWarn
	case "error":
		l = slog.LevelError
	default:
		l = slog.LevelInfo
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: l})))
}
