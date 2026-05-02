package models

import (
	"time"

	"github.com/google/uuid"
)

// Issue represents a problem reported by a technician on a specific asset.
// Severity: low | medium | critical
// Status: open → acknowledged → resolved
type Issue struct {
	Base
	OrgRef

	AssetID uuid.UUID `gorm:"type:uuid;not null;index"`
	Asset   Asset     `gorm:"foreignKey:AssetID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	ReportedByID uuid.UUID `gorm:"type:uuid;not null"`
	ReportedBy   User      `gorm:"foreignKey:ReportedByID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Title       string `gorm:"not null"`
	Description string `gorm:"not null"`
	Severity    string `gorm:"not null;default:'medium'"` // low | medium | critical
	Status      string `gorm:"not null;default:'open'"`   // open | acknowledged | resolved

	PhotoURL string // single photo attachment for MVP

	ResolvedByID *uuid.UUID `gorm:"type:uuid"`
	ResolvedBy   *User      `gorm:"foreignKey:ResolvedByID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	ResolvedAt *time.Time
	Resolution  string
}
