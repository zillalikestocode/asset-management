package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type NotificationRepository interface {
	FindByUser(userID uuid.UUID) ([]models.Notification, error)
	FindUnreadByUser(userID uuid.UUID) ([]models.Notification, error)
	MarkRead(id uuid.UUID) error
	MarkAllRead(userID uuid.UUID) error
	Create(notification *models.Notification) error
	Delete(id uuid.UUID) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) FindByUser(userID uuid.UUID) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) FindUnreadByUser(userID uuid.UUID) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.
		Where("user_id = ? AND read = false", userID).
		Order("created_at DESC").
		Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) MarkRead(id uuid.UUID) error {
	return r.db.Model(&models.Notification{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{"read": true, "read_at": gorm.Expr("NOW()")}).
		Error
}

func (r *notificationRepository) MarkAllRead(userID uuid.UUID) error {
	return r.db.Model(&models.Notification{}).
		Where("user_id = ? AND read = false", userID).
		Updates(map[string]interface{}{"read": true, "read_at": gorm.Expr("NOW()")}).
		Error
}

func (r *notificationRepository) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Notification{}, "id = ?", id).Error
}
