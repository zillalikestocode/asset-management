package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/mail"
	"github.com/zillalikestocode/assetflow-core/internal/middleware"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(req dto.RegisterRequest) (*dto.LoginResponse, error)
	Login(email, password string) (*dto.LoginResponse, error)
	RefreshToken(token string) (*dto.RefreshTokenResponse, error)
	GetMe(id string) (*dto.UserResponse, error)
	ChangePassword(userID string, req dto.ChangePasswordRequest) error
}

type authService struct {
	userRepo  repository.UserRepository
	orgRepo   repository.OrgRepository
	mailer    *mail.Mailer
	jwtSecret string
}

func NewAuthService(userRepo repository.UserRepository, orgRepo repository.OrgRepository, mailer *mail.Mailer, jwtSecret string) AuthService {
	return &authService{userRepo: userRepo, orgRepo: orgRepo, mailer: mailer, jwtSecret: jwtSecret}
}

func (s *authService) Register(req dto.RegisterRequest) (*dto.LoginResponse, error) {
	if _, err := s.userRepo.FindByEmail(req.Email); err == nil {
		return nil, errors.New("an account with that email already exists")
	}
	org := &models.Org{Name: req.OrgName, Industry: req.Industry, Plan: "starter"}
	if err := s.orgRepo.Create(org); err != nil {
		return nil, err
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, err
	}
	user := &models.User{
		Name: req.AdminName, Email: req.Email, Password: string(hashed),
		Role: "admin", Active: true, OrgID: org.ID,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return s.issueTokenPair(user)
}

func (s *authService) Login(email, password string) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}
	return s.issueTokenPair(user)
}

func (s *authService) RefreshToken(token string) (*dto.RefreshTokenResponse, error) {
	claims := &middleware.Claims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid or expired refresh token")
	}

	accessToken, err := s.signToken(claims.UserID, claims.OrgID, claims.Role, 15*time.Minute)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.signToken(claims.UserID, claims.OrgID, claims.Role, 7*24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &dto.RefreshTokenResponse{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func (s *authService) GetMe(id string) (*dto.UserResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid ID")
	}
	user, err := s.userRepo.FindByID(uid)
	if err != nil {
		return nil, err
	}
	return toUserResponse(user), nil
}

func (s *authService) ChangePassword(userID string, req dto.ChangePasswordRequest) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}
	user, err := s.userRepo.FindByID(uid)
	if err != nil {
		return errors.New("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	if err != nil {
		return err
	}
	user.Password = string(hashed)
	if err := s.userRepo.Update(user); err != nil {
		return err
	}
	_ = s.mailer.SendPasswordChanged(user.Email, user.Name)
	return nil
}

func (s *authService) issueTokenPair(user *models.User) (*dto.LoginResponse, error) {
	accessToken, err := s.signToken(user.ID.String(), user.OrgID.String(), user.Role, 15*time.Minute)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.signToken(user.ID.String(), user.OrgID.String(), user.Role, 7*24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *toUserResponse(user),
	}, nil
}

func (s *authService) signToken(userID, orgID, role string, ttl time.Duration) (string, error) {
	claims := &middleware.Claims{
		UserID: userID,
		OrgID:  orgID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.jwtSecret))
}
