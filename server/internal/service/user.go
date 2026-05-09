package service

import (
	"errors"
	"math/rand"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/mail"
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
	repo    repository.UserRepository
	orgRepo repository.OrgRepository
	mailer  *mail.Mailer
}

func NewUserService(repo repository.UserRepository, orgRepo repository.OrgRepository, mailer *mail.Mailer) UserService {
	return &userService{repo: repo, orgRepo: orgRepo, mailer: mailer}
}

const passwordChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$"

func generatePassword() string {
	b := make([]byte, 12)
	for i := range b {
		b[i] = passwordChars[rand.Intn(len(passwordChars))]
	}
	return string(b)
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

	role := req.Role
	if role == "" {
		role = "technician"
	}

	plainPassword := generatePassword()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 12)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     role,
		Active:   true,
		OrgID:    orgID,
	}

	if err := s.repo.Create(&user); err != nil {
		return nil, err
	}

	// For managers, assign locations.
	if role == "manager" && len(req.LocationIDs) > 0 {
		locationUUIDs := make([]uuid.UUID, 0, len(req.LocationIDs))
		for _, lid := range req.LocationIDs {
			if uid, err := uuid.Parse(lid); err == nil {
				locationUUIDs = append(locationUUIDs, uid)
			}
		}
		if len(locationUUIDs) > 0 {
			_ = s.repo.AssignLocations(user.ID, locationUUIDs)
		}
	}

	// Send credentials email — look up org name for a personalised subject line.
	orgName := "your organisation"
	if org, err := s.orgRepo.FindByID(orgID); err == nil {
		orgName = org.Name
	}
	_ = s.mailer.SendInvite(req.Email, req.Name, orgName, plainPassword)

	// Reload to pick up assigned locations.
	if full, err := s.repo.FindByID(user.ID); err == nil {
		return toUserResponse(full), nil
	}
	return toUserResponse(&user), nil
}

func (s *userService) GetUserByID(id, orgID string) (*dto.UserResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	orgId, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	user, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	if user.OrgID != orgId {
		return nil, errors.New("user not found")
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
	r := &dto.UserResponse{
		ID:      u.ID.String(),
		OrgID:   u.OrgID.String(),
		OrgName: u.Org.Name,
		Name:    u.Name,
		Email:   u.Email,
		Role:    u.Role,
		Active:  u.Active,
	}
	if len(u.Locations) > 0 {
		locs := make([]dto.LocationResponse, len(u.Locations))
		for i, l := range u.Locations {
			locs[i] = dto.LocationResponse{
				ID:    l.ID.String(),
				OrgID: l.OrgID.String(),
				Name:  l.Name,
			}
		}
		r.Locations = locs
	}
	return r
}
