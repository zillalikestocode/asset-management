package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/service"
)

type WorkOrderHandler struct {
	service service.WorkOrderService
}

func NewWorkOrderHandler(s service.WorkOrderService) *WorkOrderHandler {
	return &WorkOrderHandler{service: s}
}

func (h *WorkOrderHandler) List(c *gin.Context) {
	orgID := c.GetString("orgID")
	f := service.WOFilters{
		Status:       c.Query("status"),
		Priority:     c.Query("priority"),
		AssignedToID: c.Query("assignedToId"),
		AssetID:      c.Query("assetId"),
		ScheduleID:   c.Query("scheduleId"),
		WOType:       c.Query("type"),
	}
	if p := c.Query("page"); p != "" {
		f.Page, _ = strconv.Atoi(p)
	}
	if pp := c.Query("perPage"); pp != "" {
		f.PerPage, _ = strconv.Atoi(pp)
	}

	result, err := h.service.List(orgID, f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *WorkOrderHandler) Create(c *gin.Context) {
	var req dto.CreateWorkOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	wo, err := h.service.Create(c.GetString("orgID"), c.GetString("userID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, wo)
}

func (h *WorkOrderHandler) Get(c *gin.Context) {
	wo, err := h.service.Get(c.Param("id"), c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, wo)
}

func (h *WorkOrderHandler) Update(c *gin.Context) {
	var req dto.UpdateWorkOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	wo, err := h.service.Update(c.Param("id"), c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, wo)
}

func (h *WorkOrderHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Param("id"), c.GetString("orgID")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *WorkOrderHandler) AddPhoto(c *gin.Context) {
	var req dto.AddWorkOrderPhotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	photo, err := h.service.AddPhoto(c.Param("id"), c.GetString("orgID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, photo)
}

func (h *WorkOrderHandler) DeletePhoto(c *gin.Context) {
	if err := h.service.DeletePhoto(c.Param("id"), c.Param("photoId"), c.GetString("orgID")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *WorkOrderHandler) ListComments(c *gin.Context) {
	comments, err := h.service.ListComments(c.Param("id"), c.GetString("orgID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *WorkOrderHandler) AddComment(c *gin.Context) {
	var req dto.AddWorkOrderCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	comment, err := h.service.AddComment(c.Param("id"), c.GetString("orgID"), c.GetString("userID"), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, comment)
}
