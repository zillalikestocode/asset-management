package repository

import (
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByID(id uuid.UUID) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindManyByOrg(orgID uuid.UUID) ([]models.User, error)
	FindAdminByOrg(orgID uuid.UUID) (*models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	Delete(id uuid.UUID) error
	AssignLocations(userID uuid.UUID, locationIDs []uuid.UUID) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Org").Preload("Locations").Where("id = ?", id).First(&user).Error
	return &user, err
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepository) FindManyByOrg(orgID uuid.UUID) ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Locations").Where("org_id = ?", orgID).Find(&users).Error
	return users, err
}

func (r *userRepository) FindAdminByOrg(orgID uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Where("org_id = ? AND role = 'admin'", orgID).Limit(1).First(&user).Error
	return &user, err
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

func (r *userRepository) AssignLocations(userID uuid.UUID, locationIDs []uuid.UUID) error {
	user := &models.User{}
	user.ID = userID
	locations := make([]models.Location, len(locationIDs))
	for i, lid := range locationIDs {
		loc := models.Location{}
		loc.ID = lid
		locations[i] = loc
	}
	return r.db.Model(user).Association("Locations").Replace(locations)
}
