package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct{}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{}
}

func (h *CategoryHandler) List(c *gin.Context) {
	// TODO: inject and call CategoryService.GetByOrg
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *CategoryHandler) Create(c *gin.Context) {
	// TODO: inject and call CategoryService.Create
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *CategoryHandler) Update(c *gin.Context) {
	// TODO: inject and call CategoryService.Update
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	// TODO: inject and call CategoryService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
