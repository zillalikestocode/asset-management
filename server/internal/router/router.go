package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/config"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"github.com/zillalikestocode/assetflow-core/internal/service"
	"gorm.io/gorm"
)

// Setup wires all dependencies and returns a configured gin.Engine.
// This is the composition root for the entire application.
func Setup(db *gorm.DB, cfg *config.Config) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Health check — no auth required.
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// ── Repositories ──────────────────────────────────────────────────────────
	userRepo := repository.NewUserRepository(db)

	// ── Services ──────────────────────────────────────────────────────────────
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	userService := service.NewUserService(userRepo)

	// ── Handlers ──────────────────────────────────────────────────────────────
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	assetHandler := handler.NewAssetHandler()
	categoryHandler := handler.NewCategoryHandler()
	locationHandler := handler.NewLocationHandler()
	maintenanceHandler := handler.NewMaintenanceHandler()
	workOrderHandler := handler.NewWorkOrderHandler()
	issueHandler := handler.NewIssueHandler()
	notificationHandler := handler.NewNotificationHandler()
	reportHandler := handler.NewReportHandler()

	// ── API v1 ────────────────────────────────────────────────────────────────
	v1 := r.Group("/api/v1")

	// Public routes (no auth).
	registerAuthRoutes(v1, authHandler, cfg.JWTSecret)

	// All routes below require a valid JWT.
	protected := v1.Group("")
	protected.Use(middleware.Authenticate(cfg.JWTSecret))

	registerUserRoutes(protected, userHandler)
	registerAssetRoutes(protected, assetHandler)
	registerCategoryRoutes(protected, categoryHandler)
	registerLocationRoutes(protected, locationHandler)
	registerMaintenanceRoutes(protected, maintenanceHandler)
	registerWorkOrderRoutes(protected, workOrderHandler)
	registerIssueRoutes(protected, issueHandler)
	registerNotificationRoutes(protected, notificationHandler)
	registerReportRoutes(protected, reportHandler)

	return r
}
