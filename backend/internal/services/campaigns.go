package services

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type CampaignService struct {
	db                *gorm.DB
	emailService      *EmailService
	subscriberService *SubscriberService
}

func NewCampaignService() *CampaignService {
	return &CampaignService{
		db:                database.GetDB(),
		emailService:      NewEmailService(),
		subscriberService: NewSubscriberService(),
	}
}

type CreateCampaignRequest struct {
	Title       string   `json:"title" binding:"required,max=300"`
	Subject     string   `json:"subject" binding:"required,max=500"`
	PreviewText *string  `json:"previewText,omitempty"`
	Content     string   `json:"content" binding:"required"`
	HTMLContent *string  `json:"htmlContent,omitempty"`
	TargetTagIDs []string `json:"targetTagIds,omitempty"`
}

type UpdateCampaignRequest struct {
	Title       *string  `json:"title,omitempty"`
	Subject     *string  `json:"subject,omitempty"`
	PreviewText *string  `json:"previewText,omitempty"`
	Content     *string  `json:"content,omitempty"`
	HTMLContent *string  `json:"htmlContent,omitempty"`
	TargetTagIDs []string `json:"targetTagIds,omitempty"`
}

type ScheduleCampaignRequest struct {
	ScheduledAt time.Time `json:"scheduledAt" binding:"required"`
}

func (s *CampaignService) Create(req *CreateCampaignRequest, creatorID uuid.UUID) (*models.Campaign, error) {
	campaign := &models.Campaign{
		Title:       req.Title,
		Subject:     req.Subject,
		PreviewText: req.PreviewText,
		Content:     req.Content,
		HTMLContent: req.HTMLContent,
		Status:      models.CampaignStatusDraft,
		CreatorID:   creatorID,
	}

	if err := s.db.Create(campaign).Error; err != nil {
		return nil, errors.New("failed to create campaign")
	}

	// Add target tags if provided
	if len(req.TargetTagIDs) > 0 {
		for _, tagIDStr := range req.TargetTagIDs {
			tagID, err := uuid.Parse(tagIDStr)
			if err != nil {
				continue
			}
			s.db.Exec("INSERT INTO campaign_tags (campaign_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING", campaign.ID, tagID)
		}
		s.db.Preload("TargetTags").First(campaign, "id = ?", campaign.ID)
	}

	return campaign, nil
}

func (s *CampaignService) FindAll(creatorID uuid.UUID) ([]models.Campaign, error) {
	var campaigns []models.Campaign
	if err := s.db.Preload("TargetTags").
		Where("creator_id = ?", creatorID).
		Order("created_at DESC").
		Find(&campaigns).Error; err != nil {
		return nil, err
	}
	return campaigns, nil
}

func (s *CampaignService) FindByID(id uuid.UUID, creatorID uuid.UUID) (*models.Campaign, error) {
	var campaign models.Campaign
	result := s.db.Preload("TargetTags").Where("id = ? AND creator_id = ?", id, creatorID).First(&campaign)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("campaign not found")
		}
		return nil, result.Error
	}
	return &campaign, nil
}

func (s *CampaignService) Update(id uuid.UUID, req *UpdateCampaignRequest, creatorID uuid.UUID) (*models.Campaign, error) {
	campaign, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if campaign.Status != models.CampaignStatusDraft {
		return nil, errors.New("can only edit draft campaigns")
	}

	if req.Title != nil {
		campaign.Title = *req.Title
	}
	if req.Subject != nil {
		campaign.Subject = *req.Subject
	}
	if req.PreviewText != nil {
		campaign.PreviewText = req.PreviewText
	}
	if req.Content != nil {
		campaign.Content = *req.Content
	}
	if req.HTMLContent != nil {
		campaign.HTMLContent = req.HTMLContent
	}

	if err := s.db.Save(campaign).Error; err != nil {
		return nil, errors.New("failed to update campaign")
	}

	// Update tags if provided
	if req.TargetTagIDs != nil {
		s.db.Exec("DELETE FROM campaign_tags WHERE campaign_id = ?", campaign.ID)
		for _, tagIDStr := range req.TargetTagIDs {
			tagID, err := uuid.Parse(tagIDStr)
			if err != nil {
				continue
			}
			s.db.Exec("INSERT INTO campaign_tags (campaign_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING", campaign.ID, tagID)
		}
		s.db.Preload("TargetTags").First(campaign, "id = ?", campaign.ID)
	}

	return campaign, nil
}

func (s *CampaignService) Delete(id uuid.UUID, creatorID uuid.UUID) error {
	campaign, err := s.FindByID(id, creatorID)
	if err != nil {
		return err
	}

	if campaign.Status == models.CampaignStatusSending {
		return errors.New("cannot delete campaign while sending")
	}

	return s.db.Delete(campaign).Error
}

func (s *CampaignService) Schedule(id uuid.UUID, req *ScheduleCampaignRequest, creatorID uuid.UUID) (*models.Campaign, error) {
	campaign, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if campaign.Status != models.CampaignStatusDraft {
		return nil, errors.New("can only schedule draft campaigns")
	}

	if req.ScheduledAt.Before(time.Now()) {
		return nil, errors.New("scheduled time must be in the future")
	}

	campaign.Status = models.CampaignStatusScheduled
	campaign.ScheduledAt = &req.ScheduledAt

	if err := s.db.Save(campaign).Error; err != nil {
		return nil, errors.New("failed to schedule campaign")
	}

	return campaign, nil
}

func (s *CampaignService) SendNow(id uuid.UUID, creatorID uuid.UUID) (*models.Campaign, error) {
	campaign, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if campaign.Status != models.CampaignStatusDraft && campaign.Status != models.CampaignStatusScheduled {
		return nil, errors.New("campaign already sent or sending")
	}

	if !s.emailService.IsConfigured() {
		return nil, errors.New("email service not configured")
	}

	// Update status to sending
	campaign.Status = models.CampaignStatusSending
	s.db.Save(campaign)

	// Get target subscribers
	subscribers, err := s.getTargetSubscribers(campaign)
	if err != nil {
		campaign.Status = models.CampaignStatusFailed
		s.db.Save(campaign)
		return nil, err
	}

	// Initialize stats
	stats := models.CampaignStats{
		TotalRecipients: len(subscribers),
	}

	// Send to each subscriber
	for _, sub := range subscribers {
		firstName := ""
		lastName := ""
		if sub.FirstName != nil {
			firstName = *sub.FirstName
		}
		if sub.LastName != nil {
			lastName = *sub.LastName
		}

		// Render email content with subscriber data
		htmlContent := campaign.Content
		if campaign.HTMLContent != nil && *campaign.HTMLContent != "" {
			rendered, err := s.emailService.RenderTemplate(*campaign.HTMLContent, &sub, campaign)
			if err == nil {
				htmlContent = rendered
			}
		}

		err := s.emailService.Send(&SendEmailRequest{
			To: EmailRecipient{
				Email:            sub.Email,
				FirstName:        firstName,
				LastName:         lastName,
				UnsubscribeToken: sub.UnsubscribeToken,
			},
			Subject:     campaign.Subject,
			HTMLContent: htmlContent,
			TextContent: campaign.Content,
			CampaignID:  campaign.ID.String(),
		})

		if err == nil {
			stats.Sent++
		}
	}

	// Update campaign with results
	now := time.Now()
	campaign.Status = models.CampaignStatusSent
	campaign.SentAt = &now
	statsJSON, _ := json.Marshal(stats)
	statsStr := string(statsJSON)
	campaign.Stats = &statsStr

	s.db.Save(campaign)

	return campaign, nil
}

func (s *CampaignService) getTargetSubscribers(campaign *models.Campaign) ([]models.Subscriber, error) {
	var subscribers []models.Subscriber
	
	query := s.db.Where("creator_id = ? AND status = ?", campaign.CreatorID, models.SubscriberStatusActive)

	// If campaign has target tags, filter by them
	if len(campaign.TargetTags) > 0 {
		tagIDs := make([]uuid.UUID, len(campaign.TargetTags))
		for i, tag := range campaign.TargetTags {
			tagIDs[i] = tag.ID
		}
		query = query.Joins("JOIN subscriber_tags ON subscriber_tags.subscriber_id = subscribers.id").
			Where("subscriber_tags.tag_id IN ?", tagIDs).
			Distinct()
	}

	if err := query.Find(&subscribers).Error; err != nil {
		return nil, err
	}

	return subscribers, nil
}

func (s *CampaignService) GetStats(id uuid.UUID, creatorID uuid.UUID) (*models.CampaignStats, error) {
	campaign, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if campaign.Stats == nil {
		return &models.CampaignStats{}, nil
	}

	var stats models.CampaignStats
	if err := json.Unmarshal([]byte(*campaign.Stats), &stats); err != nil {
		return nil, err
	}

	return &stats, nil
}
