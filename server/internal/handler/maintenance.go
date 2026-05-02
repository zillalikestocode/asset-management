package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type MaintenanceHandler struct{}

func NewMaintenanceHandler() *MaintenanceHandler {
	return &MaintenanceHandler{}
}

func (h *MaintenanceHandler) ListSchedules(c *gin.Context) {
	// TODO: inject and call MaintenanceService.GetSchedulesByOrg
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *MaintenanceHandler) CreateSchedule(c *gin.Context) {
	// TODO: inject and call MaintenanceService.CreateSchedule
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *MaintenanceHandler) GetSchedule(c *gin.Context) {
	// TODO: inject and call MaintenanceService.GetScheduleByID
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *MaintenanceHandler) UpdateSchedule(c *gin.Context) {
	// TODO: inject and call MaintenanceService.UpdateSchedule
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *MaintenanceHandler) DeleteSchedule(c *gin.Context) {
	// TODO: inject and call MaintenanceService.DeleteSchedule
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
