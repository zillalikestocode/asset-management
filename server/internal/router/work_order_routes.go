package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerWorkOrderRoutes(rg *gin.RouterGroup, h *handler.WorkOrderHandler) {
	wo := rg.Group("/work-orders")

	// All roles can read work orders, update status, and add photos/comments.
	wo.GET("", h.List)
	wo.GET("/:id", h.Get)
	wo.PUT("/:id", h.Update)
	wo.POST("/:id/photos", h.AddPhoto)
	wo.GET("/:id/comments", h.ListComments)
	wo.POST("/:id/comments", h.AddComment)

	// Only admins and managers can create or delete work orders and photos.
	adminManager := wo.Group("")
	adminManager.Use(middleware.RequireRole("admin", "manager"))
	adminManager.POST("", h.Create)
	adminManager.DELETE("/:id", h.Delete)
	adminManager.DELETE("/:id/photos/:photoId", h.DeletePhoto)
}
