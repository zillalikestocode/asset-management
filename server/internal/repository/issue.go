package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type IssueRepository interface {
	FindByID(id uuid.UUID) (*models.Issue, error)
	FindByOrg(orgID uuid.UUID) ([]models.Issue, error)
	FindByAsset(assetID uuid.UUID) ([]models.Issue, error)
	FindByStatus(orgID uuid.UUID, status string) ([]models.Issue, error)
	FindBySeverity(orgID uuid.UUID, severity string) ([]models.Issue, error)
	Create(issue *models.Issue) error
	Update(issue *models.Issue) error
	Delete(id uuid.UUID) error
}

type issueRepository struct {
	db *gorm.DB
}

func NewIssueRepository(db *gorm.DB) IssueRepository {
	return &issueRepository{db: db}
}

func (r *issueRepository) FindByID(id uuid.UUID) (*models.Issue, error) {
	var issue models.Issue
	err := r.db.
		Preload("Asset").
		Preload("ReportedBy").
		Preload("ResolvedBy").
		Where("id = ?", id).
		First(&issue).Error
	return &issue, err
}

func (r *issueRepository) FindByOrg(orgID uuid.UUID) ([]models.Issue, error) {
	var issues []models.Issue
	err := r.db.
		Preload("Asset").
		Preload("ReportedBy").
		Where("org_id = ?", orgID).
		Order("created_at DESC").
		Find(&issues).Error
	return issues, err
}

func (r *issueRepository) FindByAsset(assetID uuid.UUID) ([]models.Issue, error) {
	var issues []models.Issue
	err := r.db.
		Where("asset_id = ?", assetID).
		Order("created_at DESC").
		Find(&issues).Error
	return issues, err
}

func (r *issueRepository) FindByStatus(orgID uuid.UUID, status string) ([]models.Issue, error) {
	var issues []models.Issue
	err := r.db.Where("org_id = ? AND status = ?", orgID, status).Find(&issues).Error
	return issues, err
}

func (r *issueRepository) FindBySeverity(orgID uuid.UUID, severity string) ([]models.Issue, error) {
	var issues []models.Issue
	err := r.db.Where("org_id = ? AND severity = ?", orgID, severity).Find(&issues).Error
	return issues, err
}

func (r *issueRepository) Create(issue *models.Issue) error {
	return r.db.Create(issue).Error
}

func (r *issueRepository) Update(issue *models.Issue) error {
	return r.db.Save(issue).Error
}

func (r *issueRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Issue{}, "id = ?", id).Error
}
