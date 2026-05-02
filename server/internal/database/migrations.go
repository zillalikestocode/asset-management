package database

import (
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) error {
	return db.AutoMigrate(
		// Core org + identity
		&models.Org{},
		&models.User{},

		// Asset domain
		&models.Category{},
		&models.Location{},
		&models.Asset{},
		&models.AssetHistory{},

		// Maintenance domain
		&models.MaintenanceSchedule{},
		&models.WorkOrder{},
		&models.WorkOrderPhoto{},
		&models.WorkOrderComment{},

		// Issues
		&models.Issue{},

		// Notifications
		&models.Notification{},
		&models.NotificationPreference{},
	)
}
