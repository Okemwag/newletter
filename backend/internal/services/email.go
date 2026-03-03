package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"os"

	"github.com/okemwag/newsletter/internal/models"
)

type EmailService struct {
	apiKey    string
	fromEmail string
	fromName  string
	baseURL   string
}

func NewEmailService() *EmailService {
	return &EmailService{
		apiKey:    os.Getenv("SENDGRID_API_KEY"),
		fromEmail: os.Getenv("SENDGRID_FROM_EMAIL"),
		fromName:  os.Getenv("SENDGRID_FROM_NAME"),
		baseURL:   os.Getenv("APP_BASE_URL"),
	}
}

type EmailRecipient struct {
	Email     string
	FirstName string
	LastName  string
	UnsubscribeToken string
}

type SendEmailRequest struct {
	To          EmailRecipient
	Subject     string
	HTMLContent string
	TextContent string
	CampaignID  string
}

type SendGridPersonalization struct {
	To []struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	} `json:"to"`
	Subject string `json:"subject,omitempty"`
}

type SendGridContent struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type SendGridMail struct {
	Personalizations []SendGridPersonalization `json:"personalizations"`
	From             struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	} `json:"from"`
	Subject  string            `json:"subject"`
	Content  []SendGridContent `json:"content"`
	Headers  map[string]string `json:"headers,omitempty"`
	TrackingSettings *struct {
		ClickTracking *struct {
			Enable bool `json:"enable"`
		} `json:"click_tracking,omitempty"`
		OpenTracking *struct {
			Enable bool `json:"enable"`
		} `json:"open_tracking,omitempty"`
	} `json:"tracking_settings,omitempty"`
}

func (s *EmailService) Send(req *SendEmailRequest) error {
	if s.apiKey == "" {
		return errors.New("SendGrid API key not configured")
	}

	mail := SendGridMail{
		Subject: req.Subject,
		Content: []SendGridContent{},
	}

	mail.From.Email = s.fromEmail
	mail.From.Name = s.fromName

	// Add recipient
	personalization := SendGridPersonalization{}
	personalization.To = []struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	}{
		{
			Email: req.To.Email,
			Name:  fmt.Sprintf("%s %s", req.To.FirstName, req.To.LastName),
		},
	}
	mail.Personalizations = append(mail.Personalizations, personalization)

	// Add content
	if req.TextContent != "" {
		mail.Content = append(mail.Content, SendGridContent{
			Type:  "text/plain",
			Value: req.TextContent,
		})
	}
	if req.HTMLContent != "" {
		mail.Content = append(mail.Content, SendGridContent{
			Type:  "text/html",
			Value: req.HTMLContent,
		})
	}

	// Add custom headers for tracking
	mail.Headers = map[string]string{
		"X-Campaign-ID": req.CampaignID,
	}

	// Enable tracking
	mail.TrackingSettings = &struct {
		ClickTracking *struct {
			Enable bool `json:"enable"`
		} `json:"click_tracking,omitempty"`
		OpenTracking *struct {
			Enable bool `json:"enable"`
		} `json:"open_tracking,omitempty"`
	}{
		ClickTracking: &struct {
			Enable bool `json:"enable"`
		}{Enable: true},
		OpenTracking: &struct {
			Enable bool `json:"enable"`
		}{Enable: true},
	}

	// Send request
	jsonData, err := json.Marshal(mail)
	if err != nil {
		return err
	}

	httpReq, err := http.NewRequest("POST", "https://api.sendgrid.com/v3/mail/send", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("SendGrid error: status %d", resp.StatusCode)
	}

	return nil
}

func (s *EmailService) RenderTemplate(content string, subscriber *models.Subscriber, campaign *models.Campaign) (string, error) {
	tmpl, err := template.New("email").Parse(content)
	if err != nil {
		return "", err
	}

	firstName := ""
	lastName := ""
	if subscriber.FirstName != nil {
		firstName = *subscriber.FirstName
	}
	if subscriber.LastName != nil {
		lastName = *subscriber.LastName
	}

	data := map[string]interface{}{
		"FirstName":       firstName,
		"LastName":        lastName,
		"Email":           subscriber.Email,
		"UnsubscribeURL":  fmt.Sprintf("%s/api/unsubscribe/%s", s.baseURL, subscriber.UnsubscribeToken),
		"CampaignTitle":   campaign.Title,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (s *EmailService) IsConfigured() bool {
	return s.apiKey != "" && s.fromEmail != ""
}
