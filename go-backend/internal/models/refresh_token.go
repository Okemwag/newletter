package models

import (
	"time"

	"github.com/google/uuid"
)

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TokenHash string    `gorm:"column:token_hash;size:255;not null" json:"-"`
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	ExpiresAt time.Time `gorm:"column:expires_at;not null" json:"expiresAt"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
