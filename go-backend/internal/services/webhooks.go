package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

type WebhookService struct {
	db *gorm.DB
}

func NewWebhookService() *WebhookService {
	return &WebhookService{
		db: database.GetDB(),
	}
}

type CreateWebhookRequest struct {
	URL    string                     `json:"url" binding:"required,url"`
	Events []models.WebhookEventType `json:"events" binding:"required"`
}

type UpdateWebhookRequest struct {
	URL      *string                    `json:"url,omitempty"`
	Events   []models.WebhookEventType `json:"events,omitempty"`
	IsActive *bool                      `json:"isActive,omitempty"`
}

func (s *WebhookService) Create(req *CreateWebhookRequest, creatorID uuid.UUID) (*models.Webhook, error) {
	// Generate secret
	secret := make([]byte, 32)
	rand.Read(secret)
	secretHex := hex.EncodeToString(secret)

	webhook := &models.Webhook{
		CreatorID: creatorID,
		URL:       req.URL,
		Secret:    secretHex,
		Events:    req.Events,
		IsActive:  true,
	}

	if err := s.db.Create(webhook).Error; err != nil {
		return nil, errors.New("failed to create webhook")
	}

	return webhook, nil
}

func (s *WebhookService) GetAll(creatorID uuid.UUID) ([]models.Webhook, error) {
	var webhooks []models.Webhook
	if err := s.db.Where("creator_id = ?", creatorID).Find(&webhooks).Error; err != nil {
		return nil, err
	}
	return webhooks, nil
}

func (s *WebhookService) GetByID(id uuid.UUID, creatorID uuid.UUID) (*models.Webhook, error) {
	var webhook models.Webhook
	if err := s.db.Where("id = ? AND creator_id = ?", id, creatorID).First(&webhook).Error; err != nil {
		return nil, errors.New("webhook not found")
	}
	return &webhook, nil
}

func (s *WebhookService) Update(id uuid.UUID, req *UpdateWebhookRequest, creatorID uuid.UUID) (*models.Webhook, error) {
	webhook, err := s.GetByID(id, creatorID)
	if err != nil {
		return nil, err
	}

	if req.URL != nil {
		webhook.URL = *req.URL
	}
	if req.Events != nil {
		webhook.Events = req.Events
	}
	if req.IsActive != nil {
		webhook.IsActive = *req.IsActive
	}

	if err := s.db.Save(webhook).Error; err != nil {
		return nil, errors.New("failed to update webhook")
	}

	return webhook, nil
}

func (s *WebhookService) Delete(id uuid.UUID, creatorID uuid.UUID) error {
	result := s.db.Where("id = ? AND creator_id = ?", id, creatorID).Delete(&models.Webhook{})
	if result.RowsAffected == 0 {
		return errors.New("webhook not found")
	}
	return result.Error
}

func (s *WebhookService) RegenerateSecret(id uuid.UUID, creatorID uuid.UUID) (*models.Webhook, string, error) {
	webhook, err := s.GetByID(id, creatorID)
	if err != nil {
		return nil, "", err
	}

	secret := make([]byte, 32)
	rand.Read(secret)
	secretHex := hex.EncodeToString(secret)

	webhook.Secret = secretHex
	if err := s.db.Save(webhook).Error; err != nil {
		return nil, "", errors.New("failed to update secret")
	}

	return webhook, secretHex, nil
}

// TriggerEvent sends webhook for an event
func (s *WebhookService) TriggerEvent(creatorID uuid.UUID, eventType models.WebhookEventType, payload interface{}) {
	var webhooks []models.Webhook
	s.db.Where("creator_id = ? AND is_active = ?", creatorID, true).Find(&webhooks)

	for _, webhook := range webhooks {
		// Check if webhook listens to this event
		listensTo := false
		for _, e := range webhook.Events {
			if e == eventType {
				listensTo = true
				break
			}
		}

		if !listensTo {
			continue
		}

		// Send webhook asynchronously
		go s.sendWebhook(&webhook, eventType, payload)
	}
}

func (s *WebhookService) sendWebhook(webhook *models.Webhook, eventType models.WebhookEventType, payload interface{}) {
	// Prepare payload
	body := map[string]interface{}{
		"event":     eventType,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"data":      payload,
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		return
	}

	// Create HMAC signature
	mac := hmac.New(sha256.New, []byte(webhook.Secret))
	mac.Write(jsonData)
	signature := hex.EncodeToString(mac.Sum(nil))

	// Send request
	req, err := http.NewRequest("POST", webhook.URL, bytes.NewBuffer(jsonData))
	if err != nil {
		s.logWebhookError(webhook, eventType, jsonData, 0, err.Error())
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Signature", signature)
	req.Header.Set("X-Webhook-Event", string(eventType))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		s.logWebhookError(webhook, eventType, jsonData, 0, err.Error())
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	respStr := string(respBody)

	// Log the webhook
	log := &models.WebhookLog{
		WebhookID:  webhook.ID,
		EventType:  string(eventType),
		Payload:    string(jsonData),
		StatusCode: resp.StatusCode,
		Response:   &respStr,
	}

	if resp.StatusCode >= 400 {
		errStr := "HTTP " + resp.Status
		log.Error = &errStr
		webhook.LastError = &errStr
	} else {
		webhook.LastError = nil
	}

	now := time.Now()
	webhook.LastSentAt = &now
	s.db.Save(webhook)
	s.db.Create(log)
}

func (s *WebhookService) logWebhookError(webhook *models.Webhook, eventType models.WebhookEventType, payload []byte, statusCode int, errMsg string) {
	log := &models.WebhookLog{
		WebhookID:  webhook.ID,
		EventType:  string(eventType),
		Payload:    string(payload),
		StatusCode: statusCode,
		Error:      &errMsg,
	}
	s.db.Create(log)

	webhook.LastError = &errMsg
	s.db.Save(webhook)
}

func (s *WebhookService) GetLogs(webhookID uuid.UUID, creatorID uuid.UUID, limit int) ([]models.WebhookLog, error) {
	// Verify ownership
	var webhook models.Webhook
	if err := s.db.Where("id = ? AND creator_id = ?", webhookID, creatorID).First(&webhook).Error; err != nil {
		return nil, errors.New("webhook not found")
	}

	var logs []models.WebhookLog
	if err := s.db.Where("webhook_id = ?", webhookID).Order("sent_at DESC").Limit(limit).Find(&logs).Error; err != nil {
		return nil, err
	}

	return logs, nil
}
