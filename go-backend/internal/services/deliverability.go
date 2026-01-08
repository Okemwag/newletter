package services

import (
	"errors"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"gorm.io/gorm"
)

// DeliverabilityService handles DNS configuration and inbox placement monitoring
type DeliverabilityService struct {
	db *gorm.DB
}

// NewDeliverabilityService creates a new deliverability service
func NewDeliverabilityService() *DeliverabilityService {
	return &DeliverabilityService{
		db: database.GetDB(),
	}
}

// DNSConfigGuide returns the DNS records needed for a domain
type DNSConfigGuide struct {
	Domain     string              `json:"domain"`
	SPF        DNSRecordGuide      `json:"spf"`
	DKIM       DNSRecordGuide      `json:"dkim"`
	DMARC      DNSRecordGuide      `json:"dmarc"`
	Status     DNSVerificationStatus `json:"status"`
}

// DNSRecordGuide contains the recommended DNS record
type DNSRecordGuide struct {
	RecordType  string `json:"recordType"`
	Host        string `json:"host"`
	Value       string `json:"value"`
	TTL         int    `json:"ttl"`
	IsVerified  bool   `json:"isVerified"`
	Instructions string `json:"instructions"`
}

// DNSVerificationStatus overall verification status
type DNSVerificationStatus struct {
	AllVerified bool   `json:"allVerified"`
	SPFVerified bool   `json:"spfVerified"`
	DKIMVerified bool  `json:"dkimVerified"`
	DMARCVerified bool `json:"dmarcVerified"`
	LastChecked *time.Time `json:"lastChecked,omitempty"`
}

// GenerateDNSConfig generates DNS configuration guide for a domain
func (s *DeliverabilityService) GenerateDNSConfig(domain string) *DNSConfigGuide {
	// Standard recommendations - these should be customized based on email provider
	return &DNSConfigGuide{
		Domain: domain,
		SPF: DNSRecordGuide{
			RecordType: "TXT",
			Host:       "@",
			Value:      "v=spf1 include:sendgrid.net include:_spf.google.com ~all",
			TTL:        3600,
			Instructions: "Add this TXT record to your domain's DNS settings. This tells email servers which servers are allowed to send email on behalf of your domain.",
		},
		DKIM: DNSRecordGuide{
			RecordType: "CNAME",
			Host:       "s1._domainkey",
			Value:      "s1.domainkey.sendgrid.net",
			TTL:        3600,
			Instructions: "Add this CNAME record for DKIM signing. DKIM adds a digital signature to your emails to verify authenticity.",
		},
		DMARC: DNSRecordGuide{
			RecordType: "TXT",
			Host:       "_dmarc",
			Value:      fmt.Sprintf("v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@%s; pct=100", domain),
			TTL:        3600,
			Instructions: "Add this TXT record for DMARC policy. DMARC tells receiving servers what to do with emails that fail SPF or DKIM checks.",
		},
	}
}

// VerifyDNS checks if DNS records are properly configured
func (s *DeliverabilityService) VerifyDNS(creatorID uuid.UUID, domain string) (*DNSVerificationStatus, error) {
	status := &DNSVerificationStatus{}
	now := time.Now()
	status.LastChecked = &now

	// Check SPF
	status.SPFVerified = s.verifySPF(domain)

	// Check DKIM
	status.DKIMVerified = s.verifyDKIM(domain)

	// Check DMARC
	status.DMARCVerified = s.verifyDMARC(domain)

	status.AllVerified = status.SPFVerified && status.DKIMVerified && status.DMARCVerified

	// Store verification results
	s.storeDNSStatus(creatorID, domain, status)

	return status, nil
}

// verifySPF checks SPF record exists
func (s *DeliverabilityService) verifySPF(domain string) bool {
	txtRecords, err := net.LookupTXT(domain)
	if err != nil {
		return false
	}

	for _, txt := range txtRecords {
		if strings.HasPrefix(txt, "v=spf1") {
			return true
		}
	}
	return false
}

// verifyDKIM checks DKIM record exists
func (s *DeliverabilityService) verifyDKIM(domain string) bool {
	// Check common DKIM selectors
	selectors := []string{"s1._domainkey", "google._domainkey", "default._domainkey", "mail._domainkey"}
	
	for _, selector := range selectors {
		host := fmt.Sprintf("%s.%s", selector, domain)
		_, err := net.LookupTXT(host)
		if err == nil {
			return true
		}
		// Also check CNAME
		_, err = net.LookupCNAME(host)
		if err == nil {
			return true
		}
	}
	return false
}

// verifyDMARC checks DMARC record exists
func (s *DeliverabilityService) verifyDMARC(domain string) bool {
	dmarcHost := "_dmarc." + domain
	txtRecords, err := net.LookupTXT(dmarcHost)
	if err != nil {
		return false
	}

	for _, txt := range txtRecords {
		if strings.HasPrefix(txt, "v=DMARC1") {
			return true
		}
	}
	return false
}

// storeDNSStatus stores DNS verification results in database
func (s *DeliverabilityService) storeDNSStatus(creatorID uuid.UUID, domain string, status *DNSVerificationStatus) {
	recordTypes := []struct {
		Type     string
		Verified bool
	}{
		{"SPF", status.SPFVerified},
		{"DKIM", status.DKIMVerified},
		{"DMARC", status.DMARCVerified},
	}

	for _, rt := range recordTypes {
		var record models.DNSRecord
		err := s.db.Where("creator_id = ? AND domain = ? AND record_type = ?", creatorID, domain, rt.Type).First(&record).Error
		
		if errors.Is(err, gorm.ErrRecordNotFound) {
			record = models.DNSRecord{
				CreatorID:  creatorID,
				Domain:     domain,
				RecordType: rt.Type,
				IsVerified: rt.Verified,
				LastChecked: status.LastChecked,
			}
			if rt.Verified {
				record.VerifiedAt = status.LastChecked
			}
			s.db.Create(&record)
		} else {
			record.IsVerified = rt.Verified
			record.LastChecked = status.LastChecked
			if rt.Verified && record.VerifiedAt == nil {
				record.VerifiedAt = status.LastChecked
			}
			s.db.Save(&record)
		}
	}
}

// GetDeliverabilityMetrics returns all deliverability metrics for a creator
func (s *DeliverabilityService) GetDeliverabilityMetrics(creatorID uuid.UUID) (*models.DeliverabilityMetrics, error) {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create default metrics
		metrics = models.DeliverabilityMetrics{
			CreatorID:       creatorID,
			ReputationScore: 100,
			DeliveryRate:    100,
		}
		if err := s.db.Create(&metrics).Error; err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return &metrics, nil
}

// RecordDelivery records a successful email delivery
func (s *DeliverabilityService) RecordDelivery(creatorID, campaignID uuid.UUID, provider string) error {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		metrics = models.DeliverabilityMetrics{
			CreatorID: creatorID,
		}
		s.db.Create(&metrics)
	}

	metrics.TotalDelivered++
	metrics.TotalSent++

	// Recalculate delivery rate
	if metrics.TotalSent > 0 {
		metrics.DeliveryRate = float64(metrics.TotalDelivered) / float64(metrics.TotalSent) * 100
	}

	return s.db.Save(&metrics).Error
}

// RecordSend records an email send (for calculating rates)
func (s *DeliverabilityService) RecordSend(creatorID uuid.UUID, count int64) error {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		metrics = models.DeliverabilityMetrics{
			CreatorID: creatorID,
		}
		s.db.Create(&metrics)
	}

	metrics.TotalSent += count
	return s.db.Save(&metrics).Error
}

// RecordOpen records an email open event
func (s *DeliverabilityService) RecordOpen(creatorID uuid.UUID) error {
	return s.db.Model(&models.DeliverabilityMetrics{}).
		Where("creator_id = ?", creatorID).
		Updates(map[string]interface{}{
			"total_opened": gorm.Expr("total_opened + 1"),
		}).Error
}

// RecordClick records an email click event
func (s *DeliverabilityService) RecordClick(creatorID uuid.UUID) error {
	return s.db.Model(&models.DeliverabilityMetrics{}).
		Where("creator_id = ?", creatorID).
		Updates(map[string]interface{}{
			"total_clicked": gorm.Expr("total_clicked + 1"),
		}).Error
}

// GetDNSStatus returns DNS configuration status for a creator
func (s *DeliverabilityService) GetDNSStatus(creatorID uuid.UUID) ([]models.DNSRecord, error) {
	var records []models.DNSRecord
	err := s.db.Where("creator_id = ?", creatorID).Find(&records).Error
	return records, err
}

// GetInboxPlacement returns inbox placement stats for a campaign
func (s *DeliverabilityService) GetInboxPlacement(creatorID, campaignID uuid.UUID) ([]models.InboxPlacement, error) {
	var placements []models.InboxPlacement
	err := s.db.Where("creator_id = ? AND campaign_id = ?", creatorID, campaignID).Find(&placements).Error
	return placements, err
}

// GetProviderBreakdown returns email performance by provider
func (s *DeliverabilityService) GetProviderBreakdown(creatorID uuid.UUID) (map[string]interface{}, error) {
	// This would analyze email domains to categorize by provider
	var subscribers []models.Subscriber
	
	if err := s.db.Where("creator_id = ? AND status = ?", creatorID, models.SubscriberStatusActive).
		Select("email").Find(&subscribers).Error; err != nil {
		return nil, err
	}

	providers := map[string]int{
		"gmail":    0,
		"outlook":  0,
		"yahoo":    0,
		"apple":    0,
		"other":    0,
	}

	for _, sub := range subscribers {
		email := strings.ToLower(sub.Email)
		switch {
		case strings.Contains(email, "@gmail.") || strings.Contains(email, "@googlemail."):
			providers["gmail"]++
		case strings.Contains(email, "@outlook.") || strings.Contains(email, "@hotmail.") || strings.Contains(email, "@live.") || strings.Contains(email, "@msn."):
			providers["outlook"]++
		case strings.Contains(email, "@yahoo.") || strings.Contains(email, "@ymail."):
			providers["yahoo"]++
		case strings.Contains(email, "@icloud.") || strings.Contains(email, "@me.com") || strings.Contains(email, "@mac.com"):
			providers["apple"]++
		default:
			providers["other"]++
		}
	}

	total := 0
	for _, count := range providers {
		total += count
	}

	result := make(map[string]interface{})
	for provider, count := range providers {
		result[provider] = map[string]interface{}{
			"count":      count,
			"percentage": float64(count) / float64(max(int64(total), 1)) * 100,
		}
	}

	return result, nil
}

// RecalculateMetrics recalculates all deliverability metrics for a creator
func (s *DeliverabilityService) RecalculateMetrics(creatorID uuid.UUID) error {
	var metrics models.DeliverabilityMetrics
	
	err := s.db.Where("creator_id = ?", creatorID).First(&metrics).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}

	// Recalculate rates
	if metrics.TotalSent > 0 {
		metrics.DeliveryRate = float64(metrics.TotalDelivered) / float64(metrics.TotalSent) * 100
		metrics.BounceRate = float64(metrics.TotalBounced) / float64(metrics.TotalSent) * 100
		metrics.ComplaintRate = float64(metrics.TotalComplaints) / float64(metrics.TotalSent) * 100
	}
	if metrics.TotalDelivered > 0 {
		metrics.OpenRate = float64(metrics.TotalOpened) / float64(metrics.TotalDelivered) * 100
		metrics.ClickRate = float64(metrics.TotalClicked) / float64(metrics.TotalDelivered) * 100
	}

	// Recalculate reputation
	score := 100.0
	if metrics.BounceRate > 2 {
		score -= (metrics.BounceRate - 2) * 5
	}
	if metrics.ComplaintRate > 0.1 {
		score -= (metrics.ComplaintRate - 0.1) * 200
	}
	if metrics.OpenRate > 20 {
		score += (metrics.OpenRate - 20) * 0.5
	}
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}
	metrics.ReputationScore = score
	metrics.LastCalculatedAt = time.Now()

	return s.db.Save(&metrics).Error
}
