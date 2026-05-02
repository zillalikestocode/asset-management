package dto

import "time"

type CreateLocationRequest struct {
	Name     string  `json:"name" binding:"required"`
	ParentID *string `json:"parentId"`
}

type UpdateLocationRequest struct {
	Name     *string `json:"name"`
	ParentID *string `json:"parentId"`
}

type LocationResponse struct {
	ID        string    `json:"id"`
	OrgID     string    `json:"orgId"`
	Name      string    `json:"name"`
	ParentID  *string   `json:"parentId,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}
