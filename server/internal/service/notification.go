package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"gorm.io/gorm"
)

type NotificationService interface {
	List(userID string) ([]dto.NotificationResponse, error)
	ListUnread(userID string) ([]dto.NotificationResponse, error)
	MarkRead(id, userID string) error
	MarkAllRead(userID string) error
	Delete(id, userID string) error
	GetPreferences(userID string) ([]dto.NotificationPreferenceResponse, error)
	UpsertPreference(userID string, req dto.UpsertNotificationPreferenceRequest) (*dto.NotificationPreferenceResponse, error)
}

type notificationService struct {
	repo     repository.NotificationRepository
	prefRepo repository.NotificationPreferenceRepository
}

func NewNotificationService(repo repository.NotificationRepository, prefRepo repository.NotificationPreferenceRepository) NotificationService {
	return &notificationService{repo: repo, prefRepo: prefRepo}
}

func (s *notificationService) List(userID string) ([]dto.NotificationResponse, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	notifs, err := s.repo.FindByUser(uid)
	if err != nil {
		return nil, err
	}
	return toNotifResponses(notifs), nil
}

func (s *notificationService) ListUnread(userID string) ([]dto.NotificationResponse, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	notifs, err := s.repo.FindUnreadByUser(uid)
	if err != nil {
		return nil, err
	}
	return toNotifResponses(notifs), nil
}

func (s *notificationService) MarkRead(id, userID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid notification ID")
	}
	return s.repo.MarkRead(uid)
}

func (s *notificationService) MarkAllRead(userID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}
	return s.repo.MarkAllRead(uid)
}

func (s *notificationService) Delete(id, userID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid notification ID")
	}
	return s.repo.Delete(uid)
}

func (s *notificationService) GetPreferences(userID string) ([]dto.NotificationPreferenceResponse, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	prefs, err := s.prefRepo.FindByUser(uid)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.NotificationPreferenceResponse, len(prefs))
	for i, p := range prefs {
		resp[i] = dto.NotificationPreferenceResponse{
			ID:        p.ID.String(),
			EventType: p.EventType,
			InApp:     p.InApp,
			Email:     p.Email,
		}
	}
	return resp, nil
}

func (s *notificationService) UpsertPreference(userID string, req dto.UpsertNotificationPreferenceRequest) (*dto.NotificationPreferenceResponse, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	existing, err := s.prefRepo.FindByUserAndEventType(uid, req.EventType)
	var pref *models.NotificationPreference
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if err == nil {
		existing.InApp = req.InApp
		existing.Email = req.Email
		pref = existing
	} else {
		pref = &models.NotificationPreference{
			UserID:    uid,
			EventType: req.EventType,
			InApp:     req.InApp,
			Email:     req.Email,
		}
	}

	if err := s.prefRepo.Upsert(pref); err != nil {
		return nil, err
	}
	r := &dto.NotificationPreferenceResponse{
		ID:        pref.ID.String(),
		EventType: pref.EventType,
		InApp:     pref.InApp,
		Email:     pref.Email,
	}
	return r, nil
}

func toNotifResponses(notifs []models.Notification) []dto.NotificationResponse {
	resp := make([]dto.NotificationResponse, len(notifs))
	for i, n := range notifs {
		r := dto.NotificationResponse{
			ID:        n.ID.String(),
			EventType: n.EventType,
			Title:     n.Title,
			Body:      n.Body,
			RefType:   n.RefType,
			Read:      n.Read,
			ReadAt:    n.ReadAt,
			CreatedAt: n.CreatedAt,
		}
		if n.RefID != nil {
			s := n.RefID.String()
			r.RefID = &s
		}
		resp[i] = r
	}
	return resp
}
