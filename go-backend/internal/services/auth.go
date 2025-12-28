package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/config"
	"github.com/okemwag/newsletter/internal/database"
	"github.com/okemwag/newsletter/internal/models"
	"github.com/okemwag/newsletter/internal/types"
	"github.com/okemwag/newsletter/pkg/utils"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService() *AuthService {
	return &AuthService{
		db: database.GetDB(),
	}
}

type SignupRequest struct {
	Email          string         `json:"email" binding:"required,email"`
	Password       string         `json:"password" binding:"required,min=8"`
	Country        string         `json:"country"`
	// Optional fields for backwards compatibility
	FirstName      string         `json:"firstName"`
	LastName       string         `json:"lastName"`
	Role           types.UserRole `json:"role"`
	NewsletterName *string        `json:"newsletterName,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User         *models.User      `json:"user"`
	Tokens       *utils.TokenPair  `json:"tokens"`
	AccessToken  string            `json:"access_token"`
	RefreshToken string            `json:"refresh_token"`
}

func (s *AuthService) Register(req *SignupRequest) (*AuthResponse, error) {
	// Check if user already exists
	var existingUser models.User
	result := s.db.Where("email = ?", req.Email).First(&existingUser)
	if result.Error == nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Set defaults for creators
	role := req.Role
	if role == "" {
		role = types.UserRoleCreator
	}
	
	country := req.Country
	if country == "" {
		country = "KE"
	}

	// Create user with creator onboarding defaults
	user := &models.User{
		Email:          req.Email,
		Password:       hashedPassword,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Role:           role,
		NewsletterName: req.NewsletterName,
		IsActive:       true,
		EmailVerified:  false,
		Country:        country,
		CreatorStatus:  types.CreatorStatusDraft,
		OnboardingStep: 1,
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, errors.New("failed to create user")
	}

	// Create CreatorBalance for creators
	if role == types.UserRoleCreator {
		balance := &models.CreatorBalance{CreatorID: user.ID}
		if err := s.db.Create(balance).Error; err != nil {
			// Non-fatal, log and continue
		}

		// Send email verification
		go s.sendVerificationEmail(user)
	}

	// Generate tokens
	tokens, err := utils.GenerateTokenPair(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// Store refresh token
	if err := s.storeRefreshToken(user.ID, tokens.RefreshToken); err != nil {
		return nil, errors.New("failed to store refresh token")
	}

	return &AuthResponse{
		User:         user,
		Tokens:       tokens,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	// Find user by email
	var user models.User
	result := s.db.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if !utils.VerifyPassword(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	// Check email verification (strict mode)
	if !user.EmailVerified {
		return nil, errors.New("email not verified - please check your inbox")
	}

	// Generate tokens
	tokens, err := utils.GenerateTokenPair(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// Store refresh token
	if err := s.storeRefreshToken(user.ID, tokens.RefreshToken); err != nil {
		return nil, errors.New("failed to store refresh token")
	}

	return &AuthResponse{
		User:   &user,
		Tokens: tokens,
	}, nil
}

func (s *AuthService) RefreshTokens(refreshToken string) (*utils.TokenPair, error) {
	// Validate refresh token
	claims, err := utils.ValidateToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if refresh token exists in database
	var storedToken models.RefreshToken
	result := s.db.Where("user_id = ?", claims.UserID).First(&storedToken)
	if result.Error != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if token is expired
	if time.Now().After(storedToken.ExpiresAt) {
		s.db.Delete(&storedToken)
		return nil, errors.New("refresh token expired")
	}

	// Find user
	var user models.User
	if err := s.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Generate new tokens
	tokens, err := utils.GenerateTokenPair(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// Store new refresh token
	if err := s.storeRefreshToken(user.ID, tokens.RefreshToken); err != nil {
		return nil, errors.New("failed to store refresh token")
	}

	return tokens, nil
}

func (s *AuthService) Logout(userID uuid.UUID) error {
	return s.db.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error
}

func (s *AuthService) ValidateUser(userID uuid.UUID) (*models.User, error) {
	var user models.User
	result := s.db.First(&user, "id = ?", userID)
	if result.Error != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	return &user, nil
}

func (s *AuthService) storeRefreshToken(userID uuid.UUID, token string) error {
	// Delete existing refresh tokens for this user
	s.db.Where("user_id = ?", userID).Delete(&models.RefreshToken{})

	// Hash the token
	tokenHash, err := utils.HashPassword(token)
	if err != nil {
		return err
	}

	// Calculate expiry
	expiresAt := time.Now().AddDate(0, 0, config.AppConfig.JWTRefreshExpirationDays)

	// Create and save new refresh token
	refreshToken := &models.RefreshToken{
		TokenHash: tokenHash,
		UserID:    userID,
		ExpiresAt: expiresAt,
	}

	return s.db.Create(refreshToken).Error
}

// sendVerificationEmail creates verification code and sends email
func (s *AuthService) sendVerificationEmail(user *models.User) {
	// Generate 6-digit code
	code := generateVerificationCode()
	
	// Store verification
	verification := &models.EmailVerification{
		UserID:    user.ID,
		Code:      code,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}
	
	if err := s.db.Create(verification).Error; err != nil {
		return // Non-fatal
	}
	
	// Send via Resend
	emailService := NewResendEmailService()
	if emailService.IsConfigured() {
		emailService.SendVerificationEmail(user.Email, code)
	}
}

// generateVerificationCode creates a 6-digit code
func generateVerificationCode() string {
	code := ""
	for i := 0; i < 6; i++ {
		code += string(rune('0' + (time.Now().UnixNano()%10)))
		time.Sleep(time.Nanosecond)
	}
	return code
}
