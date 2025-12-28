package services

import (
	"bytes"
	"errors"
	"html/template"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type TemplateService struct {
	db *gorm.DB
}

func NewTemplateService() *TemplateService {
	return &TemplateService{
		db: database.GetDB(),
	}
}

// Default templates
var defaultTemplates = []struct {
	Name        string
	Category    string
	Subject     string
	HTMLContent string
	Variables   []string
}{
	{
		Name:     "Welcome Email",
		Category: "welcome",
		Subject:  "Welcome to {{.NewsletterName}}!",
		HTMLContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #333; margin-top: 0; }
        .content p { color: #666; line-height: 1.6; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        .unsubscribe { color: #999; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.NewsletterName}}</h1>
        </div>
        <div class="content">
            <h2>Welcome, {{.FirstName}}! 🎉</h2>
            <p>We're thrilled to have you join our community. You've made an excellent choice by subscribing to <strong>{{.NewsletterName}}</strong>.</p>
            <p>Here's what you can expect:</p>
            <ul style="color: #666; line-height: 2;">
                <li>Exclusive content delivered to your inbox</li>
                <li>Early access to new features and updates</li>
                <li>Tips, insights, and valuable resources</li>
            </ul>
            <p>Stay tuned for our first newsletter coming soon!</p>
            <a href="{{.DashboardURL}}" class="button">Visit Dashboard</a>
        </div>
        <div class="footer">
            <p>You received this email because you subscribed to {{.NewsletterName}}.</p>
            <a href="{{.UnsubscribeURL}}" class="unsubscribe">Unsubscribe</a>
        </div>
    </div>
</body>
</html>`,
		Variables: []string{"FirstName", "LastName", "Email", "NewsletterName", "DashboardURL", "UnsubscribeURL"},
	},
	{
		Name:     "Newsletter Template",
		Category: "newsletter",
		Subject:  "{{.Subject}}",
		HTMLContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .content h2 { color: #333; margin-top: 0; }
        .article { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .article h3 { color: #333; margin: 0 0 10px 0; }
        .article p { color: #666; line-height: 1.6; }
        .read-more { color: #667eea; text-decoration: none; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.NewsletterName}}</h1>
        </div>
        <div class="content">
            {{.Content}}
        </div>
        <div class="footer">
            <p>Sent with ❤️ from {{.NewsletterName}}</p>
            <a href="{{.UnsubscribeURL}}" style="color: #999;">Unsubscribe</a>
        </div>
    </div>
</body>
</html>`,
		Variables: []string{"Subject", "Content", "NewsletterName", "UnsubscribeURL"},
	},
	{
		Name:     "Referral Invite",
		Category: "referral",
		Subject:  "{{.ReferrerName}} invited you to join {{.NewsletterName}}",
		HTMLContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; text-align: center; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: #667eea; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px; }
        .reward-badge { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .button { display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You're Invited! 🎁</h1>
        </div>
        <div class="content">
            <div class="avatar">{{.ReferrerInitial}}</div>
            <h2>{{.ReferrerName}} thinks you'll love {{.NewsletterName}}</h2>
            <p style="color: #666; font-size: 16px;">Join our community of subscribers and get exclusive content delivered straight to your inbox.</p>
            <div class="reward-badge">🎉 {{.RewardText}}</div>
            <br>
            <a href="{{.SignupURL}}" class="button">Accept Invitation</a>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This invitation was sent by {{.ReferrerName}} ({{.ReferrerEmail}})</p>
        </div>
        <div class="footer">
            <p>Referral code: <strong>{{.ReferralCode}}</strong></p>
        </div>
    </div>
</body>
</html>`,
		Variables: []string{"ReferrerName", "ReferrerInitial", "ReferrerEmail", "NewsletterName", "RewardText", "SignupURL", "ReferralCode"},
	},
	{
		Name:     "Payment Receipt",
		Category: "payment",
		Subject:  "Payment Receipt - {{.NewsletterName}}",
		HTMLContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 30px; }
        .receipt { background: #f8f9fa; padding: 20px; border-radius: 10px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .receipt-row:last-child { border-bottom: none; font-weight: bold; }
        .badge { background: #28a745; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Confirmed ✓</h1>
        </div>
        <div class="content">
            <p>Hi {{.FirstName}},</p>
            <p>Thank you for your payment. Here's your receipt:</p>
            <div class="receipt">
                <div class="receipt-row"><span>Plan</span><span>{{.PlanName}}</span></div>
                <div class="receipt-row"><span>Amount</span><span>{{.Currency}} {{.Amount}}</span></div>
                <div class="receipt-row"><span>Date</span><span>{{.Date}}</span></div>
                <div class="receipt-row"><span>Transaction ID</span><span>{{.TransactionID}}</span></div>
                <div class="receipt-row"><span>Status</span><span class="badge">Paid</span></div>
            </div>
            <p style="margin-top: 20px;">Your subscription is now active until {{.ExpiryDate}}.</p>
        </div>
        <div class="footer">
            <p>Questions? Reply to this email for support.</p>
        </div>
    </div>
</body>
</html>`,
		Variables: []string{"FirstName", "PlanName", "Currency", "Amount", "Date", "TransactionID", "ExpiryDate"},
	},
	{
		Name:     "Reward Notification",
		Category: "referral",
		Subject:  "🎉 You earned a reward!",
		HTMLContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 48px; }
        .content { padding: 40px 30px; text-align: center; }
        .amount { font-size: 48px; color: #667eea; font-weight: bold; margin: 20px 0; }
        .badge { background: #ffc107; color: #333; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .leaderboard { margin: 30px 0; }
        .rank { font-size: 24px; color: #333; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁</h1>
        </div>
        <div class="content">
            <h2>Congratulations, {{.FirstName}}!</h2>
            <p style="color: #666;">Your referral just converted! You've earned:</p>
            <div class="amount">{{.Currency}} {{.RewardAmount}}</div>
            <div class="badge">{{.BadgeText}}</div>
            <div class="leaderboard">
                <p class="rank">You're now ranked #{{.Rank}} 🏆</p>
                <p style="color: #666;">{{.NextMilestoneText}}</p>
            </div>
            <a href="{{.DashboardURL}}" class="button">View Your Rewards</a>
        </div>
        <div class="footer">
            <p>Keep sharing your referral link to earn more rewards!</p>
        </div>
    </div>
</body>
</html>`,
		Variables: []string{"FirstName", "Currency", "RewardAmount", "BadgeText", "Rank", "NextMilestoneText", "DashboardURL"},
	},
}

type CreateTemplateRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description *string  `json:"description,omitempty"`
	Subject     string   `json:"subject" binding:"required"`
	HTMLContent string   `json:"htmlContent" binding:"required"`
	TextContent *string  `json:"textContent,omitempty"`
	Variables   []string `json:"variables,omitempty"`
	Category    *string  `json:"category,omitempty"`
}

type UpdateTemplateRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	Subject     *string  `json:"subject,omitempty"`
	HTMLContent *string  `json:"htmlContent,omitempty"`
	TextContent *string  `json:"textContent,omitempty"`
	Variables   []string `json:"variables,omitempty"`
	Category    *string  `json:"category,omitempty"`
}

func (s *TemplateService) Create(req *CreateTemplateRequest, creatorID uuid.UUID) (*models.EmailTemplate, error) {
	tmpl := &models.EmailTemplate{
		CreatorID:   creatorID,
		Name:        req.Name,
		Description: req.Description,
		Subject:     req.Subject,
		HTMLContent: req.HTMLContent,
		TextContent: req.TextContent,
		Variables:   req.Variables,
		Category:    req.Category,
	}

	if err := s.db.Create(tmpl).Error; err != nil {
		return nil, errors.New("failed to create template")
	}

	return tmpl, nil
}

func (s *TemplateService) GetAll(creatorID uuid.UUID) ([]models.EmailTemplate, error) {
	var templates []models.EmailTemplate
	if err := s.db.Where("creator_id = ?", creatorID).Order("name ASC").Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

func (s *TemplateService) GetByID(id uuid.UUID, creatorID uuid.UUID) (*models.EmailTemplate, error) {
	var tmpl models.EmailTemplate
	if err := s.db.Where("id = ? AND creator_id = ?", id, creatorID).First(&tmpl).Error; err != nil {
		return nil, errors.New("template not found")
	}
	return &tmpl, nil
}

func (s *TemplateService) GetByCategory(category string, creatorID uuid.UUID) ([]models.EmailTemplate, error) {
	var templates []models.EmailTemplate
	if err := s.db.Where("category = ? AND creator_id = ?", category, creatorID).Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

func (s *TemplateService) Update(id uuid.UUID, req *UpdateTemplateRequest, creatorID uuid.UUID) (*models.EmailTemplate, error) {
	tmpl, err := s.GetByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		tmpl.Name = *req.Name
	}
	if req.Description != nil {
		tmpl.Description = req.Description
	}
	if req.Subject != nil {
		tmpl.Subject = *req.Subject
	}
	if req.HTMLContent != nil {
		tmpl.HTMLContent = *req.HTMLContent
	}
	if req.TextContent != nil {
		tmpl.TextContent = req.TextContent
	}
	if req.Variables != nil {
		tmpl.Variables = req.Variables
	}
	if req.Category != nil {
		tmpl.Category = req.Category
	}

	if err := s.db.Save(tmpl).Error; err != nil {
		return nil, errors.New("failed to update template")
	}

	return tmpl, nil
}

func (s *TemplateService) Delete(id uuid.UUID, creatorID uuid.UUID) error {
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).Delete(&models.EmailTemplate{})
	if result.RowsAffected == 0 {
		return errors.New("template not found")
	}
	return result.Error
}

func (s *TemplateService) Duplicate(id uuid.UUID, creatorID uuid.UUID) (*models.EmailTemplate, error) {
	original, err := s.GetByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	copy := &models.EmailTemplate{
		CreatorID:   creatorID,
		Name:        original.Name + " (Copy)",
		Description: original.Description,
		Subject:     original.Subject,
		HTMLContent: original.HTMLContent,
		TextContent: original.TextContent,
		Variables:   original.Variables,
		Category:    original.Category,
	}

	if err := s.db.Create(copy).Error; err != nil {
		return nil, errors.New("failed to duplicate template")
	}

	return copy, nil
}

// RenderTemplate renders a template with the given data
func (s *TemplateService) RenderTemplate(tmpl *models.EmailTemplate, data map[string]interface{}) (string, string, error) {
	// Render HTML
	htmlTmpl, err := template.New("html").Parse(tmpl.HTMLContent)
	if err != nil {
		return "", "", err
	}

	var htmlBuf bytes.Buffer
	if err := htmlTmpl.Execute(&htmlBuf, data); err != nil {
		return "", "", err
	}

	// Render subject
	subjectTmpl, err := template.New("subject").Parse(tmpl.Subject)
	if err != nil {
		return "", "", err
	}

	var subjectBuf bytes.Buffer
	if err := subjectTmpl.Execute(&subjectBuf, data); err != nil {
		return "", "", err
	}

	return htmlBuf.String(), subjectBuf.String(), nil
}

// InitializeDefaultTemplates creates default templates for a new creator
func (s *TemplateService) InitializeDefaultTemplates(creatorID uuid.UUID) error {
	for _, dt := range defaultTemplates {
		category := dt.Category
		tmpl := &models.EmailTemplate{
			CreatorID:   creatorID,
			Name:        dt.Name,
			Subject:     dt.Subject,
			HTMLContent: dt.HTMLContent,
			Variables:   dt.Variables,
			Category:    &category,
			IsDefault:   true,
		}
		s.db.Create(tmpl)
	}
	return nil
}

// PreviewTemplate renders a template with sample data
func (s *TemplateService) PreviewTemplate(id uuid.UUID, creatorID uuid.UUID) (string, error) {
	tmpl, err := s.GetByID(id, creatorID)
	if err != nil {
		return "", err
	}

	// Sample data for preview
	sampleData := map[string]interface{}{
		"FirstName":         "John",
		"LastName":          "Doe",
		"Email":             "john@example.com",
		"NewsletterName":    "My Awesome Newsletter",
		"Subject":           "Sample Newsletter Subject",
		"Content":           "<p>This is sample newsletter content for preview purposes.</p>",
		"DashboardURL":      "https://example.com/dashboard",
		"UnsubscribeURL":    "https://example.com/unsubscribe/sample-token",
		"ReferrerName":      "Jane Smith",
		"ReferrerInitial":   "J",
		"ReferrerEmail":     "jane@example.com",
		"RewardText":        "Get 20% off your first month!",
		"SignupURL":         "https://example.com/signup?ref=SAMPLE123",
		"ReferralCode":      "SAMPLE123",
		"PlanName":          "Pro Plan",
		"Currency":          "KES",
		"Amount":            "999",
		"Date":              time.Now().Format("Jan 02, 2006"),
		"TransactionID":     "TXN-123456789",
		"ExpiryDate":        time.Now().AddDate(0, 1, 0).Format("Jan 02, 2006"),
		"RewardAmount":      "500",
		"BadgeText":         "Referral Master 🏆",
		"Rank":              "5",
		"NextMilestoneText": "3 more referrals to reach Champion level!",
	}

	html, _, err := s.RenderTemplate(tmpl, sampleData)
	return html, err
}

// GetDefaultTemplates returns the built-in default templates
func (s *TemplateService) GetDefaultTemplates() []map[string]interface{} {
	var result []map[string]interface{}
	for _, dt := range defaultTemplates {
		result = append(result, map[string]interface{}{
			"name":      dt.Name,
			"category":  dt.Category,
			"subject":   dt.Subject,
			"variables": dt.Variables,
		})
	}
	return result
}
