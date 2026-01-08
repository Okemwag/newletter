package main

import (
	"log"

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
	// Load configuration
	config.Load()

	// Connect to databases
	database.Connect()
	database.ConnectRedis()

	// Auto-migrate models (use proper migrations in production)
	db := database.GetDB()
	err := db.AutoMigrate(
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
		// Creator onboarding models
		&models.CreatorBalance{},
		&models.CreatorPayout{},
		&models.PayoutCap{},
		&models.FraudFlag{},
		&models.EmailVerification{},
		&models.PhoneVerification{},
		&models.CreatorEarning{},
	)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Start background worker
	worker := workers.NewWorker()
	worker.Start()
	defer worker.Stop()

	// Initialize Gin router
	r := gin.Default()

	// Apply CORS middleware (must be before other middleware)
	r.Use(middleware.CORSMiddleware())

	// Apply global rate limiting
	r.Use(middleware.GlobalRateLimiter())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Newsletter API is running",
			"redis":   database.IsRedisConnected(),
		})
	})

	// Initialize handlers
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

	// Public endpoints (no auth required)
	r.GET("/api/unsubscribe/:token", subscriberHandler.Unsubscribe)
	r.GET("/api/track/open/:campaignId/:subscriberId", analyticsHandler.TrackOpen)
	r.GET("/api/track/click/:campaignId/:subscriberId", analyticsHandler.TrackClick)

	// Payment webhooks (verified by signature)
	r.POST("/api/webhooks/paystack", paymentHandler.PaystackWebhook)
	r.POST("/api/webhooks/mpesa", paymentHandler.MpesaCallback)

	// Public referral endpoints
	r.GET("/api/r/:code", referralHandler.TrackClick)
	r.GET("/api/referrals/code/:code", referralHandler.GetCode)
	r.POST("/api/referrals/track", referralHandler.TrackEvent)
	r.GET("/api/referrals/ab-test/select", referralHandler.SelectABVariant)

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (with stricter rate limiting)
		auth := api.Group("/auth")
		auth.Use(middleware.RateLimiter(middleware.AuthRateLimit))
		{
			auth.POST("/signup", authHandler.Signup)
			auth.POST("/register", authHandler.Signup) // Alias for frontend compatibility
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddlewareAllowUnverified(), authHandler.Me)
		}

		// Onboarding routes (allows unverified users)
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

		// User routes (protected)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
			users.GET("", middleware.RoleMiddleware(types.UserRoleAdmin), userHandler.GetAllUsers)
		}

		// Content routes
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

		// Subscriber routes (protected)
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

		// Tag routes (protected)
		tags := api.Group("/tags")
		tags.Use(middleware.AuthMiddleware())
		{
			tags.POST("", tagHandler.Create)
			tags.GET("", tagHandler.GetAll)
			tags.GET("/:id", tagHandler.GetOne)
			tags.PUT("/:id", tagHandler.Update)
			tags.DELETE("/:id", tagHandler.Delete)
		}

		// Campaign routes (protected)
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

		// Analytics routes (protected)
		analytics := api.Group("/analytics")
		analytics.Use(middleware.AuthMiddleware())
		{
			analytics.GET("/overview", analyticsHandler.GetOverview)
			analytics.GET("/growth", analyticsHandler.GetGrowth)
			analytics.GET("/top-campaigns", analyticsHandler.GetTopCampaigns)
		}

		// Subscription Plans (protected)
		plans := api.Group("/plans")
		plans.Use(middleware.AuthMiddleware())
		{
			plans.POST("", paymentHandler.CreatePlan)
			plans.GET("", paymentHandler.GetPlans)
			plans.GET("/:id", paymentHandler.GetPlan)
			plans.PUT("/:id", paymentHandler.UpdatePlan)
			plans.DELETE("/:id", paymentHandler.DeletePlan)
		}

		// Payments (protected)
		payments := api.Group("/payments")
		payments.Use(middleware.AuthMiddleware())
		{
			payments.GET("/providers", paymentHandler.GetProviders)
			payments.POST("/paystack/initialize", paymentHandler.InitializePaystack)
			payments.GET("/paystack/verify/:reference", paymentHandler.VerifyPaystack)
			payments.POST("/mpesa/stkpush", paymentHandler.InitiateMpesa)
			payments.GET("/mpesa/status/:checkoutId", paymentHandler.MpesaStatus)
		}

		// Subscriptions (protected)
		subscriptions := api.Group("/subscriptions")
		subscriptions.Use(middleware.AuthMiddleware())
		{
			subscriptions.GET("/my", paymentHandler.GetMySubscriptions)
			subscriptions.GET("/subscribers", paymentHandler.GetMySubscribers)
			subscriptions.GET("/revenue", paymentHandler.GetRevenue)
		}

		// Webhooks (protected)
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

		// Referral routes (protected)
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

		// Email Templates (protected)
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

		// Admin routes (admin only)
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

	// Start server
	port := config.AppConfig.ServerPort
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
