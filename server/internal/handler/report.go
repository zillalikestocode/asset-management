package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct{}

func NewReportHandler() *ReportHandler {
	return &ReportHandler{}
}

func (h *ReportHandler) MaintenanceCompletion(c *gin.Context) {
	// TODO: inject and call ReportService.MaintenanceCompletion (filter by ?from=&to=)
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *ReportHandler) AssetDowntime(c *gin.Context) {
	// TODO: inject and call ReportService.AssetDowntime
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *ReportHandler) WorkOrderHistory(c *gin.Context) {
	// TODO: inject and call ReportService.WorkOrderHistory
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *ReportHandler) AssetInventory(c *gin.Context) {
	// TODO: inject and call ReportService.AssetInventory; supports ?format=csv
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
