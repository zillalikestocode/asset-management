package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type IssueHandler struct {
	service service.IssueService
}

func NewIssueHandler(s service.IssueService) *IssueHandler {
	return &IssueHandler{service: s}
}

func (h *IssueHandler) List(c *gin.Context) {
	f := service.IssueFilters{
		Status:   c.Query("status"),
		Severity: c.Query("severity"),
		AssetID:  c.Query("assetId"),
	}
	if p := c.Query("page"); p != "" {
		f.Page, _ = strconv.Atoi(p)
	}
	if pp := c.Query("perPage"); pp != "" {
		f.PerPage, _ = strconv.Atoi(pp)
	}

	result, err := h.service.List(c.GetString("orgID"), f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *IssueHandler) Create(c *gin.Context) {
	var req dto.CreateIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	issue, err := h.service.Create(c.GetString("orgID"), c.GetString("userID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, issue)
}

func (h *IssueHandler) Get(c *gin.Context) {
	issue, err := h.service.Get(c.Param("id"), c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, issue)
}

func (h *IssueHandler) Update(c *gin.Context) {
	var req dto.UpdateIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	issue, err := h.service.Update(c.Param("id"), c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, issue)
}

func (h *IssueHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Param("id"), c.GetString("orgID")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
