package services

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/types"
	"gorm.io/gorm"
)

// Fraud thresholds
const (
	VelocityThreshold       = 10              // Max subs in 1 hour
	VelocityWindow          = time.Hour
	PriceAnomalyMultiplier  = 3.0             // 3x median = flag
	MinDiverseSubscribers   = 5               // Min unique IPs
	FirstPayoutDelayDays    = 7               // Days before first payout
	Week1PayoutCap          = 2000000         // KES 20,000 in cents
	Week2PayoutCap          = 2000000
	Week3PayoutCap          = 5000000         // KES 50,000
	Week4PayoutCap          = 5000000
	NormalPayoutCap         = 100000000       // KES 1,000,000
)

type FraudService struct {
	db *gorm.DB
}

func NewFraudService(db *gorm.DB) *FraudService {
	return &FraudService{db: db}
}

// CheckVelocity detects unusually rapid subscription signups
func (s *FraudService) CheckVelocity(creatorID uuid.UUID) (*models.FraudFlag, error) {
	var count int64
	cutoff := time.Now().Add(-VelocityWindow)
	
	s.db.Model(&models.CreatorEarning{}).
		Where("creator_id = ? AND created_at > ?", creatorID, cutoff).
		Count(&count)

	if count >= VelocityThreshold {
		details := map[string]interface{}{
			"subscriptions_in_hour": count,
			"threshold":            VelocityThreshold,
			"checked_at":           time.Now(),
		}
		return s.createFlag(creatorID, types.FraudFlagVelocity, types.FraudSeverityHigh, details, int(count*10))
	}

	return nil, nil
}

// CheckPriceAnomaly detects prices far above median
func (s *FraudService) CheckPriceAnomaly(creatorID uuid.UUID, price int64) (*models.FraudFlag, error) {
	// Get median price
	var medianPrice float64
	s.db.Model(&models.User{}).
		Where("role = ? AND subscription_price > 0", types.UserRoleCreator).
		Select("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY subscription_price)").
		Scan(&medianPrice)

	if medianPrice == 0 {
		medianPrice = 50000 // Default KES 500
	}

	if float64(price) > medianPrice*PriceAnomalyMultiplier {
		details := map[string]interface{}{
			"price":        price,
			"median_price": medianPrice,
			"multiplier":   float64(price) / medianPrice,
		}
		return s.createFlag(creatorID, types.FraudFlagPriceAnomaly, types.FraudSeverityMedium, details, 50)
	}

	return nil, nil
}

// CheckSubscriberDiversity ensures payments from diverse sources
func (s *FraudService) CheckSubscriberDiversity(creatorID uuid.UUID) (*models.FraudFlag, error) {
	var uniqueIPs int64
	// This would need IP tracking in payments - simplified check
	s.db.Model(&models.CreatorEarning{}).
		Where("creator_id = ?", creatorID).
		Distinct("subscriber_id").
		Count(&uniqueIPs)

	// Get total earnings count
	var totalEarnings int64
	s.db.Model(&models.CreatorEarning{}).
		Where("creator_id = ?", creatorID).
		Count(&totalEarnings)

	// Flag if high earnings but low diversity
	if totalEarnings > 10 && uniqueIPs < MinDiverseSubscribers {
		details := map[string]interface{}{
			"unique_subscribers": uniqueIPs,
			"total_earnings":     totalEarnings,
			"threshold":          MinDiverseSubscribers,
		}
		return s.createFlag(creatorID, types.FraudFlagSubscriberDiversity, types.FraudSeverityMedium, details, 40)
	}

	return nil, nil
}

// ShouldDelayPayout checks if payout should be held
func (s *FraudService) ShouldDelayPayout(creatorID uuid.UUID) (bool, string, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", creatorID).Error; err != nil {
		return true, "user not found", err
	}

	// Not activated
	if user.ActivatedAt == nil {
		return true, "creator not activated", nil
	}

	// First payout delay
	daysSinceActivation := int(time.Since(*user.ActivatedAt).Hours() / 24)
	if daysSinceActivation < FirstPayoutDelayDays {
		return true, "first payout delayed - please wait " + 
			string(rune(FirstPayoutDelayDays-daysSinceActivation)) + " more days", nil
	}

	// Check for open fraud flags
	var openFlags int64
	s.db.Model(&models.FraudFlag{}).
		Where("creator_id = ? AND status = 'open' AND severity IN ('high', 'critical')", creatorID).
		Count(&openFlags)

	if openFlags > 0 {
		return true, "account under review", nil
	}

	return false, "", nil
}

// CalculatePayoutCap returns the current payout limit
func (s *FraudService) CalculatePayoutCap(creatorID uuid.UUID) (int64, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", creatorID).Error; err != nil {
		return 0, err
	}

	if user.ActivatedAt == nil {
		return 0, nil
	}

	weeksSinceActivation := int(time.Since(*user.ActivatedAt).Hours() / (24 * 7))

	switch {
	case weeksSinceActivation < 1:
		return Week1PayoutCap, nil
	case weeksSinceActivation < 2:
		return Week2PayoutCap, nil
	case weeksSinceActivation < 3:
		return Week3PayoutCap, nil
	case weeksSinceActivation < 4:
		return Week4PayoutCap, nil
	default:
		return NormalPayoutCap, nil
	}
}

// FlagForReview creates a manual review flag
func (s *FraudService) FlagForReview(creatorID uuid.UUID, flagType types.FraudFlagType, reason string) (*models.FraudFlag, error) {
	details := map[string]interface{}{
		"reason":     reason,
		"flagged_at": time.Now(),
	}
	return s.createFlag(creatorID, flagType, types.FraudSeverityHigh, details, 70)
}

// FreezeCreator suspends a creator (kill switch)
func (s *FraudService) FreezeCreator(creatorID uuid.UUID, adminID uuid.UUID, reason string) error {
	now := time.Now()
	return s.db.Model(&models.User{}).Where("id = ?", creatorID).Updates(map[string]interface{}{
		"creator_status": types.CreatorStatusSuspended,
		"suspended_at":   now,
		"suspend_reason": reason,
	}).Error
}

// UnfreezeCreator reactivates a creator
func (s *FraudService) UnfreezeCreator(creatorID uuid.UUID) error {
	return s.db.Model(&models.User{}).Where("id = ?", creatorID).Updates(map[string]interface{}{
		"creator_status": types.CreatorStatusActiveEarning,
		"suspended_at":   nil,
		"suspend_reason": nil,
	}).Error
}

// GetOpenFlags returns open fraud flags for a creator
func (s *FraudService) GetOpenFlags(creatorID uuid.UUID) ([]models.FraudFlag, error) {
	var flags []models.FraudFlag
	err := s.db.Where("creator_id = ? AND status = 'open'", creatorID).
		Order("severity DESC, created_at DESC").
		Find(&flags).Error
	return flags, err
}

// ReviewFlag marks a flag as reviewed
func (s *FraudService) ReviewFlag(flagID uuid.UUID, adminID uuid.UUID, status string, note string) error {
	now := time.Now()
	return s.db.Model(&models.FraudFlag{}).Where("id = ?", flagID).Updates(map[string]interface{}{
		"status":      status,
		"reviewed_by": adminID,
		"reviewed_at": now,
		"review_note": note,
	}).Error
}

// --- Helper ---

func (s *FraudService) createFlag(creatorID uuid.UUID, flagType types.FraudFlagType, severity types.FraudSeverity, details map[string]interface{}, score int) (*models.FraudFlag, error) {
	detailsJSON, _ := json.Marshal(details)
	
	flag := &models.FraudFlag{
		CreatorID: creatorID,
		Type:      flagType,
		Severity:  severity,
		Details:   string(detailsJSON),
		Status:    "open",
		Score:     score,
	}

	if err := s.db.Create(flag).Error; err != nil {
		return nil, err
	}

	return flag, nil
}
