package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/config"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
	"github.com/zillalikestocode/assetflow-core/internal/mail"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"github.com/zillalikestocode/assetflow-core/internal/scheduler"
	"github.com/zillalikestocode/assetflow-core/internal/service"
	"gorm.io/gorm"
)

// Setup wires all dependencies and returns a configured gin.Engine.
func Setup(db *gorm.DB, cfg *config.Config) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// ── Repositories ──────────────────────────────────────────────────────────
	userRepo         := repository.NewUserRepository(db)
	orgRepo          := repository.NewOrgRepository(db)
	assetRepo        := repository.NewAssetRepository(db)
	assetHistoryRepo := repository.NewAssetHistoryRepository(db)
	categoryRepo     := repository.NewCategoryRepository(db)
	locationRepo     := repository.NewLocationRepository(db)
	scheduleRepo     := repository.NewMaintenanceScheduleRepository(db)
	workOrderRepo    := repository.NewWorkOrderRepository(db)
	issueRepo        := repository.NewIssueRepository(db)
	notifRepo        := repository.NewNotificationRepository(db)
	prefRepo         := repository.NewNotificationPreferenceRepository(db)

	// ── Mailer ────────────────────────────────────────────────────────────────
	mailer := mail.New(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPFrom)

	// ── Services ──────────────────────────────────────────────────────────────
	authService        := service.NewAuthService(userRepo, orgRepo, mailer, cfg.JWTSecret)
	userService        := service.NewUserService(userRepo, orgRepo, mailer)
	assetService       := service.NewAssetService(assetRepo, assetHistoryRepo)
	categoryService    := service.NewCategoryService(categoryRepo)
	locationService    := service.NewLocationService(locationRepo)
	maintenanceService := service.NewMaintenanceService(scheduleRepo, workOrderRepo)
	workOrderService   := service.NewWorkOrderService(workOrderRepo, userRepo)
	issueService       := service.NewIssueService(issueRepo)
	notifService       := service.NewNotificationService(notifRepo, prefRepo)
	reportService      := service.NewReportService(assetRepo, workOrderRepo, scheduleRepo, issueRepo)

	// ── Handlers ──────────────────────────────────────────────────────────────
	authHandler         := handler.NewAuthHandler(authService)
	userHandler         := handler.NewUserHandler(userService)
	assetHandler        := handler.NewAssetHandler(assetService)
	categoryHandler     := handler.NewCategoryHandler(categoryService)
	locationHandler     := handler.NewLocationHandler(locationService)
	maintenanceHandler  := handler.NewMaintenanceHandler(maintenanceService)
	workOrderHandler    := handler.NewWorkOrderHandler(workOrderService)
	issueHandler        := handler.NewIssueHandler(issueService)
	notificationHandler := handler.NewNotificationHandler(notifService)
	reportHandler       := handler.NewReportHandler(reportService)

	// ── Scheduler ─────────────────────────────────────────────────────────────
	sched := scheduler.New(scheduleRepo, workOrderRepo, userRepo)
	sched.Start()

	// ── API v1 ────────────────────────────────────────────────────────────────
	v1 := r.Group("/api/v1")

	registerAuthRoutes(v1, authHandler, cfg.JWTSecret)

	protected := v1.Group("")
	protected.Use(middleware.Authenticate(cfg.JWTSecret))
	protected.Use(middleware.LocationScope(userRepo))

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
