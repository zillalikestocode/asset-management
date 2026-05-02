package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type WorkOrderHandler struct{}

func NewWorkOrderHandler() *WorkOrderHandler {
	return &WorkOrderHandler{}
}

func (h *WorkOrderHandler) List(c *gin.Context) {
	// TODO: inject and call WorkOrderService.GetByOrg (filter by status via ?status=)
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) Create(c *gin.Context) {
	// TODO: inject and call WorkOrderService.Create
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) Get(c *gin.Context) {
	// TODO: inject and call WorkOrderService.GetByID
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) Update(c *gin.Context) {
	// TODO: inject and call WorkOrderService.Update
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) Delete(c *gin.Context) {
	// TODO: inject and call WorkOrderService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) AddPhoto(c *gin.Context) {
	// TODO: accept multipart file, upload to object storage, call WorkOrderService.AddPhoto
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) DeletePhoto(c *gin.Context) {
	// TODO: inject and call WorkOrderService.DeletePhoto
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) AddComment(c *gin.Context) {
	// TODO: inject and call WorkOrderService.AddComment
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *WorkOrderHandler) ListComments(c *gin.Context) {
	// TODO: inject and call WorkOrderService.GetComments
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
