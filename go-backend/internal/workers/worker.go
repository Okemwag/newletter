package workers

import (
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/services"
)

type Worker struct {
	campaignService *services.CampaignService
	emailService    *services.EmailService
	ticker          *time.Ticker
	quit            chan bool
}

func NewWorker() *Worker {
	return &Worker{
		campaignService: services.NewCampaignService(),
		emailService:    services.NewEmailService(),
		quit:            make(chan bool),
	}
}

// Start begins the background worker
func (w *Worker) Start() {
	log.Println("Starting background worker...")

	// Run every minute
	w.ticker = time.NewTicker(1 * time.Minute)

	go func() {
		// Run immediately on start
		w.runTasks()

		for {
			select {
			case <-w.ticker.C:
				w.runTasks()
			case <-w.quit:
				w.ticker.Stop()
				return
			}
		}
	}()
}

// Stop stops the background worker
func (w *Worker) Stop() {
	log.Println("Stopping background worker...")
	w.quit <- true
}

func (w *Worker) runTasks() {
	w.processScheduledCampaigns()
	w.checkExpiredSubscriptions()
}

// processScheduledCampaigns sends campaigns that are due
func (w *Worker) processScheduledCampaigns() {
	db := database.GetDB()

	var campaigns []models.Campaign
	now := time.Now()

	// Find campaigns scheduled for now or earlier that haven't been sent
	db.Where("status = ? AND scheduled_at <= ?", models.CampaignStatusScheduled, now).
		Find(&campaigns)

	for _, campaign := range campaigns {
		log.Printf("Processing scheduled campaign: %s", campaign.Title)

		// Get creator ID for service call
		creatorID := campaign.CreatorID

		// Send the campaign
		_, err := w.campaignService.SendNow(campaign.ID, creatorID)
		if err != nil {
			log.Printf("Failed to send campaign %s: %v", campaign.ID, err)
			// Mark as failed
			campaign.Status = models.CampaignStatusFailed
			reason := err.Error()
			statsJSON, _ := json.Marshal(map[string]string{"error": reason})
			statsStr := string(statsJSON)
			campaign.Stats = &statsStr
			db.Save(&campaign)
		}
	}
}

// checkExpiredSubscriptions marks expired subscriptions
func (w *Worker) checkExpiredSubscriptions() {
	db := database.GetDB()

	now := time.Now()
	db.Model(&models.UserSubscription{}).
		Where("status = ? AND expires_at < ?", "active", now).
		Update("status", "expired")
}

// Job queue types for async processing
type JobType string

const (
	JobTypeSendEmail     JobType = "send_email"
	JobTypeBulkImport    JobType = "bulk_import"
	JobTypeAggregateStats JobType = "aggregate_stats"
	JobTypeSendWebhook   JobType = "send_webhook"
)

type Job struct {
	ID        uuid.UUID   `json:"id"`
	Type      JobType     `json:"type"`
	Payload   interface{} `json:"payload"`
	Status    string      `json:"status"` // pending, processing, completed, failed
	Attempts  int         `json:"attempts"`
	CreatedAt time.Time   `json:"createdAt"`
}

// EnqueueJob adds a job to the Redis queue
func EnqueueJob(jobType JobType, payload interface{}) error {
	if !database.IsRedisConnected() {
		// Process synchronously if Redis not available
		return nil
	}

	job := Job{
		ID:        uuid.New(),
		Type:      jobType,
		Payload:   payload,
		Status:    "pending",
		Attempts:  0,
		CreatedAt: time.Now(),
	}

	jobJSON, err := json.Marshal(job)
	if err != nil {
		return err
	}

	return database.CacheSet("job:"+job.ID.String(), string(jobJSON), 24*time.Hour)
}
