package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type ReportHandler struct {
	service service.ReportService
}

func NewReportHandler(s service.ReportService) *ReportHandler {
	return &ReportHandler{service: s}
}

func (h *ReportHandler) MaintenanceCompletion(c *gin.Context) {
	report, err := h.service.MaintenanceCompletion(c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, report)
}

func (h *ReportHandler) AssetDowntime(c *gin.Context) {
	report, err := h.service.AssetDowntime(c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, report)
}

func (h *ReportHandler) WorkOrderHistory(c *gin.Context) {
	report, err := h.service.WorkOrderHistory(c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, report)
}

func (h *ReportHandler) AssetInventory(c *gin.Context) {
	report, err := h.service.AssetInventory(c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, report)
}
