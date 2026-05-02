package models

import "github.com/google/uuid"

type AssetHistory struct {
	Base

	AssetID uuid.UUID `gorm:"type:uuid;not null"`
	Asset   Asset     `gorm:"foreignKey:AssetID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	Field    string `gorm:"not null"`
	OldValue *string
	NewValue string

	ChangedBy uuid.UUID `gorm:"type:uuid;not null"`
	User      User      `gorm:"foreignKey:ChangedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
