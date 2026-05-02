package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type CategoryRepository interface {
	FindByID(id uuid.UUID) (*models.Category, error)
	FindByOrg(orgID uuid.UUID) ([]models.Category, error)
	Create(category *models.Category) error
	Update(category *models.Category) error
	Delete(id uuid.UUID) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindByID(id uuid.UUID) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("id = ?", id).First(&category).Error
	return &category, err
}

func (r *categoryRepository) FindByOrg(orgID uuid.UUID) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("org_id = ?", orgID).Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

func (r *categoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Category{}, "id = ?", id).Error
}
