package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type NotificationPreferenceRepository interface {
	FindByUser(userID uuid.UUID) ([]models.NotificationPreference, error)
	FindByUserAndEventType(userID uuid.UUID, eventType string) (*models.NotificationPreference, error)
	Upsert(pref *models.NotificationPreference) error
	Delete(id uuid.UUID) error
}

type notificationPreferenceRepository struct {
	db *gorm.DB
}

func NewNotificationPreferenceRepository(db *gorm.DB) NotificationPreferenceRepository {
	return &notificationPreferenceRepository{db: db}
}

func (r *notificationPreferenceRepository) FindByUser(userID uuid.UUID) ([]models.NotificationPreference, error) {
	var prefs []models.NotificationPreference
	err := r.db.Where("user_id = ?", userID).Find(&prefs).Error
	return prefs, err
}

func (r *notificationPreferenceRepository) FindByUserAndEventType(userID uuid.UUID, eventType string) (*models.NotificationPreference, error) {
	var pref models.NotificationPreference
	err := r.db.Where("user_id = ? AND event_type = ?", userID, eventType).First(&pref).Error
	return &pref, err
}

// Upsert creates the preference row if it doesn't exist, or updates InApp and Email
// if a row for the same (user_id, event_type) pair already exists.
func (r *notificationPreferenceRepository) Upsert(pref *models.NotificationPreference) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "event_type"}},
		DoUpdates: clause.AssignmentColumns([]string{"in_app", "email"}),
	}).Create(pref).Error
}

func (r *notificationPreferenceRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.NotificationPreference{}, "id = ?", id).Error
}
