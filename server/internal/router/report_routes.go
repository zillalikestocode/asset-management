package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerReportRoutes(rg *gin.RouterGroup, h *handler.ReportHandler) {
	reports := rg.Group("/reports")
	reports.Use(middleware.RequireRole("admin", "manager"))

	reports.GET("/maintenance-completion", h.MaintenanceCompletion)
	reports.GET("/asset-downtime", h.AssetDowntime)
	reports.GET("/work-order-history", h.WorkOrderHistory)
	reports.GET("/asset-inventory", h.AssetInventory)
}
