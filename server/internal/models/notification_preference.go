package models

import "github.com/google/uuid"

// NotificationPreference stores per-user, per-event delivery channel preferences.
// One row per user per event type; unique constraint prevents duplicates.
// Defaults: both InApp and Email enabled for all event types.
//
// EventType mirrors the values defined in Notification.EventType.
type NotificationPreference struct {
	Base

	UserID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_notif_pref_user_event"`
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	EventType string `gorm:"not null;uniqueIndex:idx_notif_pref_user_event"`

	InApp bool `gorm:"not null;default:true"`
	Email bool `gorm:"not null;default:true"`
}
