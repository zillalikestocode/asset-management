package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type AssetHandler struct {
	service service.AssetService
}

func NewAssetHandler(s service.AssetService) *AssetHandler {
	return &AssetHandler{service: s}
}

func (h *AssetHandler) List(c *gin.Context) {
	orgID := c.GetString("orgID")
	filters := service.AssetFilters{
		Search:     c.Query("search"),
		CategoryID: c.Query("categoryId"),
		LocationID: c.Query("locationId"),
		Status:     c.Query("status"),
	}
	if p := c.Query("page"); p != "" {
		filters.Page, _ = strconv.Atoi(p)
	}
	if pp := c.Query("perPage"); pp != "" {
		filters.PerPage, _ = strconv.Atoi(pp)
	}
	// Inject location scope for manager users.
	if ids, ok := c.Get("locationIDs"); ok {
		if locationIDs, ok := ids.([]string); ok {
			filters.LocationIDs = locationIDs
		}
	}

	result, err := h.service.List(orgID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *AssetHandler) Create(c *gin.Context) {
	var req dto.CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	orgID := c.GetString("orgID")
	userID := c.GetString("userID")

	asset, err := h.service.Create(orgID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, asset)
}

func (h *AssetHandler) Get(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("orgID")

	asset, err := h.service.Get(id, orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, asset)
}

func (h *AssetHandler) Update(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("orgID")
	userID := c.GetString("userID")

	var req dto.UpdateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	asset, err := h.service.Update(id, orgID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, asset)
}

func (h *AssetHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("orgID")

	if err := h.service.Delete(id, orgID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *AssetHandler) GetHistory(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("orgID")

	history, err := h.service.GetHistory(id, orgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *AssetHandler) GetQR(c *gin.Context) {
	// QR code generation is a future enhancement; return asset data for client-side QR rendering.
	id := c.Param("id")
	orgID := c.GetString("orgID")

	asset, err := h.service.Get(id, orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"assetCode": asset.AssetCode, "assetId": asset.ID})
}

func (h *AssetHandler) Import(c *gin.Context) {
	var req dto.ImportAssetsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	orgID := c.GetString("orgID")
	userID := c.GetString("userID")

	created := make([]dto.AssetResponse, 0, len(req.Assets))
	for _, a := range req.Assets {
		asset, err := h.service.Create(orgID, userID, a)
		if err != nil {
			continue
		}
		created = append(created, *asset)
	}
	c.JSON(http.StatusCreated, gin.H{"created": len(created), "assets": created})
}

func (h *AssetHandler) RecordLocation(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("orgID")

	var body struct {
		Lat float64 `json:"lat" binding:"required"`
		Lng float64 `json:"lng" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.RecordLocation(id, orgID, body.Lat, body.Lng); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
