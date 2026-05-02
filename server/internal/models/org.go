package models

import "github.com/google/uuid"

type Org struct {
	Base
	Name      string `gorm:"not null"`
	Plan      string `gorm:"not null;default:'starter'"`
	Industry  string `gorm:"not null"`
	SeatTotal int    `gorm:"not null;default:5"`
}

type OrgRef struct {
	OrgID uuid.UUID `gorm:"type:uuid;not null;index"`
	Org   Org       `gorm:"foreignKey:OrgID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE; not null"`
}
