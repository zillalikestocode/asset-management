package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AssetHandler struct{}

func NewAssetHandler() *AssetHandler {
	return &AssetHandler{}
}

func (h *AssetHandler) List(c *gin.Context) {
	// TODO: inject and call AssetService.GetByOrg
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) Create(c *gin.Context) {
	// TODO: inject and call AssetService.Create
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) Get(c *gin.Context) {
	// TODO: inject and call AssetService.GetByID
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) Update(c *gin.Context) {
	// TODO: inject and call AssetService.Update
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) Delete(c *gin.Context) {
	// TODO: inject and call AssetService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) GetHistory(c *gin.Context) {
	// TODO: inject and call AssetHistoryService.GetByAsset
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) GetQR(c *gin.Context) {
	// TODO: generate and return QR code PNG for asset
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *AssetHandler) Import(c *gin.Context) {
	// TODO: parse multipart CSV and bulk-create assets
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
