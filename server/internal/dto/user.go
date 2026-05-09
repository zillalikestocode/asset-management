package dto

type InviteUserRequest struct {
	Name        string   `json:"name"        binding:"required,min=2"`
	Email       string   `json:"email"       binding:"required,email"`
	Role        string   `json:"role"        binding:"omitempty,oneof=admin manager technician"`
	LocationIDs []string `json:"locationIds"`
	OrgID       string   `json:"-"` // injected by handler from JWT claims
}

type UpdateUserRequest struct {
	Name   *string `json:"name" binding:"omitempty,min=2"`
	Role   *string `json:"role" binding:"omitempty,oneof=admin manager technician"`
	Active *bool   `json:"active"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword"     binding:"required,min=8"`
}

type UserResponse struct {
	ID        string             `json:"id"`
	OrgID     string             `json:"orgId"`
	OrgName   string             `json:"orgName,omitempty"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	Role      string             `json:"role"`
	Active    bool               `json:"active"`
	Locations []LocationResponse `json:"locations,omitempty"`
}
