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

// ComplaintThreshold is the complaint rate threshold (0.1%) that triggers alerts
const ComplaintThreshold = 0.1

// ComplaintService handles spam complaint processing
type ComplaintService struct {
	db *gorm.DB
}

// NewComplaintService creates a new complaint service
func NewComplaintService() *ComplaintService {
	return &ComplaintService{
		db: database.GetDB(),
	}
}

// ComplaintEvent represents an incoming spam complaint from email provider
type ComplaintEvent struct {
	Email       string     `json:"email"`
	Reason      string     `json:"reason,omitempty"` // abuse, spam, etc.
	Timestamp   time.Time  `json:"timestamp"`
	CampaignID  *uuid.UUID `json:"campaignId,omitempty"`
	MessageID   string     `json:"messageId,omitempty"`
	Provider    string     `json:"provider"` // sendgrid, resend, etc.
	FeedbackID  string     `json:"feedbackId,omitempty"`
}

// ProcessComplaint handles a spam complaint and updates subscriber status
func (s *ComplaintService) ProcessComplaint(creatorID uuid.UUID, event *ComplaintEvent) error {
	// Find the subscriber
	var subscriber models.Subscriber
	if err := s.db.Where("email = ? AND creator_id = ?", event.Email, creatorID).First(&subscriber).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Complaint] Subscriber not found: %s", event.Email)
			return nil // Not an error, subscriber might have been deleted
		}
		return err
	}

	log.Printf("[Complaint] Spam complaint from %s: %s", subscriber.Email, event.Reason)

	// Auto-unsubscribe on complaint - this is mandatory for email compliance
	subscriber.Status = models.SubscriberStatusComplaint
	now := time.Now()
	subscriber.UnsubscribedAt = &now

	if err := s.db.Save(&subscriber).Error; err != nil {
		return err
	}

	// Record the complaint event
	if event.CampaignID != nil {
		s.recordComplaintEvent(&subscriber, event)
	}

	// Update deliverability metrics
	s.updateMetrics(subscriber.CreatorID)

	// Check if complaint rate exceeds threshold
	go s.checkComplaintThreshold(creatorID)

	return nil
}

// recordComplaintEvent creates an email event record for the complaint
func (s *ComplaintService) recordComplaintEvent(subscriber *models.Subscriber, event *ComplaintEvent) {
	reason := event.Reason
	if reason == "" {
		reason = "spam_complaint"
	}
	metadata := `{"reason": "` + reason + `", "feedbackId": "` + event.FeedbackID + `"}`
	
	emailEvent := &models.EmailEvent{
		CampaignID:   *event.CampaignID,
		SubscriberID: subscriber.ID,
		EventType:    models.EmailEventComplaint,
		Metadata:     &metadata,
	}
	
	if err := s.db.Create(emailEvent).Error; err != nil {
		log.Printf("[Complaint] Failed to record event: %v", err)
	}
}

// updateMetrics updates the creator's complaint metrics
func (s *ComplaintService) updateMetrics(creatorID uuid.UUID) {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new metrics record
		metrics = models.DeliverabilityMetrics{
			CreatorID: creatorID,
		}
		s.db.Create(&metrics)
	}

	metrics.TotalComplaints++

	// Recalculate complaint rate
	if metrics.TotalSent > 0 {
		metrics.ComplaintRate = float64(metrics.TotalComplaints) / float64(metrics.TotalSent) * 100
	}

	// Update reputation score (complaints heavily penalize reputation)
	s.updateReputationScore(&metrics)
	metrics.LastCalculatedAt = time.Now()

	s.db.Save(&metrics)
}

// updateReputationScore recalculates sender reputation based on metrics
func (s *ComplaintService) updateReputationScore(metrics *models.DeliverabilityMetrics) {
	score := 100.0

	// Heavy penalty for complaint rate (target: <0.1%)
	if metrics.ComplaintRate > 0.1 {
		// Each 0.1% over threshold = -20 points
		score -= (metrics.ComplaintRate - 0.1) * 200
	}

	// Penalty for bounce rate (target: <2%)
	if metrics.BounceRate > 2 {
		score -= (metrics.BounceRate - 2) * 5
	}

	// Bonus for good engagement
	if metrics.OpenRate > 20 {
		score += (metrics.OpenRate - 20) * 0.5
	}

	// Clamp to 0-100
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	metrics.ReputationScore = score
}

// checkComplaintThreshold checks if complaint rate exceeds threshold and logs warning
func (s *ComplaintService) checkComplaintThreshold(creatorID uuid.UUID) {
	var metrics models.DeliverabilityMetrics
	if err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error; err != nil {
		return
	}

	if metrics.ComplaintRate > ComplaintThreshold {
		log.Printf("[ALERT] Creator %s complaint rate %.2f%% exceeds threshold %.2f%%", 
			creatorID, metrics.ComplaintRate, ComplaintThreshold)
		// TODO: Send notification to creator
		// TODO: Could implement automatic sending restrictions
	}
}

// GetComplaintStats returns complaint statistics for a creator
func (s *ComplaintService) GetComplaintStats(creatorID uuid.UUID) (map[string]interface{}, error) {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return map[string]interface{}{
			"totalComplaints": int64(0),
			"complaintRate":   0.0,
			"isAboveThreshold": false,
			"threshold":        ComplaintThreshold,
		}, nil
	}
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalComplaints":  metrics.TotalComplaints,
		"complaintRate":    metrics.ComplaintRate,
		"isAboveThreshold": metrics.ComplaintRate > ComplaintThreshold,
		"threshold":        ComplaintThreshold,
	}, nil
}

// GetComplainedSubscribers returns list of subscribers who filed complaints
func (s *ComplaintService) GetComplainedSubscribers(creatorID uuid.UUID, limit, offset int) ([]models.Subscriber, int64, error) {
	var subscribers []models.Subscriber
	var total int64

	query := s.db.Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusComplaint)
	
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("unsubscribed_at DESC").Limit(limit).Offset(offset).Find(&subscribers).Error; err != nil {
		return nil, 0, err
	}

	return subscribers, total, nil
}

// GetRecentComplaints returns recent complaint events for a creator
func (s *ComplaintService) GetRecentComplaints(creatorID uuid.UUID, limit int) ([]models.EmailEvent, error) {
	var events []models.EmailEvent
	
	err := s.db.Joins("JOIN campaigns ON campaigns.id = email_events.campaign_id").
		Where("campaigns.creator_id = ? AND email_events.event_type = ?", creatorID, models.EmailEventComplaint).
		Order("email_events.created_at DESC").
		Limit(limit).
		Find(&events).Error
	
	return events, err
}
