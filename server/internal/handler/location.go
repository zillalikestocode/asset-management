package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type LocationHandler struct {
	service service.LocationService
}

func NewLocationHandler(s service.LocationService) *LocationHandler {
	return &LocationHandler{service: s}
}

func (h *LocationHandler) List(c *gin.Context) {
	locs, err := h.service.List(c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, locs)
}

func (h *LocationHandler) Create(c *gin.Context) {
	var req dto.CreateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	loc, err := h.service.Create(c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, loc)
}

func (h *LocationHandler) Update(c *gin.Context) {
	var req dto.UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	loc, err := h.service.Update(c.Param("id"), c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, loc)
}

func (h *LocationHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Param("id"), c.GetString("orgID")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
