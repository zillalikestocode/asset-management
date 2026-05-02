package dto

type InviteUserRequest struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	OrgID    string `json:"orgId" binding:"required"`
}

type UpdateUserRequest struct {
	Name   *string `json:"name" binding:"omitempty,min=2"`
	Role   *string `json:"role" binding:"omitempty,oneof=admin manager technician"`
	Active *bool   `json:"active"`
}

type UserResponse struct {
	ID     string `json:"id"`
	OrgID  string `json:"orgId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Active bool   `json:"active"`
}
