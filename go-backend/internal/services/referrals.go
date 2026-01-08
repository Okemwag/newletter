package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"math"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type ReferralService struct {
	db *gorm.DB
}

func NewReferralService() *ReferralService {
	return &ReferralService{
		db: database.GetDB(),
	}
}

// ========== Program Management ==========

type CreateProgramRequest struct {
	Name              string  `json:"name" binding:"required"`
	Description       *string `json:"description,omitempty"`
	RewardType        string  `json:"rewardType" binding:"required"` // discount, cash, credit, free_month
	ReferrerReward    int64   `json:"referrerReward"`
	RefereeReward     int64   `json:"refereeReward"`
	RewardCurrency    string  `json:"rewardCurrency"`
	MaxRewardsPerUser int     `json:"maxRewardsPerUser"`
	TierRewards       *string `json:"tierRewards,omitempty"` // JSON: [{"tier": 5, "bonus": 1000}, {"tier": 10, "bonus": 5000}]
}

func (s *ReferralService) CreateProgram(req *CreateProgramRequest, creatorID uuid.UUID) (*models.ReferralProgram, error) {
	// Check if program already exists
	var existing models.ReferralProgram
	if s.db.Where("creator_id = ?", creatorID).First(&existing).Error == nil {
		return nil, errors.New("referral program already exists for this creator")
	}

	currency := req.RewardCurrency
	if currency == "" {
		currency = "KES"
	}

	maxRewards := req.MaxRewardsPerUser
	if maxRewards == 0 {
		maxRewards = 10
	}

	program := &models.ReferralProgram{
		CreatorID:         creatorID,
		Name:              req.Name,
		Description:       req.Description,
		IsActive:          true,
		RewardType:        req.RewardType,
		ReferrerReward:    req.ReferrerReward,
		RefereeReward:     req.RefereeReward,
		RewardCurrency:    currency,
		MaxRewardsPerUser: maxRewards,
		TierRewards:       req.TierRewards,
	}

	if err := s.db.Create(program).Error; err != nil {
		return nil, errors.New("failed to create program")
	}

	return program, nil
}

func (s *ReferralService) GetProgram(creatorID uuid.UUID) (*models.ReferralProgram, error) {
	var program models.ReferralProgram
	if err := s.db.Where("creator_id = ?", creatorID).First(&program).Error; err != nil {
		return nil, errors.New("program not found")
	}
	return &program, nil
}

func (s *ReferralService) UpdateProgram(creatorID uuid.UUID, updates map[string]interface{}) (*models.ReferralProgram, error) {
	var program models.ReferralProgram
	if err := s.db.Where("creator_id = ?", creatorID).First(&program).Error; err != nil {
		return nil, errors.New("program not found")
	}

	if err := s.db.Model(&program).Updates(updates).Error; err != nil {
		return nil, errors.New("failed to update program")
	}

	return &program, nil
}

// ========== Referral Code Management ==========

func (s *ReferralService) GenerateCode(programID, userID uuid.UUID) (*models.ReferralCode, error) {
	// Check if user already has a code
	var existing models.ReferralCode
	if s.db.Where("program_id = ? AND referrer_id = ?", programID, userID).First(&existing).Error == nil {
		return &existing, nil
	}

	// Generate unique code
	code := s.generateUniqueCode()

	referralCode := &models.ReferralCode{
		ProgramID:  programID,
		ReferrerID: userID,
		Code:       code,
		IsActive:   true,
	}

	if err := s.db.Create(referralCode).Error; err != nil {
		return nil, errors.New("failed to create referral code")
	}

	return referralCode, nil
}

func (s *ReferralService) GetCodeByCode(code string) (*models.ReferralCode, error) {
	var referralCode models.ReferralCode
	if err := s.db.Where("code = ? OR custom_slug = ?", strings.ToUpper(code), code).First(&referralCode).Error; err != nil {
		return nil, errors.New("code not found")
	}
	return &referralCode, nil
}

func (s *ReferralService) SetCustomSlug(codeID uuid.UUID, userID uuid.UUID, slug string) error {
	var code models.ReferralCode
	if err := s.db.Where("id = ? AND referrer_id = ?", codeID, userID).First(&code).Error; err != nil {
		return errors.New("code not found")
	}

	// Check if slug is taken
	var existing models.ReferralCode
	if s.db.Where("custom_slug = ? AND id != ?", slug, codeID).First(&existing).Error == nil {
		return errors.New("slug already taken")
	}

	code.CustomSlug = &slug
	return s.db.Save(&code).Error
}

func (s *ReferralService) generateUniqueCode() string {
	bytes := make([]byte, 4)
	rand.Read(bytes)
	return strings.ToUpper(hex.EncodeToString(bytes))
}

// ========== Event Tracking ==========

type TrackEventRequest struct {
	Code      string  `json:"code" binding:"required"`
	EventType string  `json:"eventType" binding:"required"` // click, signup, conversion
	RefereeID *uuid.UUID `json:"refereeId,omitempty"`
	IPAddress *string `json:"ipAddress,omitempty"`
	UserAgent *string `json:"userAgent,omitempty"`
	Source    *string `json:"source,omitempty"`
	Medium    *string `json:"medium,omitempty"`
	Campaign  *string `json:"campaign,omitempty"`
	Value     *int64  `json:"value,omitempty"`
}

func (s *ReferralService) TrackEvent(req *TrackEventRequest) (*models.ReferralEvent, error) {
	code, err := s.GetCodeByCode(req.Code)
	if err != nil {
		return nil, err
	}

	if !code.IsActive {
		return nil, errors.New("referral code is inactive")
	}

	if code.ExpiresAt != nil && code.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("referral code has expired")
	}

	event := &models.ReferralEvent{
		CodeID:    code.ID,
		EventType: req.EventType,
		RefereeID: req.RefereeID,
		IPAddress: req.IPAddress,
		UserAgent: req.UserAgent,
		Source:    req.Source,
		Medium:    req.Medium,
		Campaign:  req.Campaign,
		Value:     req.Value,
	}

	if err := s.db.Create(event).Error; err != nil {
		return nil, errors.New("failed to track event")
	}

	// Update code stats
	switch req.EventType {
	case "click":
		s.db.Model(code).Update("clicks", gorm.Expr("clicks + 1"))
	case "signup":
		s.db.Model(code).Update("signups", gorm.Expr("signups + 1"))
	case "conversion":
		s.db.Model(code).Update("conversions", gorm.Expr("conversions + 1"))
		if req.Value != nil {
			s.db.Model(code).Update("revenue_generated", gorm.Expr("revenue_generated + ?", *req.Value))
		}
		// Process reward
		s.processReward(code, req.RefereeID, req.Value)
	}

	// Recalculate viral metrics
	go s.recalculateViralMetrics(code.ProgramID)

	return event, nil
}

// ========== Reward Processing ==========

func (s *ReferralService) processReward(code *models.ReferralCode, refereeID *uuid.UUID, value *int64) {
	var program models.ReferralProgram
	if s.db.First(&program, "id = ?", code.ProgramID).Error != nil {
		return
	}

	// Check if user has reached max rewards
	var rewardCount int64
	s.db.Model(&models.ReferralReward{}).
		Where("program_id = ? AND user_id = ? AND status IN ?", program.ID, code.ReferrerID, []string{"pending", "approved", "paid"}).
		Count(&rewardCount)

	if int(rewardCount) >= program.MaxRewardsPerUser {
		return
	}

	// Calculate tier bonus
	tier := int(code.Conversions) + 1
	tierBonus := s.calculateTierBonus(program.TierRewards, tier)

	// Create referrer reward
	referrerReward := &models.ReferralReward{
		ProgramID:  program.ID,
		UserID:     code.ReferrerID,
		RewardType: program.RewardType,
		Amount:     program.ReferrerReward + tierBonus,
		Currency:   program.RewardCurrency,
		Status:     "pending",
		Tier:       tier,
	}

	s.db.Create(referrerReward)

	// Create referee reward if applicable
	if refereeID != nil && program.RefereeReward > 0 {
		refereeReward := &models.ReferralReward{
			ProgramID:  program.ID,
			UserID:     *refereeID,
			RewardType: program.RewardType,
			Amount:     program.RefereeReward,
			Currency:   program.RewardCurrency,
			Status:     "pending",
			Tier:       1,
		}
		s.db.Create(refereeReward)
	}

	// Update leaderboard
	go s.updateLeaderboard(program.ID, code.ReferrerID, value)
}

func (s *ReferralService) calculateTierBonus(tierRewardsJSON *string, currentTier int) int64 {
	if tierRewardsJSON == nil {
		return 0
	}

	// Parse tier rewards: [{"tier": 5, "bonus": 1000}, {"tier": 10, "bonus": 5000}]
	// Simplified: Just check milestone tiers
	milestones := map[int]int64{
		5:   1000,  // 5 referrals = 1000 bonus
		10:  2500,  // 10 referrals = 2500 bonus
		25:  7500,  // 25 referrals = 7500 bonus
		50:  20000, // 50 referrals = 20000 bonus
		100: 50000, // 100 referrals = 50000 bonus
	}

	if bonus, exists := milestones[currentTier]; exists {
		return bonus
	}

	return 0
}

// ========== Viral Metrics Algorithms ==========

// ViralMetrics contains calculated viral growth metrics
type ViralMetrics struct {
	ViralCoefficient    float64 `json:"viralCoefficient"`    // K-factor: avg referrals per user
	ConversionRate      float64 `json:"conversionRate"`      // % of clicks that convert
	ClickThroughRate    float64 `json:"clickThroughRate"`    // % of impressions that click
	TimeToConvert       float64 `json:"timeToConvert"`       // Avg hours from click to conversion
	CustomerLTV         float64 `json:"customerLTV"`         // Lifetime value of referred customers
	ReferralLTV         float64 `json:"referralLTV"`         // Total value generated per referrer
	ViralCycleTime      float64 `json:"viralCycleTime"`      // Avg days for one viral cycle
	EffectiveViralCoef  float64 `json:"effectiveViralCoef"`  // K * (1 - churn rate)
	ProjectedGrowthRate float64 `json:"projectedGrowthRate"` // Weekly growth projection
}

func (s *ReferralService) CalculateViralMetrics(programID uuid.UUID) (*ViralMetrics, error) {
	metrics := &ViralMetrics{}

	var program models.ReferralProgram
	if err := s.db.First(&program, "id = ?", programID).Error; err != nil {
		return nil, errors.New("program not found")
	}

	// Get all codes for this program
	var codes []models.ReferralCode
	s.db.Where("program_id = ?", programID).Find(&codes)

	if len(codes) == 0 {
		return metrics, nil
	}

	// Calculate K-factor (Viral Coefficient)
	// K = (invites sent per user) * (conversion rate)
	var totalClicks, totalConversions, totalRevenue int64
	for _, code := range codes {
		totalClicks += code.Clicks
		totalConversions += code.Conversions
		totalRevenue += code.RevenueGenerated
	}

	activeReferrers := len(codes)
	if activeReferrers > 0 {
		avgInvites := float64(totalClicks) / float64(activeReferrers)
		if totalClicks > 0 {
			metrics.ConversionRate = float64(totalConversions) / float64(totalClicks)
		}
		metrics.ViralCoefficient = avgInvites * metrics.ConversionRate
	}

	// Calculate time to convert using events
	metrics.TimeToConvert = s.calculateTimeToConvert(programID)

	// Calculate viral cycle time
	if metrics.TimeToConvert > 0 {
		metrics.ViralCycleTime = metrics.TimeToConvert / 24 // Convert hours to days
	}

	// Customer LTV calculation
	if totalConversions > 0 {
		metrics.CustomerLTV = float64(totalRevenue) / float64(totalConversions)
		metrics.ReferralLTV = float64(totalRevenue) / float64(activeReferrers)
	}

	// Effective viral coefficient (accounting for 10% monthly churn estimate)
	churnRate := 0.10
	metrics.EffectiveViralCoef = metrics.ViralCoefficient * (1 - churnRate)

	// Projected weekly growth rate
	// Using compound viral growth formula
	if metrics.ViralCycleTime > 0 {
		cyclesPerWeek := 7 / metrics.ViralCycleTime
		metrics.ProjectedGrowthRate = math.Pow(1+metrics.EffectiveViralCoef, cyclesPerWeek) - 1
	}

	// Update program with metrics
	s.db.Model(&program).Updates(map[string]interface{}{
		"viral_coefficient": metrics.ViralCoefficient,
		"conversion_rate":   metrics.ConversionRate,
	})

	return metrics, nil
}

func (s *ReferralService) calculateTimeToConvert(programID uuid.UUID) float64 {
	// Get click events that led to conversions
	var clickEvents []models.ReferralEvent
	s.db.Where("event_type = ?", "click").
		Joins("JOIN referral_codes ON referral_codes.id = referral_events.code_id").
		Where("referral_codes.program_id = ?", programID).
		Find(&clickEvents)

	if len(clickEvents) == 0 {
		return 0
	}

	var totalHours float64
	var count int

	for _, click := range clickEvents {
		// Find corresponding conversion
		var conversion models.ReferralEvent
		if err := s.db.Where("code_id = ? AND event_type = ? AND created_at > ?",
			click.CodeID, "conversion", click.CreatedAt).
			Order("created_at ASC").First(&conversion).Error; err == nil {
			// Calculate time difference in hours
			hours := conversion.CreatedAt.Sub(click.CreatedAt).Hours()
			if hours < 720 { // Only consider conversions within 30 days
				totalHours += hours
				count++
			}
		}
	}

	if count == 0 {
		return 0
	}

	return totalHours / float64(count)
}

func (s *ReferralService) recalculateViralMetrics(programID uuid.UUID) {
	s.CalculateViralMetrics(programID)
}

func (s *ReferralService) updateLeaderboard(programID uuid.UUID, userID uuid.UUID, _ *int64) {
	// Find or create leaderboard entry
	var entry models.ReferralLeaderboard
	periodStart := time.Now().Truncate(24 * time.Hour).AddDate(0, 0, -int(time.Now().Weekday()))

	result := s.db.Where("program_id = ? AND user_id = ? AND period = ? AND period_start = ?",
		programID, userID, "weekly", periodStart).First(&entry)

	if result.Error != nil {
		// Create new entry
		entry = models.ReferralLeaderboard{
			ProgramID:   programID,
			UserID:      userID,
			Period:      "weekly",
			PeriodStart: periodStart,
		}
	}

	// Update stats from referral code
	var code models.ReferralCode
	if s.db.Where("program_id = ? AND referrer_id = ?", programID, userID).First(&code).Error == nil {
		entry.TotalReferrals = code.Signups
		entry.TotalConversions = code.Conversions
		entry.TotalRevenue = code.RevenueGenerated
		entry.Score = float64(code.Conversions)*100 + float64(code.Signups)*10 + float64(code.RevenueGenerated)/1000
		entry.Level = s.calculateLevel(code.Conversions)
	}

	s.db.Save(&entry)
}

// ========== Leaderboard & Gamification ==========

type LeaderboardEntry struct {
	UserID           uuid.UUID `json:"userId"`
	Email            string    `json:"email"`
	FirstName        string    `json:"firstName"`
	LastName         string    `json:"lastName"`
	TotalReferrals   int64     `json:"totalReferrals"`
	TotalConversions int64     `json:"totalConversions"`
	TotalRevenue     int64     `json:"totalRevenue"`
	Score            float64   `json:"score"`
	Rank             int       `json:"rank"`
	Level            int       `json:"level"`
	Badges           []string  `json:"badges"`
}

func (s *ReferralService) GetLeaderboard(programID uuid.UUID, period string, limit int) ([]LeaderboardEntry, error) {
	var entries []LeaderboardEntry

	// Calculate scores and get leaderboard
	var codes []models.ReferralCode
	s.db.Preload("Referrer").Where("program_id = ?", programID).Find(&codes)

	for _, code := range codes {
		// Calculate weighted score
		// Score = (conversions * 100) + (signups * 10) + (revenue / 1000)
		score := float64(code.Conversions)*100 + float64(code.Signups)*10 + float64(code.RevenueGenerated)/1000

		// Determine level based on conversions
		level := s.calculateLevel(code.Conversions)

		// Determine badges
		badges := s.calculateBadges(code.Conversions, code.RevenueGenerated, code.Clicks)

		entries = append(entries, LeaderboardEntry{
			UserID:           code.ReferrerID,
			Email:            code.Referrer.Email,
			FirstName:        code.Referrer.FirstName,
			LastName:         code.Referrer.LastName,
			TotalReferrals:   code.Signups,
			TotalConversions: code.Conversions,
			TotalRevenue:     code.RevenueGenerated,
			Score:            score,
			Level:            level,
			Badges:           badges,
		})
	}

	// Sort by score descending
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Score > entries[j].Score
	})

	// Assign ranks
	for i := range entries {
		entries[i].Rank = i + 1
	}

	// Apply limit
	if limit > 0 && len(entries) > limit {
		entries = entries[:limit]
	}

	return entries, nil
}

func (s *ReferralService) calculateLevel(conversions int64) int {
	// Level progression: 1, 3, 5, 10, 25, 50, 100, 250, 500, 1000
	thresholds := []int64{0, 1, 3, 5, 10, 25, 50, 100, 250, 500, 1000}

	for i := len(thresholds) - 1; i >= 0; i-- {
		if conversions >= thresholds[i] {
			return i + 1
		}
	}
	return 1
}

func (s *ReferralService) calculateBadges(conversions, revenue, clicks int64) []string {
	var badges []string

	// Conversion badges
	if conversions >= 1 {
		badges = append(badges, "first_referral")
	}
	if conversions >= 10 {
		badges = append(badges, "referral_master")
	}
	if conversions >= 50 {
		badges = append(badges, "referral_champion")
	}
	if conversions >= 100 {
		badges = append(badges, "referral_legend")
	}

	// Revenue badges
	if revenue >= 10000 {
		badges = append(badges, "revenue_generator")
	}
	if revenue >= 100000 {
		badges = append(badges, "high_value")
	}

	// Engagement badges
	if clicks >= 100 {
		badges = append(badges, "influencer")
	}

	// Conversion rate badge
	if clicks > 10 {
		rate := float64(conversions) / float64(clicks)
		if rate > 0.20 {
			badges = append(badges, "high_converter")
		}
	}

	return badges
}

// ========== A/B Testing ==========

type CreateVariantRequest struct {
	Name            string  `json:"name" binding:"required"`
	Description     *string `json:"description,omitempty"`
	ReferrerReward  int64   `json:"referrerReward"`
	RefereeReward   int64   `json:"refereeReward"`
	LandingPageCopy *string `json:"landingPageCopy,omitempty"`
	EmailCopy       *string `json:"emlCopy,omitempty"`
	TrafficPercentage int   `json:"trafficPercentage"`
	IsControl       bool    `json:"isControl"`
}

func (s *ReferralService) CreateABVariant(programID uuid.UUID, req *CreateVariantRequest) (*models.ABTestVariant, error) {
	variant := &models.ABTestVariant{
		ProgramID:         programID,
		Name:              req.Name,
		Description:       req.Description,
		ReferrerReward:    req.ReferrerReward,
		RefereeReward:     req.RefereeReward,
		LandingPageCopy:   req.LandingPageCopy,
		EmailCopy:         req.EmailCopy,
		TrafficPercentage: req.TrafficPercentage,
		IsControl:         req.IsControl,
		IsActive:          true,
	}

	if err := s.db.Create(variant).Error; err != nil {
		return nil, errors.New("failed to create variant")
	}

	return variant, nil
}

func (s *ReferralService) GetVariants(programID uuid.UUID) ([]models.ABTestVariant, error) {
	var variants []models.ABTestVariant
	if err := s.db.Where("program_id = ?", programID).Find(&variants).Error; err != nil {
		return nil, err
	}
	return variants, nil
}

func (s *ReferralService) SelectVariant(programID uuid.UUID) (*models.ABTestVariant, error) {
	var variants []models.ABTestVariant
	if err := s.db.Where("program_id = ? AND is_active = ?", programID, true).Find(&variants).Error; err != nil {
		return nil, err
	}

	if len(variants) == 0 {
		return nil, errors.New("no active variants")
	}

	// Random selection based on traffic percentage
	randBytes := make([]byte, 1)
	rand.Read(randBytes)
	randomNum := int(randBytes[0]) % 100

	cumulative := 0
	for _, v := range variants {
		cumulative += v.TrafficPercentage
		if randomNum < cumulative {
			// Record impression
			s.db.Model(&v).Update("impressions", gorm.Expr("impressions + 1"))
			return &v, nil
		}
	}

	// Default to first variant
	return &variants[0], nil
}

func (s *ReferralService) UpdateVariantStats(variantID uuid.UUID, eventType string, value *int64) {
	updates := map[string]interface{}{}

	switch eventType {
	case "click":
		updates["clicks"] = gorm.Expr("clicks + 1")
	case "signup":
		updates["signups"] = gorm.Expr("signups + 1")
	case "conversion":
		updates["conversions"] = gorm.Expr("conversions + 1")
		if value != nil {
			updates["revenue"] = gorm.Expr("revenue + ?", *value)
		}
	}

	s.db.Model(&models.ABTestVariant{}).Where("id = ?", variantID).Updates(updates)

	// Recalculate conversion rate and confidence
	go s.calculateVariantConfidence(variantID)
}

func (s *ReferralService) calculateVariantConfidence(variantID uuid.UUID) {
	var variant models.ABTestVariant
	if s.db.First(&variant, "id = ?", variantID).Error != nil {
		return
	}

	// Calculate conversion rate
	if variant.Clicks > 0 {
		variant.ConversionRate = float64(variant.Conversions) / float64(variant.Clicks)
	}

	// Calculate statistical confidence using Wald method
	// Confidence = sqrt(p * (1-p) / n) where p = conversion rate, n = sample size
	if variant.Clicks >= 30 { // Minimum sample size for significance
		p := variant.ConversionRate
		n := float64(variant.Clicks)
		standardError := math.Sqrt(p * (1 - p) / n)

		// 95% confidence interval
		zScore := 1.96 // For 95% confidence
		margin := zScore * standardError

		// Confidence is inverse of margin (higher certainty = higher confidence)
		if margin > 0 {
			variant.Confidence = math.Min(1-margin, 0.99) * 100
		}
	}

	s.db.Save(&variant)
}

// ========== Stats & Analytics ==========

type ReferralStats struct {
	TotalCodes       int64        `json:"totalCodes"`
	ActiveCodes      int64        `json:"activeCodes"`
	TotalClicks      int64        `json:"totalClicks"`
	TotalSignups     int64        `json:"totalSignups"`
	TotalConversions int64        `json:"totalConversions"`
	TotalRevenue     int64        `json:"totalRevenue"`
	PendingRewards   int64        `json:"pendingRewards"`
	PaidRewards      int64        `json:"paidRewards"`
	ViralMetrics     *ViralMetrics `json:"viralMetrics,omitempty"`
}

func (s *ReferralService) GetStats(programID uuid.UUID) (*ReferralStats, error) {
	stats := &ReferralStats{}

	// Code stats
	s.db.Model(&models.ReferralCode{}).Where("program_id = ?", programID).Count(&stats.TotalCodes)
	s.db.Model(&models.ReferralCode{}).Where("program_id = ? AND is_active = ?", programID, true).Count(&stats.ActiveCodes)

	// Aggregate stats
	var result struct {
		Clicks      int64
		Signups     int64
		Conversions int64
		Revenue     int64
	}
	s.db.Model(&models.ReferralCode{}).
		Where("program_id = ?", programID).
		Select("COALESCE(SUM(clicks), 0) as clicks, COALESCE(SUM(signups), 0) as signups, COALESCE(SUM(conversions), 0) as conversions, COALESCE(SUM(revenue_generated), 0) as revenue").
		Scan(&result)

	stats.TotalClicks = result.Clicks
	stats.TotalSignups = result.Signups
	stats.TotalConversions = result.Conversions
	stats.TotalRevenue = result.Revenue

	// Reward stats
	s.db.Model(&models.ReferralReward{}).
		Where("program_id = ? AND status = ?", programID, "pending").
		Select("COALESCE(SUM(amount), 0)").Scan(&stats.PendingRewards)

	s.db.Model(&models.ReferralReward{}).
		Where("program_id = ? AND status = ?", programID, "paid").
		Select("COALESCE(SUM(amount), 0)").Scan(&stats.PaidRewards)

	// Get viral metrics
	stats.ViralMetrics, _ = s.CalculateViralMetrics(programID)

	return stats, nil
}
