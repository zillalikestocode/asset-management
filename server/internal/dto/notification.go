package dto

import "time"

type NotificationResponse struct {
	ID        string     `json:"id"`
	EventType string     `json:"eventType"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	RefType   string     `json:"refType,omitempty"`
	RefID     *string    `json:"refId,omitempty"`
	Read      bool       `json:"read"`
	ReadAt    *time.Time `json:"readAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}

type UpsertNotificationPreferenceRequest struct {
	EventType string `json:"eventType" binding:"required"`
	InApp     bool   `json:"inApp"`
	Email     bool   `json:"email"`
}

type NotificationPreferenceResponse struct {
	ID        string `json:"id"`
	EventType string `json:"eventType"`
	InApp     bool   `json:"inApp"`
	Email     bool   `json:"email"`
}
