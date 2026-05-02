package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	InviteUser(req dto.InviteUserRequest) (*dto.UserResponse, error)
	GetUserByID(id, orgID string) (*dto.UserResponse, error)
	GetUsersByOrg(orgID string) ([]*dto.UserResponse, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) InviteUser(req dto.InviteUserRequest) (*dto.UserResponse, error) {
	_, err := s.repo.FindByEmail(req.Email)
	if err == nil {
		return nil, errors.New("user already exists")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	orgID, err := uuid.Parse(req.OrgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		OrgID:    orgID,
	}

	if err := s.repo.Create(&user); err != nil {
		return nil, err
	}

	return toUserResponse(&user), nil
}

func (s *userService) GetUserByID(id, orgID string) (*dto.UserResponse, error) {
	uid, err := uuid.Parse(id)
	orgId, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	user, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	if user.OrgID != orgId {
		return nil, errors.New("You can't view this user")
	}

	return toUserResponse(user), nil
}

func (s *userService) GetUsersByOrg(orgID string) ([]*dto.UserResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	users, err := s.repo.FindManyByOrg(oid)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.UserResponse, len(users))
	for i := range users {
		responses[i] = toUserResponse(&users[i])
	}
	return responses, nil
}

func toUserResponse(u *models.User) *dto.UserResponse {
	return &dto.UserResponse{
		ID:     u.ID.String(),
		OrgID:  u.OrgID.String(),
		Name:   u.Name,
		Email:  u.Email,
		Role:   u.Role,
		Active: u.Active,
	}
}
