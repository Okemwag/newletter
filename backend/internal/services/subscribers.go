package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type SubscriberService struct {
	db *gorm.DB
}

func NewSubscriberService() *SubscriberService {
	return &SubscriberService{
		db: database.GetDB(),
	}
}

type CreateSubscriberRequest struct {
	Email     string    `json:"email" binding:"required,email"`
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	Source    *string   `json:"source,omitempty"`
	TagIDs    []string  `json:"tagIds,omitempty"`
}

type UpdateSubscriberRequest struct {
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	TagIDs    []string  `json:"tagIds,omitempty"`
}

type SubscriberFilter struct {
	Status   *models.SubscriberStatus
	TagID    *uuid.UUID
	Search   *string
	Page     int
	PageSize int
}

func (s *SubscriberService) Create(req *CreateSubscriberRequest, creatorID uuid.UUID) (*models.Subscriber, error) {
	// Check if subscriber already exists for this creator
	var existing models.Subscriber
	result := s.db.Where("email = ? AND creator_id = ?", strings.ToLower(req.Email), creatorID).First(&existing)
	if result.Error == nil {
		return nil, errors.New("subscriber already exists")
	}

	// Generate unsubscribe token
	token, err := generateToken(32)
	if err != nil {
		return nil, errors.New("failed to generate unsubscribe token")
	}

	subscriber := &models.Subscriber{
		Email:            strings.ToLower(req.Email),
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Status:           models.SubscriberStatusActive,
		CreatorID:        creatorID,
		UnsubscribeToken: token,
		Source:           req.Source,
	}

	if err := s.db.Create(subscriber).Error; err != nil {
		return nil, errors.New("failed to create subscriber")
	}

	// Add tags if provided
	if len(req.TagIDs) > 0 {
		if err := s.updateTags(subscriber.ID, req.TagIDs); err != nil {
			// Log but don't fail
		}
		// Reload with tags
		s.db.Preload("Tags").First(subscriber, "id = ?", subscriber.ID)
	}

	return subscriber, nil
}

func (s *SubscriberService) FindAll(creatorID uuid.UUID, filter *SubscriberFilter) ([]models.Subscriber, int64, error) {
	var subscribers []models.Subscriber
	var total int64

	query := s.db.Model(&models.Subscriber{}).Where("creator_id = ?", creatorID)

	if filter != nil {
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("email LIKE ? OR first_name ILIKE ? OR last_name ILIKE ?", search, search, search)
		}
		if filter.TagID != nil {
			query = query.Joins("JOIN subscriber_tags ON subscriber_tags.subscriber_id = subscribers.id").
				Where("subscriber_tags.tag_id = ?", *filter.TagID)
		}
	}

	// Count total
	query.Count(&total)

	// Apply pagination
	page := 1
	pageSize := 50
	if filter != nil {
		if filter.Page > 0 {
			page = filter.Page
		}
		if filter.PageSize > 0 && filter.PageSize <= 100 {
			pageSize = filter.PageSize
		}
	}
	offset := (page - 1) * pageSize

	if err := query.Preload("Tags").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&subscribers).Error; err != nil {
		return nil, 0, err
	}

	return subscribers, total, nil
}

func (s *SubscriberService) FindByID(id uuid.UUID, creatorID uuid.UUID) (*models.Subscriber, error) {
	var subscriber models.Subscriber
	result := s.db.Preload("Tags").Where("id = ? AND creator_id = ?", id, creatorID).First(&subscriber)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("subscriber not found")
		}
		return nil, result.Error
	}
	return &subscriber, nil
}

func (s *SubscriberService) Update(id uuid.UUID, req *UpdateSubscriberRequest, creatorID uuid.UUID) (*models.Subscriber, error) {
	subscriber, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if req.FirstName != nil {
		subscriber.FirstName = req.FirstName
	}
	if req.LastName != nil {
		subscriber.LastName = req.LastName
	}

	if err := s.db.Save(subscriber).Error; err != nil {
		return nil, errors.New("failed to update subscriber")
	}

	if req.TagIDs != nil {
		if err := s.updateTags(subscriber.ID, req.TagIDs); err != nil {
			return nil, err
		}
		s.db.Preload("Tags").First(subscriber, "id = ?", subscriber.ID)
	}

	return subscriber, nil
}

func (s *SubscriberService) Delete(id uuid.UUID, creatorID uuid.UUID) error {
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).Delete(&models.Subscriber{})
	if result.Error != nil {
		return errors.New("failed to delete subscriber")
	}
	if result.RowsAffected == 0 {
		return errors.New("subscriber not found")
	}
	return nil
}

func (s *SubscriberService) Unsubscribe(token string) error {
	var subscriber models.Subscriber
	result := s.db.Where("unsubscribe_token = ?", token).First(&subscriber)
	if result.Error != nil {
		return errors.New("invalid unsubscribe token")
	}

	now := time.Now()
	subscriber.Status = models.SubscriberStatusUnsubscribed
	subscriber.UnsubscribedAt = &now

	return s.db.Save(&subscriber).Error
}

func (s *SubscriberService) BulkCreate(subscribers []CreateSubscriberRequest, creatorID uuid.UUID, source string) (int, int, error) {
	created := 0
	skipped := 0

	for _, req := range subscribers {
		if source != "" && req.Source == nil {
			req.Source = &source
		}
		_, err := s.Create(&req, creatorID)
		if err != nil {
			skipped++
		} else {
			created++
		}
	}

	return created, skipped, nil
}

func (s *SubscriberService) GetStats(creatorID uuid.UUID) (map[string]int64, error) {
	stats := make(map[string]int64)

	var total, active, unsubscribed, bounced int64

	s.db.Model(&models.Subscriber{}).Where("creator_id = ?", creatorID).Count(&total)
	s.db.Model(&models.Subscriber{}).Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).Count(&active)
	s.db.Model(&models.Subscriber{}).Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusUnsubscribed).Count(&unsubscribed)
	s.db.Model(&models.Subscriber{}).Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusBounced).Count(&bounced)

	stats["total"] = total
	stats["active"] = active
	stats["unsubscribed"] = unsubscribed
	stats["bounced"] = bounced

	return stats, nil
}

func (s *SubscriberService) updateTags(subscriberID uuid.UUID, tagIDs []string) error {
	// Clear existing tags
	s.db.Exec("DELETE FROM subscriber_tags WHERE subscriber_id = ?", subscriberID)

	if len(tagIDs) == 0 {
		return nil
	}

	// Add new tags
	for _, tagIDStr := range tagIDs {
		tagID, err := uuid.Parse(tagIDStr)
		if err != nil {
			continue
		}
		s.db.Exec("INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING", subscriberID, tagID)
	}

	return nil
}

func generateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
