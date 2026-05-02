package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type AssetRepository interface {
	FindByID(id uuid.UUID) (*models.Asset, error)
	FindByOrg(orgID uuid.UUID) ([]models.Asset, error)
	FindByCategory(orgID, categoryID uuid.UUID) ([]models.Asset, error)
	FindByLocation(orgID, locationID uuid.UUID) ([]models.Asset, error)
	FindByAssignee(orgID, userID uuid.UUID) ([]models.Asset, error)
	FindByStatus(orgID uuid.UUID, status string) ([]models.Asset, error)
	FindByAssetCode(assetCode string) (*models.Asset, error)
	Create(asset *models.Asset) error
	Update(asset *models.Asset) error
	Delete(id uuid.UUID) error
}

type assetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) AssetRepository {
	return &assetRepository{db: db}
}

func (r *assetRepository) FindByID(id uuid.UUID) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.
		Preload("Category").
		Preload("Location").
		Preload("AssignedUser").
		Where("id = ?", id).
		First(&asset).Error
	return &asset, err
}

func (r *assetRepository) FindByOrg(orgID uuid.UUID) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.
		Preload("Category").
		Preload("Location").
		Where("org_id = ?", orgID).
		Find(&assets).Error
	return assets, err
}

func (r *assetRepository) FindByCategory(orgID, categoryID uuid.UUID) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Where("org_id = ? AND category_id = ?", orgID, categoryID).Find(&assets).Error
	return assets, err
}

func (r *assetRepository) FindByLocation(orgID, locationID uuid.UUID) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Where("org_id = ? AND location_id = ?", orgID, locationID).Find(&assets).Error
	return assets, err
}

func (r *assetRepository) FindByAssignee(orgID, userID uuid.UUID) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Where("org_id = ? AND assigned_user_id = ?", orgID, userID).Find(&assets).Error
	return assets, err
}

func (r *assetRepository) FindByStatus(orgID uuid.UUID, status string) ([]models.Asset, error) {
	var assets []models.Asset
	err := r.db.Where("org_id = ? AND status = ?", orgID, status).Find(&assets).Error
	return assets, err
}

func (r *assetRepository) FindByAssetCode(assetCode string) (*models.Asset, error) {
	var asset models.Asset
	err := r.db.Where("asset_code = ?", assetCode).First(&asset).Error
	return &asset, err
}

func (r *assetRepository) Create(asset *models.Asset) error {
	return r.db.Create(asset).Error
}

func (r *assetRepository) Update(asset *models.Asset) error {
	return r.db.Save(asset).Error
}

func (r *assetRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Asset{}, "id = ?", id).Error
}
