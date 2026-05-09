package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerMaintenanceRoutes(rg *gin.RouterGroup, h *handler.MaintenanceHandler) {
	schedules := rg.Group("/maintenance/schedules")

	// All roles can read schedules.
	schedules.GET("", h.ListSchedules)
	schedules.GET("/:id", h.GetSchedule)

	// Admins and managers can create and edit; only admins can delete.
	adminManager := schedules.Group("")
	adminManager.Use(middleware.RequireRole("admin", "manager"))
	adminManager.POST("", h.CreateSchedule)
	adminManager.PUT("/:id", h.UpdateSchedule)
	adminManager.POST("/:id/trigger", h.TriggerSchedule)

	adminOnly := schedules.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.DELETE("/:id", h.DeleteSchedule)
}
