package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type AnalyticsService struct {
	db *gorm.DB
}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{
		db: database.GetDB(),
	}
}

type OverviewStats struct {
	TotalSubscribers   int64 `json:"totalSubscribers"`
	ActiveSubscribers  int64 `json:"activeSubscribers"`
	TotalCampaigns     int64 `json:"totalCampaigns"`
	SentCampaigns      int64 `json:"sentCampaigns"`
	TotalOpens         int64 `json:"totalOpens"`
	TotalClicks        int64 `json:"totalClicks"`
	AvgOpenRate        float64 `json:"avgOpenRate"`
	AvgClickRate       float64 `json:"avgClickRate"`
	SubscribersThisMonth int64 `json:"subscribersThisMonth"`
	UnsubscribesThisMonth int64 `json:"unsubscribesThisMonth"`
}

type GrowthData struct {
	Date        string `json:"date"`
	Subscribers int64  `json:"subscribers"`
	Unsubscribes int64 `json:"unsubscribes"`
}

func (s *AnalyticsService) GetOverview(creatorID uuid.UUID) (*OverviewStats, error) {
	stats := &OverviewStats{}

	// Subscriber counts
	s.db.Model(&models.Subscriber{}).Where("creator_id = ?", creatorID).Count(&stats.TotalSubscribers)
	s.db.Model(&models.Subscriber{}).Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).Count(&stats.ActiveSubscribers)

	// Campaign counts
	s.db.Model(&models.Campaign{}).Where("creator_id = ?", creatorID).Count(&stats.TotalCampaigns)
	s.db.Model(&models.Campaign{}).Where("creator_id = ? AND status = ?", creatorID, models.CampaignStatusSent).Count(&stats.SentCampaigns)

	// Event counts
	s.db.Model(&models.EmailEvent{}).
		Joins("JOIN campaigns ON campaigns.id = email_events.campaign_id").
		Where("campaigns.creator_id = ? AND email_events.event_type = ?", creatorID, models.EmailEventOpen).
		Count(&stats.TotalOpens)

	s.db.Model(&models.EmailEvent{}).
		Joins("JOIN campaigns ON campaigns.id = email_events.campaign_id").
		Where("campaigns.creator_id = ? AND email_events.event_type = ?", creatorID, models.EmailEventClick).
		Count(&stats.TotalClicks)

	// This month stats
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1).Truncate(24 * time.Hour)
	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND created_at >= ?", creatorID, startOfMonth).
		Count(&stats.SubscribersThisMonth)

	s.db.Model(&models.Subscriber{}).
		Where("creator_id = ? AND status = ? AND unsubscribed_at >= ?", creatorID, models.SubscriberStatusUnsubscribed, startOfMonth).
		Count(&stats.UnsubscribesThisMonth)

	// Calculate rates
	if stats.SentCampaigns > 0 && stats.ActiveSubscribers > 0 {
		totalSent := float64(stats.SentCampaigns * stats.ActiveSubscribers)
		stats.AvgOpenRate = float64(stats.TotalOpens) / totalSent * 100
		stats.AvgClickRate = float64(stats.TotalClicks) / totalSent * 100
	}

	return stats, nil
}

func (s *AnalyticsService) GetGrowthData(creatorID uuid.UUID, days int) ([]GrowthData, error) {
	var data []GrowthData

	for i := days - 1; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Truncate(24 * time.Hour)
		nextDate := date.Add(24 * time.Hour)

		var subscribers, unsubscribes int64

		s.db.Model(&models.Subscriber{}).
			Where("creator_id = ? AND created_at >= ? AND created_at < ?", creatorID, date, nextDate).
			Count(&subscribers)

		s.db.Model(&models.Subscriber{}).
			Where("creator_id = ? AND status = ? AND unsubscribed_at >= ? AND unsubscribed_at < ?", 
				creatorID, models.SubscriberStatusUnsubscribed, date, nextDate).
			Count(&unsubscribes)

		data = append(data, GrowthData{
			Date:         date.Format("2006-01-02"),
			Subscribers:  subscribers,
			Unsubscribes: unsubscribes,
		})
	}

	return data, nil
}

func (s *AnalyticsService) RecordEvent(event *models.EmailEvent) error {
	return s.db.Create(event).Error
}

func (s *AnalyticsService) GetCampaignEvents(campaignID uuid.UUID, eventType *models.EmailEventType) ([]models.EmailEvent, error) {
	var events []models.EmailEvent
	query := s.db.Where("campaign_id = ?", campaignID)
	
	if eventType != nil {
		query = query.Where("event_type = ?", *eventType)
	}

	if err := query.Order("created_at DESC").Limit(1000).Find(&events).Error; err != nil {
		return nil, err
	}

	return events, nil
}

func (s *AnalyticsService) GetTopCampaigns(creatorID uuid.UUID, limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	rows, err := s.db.Model(&models.Campaign{}).
		Select("campaigns.id, campaigns.title, campaigns.sent_at, COUNT(DISTINCT email_events.id) as total_events").
		Joins("LEFT JOIN email_events ON email_events.campaign_id = campaigns.id").
		Where("campaigns.creator_id = ? AND campaigns.status = ?", creatorID, models.CampaignStatusSent).
		Group("campaigns.id").
		Order("total_events DESC").
		Limit(limit).
		Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id uuid.UUID
		var title string
		var sentAt time.Time
		var totalEvents int64

		rows.Scan(&id, &title, &sentAt, &totalEvents)
		results = append(results, map[string]interface{}{
			"id":          id,
			"title":       title,
			"sentAt":      sentAt,
			"totalEvents": totalEvents,
		})
	}

	return results, nil
}
