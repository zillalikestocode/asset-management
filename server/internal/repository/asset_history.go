package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type AssetHistoryRepository interface {
	FindByAsset(assetID uuid.UUID) ([]models.AssetHistory, error)
	Create(entry *models.AssetHistory) error
}

type assetHistoryRepository struct {
	db *gorm.DB
}

func NewAssetHistoryRepository(db *gorm.DB) AssetHistoryRepository {
	return &assetHistoryRepository{db: db}
}

func (r *assetHistoryRepository) FindByAsset(assetID uuid.UUID) ([]models.AssetHistory, error) {
	var entries []models.AssetHistory
	err := r.db.
		Preload("User").
		Where("asset_id = ?", assetID).
		Order("created_at DESC").
		Find(&entries).Error
	return entries, err
}

func (r *assetHistoryRepository) Create(entry *models.AssetHistory) error {
	return r.db.Create(entry).Error
}
