package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService() *UserService {
	return &UserService{
		db: database.GetDB(),
	}
}

type UpdateUserRequest struct {
	FirstName      *string `json:"firstName,omitempty"`
	LastName       *string `json:"lastName,omitempty"`
	AvatarURL      *string `json:"avatarUrl,omitempty"`
	Bio            *string `json:"bio,omitempty"`
	NewsletterName *string `json:"newsletterName,omitempty"`
}

func (s *UserService) GetByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	result := s.db.First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

func (s *UserService) Update(id uuid.UUID, req *UpdateUserRequest) (*models.User, error) {
	user, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}
	if req.Bio != nil {
		user.Bio = req.Bio
	}
	if req.NewsletterName != nil {
		user.NewsletterName = req.NewsletterName
	}

	if err := s.db.Save(user).Error; err != nil {
		return nil, errors.New("failed to update user")
	}

	return user, nil
}

func (s *UserService) Delete(id uuid.UUID) error {
	result := s.db.Delete(&models.User{}, "id = ?", id)
	if result.Error != nil {
		return errors.New("failed to delete user")
	}
	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (s *UserService) GetAll() ([]models.User, error) {
	var users []models.User
	if err := s.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
