package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type LocationRepository interface {
	FindByID(id uuid.UUID) (*models.Location, error)
	FindByOrg(orgID uuid.UUID) ([]models.Location, error)
	FindChildren(parentID uuid.UUID) ([]models.Location, error)
	Create(location *models.Location) error
	Update(location *models.Location) error
	Delete(id uuid.UUID) error
}

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) LocationRepository {
	return &locationRepository{db: db}
}

func (r *locationRepository) FindByID(id uuid.UUID) (*models.Location, error) {
	var location models.Location
	err := r.db.Where("id = ?", id).First(&location).Error
	return &location, err
}

func (r *locationRepository) FindByOrg(orgID uuid.UUID) ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Where("org_id = ?", orgID).Find(&locations).Error
	return locations, err
}

func (r *locationRepository) FindChildren(parentID uuid.UUID) ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Where("parent_id = ?", parentID).Find(&locations).Error
	return locations, err
}

func (r *locationRepository) Create(location *models.Location) error {
	return r.db.Create(location).Error
}

func (r *locationRepository) Update(location *models.Location) error {
	return r.db.Save(location).Error
}

func (r *locationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Location{}, "id = ?", id).Error
}
