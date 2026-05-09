package models

import "github.com/google/uuid"

type User struct {
	Base
	Name     string `gorm:"not null"`
	Email    string `gorm:"not null;uniqueIndex"`
	Password string `gorm:"not null"`
	Role     string `gorm:"not null;default:'technician'"`
	Active   bool   `gorm:"not null;default:true"`

	OrgID uuid.UUID `gorm:"type:uuid;not null"`
	Org   Org       `gorm:"foreignKey:OrgID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE; not null"`

	// Managers can be scoped to specific locations (many-to-many via user_locations join table).
	Locations []Location `gorm:"many2many:user_locations;"`
}
