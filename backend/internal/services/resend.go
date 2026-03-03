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

// ResendEmailService implements email sending via Resend API
type ResendEmailService struct {
	apiKey    string
	fromEmail string
	fromName  string
	baseURL   string
}

func NewResendEmailService() *ResendEmailService {
	return &ResendEmailService{
		apiKey:    os.Getenv("RESEND_API_KEY"),
		fromEmail: os.Getenv("RESEND_FROM_EMAIL"),
		fromName:  os.Getenv("RESEND_FROM_NAME"),
		baseURL:   os.Getenv("APP_BASE_URL"),
	}
}

// ResendEmail request body
type ResendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html,omitempty"`
	Text    string   `json:"text,omitempty"`
	ReplyTo string   `json:"reply_to,omitempty"`
	Tags    []struct {
		Name  string `json:"name"`
		Value string `json:"value"`
	} `json:"tags,omitempty"`
}

// ResendResponse from API
type ResendResponse struct {
	ID string `json:"id"`
}

// Send sends an email via Resend
func (s *ResendEmailService) Send(req *EmailRequest) error {
	if s.apiKey == "" {
		return errors.New("Resend API key not configured")
	}

	fromAddress := s.fromEmail
	if s.fromName != "" {
		fromAddress = fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	}

	resendReq := ResendEmailRequest{
		From:    fromAddress,
		To:      []string{req.To.Email},
		Subject: req.Subject,
	}

	if req.HTMLContent != "" {
		resendReq.HTML = req.HTMLContent
	}
	if req.TextContent != "" {
		resendReq.Text = req.TextContent
	}

	// Add campaign tag if present
	if req.CampaignID != "" {
		resendReq.Tags = []struct {
			Name  string `json:"name"`
			Value string `json:"value"`
		}{
			{Name: "campaign_id", Value: req.CampaignID},
		}
	}

	jsonData, err := json.Marshal(resendReq)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errBody)
		return fmt.Errorf("Resend API error: status %d, body: %v", resp.StatusCode, errBody)
	}

	return nil
}

// SendVerificationEmail sends email verification OTP
func (s *ResendEmailService) SendVerificationEmail(email, code string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; }
		.container { max-width: 500px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 12px; padding: 40px; }
		.logo { text-align: center; margin-bottom: 30px; }
		.logo span { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #06b6d4, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
		h1 { text-align: center; font-size: 24px; margin-bottom: 16px; }
		.code { text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #06b6d4; background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 30px 0; font-family: monospace; }
		p { color: #888; line-height: 1.6; text-align: center; }
		.footer { margin-top: 40px; text-align: center; font-size: 12px; color: #555; }
	</style>
</head>
<body>
	<div class="container">
		<div class="logo"><span>Pulse</span></div>
		<h1>Verify your email</h1>
		<p>Enter this code to verify your email address and continue with onboarding.</p>
		<div class="code">%s</div>
		<p>This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
		<div class="footer">© 2024 Pulse. All rights reserved.</div>
	</div>
</body>
</html>`, code)

	return s.Send(&EmailRequest{
		To:          EmailRecipient{Email: email},
		Subject:     "Your Pulse verification code: " + code,
		HTMLContent: html,
		TextContent: fmt.Sprintf("Your Pulse verification code is: %s\n\nThis code expires in 15 minutes.", code),
	})
}

// SendPhoneVerificationSMS - placeholder for SMS (would use Africa's Talking or similar)
func (s *ResendEmailService) SendPhoneVerificationSMS(phone, code string) error {
	// TODO: Integrate with SMS provider (Africa's Talking, Twilio, etc.)
	// For now, log the code
	fmt.Printf("[SMS] Verification code %s sent to %s\n", code, phone)
	return nil
}

// RenderTemplate renders a campaign template with subscriber data
func (s *ResendEmailService) RenderTemplate(content string, subscriber *models.Subscriber, campaign *models.Campaign) (string, error) {
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
		"FirstName":      firstName,
		"LastName":       lastName,
		"Email":          subscriber.Email,
		"UnsubscribeURL": fmt.Sprintf("%s/api/unsubscribe/%s", s.baseURL, subscriber.UnsubscribeToken),
		"CampaignTitle":  campaign.Title,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// IsConfigured checks if Resend is properly configured
func (s *ResendEmailService) IsConfigured() bool {
	return s.apiKey != "" && s.fromEmail != ""
}

// EmailRequest is the common request structure
type EmailRequest struct {
	To          EmailRecipient
	Subject     string
	HTMLContent string
	TextContent string
	CampaignID  string
}
