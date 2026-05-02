package dto

import "time"

type CreateAssetRequest struct {
	Name           string                 `json:"name" binding:"required"`
	AssetCode      string                 `json:"assetCode" binding:"required"`
	Description    string                 `json:"description"`
	Model          string                 `json:"model" binding:"required"`
	Manufacturer   string                 `json:"manufacturer"`
	SerialNumber   string                 `json:"serialNumber" binding:"required"`
	Status         string                 `json:"status"`
	CustomFields   map[string]interface{} `json:"customFields"`
	CategoryID     *string                `json:"categoryId"`
	LocationID     *string                `json:"locationId"`
	AssignedUserID *string                `json:"assignedUserId"`
	PurchaseCost   *float64               `json:"purchaseCost"`
	PurchaseDate   *time.Time             `json:"purchaseDate"`
}

type UpdateAssetRequest struct {
	Name           *string                `json:"name"`
	Description    *string                `json:"description"`
	Model          *string                `json:"model"`
	Manufacturer   *string                `json:"manufacturer"`
	SerialNumber   *string                `json:"serialNumber"`
	Status         *string                `json:"status"`
	CustomFields   map[string]interface{} `json:"customFields"`
	CategoryID     *string                `json:"categoryId"`
	LocationID     *string                `json:"locationId"`
	AssignedUserID *string                `json:"assignedUserId"`
	PurchaseCost   *float64               `json:"purchaseCost"`
	PurchaseDate   *time.Time             `json:"purchaseDate"`
	LastLat        *float64               `json:"lastLat"`
	LastLong       *float64               `json:"lastLong"`
}

type ImportAssetsRequest struct {
	Assets []CreateAssetRequest `json:"assets" binding:"required,min=1,dive"`
}

type AssetResponse struct {
	ID             string                 `json:"id"`
	OrgID          string                 `json:"orgId"`
	Name           string                 `json:"name"`
	AssetCode      string                 `json:"assetCode"`
	Description    string                 `json:"description"`
	Model          string                 `json:"model"`
	Manufacturer   string                 `json:"manufacturer"`
	SerialNumber   string                 `json:"serialNumber"`
	Status         string                 `json:"status"`
	CustomFields   map[string]interface{} `json:"customFields,omitempty"`
	CategoryID     *string                `json:"categoryId,omitempty"`
	Category       *CategoryResponse      `json:"category,omitempty"`
	LocationID     *string                `json:"locationId,omitempty"`
	Location       *LocationResponse      `json:"location,omitempty"`
	AssignedUserID *string                `json:"assignedUserId,omitempty"`
	AssignedUser   *UserResponse          `json:"assignedUser,omitempty"`
	PurchaseCost   *float64               `json:"purchaseCost,omitempty"`
	PurchaseDate   *time.Time             `json:"purchaseDate,omitempty"`
	LastLat        *float64               `json:"lastLat,omitempty"`
	LastLong       *float64               `json:"lastLong,omitempty"`
	LastLocationAt *time.Time             `json:"lastLocationAt,omitempty"`
	CreatedAt      time.Time              `json:"createdAt"`
	UpdatedAt      time.Time              `json:"updatedAt"`
}

type AssetHistoryResponse struct {
	ID        string    `json:"id"`
	AssetID   string    `json:"assetId"`
	Field     string    `json:"field"`
	OldValue  *string   `json:"oldValue,omitempty"`
	NewValue  string    `json:"newValue"`
	ChangedBy string    `json:"changedBy"`
	ChangedAt time.Time `json:"changedAt"`
}
