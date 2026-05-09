package dto

type RegisterRequest struct {
	OrgName   string `json:"orgName"   binding:"required,min=2"`
	Industry  string `json:"industry"  binding:"required,min=2"`
	AdminName string `json:"adminName" binding:"required,min=2"`
	Email     string `json:"email"     binding:"required,email"`
	Password  string `json:"password"  binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginResponse struct {
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
	User         UserResponse `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type RefreshTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}
