package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type LocationHandler struct{}

func NewLocationHandler() *LocationHandler {
	return &LocationHandler{}
}

func (h *LocationHandler) List(c *gin.Context) {
	// TODO: inject and call LocationService.GetByOrg
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *LocationHandler) Create(c *gin.Context) {
	// TODO: inject and call LocationService.Create
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *LocationHandler) Update(c *gin.Context) {
	// TODO: inject and call LocationService.Update
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *LocationHandler) Delete(c *gin.Context) {
	// TODO: inject and call LocationService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
