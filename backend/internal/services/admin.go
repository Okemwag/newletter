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

type AdminService struct {
	db *gorm.DB
}

func NewAdminService() *AdminService {
	return &AdminService{
		db: database.GetDB(),
	}
}

type PlatformStats struct {
	TotalUsers         int64 `json:"totalUsers"`
	TotalCreators      int64 `json:"totalCreators"`
	TotalSubscribers   int64 `json:"totalSubscribers"`
	TotalCampaigns     int64 `json:"totalCampaigns"`
	TotalEmailsSent    int64 `json:"totalEmailsSent"`
	TotalRevenue       int64 `json:"totalRevenue"`
	NewUsersToday      int64 `json:"newUsersToday"`
	NewUsersThisWeek   int64 `json:"newUsersThisWeek"`
	NewUsersThisMonth  int64 `json:"newUsersThisMonth"`
	ActiveSubscriptions int64 `json:"activeSubscriptions"`
}

type UserFilter struct {
	Role     *types.UserRole
	IsActive *bool
	Search   *string
	Page     int
	PageSize int
}

func (s *AdminService) GetPlatformStats() (*PlatformStats, error) {
	stats := &PlatformStats{}

	// User counts
	s.db.Model(&models.User{}).Count(&stats.TotalUsers)
	s.db.Model(&models.User{}).Where("role = ?", types.UserRoleCreator).Count(&stats.TotalCreators)
	s.db.Model(&models.Subscriber{}).Where("status = ?", models.SubscriberStatusActive).Count(&stats.TotalSubscribers)

	// Campaign stats
	s.db.Model(&models.Campaign{}).Count(&stats.TotalCampaigns)
	s.db.Model(&models.EmailEvent{}).Where("event_type = ?", models.EmailEventDelivered).Count(&stats.TotalEmailsSent)

	// Revenue
	var revenue int64
	s.db.Model(&models.Payment{}).Where("status = ?", models.PaymentStatusSuccess).Select("COALESCE(SUM(amount), 0)").Scan(&revenue)
	stats.TotalRevenue = revenue

	// User growth
	today := time.Now().Truncate(24 * time.Hour)
	weekAgo := today.AddDate(0, 0, -7)
	monthAgo := today.AddDate(0, -1, 0)

	s.db.Model(&models.User{}).Where("created_at >= ?", today).Count(&stats.NewUsersToday)
	s.db.Model(&models.User{}).Where("created_at >= ?", weekAgo).Count(&stats.NewUsersThisWeek)
	s.db.Model(&models.User{}).Where("created_at >= ?", monthAgo).Count(&stats.NewUsersThisMonth)

	// Active subscriptions
	s.db.Model(&models.UserSubscription{}).Where("status = ?", "active").Count(&stats.ActiveSubscriptions)

	return stats, nil
}

func (s *AdminService) GetAllUsers(filter *UserFilter) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := s.db.Model(&models.User{})

	if filter != nil {
		if filter.Role != nil {
			query = query.Where("role = ?", *filter.Role)
		}
		if filter.IsActive != nil {
			query = query.Where("is_active = ?", *filter.IsActive)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + *filter.Search + "%"
			query = query.Where("email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?", search, search, search)
		}
	}

	query.Count(&total)

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

	if err := query.Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (s *AdminService) UpdateUserRole(userID uuid.UUID, role types.UserRole) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	user.Role = role
	if err := s.db.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update user role")
	}

	return &user, nil
}

func (s *AdminService) UpdateUserStatus(userID uuid.UUID, isActive bool) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	user.IsActive = isActive
	if err := s.db.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update user status")
	}

	return &user, nil
}

func (s *AdminService) GetAllCampaigns(page, pageSize int) ([]models.Campaign, int64, error) {
	var campaigns []models.Campaign
	var total int64

	s.db.Model(&models.Campaign{}).Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	if err := s.db.Preload("Creator").Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&campaigns).Error; err != nil {
		return nil, 0, err
	}

	return campaigns, total, nil
}

func (s *AdminService) DeleteContent(contentID uuid.UUID) error {
	result := s.db.Delete(&models.NewsletterContent{}, "id = ?", contentID)
	if result.RowsAffected == 0 {
		return errors.New("content not found")
	}
	return result.Error
}

func (s *AdminService) GetRevenueByProvider() (map[string]int64, error) {
	revenue := make(map[string]int64)

	var results []struct {
		Provider string
		Total    int64
	}

	s.db.Model(&models.Payment{}).
		Select("provider, COALESCE(SUM(amount), 0) as total").
		Where("status = ?", models.PaymentStatusSuccess).
		Group("provider").
		Scan(&results)

	for _, r := range results {
		revenue[r.Provider] = r.Total
	}

	return revenue, nil
}

func (s *AdminService) GetRevenueTimeline(days int) ([]map[string]interface{}, error) {
	var data []map[string]interface{}

	for i := days - 1; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Truncate(24 * time.Hour)
		nextDate := date.Add(24 * time.Hour)

		var dailyRevenue int64
		s.db.Model(&models.Payment{}).
			Where("status = ? AND paid_at >= ? AND paid_at < ?", models.PaymentStatusSuccess, date, nextDate).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&dailyRevenue)

		data = append(data, map[string]interface{}{
			"date":    date.Format("2006-01-02"),
			"revenue": dailyRevenue,
		})
	}

	return data, nil
}

func (s *AdminService) GetTopCreators(limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	rows, err := s.db.Model(&models.User{}).
		Select("users.id, users.email, users.first_name, users.last_name, users.newsletter_name, COUNT(DISTINCT subscribers.id) as subscriber_count").
		Joins("LEFT JOIN subscribers ON subscribers.creator_id = users.id AND subscribers.status = 'active'").
		Where("users.role = ?", types.UserRoleCreator).
		Group("users.id").
		Order("subscriber_count DESC").
		Limit(limit).
		Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id uuid.UUID
		var email, firstName, lastName string
		var newsletterName *string
		var subscriberCount int64

		rows.Scan(&id, &email, &firstName, &lastName, &newsletterName, &subscriberCount)
		
		name := ""
		if newsletterName != nil {
			name = *newsletterName
		}

		results = append(results, map[string]interface{}{
			"id":              id,
			"email":           email,
			"firstName":       firstName,
			"lastName":        lastName,
			"newsletterName":  name,
			"subscriberCount": subscriberCount,
		})
	}

	return results, nil
}
