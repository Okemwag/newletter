package services

import (
	"log"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

const (
	// UnengagedDays defines how many days without opens makes a user "unengaged"
	UnengagedDays = 90

	// EngagementDecayDays is how quickly engagement score decays without activity
	EngagementDecayDays = 30
)

// EngagementService handles subscriber engagement tracking and pruning
type EngagementService struct {
	db *gorm.DB
}

// NewEngagementService creates a new engagement service
func NewEngagementService() *EngagementService {
	return &EngagementService{
		db: database.GetDB(),
	}
}

// RecordOpen records an email open event and updates engagement metrics
func (s *EngagementService) RecordOpen(subscriberID, campaignID uuid.UUID) error {
	now := time.Now()
	
	// Update subscriber engagement
	result := s.db.Model(&models.Subscriber{}).
		Where("id = ?", subscriberID).
		Updates(map[string]interface{}{
			"last_opened_at": now,
			"emails_opened":  gorm.Expr("emails_opened + 1"),
		})
	
	if result.Error != nil {
		return result.Error
	}

	// Recalculate engagement score
	go s.recalculateEngagementScore(subscriberID)

	return nil
}

// RecordClick records an email click event and updates engagement metrics
func (s *EngagementService) RecordClick(subscriberID, campaignID uuid.UUID) error {
	now := time.Now()
	
	// Update subscriber engagement
	result := s.db.Model(&models.Subscriber{}).
		Where("id = ?", subscriberID).
		Updates(map[string]interface{}{
			"last_clicked_at": now,
			"emails_clicked":  gorm.Expr("emails_clicked + 1"),
		})
	
	if result.Error != nil {
		return result.Error
	}

	// Recalculate engagement score
	go s.recalculateEngagementScore(subscriberID)

	return nil
}

// RecordSend records that an email was sent to a subscriber
func (s *EngagementService) RecordSend(subscriberID uuid.UUID) error {
	return s.db.Model(&models.Subscriber{}).
		Where("id = ?", subscriberID).
		Update("emails_sent", gorm.Expr("emails_sent + 1")).Error
}

// recalculateEngagementScore calculates engagement score based on activity
func (s *EngagementService) recalculateEngagementScore(subscriberID uuid.UUID) {
	var subscriber models.Subscriber
	if err := s.db.First(&subscriber, subscriberID).Error; err != nil {
		log.Printf("[Engagement] Failed to get subscriber %s: %v", subscriberID, err)
		return
	}

	score := s.calculateScore(&subscriber)
	
	s.db.Model(&subscriber).Update("engagement_score", score)
}

// calculateScore computes the engagement score (0-100) for a subscriber
func (s *EngagementService) calculateScore(subscriber *models.Subscriber) float64 {
	score := 50.0 // Start with neutral score

	// Factor 1: Open rate (0-35 points)
	if subscriber.EmailsSent > 0 {
		openRate := float64(subscriber.EmailsOpened) / float64(subscriber.EmailsSent)
		score += openRate * 35 // Max 35 points for 100% open rate
	}

	// Factor 2: Click rate (0-30 points)
	if subscriber.EmailsOpened > 0 {
		clickRate := float64(subscriber.EmailsClicked) / float64(subscriber.EmailsOpened)
		score += clickRate * 30 // Max 30 points for clicking every opened email
	}

	// Factor 3: Recency of engagement (0-25 points with decay)
	if subscriber.LastOpenedAt != nil {
		daysSinceOpen := time.Since(*subscriber.LastOpenedAt).Hours() / 24
		recencyScore := 25 * math.Exp(-daysSinceOpen/float64(EngagementDecayDays))
		score += recencyScore
	} else {
		// Never opened - apply penalty
		score -= 20
	}

	// Factor 4: Time since subscription (newer subscribers get benefit of doubt)
	daysSinceSubscription := time.Since(subscriber.SubscribedAt).Hours() / 24
	if daysSinceSubscription < 30 {
		score += 10 // Honeymoon period boost
	}

	// Clamp to 0-100
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	return score
}

// GetEngagementTier returns the engagement tier for a subscriber
func (s *EngagementService) GetEngagementTier(subscriber *models.Subscriber) models.EngagementTier {
	// Check for unengaged (no opens in 90 days)
	if subscriber.LastOpenedAt != nil {
		daysSinceOpen := time.Since(*subscriber.LastOpenedAt).Hours() / 24
		if daysSinceOpen >= UnengagedDays {
			return models.EngagementTierUnengaged
		}
	} else if time.Since(subscriber.SubscribedAt).Hours()/24 >= UnengagedDays {
		// Never opened and subscribed more than 90 days ago
		return models.EngagementTierUnengaged
	}

	// Tier based on score
	score := subscriber.EngagementScore
	switch {
	case score >= 80:
		return models.EngagementTierHighly
	case score >= 50:
		return models.EngagementTierModerate
	case score >= 20:
		return models.EngagementTierLow
	default:
		return models.EngagementTierUnengaged
	}
}

// GetUnengagedSubscribers returns subscribers with no engagement in 90+ days
func (s *EngagementService) GetUnengagedSubscribers(creatorID uuid.UUID, limit, offset int) ([]models.Subscriber, int64, error) {
	var subscribers []models.Subscriber
	var total int64

	cutoffDate := time.Now().AddDate(0, 0, -UnengagedDays)

	// Find subscribers who either:
	// 1. Have a last_opened_at older than 90 days
	// 2. Have never opened (last_opened_at is null) and subscribed more than 90 days ago
	query := s.db.Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Where("(last_opened_at < ? OR (last_opened_at IS NULL AND subscribed_at < ?))", cutoffDate, cutoffDate)
	
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("engagement_score ASC").Limit(limit).Offset(offset).Find(&subscribers).Error; err != nil {
		return nil, 0, err
	}

	return subscribers, total, nil
}

// GetEngagementStats returns engagement statistics for a creator
func (s *EngagementService) GetEngagementStats(creatorID uuid.UUID) (map[string]interface{}, error) {
	var totalActive, highlyEngaged, moderateEngaged, lowEngaged, unengaged int64

	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Count(&totalActive)

	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ? AND engagement_score >= 80", creatorID, models.SubscriberStatusActive).
		Count(&highlyEngaged)

	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ? AND engagement_score >= 50 AND engagement_score < 80", creatorID, models.SubscriberStatusActive).
		Count(&moderateEngaged)

	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ? AND engagement_score >= 20 AND engagement_score < 50", creatorID, models.SubscriberStatusActive).
		Count(&lowEngaged)

	cutoffDate := time.Now().AddDate(0, 0, -UnengagedDays)
	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Where("(last_opened_at < ? OR (last_opened_at IS NULL AND subscribed_at < ?))", cutoffDate, cutoffDate).
		Count(&unengaged)

	// Calculate average engagement score
	var avgScore float64
	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Select("COALESCE(AVG(engagement_score), 50)").
		Scan(&avgScore)

	return map[string]interface{}{
		"totalActive":     totalActive,
		"highlyEngaged":   highlyEngaged,
		"moderateEngaged": moderateEngaged,
		"lowEngaged":      lowEngaged,
		"unengaged":       unengaged,
		"avgScore":        avgScore,
		"distribution": map[string]interface{}{
			"highlyEngaged":   float64(highlyEngaged) / float64(max(totalActive, 1)) * 100,
			"moderateEngaged": float64(moderateEngaged) / float64(max(totalActive, 1)) * 100,
			"lowEngaged":      float64(lowEngaged) / float64(max(totalActive, 1)) * 100,
			"unengaged":       float64(unengaged) / float64(max(totalActive, 1)) * 100,
		},
	}, nil
}

// PrunePreview returns a preview of subscribers that would be pruned
func (s *EngagementService) PrunePreview(creatorID uuid.UUID) (map[string]interface{}, error) {
	subscribers, total, err := s.GetUnengagedSubscribers(creatorID, 10, 0)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalToPrune": total,
		"preview":      subscribers,
		"criteria":     "No email opens in the last 90 days",
	}, nil
}

// PruneUnengaged archives/removes unengaged subscribers
func (s *EngagementService) PruneUnengaged(creatorID uuid.UUID, archive bool) (int64, error) {
	cutoffDate := time.Now().AddDate(0, 0, -UnengagedDays)

	query := s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Where("(last_opened_at < ? OR (last_opened_at IS NULL AND subscribed_at < ?))", cutoffDate, cutoffDate)

	if archive {
		// Archive by updating status (keeps data but removes from active lists)
		now := time.Now()
		result := query.Updates(map[string]interface{}{
			"status":         models.SubscriberStatusUnsubscribed,
			"unsubscribed_at": now,
		})
		log.Printf("[Engagement] Archived %d unengaged subscribers for creator %s", result.RowsAffected, creatorID)
		return result.RowsAffected, result.Error
	}

	// Hard delete (permanent removal)
	result := query.Delete(&models.Subscriber{})
	log.Printf("[Engagement] Deleted %d unengaged subscribers for creator %s", result.RowsAffected, creatorID)
	return result.RowsAffected, result.Error
}

// RecalculateAllScores recalculates engagement scores for all active subscribers
func (s *EngagementService) RecalculateAllScores(creatorID uuid.UUID) error {
	var subscribers []models.Subscriber
	
	if err := s.db.Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Find(&subscribers).Error; err != nil {
		return err
	}

	for _, sub := range subscribers {
		score := s.calculateScore(&sub)
		s.db.Model(&sub).Update("engagement_score", score)
	}

	log.Printf("[Engagement] Recalculated scores for %d subscribers of creator %s", len(subscribers), creatorID)
	return nil
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
