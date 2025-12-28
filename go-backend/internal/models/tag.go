package models

import (
	"time"

	"github.com/google/uuid"
)

type Tag struct {
	ID          uuid.UUID    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"size:100;not null;index:idx_tag_name_creator,unique" json:"name"`
	Color       *string      `gorm:"size:7" json:"color,omitempty"` // Hex color e.g., #FF5733
	Description *string      `gorm:"size:255" json:"description,omitempty"`
	CreatorID   uuid.UUID    `gorm:"column:creator_id;type:uuid;not null;index:idx_tag_name_creator,unique" json:"creatorId"`
	Creator     User         `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"-"`
	Subscribers []Subscriber `gorm:"many2many:subscriber_tags;" json:"-"`
	CreatedAt   time.Time    `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time    `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Tag) TableName() string {
	return "tags"
}
