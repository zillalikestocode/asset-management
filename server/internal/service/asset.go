package service

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"gorm.io/gorm"
)

type AssetFilters struct {
	Page        int
	PerPage     int
	Search      string
	CategoryID  string
	LocationID  string   // single filter from query param
	LocationIDs []string // scope filter injected by LocationScope middleware
	Status      string
}

type AssetService interface {
	List(orgID string, f AssetFilters) (*dto.Paginated[dto.AssetResponse], error)
	Get(id, orgID string) (*dto.AssetResponse, error)
	Create(orgID, createdByID string, req dto.CreateAssetRequest) (*dto.AssetResponse, error)
	Update(id, orgID, updatedByID string, req dto.UpdateAssetRequest) (*dto.AssetResponse, error)
	Delete(id, orgID string) error
	GetHistory(assetID, orgID string) ([]dto.AssetHistoryResponse, error)
	RecordLocation(id, orgID string, lat, lng float64) error
}

type assetService struct {
	repo        repository.AssetRepository
	historyRepo repository.AssetHistoryRepository
}

func NewAssetService(repo repository.AssetRepository, historyRepo repository.AssetHistoryRepository) AssetService {
	return &assetService{repo: repo, historyRepo: historyRepo}
}

func (s *assetService) List(orgID string, f AssetFilters) (*dto.Paginated[dto.AssetResponse], error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	assets, err := s.repo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}

	// Build a set from the location scope (manager-scoped locations), if present.
	var scopeSet map[string]struct{}
	if len(f.LocationIDs) > 0 {
		scopeSet = make(map[string]struct{}, len(f.LocationIDs))
		for _, id := range f.LocationIDs {
			scopeSet[id] = struct{}{}
		}
	}

	// Apply in-memory filters (suitable for MVP scale)
	filtered := assets[:0]
	for _, a := range assets {
		if f.Status != "" && a.Status != f.Status {
			continue
		}
		if f.CategoryID != "" {
			if a.CategoryID == nil || a.CategoryID.String() != f.CategoryID {
				continue
			}
		}
		if f.LocationID != "" {
			if a.LocationID == nil || a.LocationID.String() != f.LocationID {
				continue
			}
		}
		// Location scope: managers only see assets in their assigned locations.
		if scopeSet != nil {
			locID := ""
			if a.LocationID != nil {
				locID = a.LocationID.String()
			}
			if _, ok := scopeSet[locID]; !ok {
				continue
			}
		}
		if f.Search != "" {
			q := strings.ToLower(f.Search)
			if !strings.Contains(strings.ToLower(a.Name), q) &&
				!strings.Contains(strings.ToLower(a.AssetCode), q) {
				continue
			}
		}
		filtered = append(filtered, a)
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

	resp := make([]dto.AssetResponse, len(page_data))
	for i := range page_data {
		resp[i] = toAssetResponse(&page_data[i])
	}
	return &dto.Paginated[dto.AssetResponse]{Data: resp, Total: total, Page: page, PerPage: perPage}, nil
}

func (s *assetService) Get(id, orgID string) (*dto.AssetResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid asset ID")
	}
	asset, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("asset not found")
		}
		return nil, err
	}
	if asset.OrgID.String() != orgID {
		return nil, errors.New("asset not found")
	}
	r := toAssetResponse(asset)
	return &r, nil
}

func (s *assetService) Create(orgID, _ string, req dto.CreateAssetRequest) (*dto.AssetResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	purchaseDate, err := dto.ParseDate(req.PurchaseDate)
	if err != nil {
		return nil, err
	}
	asset := &models.Asset{
		OrgRef:       models.OrgRef{OrgID: oid},
		Name:         req.Name,
		AssetCode:    req.AssetCode,
		Description:  req.Description,
		Model:        req.Model,
		Manufacturer: req.Manufacturer,
		SerialNumber: req.SerialNumber,
		Status:       req.Status,
		PurchaseCost: req.PurchaseCost,
		PurchaseDate: purchaseDate,
	}
	if req.Status == "" {
		asset.Status = "active"
	}
	if req.CategoryID != nil {
		cid, err := uuid.Parse(*req.CategoryID)
		if err == nil {
			asset.CategoryID = &cid
		}
	}
	if req.LocationID != nil {
		lid, err := uuid.Parse(*req.LocationID)
		if err == nil {
			asset.LocationID = &lid
		}
	}
	if req.AssignedUserID != nil {
		uid, err := uuid.Parse(*req.AssignedUserID)
		if err == nil {
			asset.AssignedUserID = &uid
		}
	}
	if err := s.repo.Create(asset); err != nil {
		return nil, err
	}
	// Reload with preloads
	full, err := s.repo.FindByID(asset.ID)
	if err != nil {
		r := toAssetResponse(asset)
		return &r, nil
	}
	r := toAssetResponse(full)
	return &r, nil
}

func (s *assetService) Update(id, orgID, updatedByID string, req dto.UpdateAssetRequest) (*dto.AssetResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid asset ID")
	}
	asset, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("asset not found")
	}
	if asset.OrgID.String() != orgID {
		return nil, errors.New("asset not found")
	}

	changerID, _ := uuid.Parse(updatedByID)
	s.trackChange(asset, "status", asset.Status, req.Status, changerID)

	if req.Name != nil {
		asset.Name = *req.Name
	}
	if req.Description != nil {
		asset.Description = *req.Description
	}
	if req.Model != nil {
		asset.Model = *req.Model
	}
	if req.Manufacturer != nil {
		asset.Manufacturer = *req.Manufacturer
	}
	if req.SerialNumber != nil {
		asset.SerialNumber = *req.SerialNumber
	}
	if req.Status != nil {
		asset.Status = *req.Status
	}
	if req.PurchaseCost != nil {
		asset.PurchaseCost = req.PurchaseCost
	}
	if req.PurchaseDate != nil {
		pd, err := dto.ParseDate(req.PurchaseDate)
		if err != nil {
			return nil, err
		}
		asset.PurchaseDate = pd
	}
	if req.LastLat != nil {
		asset.LastLat = req.LastLat
		now := time.Now()
		asset.LastLocationAt = &now
	}
	if req.LastLong != nil {
		asset.LastLong = req.LastLong
	}
	if req.CategoryID != nil {
		cid, err := uuid.Parse(*req.CategoryID)
		if err == nil {
			asset.CategoryID = &cid
		}
	}
	if req.LocationID != nil {
		lid, err := uuid.Parse(*req.LocationID)
		if err == nil {
			asset.LocationID = &lid
		}
	}
	if req.AssignedUserID != nil {
		uid2, err := uuid.Parse(*req.AssignedUserID)
		if err == nil {
			asset.AssignedUserID = &uid2
		}
	}

	if err := s.repo.Update(asset); err != nil {
		return nil, err
	}
	full, _ := s.repo.FindByID(asset.ID)
	r := toAssetResponse(full)
	return &r, nil
}

func (s *assetService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid asset ID")
	}
	asset, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("asset not found")
	}
	if asset.OrgID.String() != orgID {
		return errors.New("asset not found")
	}
	return s.repo.Delete(uid)
}

func (s *assetService) GetHistory(assetID, orgID string) ([]dto.AssetHistoryResponse, error) {
	aid, err := uuid.Parse(assetID)
	if err != nil {
		return nil, errors.New("invalid asset ID")
	}
	entries, err := s.historyRepo.FindByAsset(aid)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.AssetHistoryResponse, len(entries))
	for i, h := range entries {
		resp[i] = dto.AssetHistoryResponse{
			ID:        h.ID.String(),
			AssetID:   h.AssetID.String(),
			Field:     h.Field,
			OldValue:  h.OldValue,
			NewValue:  h.NewValue,
			ChangedBy: h.User.Name,
			ChangedAt: h.CreatedAt,
		}
	}
	return resp, nil
}

func (s *assetService) RecordLocation(id, orgID string, lat, lng float64) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid asset ID")
	}
	asset, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("asset not found")
	}
	if asset.OrgID.String() != orgID {
		return errors.New("asset not found")
	}
	now := time.Now()
	asset.LastLat = &lat
	asset.LastLong = &lng
	asset.LastLocationAt = &now
	return s.repo.Update(asset)
}

func (s *assetService) trackChange(asset *models.Asset, field, oldVal string, newVal *string, changerID uuid.UUID) {
	if newVal == nil || *newVal == oldVal {
		return
	}
	_ = s.historyRepo.Create(&models.AssetHistory{
		AssetID:   asset.ID,
		Field:     field,
		OldValue:  &oldVal,
		NewValue:  *newVal,
		ChangedBy: changerID,
	})
}

func toAssetResponse(a *models.Asset) dto.AssetResponse {
	r := dto.AssetResponse{
		ID:           a.ID.String(),
		OrgID:        a.OrgID.String(),
		Name:         a.Name,
		AssetCode:    a.AssetCode,
		Description:  a.Description,
		Model:        a.Model,
		Manufacturer: a.Manufacturer,
		SerialNumber: a.SerialNumber,
		Status:       a.Status,
		PurchaseCost: a.PurchaseCost,
		PurchaseDate: a.PurchaseDate,
		LastLat:      a.LastLat,
		LastLong:     a.LastLong,
		LastLocationAt: a.LastLocationAt,
		CreatedAt:    a.CreatedAt,
		UpdatedAt:    a.UpdatedAt,
	}
	if a.CategoryID != nil {
		s := a.CategoryID.String()
		r.CategoryID = &s
	}
	if a.LocationID != nil {
		s := a.LocationID.String()
		r.LocationID = &s
	}
	if a.AssignedUserID != nil {
		s := a.AssignedUserID.String()
		r.AssignedUserID = &s
	}
	if a.Category != nil && a.Category.ID != uuid.Nil {
		c := dto.CategoryResponse{
			ID:    a.Category.ID.String(),
			OrgID: a.Category.OrgID.String(),
			Name:  a.Category.Name,
			Color: a.Category.Color,
		}
		r.Category = &c
	}
	if a.Location != nil && a.Location.ID != uuid.Nil {
		l := dto.LocationResponse{
			ID:    a.Location.ID.String(),
			OrgID: a.Location.OrgID.String(),
			Name:  a.Location.Name,
		}
		r.Location = &l
	}
	if a.AssignedUser != nil && a.AssignedUser.ID != uuid.Nil {
		u := toUserResponse(a.AssignedUser)
		r.AssignedUser = u
	}
	return r
}

func normPage(page, perPage int) (int, int) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 200 {
		perPage = 20
	}
	return page, perPage
}
