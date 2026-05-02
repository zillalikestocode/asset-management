package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerUserRoutes(rg *gin.RouterGroup, h *handler.UserHandler) {
	users := rg.Group("/users")
	users.Use(middleware.RequireRole("admin", "manager"))

	users.GET("", h.GetUsers)
	users.GET("/:id", h.GetUser)

	// Invite and management are admin-only.
	adminOnly := users.Group("")
	adminOnly.Use(middleware.RequireRole("admin"))
	adminOnly.POST("/invite", h.InviteUser)
}
