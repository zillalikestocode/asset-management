package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"gorm.io/gorm"
)

type MaintenanceService interface {
	List(orgID string, assetID string) ([]dto.MaintenanceScheduleResponse, error)
	Get(id, orgID string) (*dto.MaintenanceScheduleResponse, error)
	Create(orgID string, req dto.CreateMaintenanceScheduleRequest) (*dto.MaintenanceScheduleResponse, error)
	Update(id, orgID string, req dto.UpdateMaintenanceScheduleRequest) (*dto.MaintenanceScheduleResponse, error)
	Delete(id, orgID string) error
}

type maintenanceService struct {
	repo repository.MaintenanceScheduleRepository
}

func NewMaintenanceService(repo repository.MaintenanceScheduleRepository) MaintenanceService {
	return &maintenanceService{repo: repo}
}

func (s *maintenanceService) List(orgID string, assetID string) ([]dto.MaintenanceScheduleResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	var schedules []models.MaintenanceSchedule
	if assetID != "" {
		aid, err := uuid.Parse(assetID)
		if err != nil {
			return nil, errors.New("invalid asset ID")
		}
		schedules, err = s.repo.FindByAsset(aid)
		if err != nil {
			return nil, err
		}
	} else {
		schedules, err = s.repo.FindByOrg(oid)
		if err != nil {
			return nil, err
		}
	}

	resp := make([]dto.MaintenanceScheduleResponse, len(schedules))
	for i := range schedules {
		resp[i] = toMaintenanceResponse(&schedules[i])
	}
	return resp, nil
}

func (s *maintenanceService) Get(id, orgID string) (*dto.MaintenanceScheduleResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid schedule ID")
	}
	sched, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("schedule not found")
		}
		return nil, err
	}
	if sched.OrgID.String() != orgID {
		return nil, errors.New("schedule not found")
	}
	r := toMaintenanceResponse(sched)
	return &r, nil
}

func (s *maintenanceService) Create(orgID string, req dto.CreateMaintenanceScheduleRequest) (*dto.MaintenanceScheduleResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}
	leadTime := req.LeadTimeDays
	if leadTime == 0 {
		leadTime = 7
	}

	sched := &models.MaintenanceSchedule{
		OrgRef:         models.OrgRef{OrgID: oid},
		Name:           req.Name,
		Description:    req.Description,
		TaskType:       req.TaskType,
		ScheduleType:   req.ScheduleType,
		Priority:       priority,
		IntervalDays:   req.IntervalDays,
		IntervalHours:  req.IntervalHours,
		LeadTimeDays:   leadTime,
		EstimatedHours: req.EstimatedHours,
		Active:         true,
	}

	if req.AssetID != nil {
		aid, err := uuid.Parse(*req.AssetID)
		if err == nil {
			sched.AssetID = &aid
		}
	}
	if req.CategoryID != nil {
		cid, err := uuid.Parse(*req.CategoryID)
		if err == nil {
			sched.CategoryID = &cid
		}
	}
	if req.DefaultAssigneeID != nil {
		did, err := uuid.Parse(*req.DefaultAssigneeID)
		if err == nil {
			sched.DefaultAssigneeID = &did
		}
	}

	// Calculate first NextDueAt for time-based schedules
	if sched.ScheduleType == "time_based" && sched.IntervalDays != nil {
		t := time.Now().AddDate(0, 0, *sched.IntervalDays)
		sched.NextDueAt = &t
	}

	if err := s.repo.Create(sched); err != nil {
		return nil, err
	}
	r := toMaintenanceResponse(sched)
	return &r, nil
}

func (s *maintenanceService) Update(id, orgID string, req dto.UpdateMaintenanceScheduleRequest) (*dto.MaintenanceScheduleResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid schedule ID")
	}
	sched, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("schedule not found")
	}
	if sched.OrgID.String() != orgID {
		return nil, errors.New("schedule not found")
	}

	if req.Name != nil {
		sched.Name = *req.Name
	}
	if req.Description != nil {
		sched.Description = *req.Description
	}
	if req.TaskType != nil {
		sched.TaskType = *req.TaskType
	}
	if req.ScheduleType != nil {
		sched.ScheduleType = *req.ScheduleType
	}
	if req.Priority != nil {
		sched.Priority = *req.Priority
	}
	if req.IntervalDays != nil {
		sched.IntervalDays = req.IntervalDays
	}
	if req.IntervalHours != nil {
		sched.IntervalHours = req.IntervalHours
	}
	if req.LeadTimeDays != nil {
		sched.LeadTimeDays = *req.LeadTimeDays
	}
	if req.EstimatedHours != nil {
		sched.EstimatedHours = req.EstimatedHours
	}
	if req.Active != nil {
		sched.Active = *req.Active
	}
	if req.AssetID != nil {
		aid, err := uuid.Parse(*req.AssetID)
		if err == nil {
			sched.AssetID = &aid
		}
	}
	if req.DefaultAssigneeID != nil {
		did, err := uuid.Parse(*req.DefaultAssigneeID)
		if err == nil {
			sched.DefaultAssigneeID = &did
		}
	}

	if err := s.repo.Update(sched); err != nil {
		return nil, err
	}
	r := toMaintenanceResponse(sched)
	return &r, nil
}

func (s *maintenanceService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid schedule ID")
	}
	sched, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("schedule not found")
	}
	if sched.OrgID.String() != orgID {
		return errors.New("schedule not found")
	}
	return s.repo.Delete(uid)
}

func toMaintenanceResponse(s *models.MaintenanceSchedule) dto.MaintenanceScheduleResponse {
	r := dto.MaintenanceScheduleResponse{
		ID:              s.ID.String(),
		OrgID:           s.OrgID.String(),
		Name:            s.Name,
		Description:     s.Description,
		TaskType:        s.TaskType,
		ScheduleType:    s.ScheduleType,
		Priority:        s.Priority,
		IntervalDays:    s.IntervalDays,
		IntervalHours:   s.IntervalHours,
		LeadTimeDays:    s.LeadTimeDays,
		EstimatedHours:  s.EstimatedHours,
		Active:          s.Active,
		LastTriggeredAt: s.LastTriggeredAt,
		NextDueAt:       s.NextDueAt,
		CreatedAt:       s.CreatedAt,
		UpdatedAt:       s.UpdatedAt,
	}
	if s.AssetID != nil {
		v := s.AssetID.String()
		r.AssetID = &v
		if s.Asset != nil && s.Asset.ID != uuid.Nil {
			ar := toAssetResponse(s.Asset)
			_ = ar // asset details available if needed
		}
	}
	if s.CategoryID != nil {
		v := s.CategoryID.String()
		r.CategoryID = &v
	}
	if s.DefaultAssigneeID != nil {
		v := s.DefaultAssigneeID.String()
		r.DefaultAssigneeID = &v
	}
	return r
}
