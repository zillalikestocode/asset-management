package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"gorm.io/gorm"
)

type LocationService interface {
	List(orgID string) ([]dto.LocationResponse, error)
	Get(id, orgID string) (*dto.LocationResponse, error)
	Create(orgID string, req dto.CreateLocationRequest) (*dto.LocationResponse, error)
	Update(id, orgID string, req dto.UpdateLocationRequest) (*dto.LocationResponse, error)
	Delete(id, orgID string) error
}

type locationService struct {
	repo repository.LocationRepository
}

func NewLocationService(repo repository.LocationRepository) LocationService {
	return &locationService{repo: repo}
}

func (s *locationService) List(orgID string) ([]dto.LocationResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	locs, err := s.repo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.LocationResponse, len(locs))
	for i := range locs {
		resp[i] = toLocationResponse(&locs[i])
	}
	return resp, nil
}

func (s *locationService) Get(id, orgID string) (*dto.LocationResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid location ID")
	}
	loc, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("location not found")
		}
		return nil, err
	}
	if loc.OrgID.String() != orgID {
		return nil, errors.New("location not found")
	}
	r := toLocationResponse(loc)
	return &r, nil
}

func (s *locationService) Create(orgID string, req dto.CreateLocationRequest) (*dto.LocationResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	loc := &models.Location{
		OrgRef: models.OrgRef{OrgID: oid},
		Name:   req.Name,
	}
	if req.ParentID != nil {
		pid, err := uuid.Parse(*req.ParentID)
		if err == nil {
			loc.ParentID = &pid
		}
	}
	if err := s.repo.Create(loc); err != nil {
		return nil, err
	}
	r := toLocationResponse(loc)
	return &r, nil
}

func (s *locationService) Update(id, orgID string, req dto.UpdateLocationRequest) (*dto.LocationResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid location ID")
	}
	loc, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("location not found")
	}
	if loc.OrgID.String() != orgID {
		return nil, errors.New("location not found")
	}
	if req.Name != nil {
		loc.Name = *req.Name
	}
	if req.ParentID != nil {
		pid, err := uuid.Parse(*req.ParentID)
		if err == nil {
			loc.ParentID = &pid
		}
	}
	if err := s.repo.Update(loc); err != nil {
		return nil, err
	}
	r := toLocationResponse(loc)
	return &r, nil
}

func (s *locationService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid location ID")
	}
	loc, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("location not found")
	}
	if loc.OrgID.String() != orgID {
		return errors.New("location not found")
	}
	return s.repo.Delete(uid)
}

func toLocationResponse(l *models.Location) dto.LocationResponse {
	r := dto.LocationResponse{
		ID:        l.ID.String(),
		OrgID:     l.OrgID.String(),
		Name:      l.Name,
		CreatedAt: l.CreatedAt,
	}
	if l.ParentID != nil {
		s := l.ParentID.String()
		r.ParentID = &s
	}
	return r
}
