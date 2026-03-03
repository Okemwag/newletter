package services

import (
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

const (
	// MaxSoftBounces is the maximum number of soft bounces before treating as hard bounce
	MaxSoftBounces = 3
)

// BounceService handles email bounce processing
type BounceService struct {
	db *gorm.DB
}

// NewBounceService creates a new bounce service
func NewBounceService() *BounceService {
	return &BounceService{
		db: database.GetDB(),
	}
}

// BounceEvent represents an incoming bounce event from email provider
type BounceEvent struct {
	Email       string            `json:"email"`
	BounceType  models.BounceType `json:"bounceType"` // "hard" or "soft"
	Reason      string            `json:"reason"`
	Timestamp   time.Time         `json:"timestamp"`
	CampaignID  *uuid.UUID        `json:"campaignId,omitempty"`
	MessageID   string            `json:"messageId,omitempty"`
	Provider    string            `json:"provider"` // sendgrid, resend, etc.
}

// ProcessBounce handles a bounce event and updates subscriber status
func (s *BounceService) ProcessBounce(creatorID uuid.UUID, event *BounceEvent) error {
	// Find the subscriber
	var subscriber models.Subscriber
	if err := s.db.Where("email = ? AND creator_id = ?", event.Email, creatorID).First(&subscriber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Bounce] Subscriber not found: %s", event.Email)
			return nil // Not an error, subscriber might have been deleted
		}
		return err
	}

	// Update bounce tracking
	now := time.Now()
	subscriber.LastBounceAt = &now
	subscriber.BounceReason = &event.Reason

	// Handle based on bounce type
	if event.BounceType == models.BounceTypeHard {
		// Hard bounce - immediately mark as bounced and unsubscribe
		return s.handleHardBounce(&subscriber, event)
	}

	// Soft bounce - increment counter and check threshold
	return s.handleSoftBounce(&subscriber, event)
}

// handleHardBounce processes a hard bounce (permanent delivery failure)
func (s *BounceService) handleHardBounce(subscriber *models.Subscriber, event *BounceEvent) error {
	log.Printf("[Bounce] Hard bounce for %s: %s", subscriber.Email, event.Reason)

	subscriber.Status = models.SubscriberStatusBounced
	subscriber.BounceCount = subscriber.BounceCount + 1
	now := time.Now()
	subscriber.UnsubscribedAt = &now

	if err := s.db.Save(subscriber).Error; err != nil {
		return err
	}

	// Record the event
	if event.CampaignID != nil {
		s.recordBounceEvent(subscriber, event)
	}

	// Update deliverability metrics
	s.updateMetrics(subscriber.CreatorID, models.BounceTypeHard)

	return nil
}

// handleSoftBounce processes a soft bounce (temporary delivery failure)
func (s *BounceService) handleSoftBounce(subscriber *models.Subscriber, event *BounceEvent) error {
	subscriber.BounceCount = subscriber.BounceCount + 1

	if subscriber.BounceCount >= MaxSoftBounces {
		// Too many soft bounces, treat as hard bounce
		log.Printf("[Bounce] Max soft bounces reached for %s, marking as bounced", subscriber.Email)
		subscriber.Status = models.SubscriberStatusBounced
		now := time.Now()
		subscriber.UnsubscribedAt = &now
	} else {
		log.Printf("[Bounce] Soft bounce #%d for %s: %s", subscriber.BounceCount, subscriber.Email, event.Reason)
	}

	if err := s.db.Save(subscriber).Error; err != nil {
		return err
	}

	// Record the event
	if event.CampaignID != nil {
		s.recordBounceEvent(subscriber, event)
	}

	// Update deliverability metrics
	s.updateMetrics(subscriber.CreatorID, models.BounceTypeSoft)

	return nil
}

// recordBounceEvent creates an email event record for the bounce
func (s *BounceService) recordBounceEvent(subscriber *models.Subscriber, event *BounceEvent) {
	metadata := `{"reason": "` + event.Reason + `", "bounceType": "` + string(event.BounceType) + `"}`
	
	emailEvent := &models.EmailEvent{
		CampaignID:   *event.CampaignID,
		SubscriberID: subscriber.ID,
		EventType:    models.EmailEventBounce,
		Metadata:     &metadata,
	}
	
	if err := s.db.Create(emailEvent).Error; err != nil {
		log.Printf("[Bounce] Failed to record event: %v", err)
	}
}

// updateMetrics updates the creator's deliverability metrics
func (s *BounceService) updateMetrics(creatorID uuid.UUID, bounceType models.BounceType) {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new metrics record
		metrics = models.DeliverabilityMetrics{
			CreatorID: creatorID,
		}
		s.db.Create(&metrics)
	}

	metrics.TotalBounced++
	if bounceType == models.BounceTypeHard {
		metrics.HardBounces++
	} else {
		metrics.SoftBounces++
	}

	// Recalculate bounce rate
	if metrics.TotalSent > 0 {
		metrics.BounceRate = float64(metrics.TotalBounced) / float64(metrics.TotalSent) * 100
	}

	// Update reputation score (decrease for bounces)
	s.updateReputationScore(&metrics)

	s.db.Save(&metrics)
}

// updateReputationScore recalculates sender reputation based on metrics
func (s *BounceService) updateReputationScore(metrics *models.DeliverabilityMetrics) {
	// Start with perfect score
	score := 100.0

	// Deduct for bounce rate (target: <2%)
	if metrics.BounceRate > 2 {
		score -= (metrics.BounceRate - 2) * 5 // -5 points per 1% over 2%
	}

	// Deduct for complaint rate (target: <0.1%)
	if metrics.ComplaintRate > 0.1 {
		score -= (metrics.ComplaintRate - 0.1) * 50 // -50 points per 1% over 0.1%
	}

	// Bonus for good engagement
	if metrics.OpenRate > 20 {
		score += (metrics.OpenRate - 20) * 0.5 // +0.5 points per 1% over 20%
	}

	// Clamp to 0-100
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	metrics.ReputationScore = score
	metrics.LastCalculatedAt = time.Now()
}

// GetBounceStats returns bounce statistics for a creator
func (s *BounceService) GetBounceStats(creatorID uuid.UUID) (map[string]interface{}, error) {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Return default stats
		return map[string]interface{}{
			"totalBounced":    0,
			"hardBounces":     0,
			"softBounces":     0,
			"bounceRate":      0.0,
			"reputationScore": 100.0,
		}, nil
	}
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalBounced":    metrics.TotalBounced,
		"hardBounces":     metrics.HardBounces,
		"softBounces":     metrics.SoftBounces,
		"bounceRate":      metrics.BounceRate,
		"reputationScore": metrics.ReputationScore,
	}, nil
}

// GetBouncedSubscribers returns list of bounced subscribers for a creator
func (s *BounceService) GetBouncedSubscribers(creatorID uuid.UUID, limit, offset int) ([]models.Subscriber, int64, error) {
	var subscribers []models.Subscriber
	var total int64

	query := s.db.Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusBounced)
	
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("last_bounce_at DESC").Limit(limit).Offset(offset).Find(&subscribers).Error; err != nil {
		return nil, 0, err
	}

	return subscribers, total, nil
}

// ResetBounce resets bounce status for a subscriber (e.g., after email is corrected)
func (s *BounceService) ResetBounce(creatorID, subscriberID uuid.UUID) error {
	return s.db.Model(&models.Subscriber{}).
		Where("id = ? AND creator_id = ?", subscriberID, creatorID).
		Updates(map[string]interface{}{
			"status":        models.SubscriberStatusActive,
			"bounce_count":  0,
			"bounce_reason": nil,
			"last_bounce_at": nil,
			"unsubscribed_at": nil,
		}).Error
}
