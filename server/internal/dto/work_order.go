package dto

import "time"

type CreateWorkOrderRequest struct {
	Title          string     `json:"title" binding:"required"`
	Description    string     `json:"description"`
	Priority       string     `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	AssetID        string     `json:"assetId" binding:"required"`
	AssignedToID   *string    `json:"assignedToId"`
	DueDate        *string  `json:"dueDate"`
	EstimatedHours *float64 `json:"estimatedHours"`
}

type UpdateWorkOrderRequest struct {
	Title           *string    `json:"title"`
	Description     *string    `json:"description"`
	Priority        *string    `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	Status          *string    `json:"status" binding:"omitempty,oneof=open in_progress completed cancelled"`
	AssignedToID    *string    `json:"assignedToId"`
	DueDate         *string  `json:"dueDate"`
	EstimatedHours  *float64 `json:"estimatedHours"`
	ActualHours     *float64   `json:"actualHours"`
	CompletionNotes *string    `json:"completionNotes"`
}

type AddWorkOrderPhotoRequest struct {
	URL      string `json:"url" binding:"required"`
	Filename string `json:"filename" binding:"required"`
}

type AddWorkOrderCommentRequest struct {
	Body string `json:"body" binding:"required"`
}

type WorkOrderCommentResponse struct {
	ID        string    `json:"id"`
	AuthorID  string    `json:"authorId"`
	Author    string    `json:"author"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"createdAt"`
}

type WorkOrderPhotoResponse struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Filename    string    `json:"filename"`
	CreatedAt   time.Time `json:"createdAt"`
}

type WorkOrderResponse struct {
	ID                    string                     `json:"id"`
	OrgID                 string                     `json:"orgId"`
	Title                 string                     `json:"title"`
	Description           string                     `json:"description,omitempty"`
	Priority              string                     `json:"priority"`
	Status                string                     `json:"status"`
	Type                  string                     `json:"type"`
	AssetID               string                     `json:"assetId"`
	Asset                 *AssetResponse             `json:"asset,omitempty"`
	AssignedToID          *string                    `json:"assignedToId,omitempty"`
	AssignedTo            *UserResponse              `json:"assignedTo,omitempty"`
	CreatedByID           string                     `json:"createdById"`
	CreatedBy             *UserResponse              `json:"createdBy,omitempty"`
	MaintenanceScheduleID *string                    `json:"maintenanceScheduleId,omitempty"`
	DueDate               *time.Time                 `json:"dueDate,omitempty"`
	CompletedAt           *time.Time                 `json:"completedAt,omitempty"`
	EstimatedHours        *float64                   `json:"estimatedHours,omitempty"`
	ActualHours           *float64                   `json:"actualHours,omitempty"`
	CompletionNotes       string                     `json:"completionNotes,omitempty"`
	Photos                []WorkOrderPhotoResponse   `json:"photos,omitempty"`
	Comments              []WorkOrderCommentResponse `json:"comments,omitempty"`
	CreatedAt             time.Time                  `json:"createdAt"`
	UpdatedAt             time.Time                  `json:"updatedAt"`
}
