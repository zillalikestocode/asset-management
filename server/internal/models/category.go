package models

import "github.com/google/uuid"

type Category struct {
	Base

	OrgID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_org_name"`
	Org   Org       `gorm:"foreignKey:OrgID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE; not null"`

	Name  string `gorm:"not null;uniqueIndex:idx_org_name"`
	Color *string
}
