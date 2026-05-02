package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerIssueRoutes(rg *gin.RouterGroup, h *handler.IssueHandler) {
	issues := rg.Group("/issues")

	// All roles can read and report issues.
	issues.GET("", h.List)
	issues.GET("/:id", h.Get)
	issues.POST("", h.Create)

	// Managers and admins can update (acknowledge / resolve).
	adminManager := issues.Group("")
	adminManager.Use(middleware.RequireRole("admin", "manager"))
	adminManager.PUT("/:id", h.Update)

	// Only admins can hard-delete issues.
	adminOnly := issues.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.DELETE("/:id", h.Delete)
}
