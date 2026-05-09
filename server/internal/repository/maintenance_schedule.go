package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type MaintenanceScheduleRepository interface {
	FindByID(id uuid.UUID) (*models.MaintenanceSchedule, error)
	FindByOrg(orgID uuid.UUID) ([]models.MaintenanceSchedule, error)
	FindByAsset(assetID uuid.UUID) ([]models.MaintenanceSchedule, error)
	FindByCategory(categoryID uuid.UUID) ([]models.MaintenanceSchedule, error)
	FindDue(before time.Time) ([]models.MaintenanceSchedule, error)
	Create(schedule *models.MaintenanceSchedule) error
	Update(schedule *models.MaintenanceSchedule) error
	Delete(id uuid.UUID) error
}

type maintenanceScheduleRepository struct {
	db *gorm.DB
}

func NewMaintenanceScheduleRepository(db *gorm.DB) MaintenanceScheduleRepository {
	return &maintenanceScheduleRepository{db: db}
}

func (r *maintenanceScheduleRepository) FindByID(id uuid.UUID) (*models.MaintenanceSchedule, error) {
	var schedule models.MaintenanceSchedule
	err := r.db.
		Preload("Asset").
		Preload("Category").
		Preload("DefaultAssignee").
		Where("id = ?", id).
		First(&schedule).Error
	return &schedule, err
}

func (r *maintenanceScheduleRepository) FindByOrg(orgID uuid.UUID) ([]models.MaintenanceSchedule, error) {
	var schedules []models.MaintenanceSchedule
	err := r.db.
		Preload("Asset").
		Preload("DefaultAssignee").
		Where("org_id = ?", orgID).
		Find(&schedules).Error
	return schedules, err
}

func (r *maintenanceScheduleRepository) FindByAsset(assetID uuid.UUID) ([]models.MaintenanceSchedule, error) {
	var schedules []models.MaintenanceSchedule
	err := r.db.
		Preload("Asset").
		Preload("DefaultAssignee").
		Where("asset_id = ?", assetID).
		Find(&schedules).Error
	return schedules, err
}

func (r *maintenanceScheduleRepository) FindByCategory(categoryID uuid.UUID) ([]models.MaintenanceSchedule, error) {
	var schedules []models.MaintenanceSchedule
	err := r.db.Where("category_id = ?", categoryID).Find(&schedules).Error
	return schedules, err
}

// FindDue returns all active schedules whose NextDueAt is at or before the given time.
// Used by the scheduler to generate upcoming work orders.
func (r *maintenanceScheduleRepository) FindDue(before time.Time) ([]models.MaintenanceSchedule, error) {
	var schedules []models.MaintenanceSchedule
	err := r.db.
		Where("active = true AND next_due_at <= ?", before).
		Find(&schedules).Error
	return schedules, err
}

func (r *maintenanceScheduleRepository) Create(schedule *models.MaintenanceSchedule) error {
	return r.db.Create(schedule).Error
}

func (r *maintenanceScheduleRepository) Update(schedule *models.MaintenanceSchedule) error {
	return r.db.Save(schedule).Error
}

func (r *maintenanceScheduleRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.MaintenanceSchedule{}, "id = ?", id).Error
}
