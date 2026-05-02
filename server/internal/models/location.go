package models

import "github.com/google/uuid"

type Location struct {
	Base
	OrgRef

	Name string `gorm:"not null"`

	ParentID *uuid.UUID `gorm:"type:uuid;index"`
	Parent   *Location  `gorm:"foreignKey=ParentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
