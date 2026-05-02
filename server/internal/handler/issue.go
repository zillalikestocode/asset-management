package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type IssueHandler struct{}

func NewIssueHandler() *IssueHandler {
	return &IssueHandler{}
}

func (h *IssueHandler) List(c *gin.Context) {
	// TODO: inject and call IssueService.GetByOrg (filter by status/severity via query params)
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *IssueHandler) Create(c *gin.Context) {
	// TODO: inject and call IssueService.Create; trigger critical alert if severity == "critical"
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *IssueHandler) Get(c *gin.Context) {
	// TODO: inject and call IssueService.GetByID
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *IssueHandler) Update(c *gin.Context) {
	// TODO: inject and call IssueService.Update (resolve, acknowledge)
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func (h *IssueHandler) Delete(c *gin.Context) {
	// TODO: inject and call IssueService.Delete
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
