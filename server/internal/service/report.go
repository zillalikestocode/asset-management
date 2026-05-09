package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
)

// ReportService produces aggregate summaries for the admin dashboard reports.
// Each method fetches from the relevant repositories and aggregates in memory —
// sufficient for MVP-scale datasets.

type MaintenanceCompletionReport struct {
	Period         string  `json:"period"`
	Total          int     `json:"total"`
	Completed      int     `json:"completed"`
	Overdue        int     `json:"overdue"`
	CompletionRate float64 `json:"completionRate"`
}

type AssetDowntimeReport struct {
	AssetID    string  `json:"assetId"`
	AssetCode  string  `json:"assetCode"`
	AssetName  string  `json:"assetName"`
	Incidents  int     `json:"incidents"`
	DowntimeHours float64 `json:"downtimeHours"`
}

type WorkOrderHistoryReport struct {
	Period             string  `json:"period"`
	Total              int     `json:"total"`
	Completed          int     `json:"completed"`
	Cancelled          int     `json:"cancelled"`
	AvgResolutionHours float64 `json:"avgResolutionHours"`
}

type CategoryCount struct {
	CategoryName string `json:"categoryName"`
	Count        int    `json:"count"`
}

type AssetInventoryReport struct {
	Total       int             `json:"total"`
	Active      int             `json:"active"`
	Inactive    int             `json:"inactive"`
	Maintenance int             `json:"maintenance"`
	Retired     int             `json:"retired"`
	ByCategory  []CategoryCount `json:"byCategory"`
}

type ReportService interface {
	MaintenanceCompletion(orgID string) (*MaintenanceCompletionReport, error)
	AssetDowntime(orgID string) ([]AssetDowntimeReport, error)
	WorkOrderHistory(orgID string) (*WorkOrderHistoryReport, error)
	AssetInventory(orgID string) (*AssetInventoryReport, error)
}

type reportService struct {
	assetRepo     repository.AssetRepository
	woRepo        repository.WorkOrderRepository
	scheduleRepo  repository.MaintenanceScheduleRepository
	issueRepo     repository.IssueRepository
}

func NewReportService(
	assetRepo repository.AssetRepository,
	woRepo repository.WorkOrderRepository,
	scheduleRepo repository.MaintenanceScheduleRepository,
	issueRepo repository.IssueRepository,
) ReportService {
	return &reportService{
		assetRepo:    assetRepo,
		woRepo:       woRepo,
		scheduleRepo: scheduleRepo,
		issueRepo:    issueRepo,
	}
}

func (s *reportService) MaintenanceCompletion(orgID string) (*MaintenanceCompletionReport, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	wos, err := s.woRepo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}

	total, completed, overdue := 0, 0, 0
	for _, wo := range wos {
		if wo.Type != "scheduled" {
			continue
		}
		total++
		if wo.Status == "completed" {
			completed++
		}
		if wo.DueDate != nil && wo.Status != "completed" && wo.Status != "cancelled" {
			overdue++
		}
	}

	rate := 0.0
	if total > 0 {
		rate = float64(completed) / float64(total) * 100
	}
	return &MaintenanceCompletionReport{
		Period:         "all-time",
		Total:          total,
		Completed:      completed,
		Overdue:        overdue,
		CompletionRate: rate,
	}, nil
}

func (s *reportService) AssetDowntime(orgID string) ([]AssetDowntimeReport, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	issues, err := s.issueRepo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}

	type entry struct {
		code      string
		name      string
		incidents int
		hours     float64
	}
	m := map[string]*entry{}
	for _, iss := range issues {
		id := iss.AssetID.String()
		if _, ok := m[id]; !ok {
			m[id] = &entry{code: iss.Asset.AssetCode, name: iss.Asset.Name}
		}
		m[id].incidents++
		if iss.ResolvedAt != nil {
			m[id].hours += iss.ResolvedAt.Sub(iss.CreatedAt).Hours()
		}
	}

	resp := make([]AssetDowntimeReport, 0, len(m))
	for id, e := range m {
		resp = append(resp, AssetDowntimeReport{
			AssetID:       id,
			AssetCode:     e.code,
			AssetName:     e.name,
			Incidents:     e.incidents,
			DowntimeHours: e.hours,
		})
	}
	return resp, nil
}

func (s *reportService) WorkOrderHistory(orgID string) (*WorkOrderHistoryReport, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	wos, err := s.woRepo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}

	total, completed, cancelled := len(wos), 0, 0
	var totalHours float64
	var resolvedCount int
	for _, wo := range wos {
		if wo.Status == "completed" {
			completed++
			if wo.CompletedAt != nil {
				totalHours += wo.CompletedAt.Sub(wo.CreatedAt).Hours()
				resolvedCount++
			}
		}
		if wo.Status == "cancelled" {
			cancelled++
		}
	}
	avg := 0.0
	if resolvedCount > 0 {
		avg = totalHours / float64(resolvedCount)
	}
	return &WorkOrderHistoryReport{
		Period:             "all-time",
		Total:              total,
		Completed:          completed,
		Cancelled:          cancelled,
		AvgResolutionHours: avg,
	}, nil
}

func (s *reportService) AssetInventory(orgID string) (*AssetInventoryReport, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	assets, err := s.assetRepo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}

	report := &AssetInventoryReport{Total: len(assets)}
	catCounts := map[string]int{}
	catNames := map[string]string{}

	for _, a := range assets {
		switch a.Status {
		case "active":
			report.Active++
		case "inactive":
			report.Inactive++
		case "maintenance":
			report.Maintenance++
		case "retired":
			report.Retired++
		}
		if a.CategoryID != nil {
			cid := a.CategoryID.String()
			catCounts[cid]++
			if a.Category != nil {
				catNames[cid] = a.Category.Name
			}
		}
	}

	for cid, count := range catCounts {
		report.ByCategory = append(report.ByCategory, CategoryCount{
			CategoryName: catNames[cid],
			Count:        count,
		})
	}
	return report, nil
}
