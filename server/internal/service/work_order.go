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

type WOFilters struct {
	Page         int
	PerPage      int
	Status       string
	Priority     string
	AssignedToID string
	AssetID      string
	ScheduleID   string
	WOType       string
}

type WorkOrderService interface {
	List(orgID string, f WOFilters) (*dto.Paginated[dto.WorkOrderResponse], error)
	Get(id, orgID string) (*dto.WorkOrderResponse, error)
	Create(orgID, createdByID string, req dto.CreateWorkOrderRequest) (*dto.WorkOrderResponse, error)
	Update(id, orgID string, req dto.UpdateWorkOrderRequest) (*dto.WorkOrderResponse, error)
	Delete(id, orgID string) error
	AddPhoto(id, orgID string, req dto.AddWorkOrderPhotoRequest) (*dto.WorkOrderPhotoResponse, error)
	DeletePhoto(woID, photoID, orgID string) error
	ListComments(id, orgID string) ([]dto.WorkOrderCommentResponse, error)
	AddComment(id, orgID, authorID string, req dto.AddWorkOrderCommentRequest) (*dto.WorkOrderCommentResponse, error)
}

type workOrderService struct {
	repo     repository.WorkOrderRepository
	userRepo repository.UserRepository
}

func NewWorkOrderService(repo repository.WorkOrderRepository, userRepo repository.UserRepository) WorkOrderService {
	return &workOrderService{repo: repo, userRepo: userRepo}
}

func (s *workOrderService) List(orgID string, f WOFilters) (*dto.Paginated[dto.WorkOrderResponse], error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}

	var wos []models.WorkOrder
	if f.ScheduleID != "" {
		sid, err := uuid.Parse(f.ScheduleID)
		if err != nil {
			return nil, errors.New("invalid schedule ID")
		}
		wos, err = s.repo.FindBySchedule(sid)
		if err != nil {
			return nil, err
		}
	} else if f.AssetID != "" {
		aid, err := uuid.Parse(f.AssetID)
		if err != nil {
			return nil, errors.New("invalid asset ID")
		}
		wos, err = s.repo.FindByAsset(aid)
		if err != nil {
			return nil, err
		}
	} else if f.AssignedToID != "" {
		uid, err := uuid.Parse(f.AssignedToID)
		if err != nil {
			return nil, errors.New("invalid user ID")
		}
		wos, err = s.repo.FindByAssignee(uid)
		if err != nil {
			return nil, err
		}
	} else {
		wos, err = s.repo.FindByOrg(oid)
		if err != nil {
			return nil, err
		}
	}

	// In-memory filtering
	filtered := wos[:0]
	for _, w := range wos {
		if f.Status != "" && w.Status != f.Status {
			continue
		}
		if f.Priority != "" && w.Priority != f.Priority {
			continue
		}
		if f.WOType != "" && w.Type != f.WOType {
			continue
		}
		filtered = append(filtered, w)
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

	resp := make([]dto.WorkOrderResponse, len(page_data))
	for i := range page_data {
		resp[i] = toWOResponse(&page_data[i])
	}
	return &dto.Paginated[dto.WorkOrderResponse]{Data: resp, Total: total, Page: page, PerPage: perPage}, nil
}

func (s *workOrderService) Get(id, orgID string) (*dto.WorkOrderResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("work order not found")
		}
		return nil, err
	}
	if wo.OrgID.String() != orgID {
		return nil, errors.New("work order not found")
	}
	r := toWOResponse(wo)
	return &r, nil
}

func (s *workOrderService) Create(orgID, createdByID string, req dto.CreateWorkOrderRequest) (*dto.WorkOrderResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	cid, err := uuid.Parse(createdByID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	assetID, err := uuid.Parse(req.AssetID)
	if err != nil {
		return nil, errors.New("invalid asset ID")
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	dueDate, err := dto.ParseDate(req.DueDate)
	if err != nil {
		return nil, err
	}

	wo := &models.WorkOrder{
		OrgRef:         models.OrgRef{OrgID: oid},
		Title:          req.Title,
		Description:    req.Description,
		Priority:       priority,
		Status:         "open",
		Type:           "manual",
		AssetID:        assetID,
		CreatedByID:    cid,
		DueDate:        dueDate,
		EstimatedHours: req.EstimatedHours,
	}
	if req.AssignedToID != nil {
		uid, err := uuid.Parse(*req.AssignedToID)
		if err == nil {
			wo.AssignedToID = &uid
		}
	}

	if err := s.repo.Create(wo); err != nil {
		return nil, err
	}
	full, err := s.repo.FindByID(wo.ID)
	if err != nil {
		r := toWOResponse(wo)
		return &r, nil
	}
	r := toWOResponse(full)
	return &r, nil
}

func (s *workOrderService) Update(id, orgID string, req dto.UpdateWorkOrderRequest) (*dto.WorkOrderResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return nil, errors.New("work order not found")
	}

	if req.Title != nil {
		wo.Title = *req.Title
	}
	if req.Description != nil {
		wo.Description = *req.Description
	}
	if req.Priority != nil {
		wo.Priority = *req.Priority
	}
	if req.Status != nil {
		wo.Status = *req.Status
		if *req.Status == "completed" && wo.CompletedAt == nil {
			now := time.Now()
			wo.CompletedAt = &now
		}
	}
	if req.DueDate != nil {
		dd, err := dto.ParseDate(req.DueDate)
		if err != nil {
			return nil, err
		}
		wo.DueDate = dd
	}
	if req.EstimatedHours != nil {
		wo.EstimatedHours = req.EstimatedHours
	}
	if req.ActualHours != nil {
		wo.ActualHours = req.ActualHours
	}
	if req.CompletionNotes != nil {
		wo.CompletionNotes = *req.CompletionNotes
	}
	if req.AssignedToID != nil {
		aid, err := uuid.Parse(*req.AssignedToID)
		if err == nil {
			wo.AssignedToID = &aid
		}
	}

	if err := s.repo.Update(wo); err != nil {
		return nil, err
	}
	full, _ := s.repo.FindByID(wo.ID)
	r := toWOResponse(full)
	return &r, nil
}

func (s *workOrderService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return errors.New("work order not found")
	}
	return s.repo.Delete(uid)
}

func (s *workOrderService) AddPhoto(id, orgID string, req dto.AddWorkOrderPhotoRequest) (*dto.WorkOrderPhotoResponse, error) {
	woid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(woid)
	if err != nil {
		return nil, errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return nil, errors.New("work order not found")
	}
	photo := &models.WorkOrderPhoto{
		WorkOrderID: woid,
		URL:         req.URL,
		Filename:    req.Filename,
	}
	if err := s.repo.AddPhoto(photo); err != nil {
		return nil, err
	}
	r := &dto.WorkOrderPhotoResponse{
		ID:        photo.ID.String(),
		URL:       photo.URL,
		Filename:  photo.Filename,
		CreatedAt: photo.CreatedAt,
	}
	return r, nil
}

func (s *workOrderService) DeletePhoto(woID, photoID, orgID string) error {
	woid, err := uuid.Parse(woID)
	if err != nil {
		return errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(woid)
	if err != nil {
		return errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return errors.New("work order not found")
	}
	pid, err := uuid.Parse(photoID)
	if err != nil {
		return errors.New("invalid photo ID")
	}
	return s.repo.DeletePhoto(pid)
}

func (s *workOrderService) ListComments(id, orgID string) ([]dto.WorkOrderCommentResponse, error) {
	woid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(woid)
	if err != nil {
		return nil, errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return nil, errors.New("work order not found")
	}
	comments, err := s.repo.FindComments(woid)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.WorkOrderCommentResponse, len(comments))
	for i, c := range comments {
		resp[i] = dto.WorkOrderCommentResponse{
			ID:        c.ID.String(),
			AuthorID:  c.AuthorID.String(),
			Author:    c.Author.Name,
			Body:      c.Body,
			CreatedAt: c.CreatedAt,
		}
	}
	return resp, nil
}

func (s *workOrderService) AddComment(id, orgID, authorID string, req dto.AddWorkOrderCommentRequest) (*dto.WorkOrderCommentResponse, error) {
	woid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid work order ID")
	}
	wo, err := s.repo.FindByID(woid)
	if err != nil {
		return nil, errors.New("work order not found")
	}
	if wo.OrgID.String() != orgID {
		return nil, errors.New("work order not found")
	}
	auid, err := uuid.Parse(authorID)
	if err != nil {
		return nil, errors.New("invalid author ID")
	}
	comment := &models.WorkOrderComment{
		WorkOrderID: woid,
		AuthorID:    auid,
		Body:        req.Body,
	}
	if err := s.repo.AddComment(comment); err != nil {
		return nil, err
	}
	authorName := authorID
	if u, err := s.userRepo.FindByID(auid); err == nil {
		authorName = u.Name
	}
	r := &dto.WorkOrderCommentResponse{
		ID:        comment.ID.String(),
		AuthorID:  comment.AuthorID.String(),
		Author:    authorName,
		Body:      comment.Body,
		CreatedAt: comment.CreatedAt,
	}
	return r, nil
}

func toWOResponse(w *models.WorkOrder) dto.WorkOrderResponse {
	r := dto.WorkOrderResponse{
		ID:              w.ID.String(),
		OrgID:           w.OrgID.String(),
		Title:           w.Title,
		Description:     w.Description,
		Priority:        w.Priority,
		Status:          w.Status,
		Type:            w.Type,
		AssetID:         w.AssetID.String(),
		CreatedByID:     w.CreatedByID.String(),
		DueDate:         w.DueDate,
		CompletedAt:     w.CompletedAt,
		EstimatedHours:  w.EstimatedHours,
		ActualHours:     w.ActualHours,
		CompletionNotes: w.CompletionNotes,
		CreatedAt:       w.CreatedAt,
		UpdatedAt:       w.UpdatedAt,
	}
	if w.AssignedToID != nil {
		s := w.AssignedToID.String()
		r.AssignedToID = &s
	}
	if w.MaintenanceScheduleID != nil {
		s := w.MaintenanceScheduleID.String()
		r.MaintenanceScheduleID = &s
	}
	if w.Asset.ID != uuid.Nil {
		ar := toAssetResponse(&w.Asset)
		r.Asset = &ar
	}
	if w.AssignedTo != nil && w.AssignedTo.ID != uuid.Nil {
		r.AssignedTo = toUserResponse(w.AssignedTo)
	}
	if w.CreatedBy.ID != uuid.Nil {
		r.CreatedBy = toUserResponse(&w.CreatedBy)
	}
	if len(w.Photos) > 0 {
		photos := make([]dto.WorkOrderPhotoResponse, len(w.Photos))
		for i, p := range w.Photos {
			photos[i] = dto.WorkOrderPhotoResponse{
				ID:        p.ID.String(),
				URL:       p.URL,
				Filename:  p.Filename,
				CreatedAt: p.CreatedAt,
			}
		}
		r.Photos = photos
	}
	if len(w.Comments) > 0 {
		comments := make([]dto.WorkOrderCommentResponse, len(w.Comments))
		for i, c := range w.Comments {
			comments[i] = dto.WorkOrderCommentResponse{
				ID:        c.ID.String(),
				AuthorID:  c.AuthorID.String(),
				Author:    c.Author.Name,
				Body:      c.Body,
				CreatedAt: c.CreatedAt,
			}
		}
		r.Comments = comments
	}
	return r
}
