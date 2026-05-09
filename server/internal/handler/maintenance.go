package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type MaintenanceHandler struct {
	service service.MaintenanceService
}

func NewMaintenanceHandler(s service.MaintenanceService) *MaintenanceHandler {
	return &MaintenanceHandler{service: s}
}

func (h *MaintenanceHandler) ListSchedules(c *gin.Context) {
	orgID := c.GetString("orgID")
	assetID := c.Query("assetId")

	schedules, err := h.service.List(orgID, assetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

func (h *MaintenanceHandler) CreateSchedule(c *gin.Context) {
	var req dto.CreateMaintenanceScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sched, err := h.service.Create(c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sched)
}

func (h *MaintenanceHandler) GetSchedule(c *gin.Context) {
	sched, err := h.service.Get(c.Param("id"), c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sched)
}

func (h *MaintenanceHandler) UpdateSchedule(c *gin.Context) {
	var req dto.UpdateMaintenanceScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sched, err := h.service.Update(c.Param("id"), c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sched)
}

func (h *MaintenanceHandler) DeleteSchedule(c *gin.Context) {
	if err := h.service.Delete(c.Param("id"), c.GetString("orgID")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *MaintenanceHandler) TriggerSchedule(c *gin.Context) {
	sched, err := h.service.Trigger(c.Param("id"), c.GetString("orgID"), c.GetString("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sched)
}
