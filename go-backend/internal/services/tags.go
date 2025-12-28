package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type TagService struct {
	db *gorm.DB
}

func NewTagService() *TagService {
	return &TagService{
		db: database.GetDB(),
	}
}

type CreateTagRequest struct {
	Name        string  `json:"name" binding:"required,max=100"`
	Color       *string `json:"color,omitempty"`
	Description *string `json:"description,omitempty"`
}

type UpdateTagRequest struct {
	Name        *string `json:"name,omitempty"`
	Color       *string `json:"color,omitempty"`
	Description *string `json:"description,omitempty"`
}

func (s *TagService) Create(req *CreateTagRequest, creatorID uuid.UUID) (*models.Tag, error) {
	// Check if tag with same name exists for this creator
	var existing models.Tag
	result := s.db.Where("name = ? AND creator_id = ?", req.Name, creatorID).First(&existing)
	if result.Error == nil {
		return nil, errors.New("tag with this name already exists")
	}

	tag := &models.Tag{
		Name:        req.Name,
		Color:       req.Color,
		Description: req.Description,
		CreatorID:   creatorID,
	}

	if err := s.db.Create(tag).Error; err != nil {
		return nil, errors.New("failed to create tag")
	}

	return tag, nil
}

func (s *TagService) FindAll(creatorID uuid.UUID) ([]models.Tag, error) {
	var tags []models.Tag
	if err := s.db.Where("creator_id = ?", creatorID).Order("name ASC").Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (s *TagService) FindByID(id uuid.UUID, creatorID uuid.UUID) (*models.Tag, error) {
	var tag models.Tag
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).First(&tag)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("tag not found")
		}
		return nil, result.Error
	}
	return &tag, nil
}

func (s *TagService) Update(id uuid.UUID, req *UpdateTagRequest, creatorID uuid.UUID) (*models.Tag, error) {
	tag, err := s.FindByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		// Check if new name conflicts with existing tag
		var existing models.Tag
		result := s.db.Where("name = ? AND creator_id = ? AND id != ?", *req.Name, creatorID, id).First(&existing)
		if result.Error == nil {
			return nil, errors.New("tag with this name already exists")
		}
		tag.Name = *req.Name
	}
	if req.Color != nil {
		tag.Color = req.Color
	}
	if req.Description != nil {
		tag.Description = req.Description
	}

	if err := s.db.Save(tag).Error; err != nil {
		return nil, errors.New("failed to update tag")
	}

	return tag, nil
}

func (s *TagService) Delete(id uuid.UUID, creatorID uuid.UUID) error {
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).Delete(&models.Tag{})
	if result.Error != nil {
		return errors.New("failed to delete tag")
	}
	if result.RowsAffected == 0 {
		return errors.New("tag not found")
	}
	return nil
}

func (s *TagService) GetSubscriberCount(tagID uuid.UUID) (int64, error) {
	var count int64
	err := s.db.Table("subscriber_tags").Where("tag_id = ?", tagID).Count(&count).Error
	return count, err
}
