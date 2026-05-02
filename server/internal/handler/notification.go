package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct{}

func NewNotificationHandler() *NotificationHandler {
	return &NotificationHandler{}
}

func (h *NotificationHandler) List(c *gin.Context) {
	// TODO: inject and call NotificationService.GetByUser
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) ListUnread(c *gin.Context) {
	// TODO: inject and call NotificationService.GetUnreadByUser
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	// TODO: inject and call NotificationService.MarkRead
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	// TODO: inject and call NotificationService.MarkAllRead for current user
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) Delete(c *gin.Context) {
	// TODO: inject and call NotificationService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) GetPreferences(c *gin.Context) {
	// TODO: inject and call NotificationService.GetPreferences
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *NotificationHandler) UpsertPreferences(c *gin.Context) {
	// TODO: inject and call NotificationService.UpsertPreference
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
