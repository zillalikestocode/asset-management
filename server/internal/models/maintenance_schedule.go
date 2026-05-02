package models

import (
	"time"

	"github.com/google/uuid"
)

// MaintenanceSchedule defines a recurring preventive maintenance task for an asset or category.
// ScheduleType: "time_based" triggers every IntervalDays days.
// ScheduleType: "usage_based" triggers every IntervalHours of logged usage hours.
type MaintenanceSchedule struct {
	Base
	OrgRef

	Name         string `gorm:"not null"`
	Description  string
	TaskType     string `gorm:"not null"`                        // e.g. "Oil Change", "Inspection"
	ScheduleType string `gorm:"not null;default:'time_based'"`   // time_based | usage_based
	Priority     string `gorm:"not null;default:'medium'"`       // low | medium | high | critical

	IntervalDays  *int // for time_based: trigger every N days
	IntervalHours *int // for usage_based: trigger every N logged hours

	// LeadTimeDays controls how many days before due date the work order is created.
	LeadTimeDays   int      `gorm:"not null;default:7"`
	EstimatedHours *float64

	// Scoped to a single asset OR an entire category — one or both may be nil (org-wide template).
	AssetID *uuid.UUID `gorm:"type:uuid;index"`
	Asset   *Asset     `gorm:"foreignKey:AssetID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	CategoryID *uuid.UUID `gorm:"type:uuid;index"`
	Category   *Category  `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	DefaultAssigneeID *uuid.UUID `gorm:"type:uuid;index"`
	DefaultAssignee   *User      `gorm:"foreignKey:DefaultAssigneeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	Active          bool       `gorm:"not null;default:true"`
	LastTriggeredAt *time.Time
	NextDueAt       *time.Time
}
