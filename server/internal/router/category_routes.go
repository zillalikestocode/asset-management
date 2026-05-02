package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerCategoryRoutes(rg *gin.RouterGroup, h *handler.CategoryHandler) {
	categories := rg.Group("/categories")

	categories.GET("", h.List)

	adminOnly := categories.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.POST("", h.Create)
	adminOnly.PUT("/:id", h.Update)
	adminOnly.DELETE("/:id", h.Delete)
}
