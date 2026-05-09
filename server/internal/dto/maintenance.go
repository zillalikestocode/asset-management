package dto

import "time"

type CreateMaintenanceScheduleRequest struct {
	Name              string   `json:"name" binding:"required"`
	Description       string   `json:"description"`
	TaskType          string   `json:"taskType" binding:"required"`
	ScheduleType      string   `json:"scheduleType" binding:"required,oneof=time_based usage_based"`
	Priority          string   `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	IntervalDays      *int     `json:"intervalDays"`
	IntervalHours     *int     `json:"intervalHours"`
	LeadTimeDays      int      `json:"leadTimeDays"`
	EstimatedHours    *float64 `json:"estimatedHours"`
	AssetID           *string  `json:"assetId"`
	CategoryID        *string  `json:"categoryId"`
	DefaultAssigneeID *string  `json:"defaultAssigneeId"`
}

type UpdateMaintenanceScheduleRequest struct {
	Name              *string  `json:"name"`
	Description       *string  `json:"description"`
	TaskType          *string  `json:"taskType"`
	ScheduleType      *string  `json:"scheduleType" binding:"omitempty,oneof=time_based usage_based"`
	Priority          *string  `json:"priority" binding:"omitempty,oneof=low medium high critical"`
	IntervalDays      *int     `json:"intervalDays"`
	IntervalHours     *int     `json:"intervalHours"`
	LeadTimeDays      *int     `json:"leadTimeDays"`
	EstimatedHours    *float64 `json:"estimatedHours"`
	AssetID           *string  `json:"assetId"`
	CategoryID        *string  `json:"categoryId"`
	DefaultAssigneeID *string  `json:"defaultAssigneeId"`
	Active            *bool    `json:"active"`
}

type MaintenanceScheduleResponse struct {
	ID                string     `json:"id"`
	OrgID             string     `json:"orgId"`
	Name              string     `json:"name"`
	Description       string     `json:"description,omitempty"`
	TaskType          string     `json:"taskType"`
	ScheduleType      string     `json:"scheduleType"`
	Priority          string     `json:"priority"`
	IntervalDays      *int       `json:"intervalDays,omitempty"`
	IntervalHours     *int       `json:"intervalHours,omitempty"`
	LeadTimeDays      int        `json:"leadTimeDays"`
	EstimatedHours    *float64   `json:"estimatedHours,omitempty"`
	AssetID           *string        `json:"assetId,omitempty"`
	Asset             *AssetResponse `json:"asset,omitempty"`
	CategoryID        *string        `json:"categoryId,omitempty"`
	DefaultAssigneeID *string        `json:"defaultAssigneeId,omitempty"`
	Active            bool       `json:"active"`
	LastTriggeredAt   *time.Time `json:"lastTriggeredAt,omitempty"`
	NextDueAt         *time.Time `json:"nextDueAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}
