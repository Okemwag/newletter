package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/types"
	"gorm.io/gorm"
)

type ContentService struct {
	db *gorm.DB
}

func NewContentService() *ContentService {
	return &ContentService{
		db: database.GetDB(),
	}
}

type CreateContentRequest struct {
	Title     string              `json:"title" binding:"required,max=300"`
	Content   string              `json:"content" binding:"required"`
	Excerpt   *string             `json:"excerpt,omitempty"`
	Status    *types.ContentStatus `json:"status,omitempty"`
	IsPremium *bool               `json:"isPremium,omitempty"`
}

type UpdateContentRequest struct {
	Title     *string             `json:"title,omitempty"`
	Content   *string             `json:"content,omitempty"`
	Excerpt   *string             `json:"excerpt,omitempty"`
	Status    *types.ContentStatus `json:"status,omitempty"`
	IsPremium *bool               `json:"isPremium,omitempty"`
}

func (s *ContentService) Create(req *CreateContentRequest, creatorID uuid.UUID) (*models.NewsletterContent, error) {
	status := types.ContentStatusDraft
	if req.Status != nil {
		status = *req.Status
	}

	isPremium := false
	if req.IsPremium != nil {
		isPremium = *req.IsPremium
	}

	content := &models.NewsletterContent{
		Title:     req.Title,
		Content:   req.Content,
		Excerpt:   req.Excerpt,
		Status:    status,
		IsPremium: isPremium,
		CreatorID: creatorID,
	}

	if status == types.ContentStatusPublished {
		now := time.Now()
		content.PublishedAt = &now
	}

	if err := s.db.Create(content).Error; err != nil {
		return nil, errors.New("failed to create content")
	}

	return content, nil
}

func (s *ContentService) FindAll(creatorID *uuid.UUID) ([]models.NewsletterContent, error) {
	var contents []models.NewsletterContent
	query := s.db.Order("created_at DESC")

	if creatorID != nil {
		query = query.Where("creator_id = ?", *creatorID)
	}

	if err := query.Find(&contents).Error; err != nil {
		return nil, err
	}

	return contents, nil
}

func (s *ContentService) FindOne(id uuid.UUID) (*models.NewsletterContent, error) {
	var content models.NewsletterContent
	result := s.db.Preload("Creator").First(&content, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}
		return nil, result.Error
	}
	return &content, nil
}

func (s *ContentService) Update(id uuid.UUID, req *UpdateContentRequest, userID uuid.UUID) (*models.NewsletterContent, error) {
	content, err := s.FindOne(id)
	if err != nil {
		return nil, err
	}

	if content.CreatorID != userID {
		return nil, errors.New("you do not have permission to update this content")
	}

	// Track if status is changing to published
	wasNotPublished := content.Status != types.ContentStatusPublished

	if req.Title != nil {
		content.Title = *req.Title
	}
	if req.Content != nil {
		content.Content = *req.Content
	}
	if req.Excerpt != nil {
		content.Excerpt = req.Excerpt
	}
	if req.Status != nil {
		content.Status = *req.Status
		// Set publishedAt when status changes to published
		if *req.Status == types.ContentStatusPublished && wasNotPublished {
			now := time.Now()
			content.PublishedAt = &now
		}
	}
	if req.IsPremium != nil {
		content.IsPremium = *req.IsPremium
	}

	if err := s.db.Save(content).Error; err != nil {
		return nil, errors.New("failed to update content")
	}

	return content, nil
}

func (s *ContentService) Remove(id uuid.UUID, userID uuid.UUID) error {
	content, err := s.FindOne(id)
	if err != nil {
		return err
	}

	if content.CreatorID != userID {
		return errors.New("you do not have permission to delete this content")
	}

	return s.db.Delete(content).Error
}

func (s *ContentService) FindByStatus(status types.ContentStatus, creatorID *uuid.UUID) ([]models.NewsletterContent, error) {
	var contents []models.NewsletterContent
	query := s.db.Where("status = ?", status).Order("created_at DESC")

	if creatorID != nil {
		query = query.Where("creator_id = ?", *creatorID)
	}

	if err := query.Find(&contents).Error; err != nil {
		return nil, err
	}

	return contents, nil
}

func (s *ContentService) FindPublishedContent(subscriptionStatus *types.SubscriptionStatus) ([]models.NewsletterContent, error) {
	var contents []models.NewsletterContent
	query := s.db.Where("status = ?", types.ContentStatusPublished).Order("published_at DESC")

	// If user is not premium, exclude premium content
	if subscriptionStatus == nil || *subscriptionStatus != types.SubscriptionPremium {
		query = query.Where("is_premium = ?", false)
	}

	if err := query.Find(&contents).Error; err != nil {
		return nil, err
	}

	return contents, nil
}

func (s *ContentService) CanAccessContent(contentID uuid.UUID, subscriptionStatus *types.SubscriptionStatus) (bool, error) {
	content, err := s.FindOne(contentID)
	if err != nil {
		return false, err
	}

	// If content is not premium, everyone can access
	if !content.IsPremium {
		return true, nil
	}

	// Premium content requires premium subscription
	return subscriptionStatus != nil && *subscriptionStatus == types.SubscriptionPremium, nil
}
