package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/okemwag/newsletter/internal/config"
	"github.com/okemwag/newsletter/internal/types"
)

type Claims struct {
	UserID uuid.UUID      `json:"sub"`
	Email  string         `json:"email"`
	Role   types.UserRole `json:"role"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
}

func GenerateAccessToken(userID uuid.UUID, email string, role types.UserRole) (string, error) {
	expiration, err := time.ParseDuration(config.AppConfig.JWTExpiration)
	if err != nil {
		expiration = time.Hour // default to 1 hour
	}

	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func GenerateRefreshToken(userID uuid.UUID, email string, role types.UserRole) (string, error) {
	expirationDays := config.AppConfig.JWTRefreshExpirationDays
	expiration := time.Duration(expirationDays) * 24 * time.Hour

	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func GenerateTokenPair(userID uuid.UUID, email string, role types.UserRole) (*TokenPair, error) {
	accessToken, err := GenerateAccessToken(userID, email, role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := GenerateRefreshToken(userID, email, role)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    config.AppConfig.JWTExpiration,
	}, nil
}
