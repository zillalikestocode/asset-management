package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type WorkOrderRepository interface {
	FindByID(id uuid.UUID) (*models.WorkOrder, error)
	FindByOrg(orgID uuid.UUID) ([]models.WorkOrder, error)
	FindByAsset(assetID uuid.UUID) ([]models.WorkOrder, error)
	FindByAssignee(userID uuid.UUID) ([]models.WorkOrder, error)
	FindByStatus(orgID uuid.UUID, status string) ([]models.WorkOrder, error)
	Create(workOrder *models.WorkOrder) error
	Update(workOrder *models.WorkOrder) error
	Delete(id uuid.UUID) error
	AddPhoto(photo *models.WorkOrderPhoto) error
	DeletePhoto(id uuid.UUID) error
	AddComment(comment *models.WorkOrderComment) error
	FindComments(workOrderID uuid.UUID) ([]models.WorkOrderComment, error)
}

type workOrderRepository struct {
	db *gorm.DB
}

func NewWorkOrderRepository(db *gorm.DB) WorkOrderRepository {
	return &workOrderRepository{db: db}
}

func (r *workOrderRepository) FindByID(id uuid.UUID) (*models.WorkOrder, error) {
	var workOrder models.WorkOrder
	err := r.db.
		Preload("Asset").
		Preload("AssignedTo").
		Preload("CreatedBy").
		Preload("Photos").
		Preload("Comments.Author").
		Where("id = ?", id).
		First(&workOrder).Error
	return &workOrder, err
}

func (r *workOrderRepository) FindByOrg(orgID uuid.UUID) ([]models.WorkOrder, error) {
	var workOrders []models.WorkOrder
	err := r.db.
		Preload("Asset").
		Preload("AssignedTo").
		Where("org_id = ?", orgID).
		Order("created_at DESC").
		Find(&workOrders).Error
	return workOrders, err
}

func (r *workOrderRepository) FindByAsset(assetID uuid.UUID) ([]models.WorkOrder, error) {
	var workOrders []models.WorkOrder
	err := r.db.
		Where("asset_id = ?", assetID).
		Order("created_at DESC").
		Find(&workOrders).Error
	return workOrders, err
}

func (r *workOrderRepository) FindByAssignee(userID uuid.UUID) ([]models.WorkOrder, error) {
	var workOrders []models.WorkOrder
	err := r.db.
		Preload("Asset").
		Where("assigned_to_id = ?", userID).
		Order("due_date ASC").
		Find(&workOrders).Error
	return workOrders, err
}

func (r *workOrderRepository) FindByStatus(orgID uuid.UUID, status string) ([]models.WorkOrder, error) {
	var workOrders []models.WorkOrder
	err := r.db.
		Preload("Asset").
		Preload("AssignedTo").
		Where("org_id = ? AND status = ?", orgID, status).
		Order("due_date ASC").
		Find(&workOrders).Error
	return workOrders, err
}

func (r *workOrderRepository) Create(workOrder *models.WorkOrder) error {
	return r.db.Create(workOrder).Error
}

func (r *workOrderRepository) Update(workOrder *models.WorkOrder) error {
	return r.db.Save(workOrder).Error
}

func (r *workOrderRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.WorkOrder{}, "id = ?", id).Error
}

func (r *workOrderRepository) AddPhoto(photo *models.WorkOrderPhoto) error {
	return r.db.Create(photo).Error
}

func (r *workOrderRepository) DeletePhoto(id uuid.UUID) error {
	return r.db.Delete(&models.WorkOrderPhoto{}, "id = ?", id).Error
}

func (r *workOrderRepository) AddComment(comment *models.WorkOrderComment) error {
	return r.db.Create(comment).Error
}

func (r *workOrderRepository) FindComments(workOrderID uuid.UUID) ([]models.WorkOrderComment, error) {
	var comments []models.WorkOrderComment
	err := r.db.
		Preload("Author").
		Where("work_order_id = ?", workOrderID).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}
