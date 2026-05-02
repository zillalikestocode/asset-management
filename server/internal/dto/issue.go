package dto

import "time"

type CreateIssueRequest struct {
	AssetID     string `json:"assetId" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Severity    string `json:"severity" binding:"omitempty,oneof=low medium critical"`
	PhotoURL    string `json:"photoUrl"`
}

type UpdateIssueRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Severity    *string `json:"severity" binding:"omitempty,oneof=low medium critical"`
	Status      *string `json:"status" binding:"omitempty,oneof=open acknowledged resolved"`
	Resolution  *string `json:"resolution"`
}

type IssueResponse struct {
	ID           string     `json:"id"`
	OrgID        string     `json:"orgId"`
	AssetID      string     `json:"assetId"`
	Asset        *AssetResponse `json:"asset,omitempty"`
	ReportedByID string     `json:"reportedById"`
	ReportedBy   *UserResponse `json:"reportedBy,omitempty"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Severity     string     `json:"severity"`
	Status       string     `json:"status"`
	PhotoURL     string     `json:"photoUrl,omitempty"`
	ResolvedByID *string    `json:"resolvedById,omitempty"`
	ResolvedBy   *UserResponse `json:"resolvedBy,omitempty"`
	ResolvedAt   *time.Time `json:"resolvedAt,omitempty"`
	Resolution   string     `json:"resolution,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}
