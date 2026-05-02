package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/handler"
)

func registerNotificationRoutes(rg *gin.RouterGroup, h *handler.NotificationHandler) {
	// All notification routes are scoped to the authenticated user — no role restriction needed.
	n := rg.Group("/notifications")
	n.GET("", h.List)
	n.GET("/unread", h.ListUnread)
	n.PUT("/:id/read", h.MarkRead)
	n.PUT("/read-all", h.MarkAllRead)
	n.DELETE("/:id", h.Delete)

	prefs := rg.Group("/notification-preferences")
	prefs.GET("", h.GetPreferences)
	prefs.PUT("", h.UpsertPreferences)
}
