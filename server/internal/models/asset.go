package models

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"time"
)

type Asset struct {
	Base
	OrgRef

	AssignedUserID *uuid.UUID `gorm:"type:uuid"`
	AssignedUser   *User      `gorm:"foreignKey:AssignedUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Name         string         `gorm:"not null"`
	AssetCode    string         `gorm:"not null;uniqueIndex"`
	Description  string         `gorm:"not null"`
	Model        string         `gorm:"not null"`
	Manufacturer string         `gorm:"not null;default:'Unknown'"`
	SerialNumber string         `gorm:"not null;"`
	Status       string         `gorm:"not null;default:'active'"`
	CustomFields datatypes.JSON `gorm:"type:jsonb"`

	LastLat        *float64
	LastLong       *float64
	LastLocationAt *time.Time

	PurchaseCost *float64
	PurchaseDate *time.Time

	CategoryID *uuid.UUID `gorm:"type:uuid;index"`
	Category   *Category  `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;not null"`

	LocationID *uuid.UUID `gorm:"type:uuid;index"`
	Location   *Location  `gorm:"foreignKey:LocationID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;not null"`
}
