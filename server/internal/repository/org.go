package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type OrgRepository interface {
	FindByID(id uuid.UUID) (*models.Org, error)
	Create(org *models.Org) error
	Update(org *models.Org) error
	Delete(id uuid.UUID) error
}

type orgRepository struct {
	db *gorm.DB
}

func NewOrgRepository(db *gorm.DB) OrgRepository {
	return &orgRepository{db: db}
}

func (r *orgRepository) FindByID(id uuid.UUID) (*models.Org, error) {
	var org models.Org
	err := r.db.Where("id = ?", id).First(&org).Error
	return &org, err
}

func (r *orgRepository) Create(org *models.Org) error {
	return r.db.Create(org).Error
}

func (r *orgRepository) Update(org *models.Org) error {
	return r.db.Save(org).Error
}

func (r *orgRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Org{}, "id = ?", id).Error
}
