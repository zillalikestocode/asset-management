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

type IssueFilters struct {
	Page     int
	PerPage  int
	Status   string
	Severity string
	AssetID  string
}

type IssueService interface {
	List(orgID string, f IssueFilters) (*dto.Paginated[dto.IssueResponse], error)
	Get(id, orgID string) (*dto.IssueResponse, error)
	Create(orgID, reportedByID string, req dto.CreateIssueRequest) (*dto.IssueResponse, error)
	Update(id, orgID string, req dto.UpdateIssueRequest) (*dto.IssueResponse, error)
	Delete(id, orgID string) error
}

type issueService struct {
	repo repository.IssueRepository
}

func NewIssueService(repo repository.IssueRepository) IssueService {
	return &issueService{repo: repo}
}

func (s *issueService) List(orgID string, f IssueFilters) (*dto.Paginated[dto.IssueResponse], error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	var issues []models.Issue
	if f.AssetID != "" {
		aid, err := uuid.Parse(f.AssetID)
		if err != nil {
			return nil, errors.New("invalid asset ID")
		}
		issues, err = s.repo.FindByAsset(aid)
		if err != nil {
			return nil, err
		}
	} else {
		issues, err = s.repo.FindByOrg(oid)
		if err != nil {
			return nil, err
		}
	}

	filtered := issues[:0]
	for _, iss := range issues {
		if f.Status != "" && iss.Status != f.Status {
			continue
		}
		if f.Severity != "" && iss.Severity != f.Severity {
			continue
		}
		filtered = append(filtered, iss)
	}

	total := int64(len(filtered))
	page, perPage := normPage(f.Page, f.PerPage)
	start := (page - 1) * perPage
	end := start + perPage
	if start > len(filtered) {
		start = len(filtered)
	}
	if end > len(filtered) {
		end = len(filtered)
	}
	page_data := filtered[start:end]

	resp := make([]dto.IssueResponse, len(page_data))
	for i := range page_data {
		resp[i] = toIssueResponse(&page_data[i])
	}
	return &dto.Paginated[dto.IssueResponse]{Data: resp, Total: total, Page: page, PerPage: perPage}, nil
}

func (s *issueService) Get(id, orgID string) (*dto.IssueResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid issue ID")
	}
	issue, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("issue not found")
		}
		return nil, err
	}
	if issue.OrgID.String() != orgID {
		return nil, errors.New("issue not found")
	}
	r := toIssueResponse(issue)
	return &r, nil
}

func (s *issueService) Create(orgID, reportedByID string, req dto.CreateIssueRequest) (*dto.IssueResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	rbid, err := uuid.Parse(reportedByID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	assetID, err := uuid.Parse(req.AssetID)
	if err != nil {
		return nil, errors.New("invalid asset ID")
	}

	severity := req.Severity
	if severity == "" {
		severity = "medium"
	}

	issue := &models.Issue{
		OrgRef:       models.OrgRef{OrgID: oid},
		AssetID:      assetID,
		ReportedByID: rbid,
		Title:        req.Title,
		Description:  req.Description,
		Severity:     severity,
		Status:       "open",
		PhotoURL:     req.PhotoURL,
	}
	if err := s.repo.Create(issue); err != nil {
		return nil, err
	}
	full, err := s.repo.FindByID(issue.ID)
	if err != nil {
		r := toIssueResponse(issue)
		return &r, nil
	}
	r := toIssueResponse(full)
	return &r, nil
}

func (s *issueService) Update(id, orgID string, req dto.UpdateIssueRequest) (*dto.IssueResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid issue ID")
	}
	issue, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("issue not found")
	}
	if issue.OrgID.String() != orgID {
		return nil, errors.New("issue not found")
	}

	if req.Title != nil {
		issue.Title = *req.Title
	}
	if req.Description != nil {
		issue.Description = *req.Description
	}
	if req.Severity != nil {
		issue.Severity = *req.Severity
	}
	if req.Status != nil {
		issue.Status = *req.Status
		if *req.Status == "resolved" && issue.ResolvedAt == nil {
			now := time.Now()
			issue.ResolvedAt = &now
		}
	}
	if req.Resolution != nil {
		issue.Resolution = *req.Resolution
	}

	if err := s.repo.Update(issue); err != nil {
		return nil, err
	}
	r := toIssueResponse(issue)
	return &r, nil
}

func (s *issueService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid issue ID")
	}
	issue, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("issue not found")
	}
	if issue.OrgID.String() != orgID {
		return errors.New("issue not found")
	}
	return s.repo.Delete(uid)
}

func toIssueResponse(i *models.Issue) dto.IssueResponse {
	r := dto.IssueResponse{
		ID:           i.ID.String(),
		OrgID:        i.OrgID.String(),
		AssetID:      i.AssetID.String(),
		ReportedByID: i.ReportedByID.String(),
		Title:        i.Title,
		Description:  i.Description,
		Severity:     i.Severity,
		Status:       i.Status,
		PhotoURL:     i.PhotoURL,
		ResolvedAt:   i.ResolvedAt,
		Resolution:   i.Resolution,
		CreatedAt:    i.CreatedAt,
		UpdatedAt:    i.UpdatedAt,
	}
	if i.Asset.ID != uuid.Nil {
		ar := toAssetResponse(&i.Asset)
		r.Asset = &ar
	}
	if i.ReportedBy.ID != uuid.Nil {
		r.ReportedBy = toUserResponse(&i.ReportedBy)
	}
	if i.ResolvedByID != nil {
		s := i.ResolvedByID.String()
		r.ResolvedByID = &s
		if i.ResolvedBy != nil && i.ResolvedBy.ID != uuid.Nil {
			r.ResolvedBy = toUserResponse(i.ResolvedBy)
		}
	}
	return r
}
