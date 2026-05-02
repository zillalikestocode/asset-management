package models

import (
	"time"

	"github.com/google/uuid"
)

// Notification is an in-app or email alert delivered to a specific user.
// EventType drives which notification preference gate is checked before delivery.
//
// EventType values:
//   - maintenance_due         — an asset's maintenance window is approaching
//   - work_order_overdue      — a work order has passed its due date
//   - critical_issue          — a technician reported a critical severity issue
//   - asset_status_changed    — an asset moved to Inactive or Under Maintenance
//   - work_order_assigned     — a work order was assigned to this user
type Notification struct {
	Base

	UserID uuid.UUID `gorm:"type:uuid;not null;index"`
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	OrgID uuid.UUID `gorm:"type:uuid;not null;index"`

	EventType string `gorm:"not null"`
	Title     string `gorm:"not null"`
	Body      string `gorm:"not null"`

	// RefType and RefID point to the source record (asset, work_order, issue, maintenance_schedule).
	RefType string
	RefID   *uuid.UUID `gorm:"type:uuid"`

	Read   bool       `gorm:"not null;default:false"`
	ReadAt *time.Time
}
