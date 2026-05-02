package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerAssetRoutes(rg *gin.RouterGroup, h *handler.AssetHandler) {
	assets := rg.Group("/assets")

	// All authenticated users can read assets and scan QR codes.
	assets.GET("", h.List)
	assets.GET("/:id", h.Get)
	assets.GET("/:id/history", h.GetHistory)
	assets.GET("/:id/qr", h.GetQR)

	// Only admins can create, modify, delete, or bulk-import assets.
	adminOnly := assets.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.POST("", h.Create)
	adminOnly.POST("/import", h.Import)
	adminOnly.PUT("/:id", h.Update)
	adminOnly.DELETE("/:id", h.Delete)
}
