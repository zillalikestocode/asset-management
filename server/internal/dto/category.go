package dto

import "time"

type CreateCategoryRequest struct {
	Name  string  `json:"name" binding:"required"`
	Color *string `json:"color"`
}

type UpdateCategoryRequest struct {
	Name  *string `json:"name"`
	Color *string `json:"color"`
}

type CategoryResponse struct {
	ID        string    `json:"id"`
	OrgID     string    `json:"orgId"`
	Name      string    `json:"name"`
	Color     *string   `json:"color,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}
