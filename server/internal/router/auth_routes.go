package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
)

func registerAuthRoutes(rg *gin.RouterGroup, h *handler.AuthHandler, jwtSecret string) {
	auth := rg.Group("/auth")

	auth.POST("/register", h.Register)
	auth.POST("/login", h.Login)
	auth.POST("/refresh", h.RefreshToken)

	// Protected — requires a valid token to identify the caller.
	auth.Use(middleware.Authenticate(jwtSecret))
	auth.GET("/me", h.GetMe)
	auth.POST("/change-password", h.ChangePassword)
}
