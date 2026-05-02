package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerLocationRoutes(rg *gin.RouterGroup, h *handler.LocationHandler) {
	locations := rg.Group("/locations")

	locations.GET("", h.List)

	adminOnly := locations.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.POST("", h.Create)
	adminOnly.PUT("/:id", h.Update)
	adminOnly.DELETE("/:id", h.Delete)
}
