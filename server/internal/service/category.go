package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/dto"
	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
	"gorm.io/gorm"
)

type CategoryService interface {
	List(orgID string) ([]dto.CategoryResponse, error)
	Get(id, orgID string) (*dto.CategoryResponse, error)
	Create(orgID string, req dto.CreateCategoryRequest) (*dto.CategoryResponse, error)
	Update(id, orgID string, req dto.UpdateCategoryRequest) (*dto.CategoryResponse, error)
	Delete(id, orgID string) error
}

type categoryService struct {
	repo repository.CategoryRepository
}

func NewCategoryService(repo repository.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) List(orgID string) ([]dto.CategoryResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	cats, err := s.repo.FindByOrg(oid)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.CategoryResponse, len(cats))
	for i := range cats {
		resp[i] = toCategoryResponse(&cats[i])
	}
	return resp, nil
}

func (s *categoryService) Get(id, orgID string) (*dto.CategoryResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid category ID")
	}
	cat, err := s.repo.FindByID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("category not found")
		}
		return nil, err
	}
	if cat.OrgID.String() != orgID {
		return nil, errors.New("category not found")
	}
	r := toCategoryResponse(cat)
	return &r, nil
}

func (s *categoryService) Create(orgID string, req dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	oid, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.New("invalid org ID")
	}
	cat := &models.Category{
		OrgID: oid,
		Name:  req.Name,
		Color: req.Color,
	}
	if err := s.repo.Create(cat); err != nil {
		return nil, err
	}
	r := toCategoryResponse(cat)
	return &r, nil
}

func (s *categoryService) Update(id, orgID string, req dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid category ID")
	}
	cat, err := s.repo.FindByID(uid)
	if err != nil {
		return nil, errors.New("category not found")
	}
	if cat.OrgID.String() != orgID {
		return nil, errors.New("category not found")
	}
	if req.Name != nil {
		cat.Name = *req.Name
	}
	if req.Color != nil {
		cat.Color = req.Color
	}
	if err := s.repo.Update(cat); err != nil {
		return nil, err
	}
	r := toCategoryResponse(cat)
	return &r, nil
}

func (s *categoryService) Delete(id, orgID string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid category ID")
	}
	cat, err := s.repo.FindByID(uid)
	if err != nil {
		return errors.New("category not found")
	}
	if cat.OrgID.String() != orgID {
		return errors.New("category not found")
	}
	return s.repo.Delete(uid)
}

func toCategoryResponse(c *models.Category) dto.CategoryResponse {
	return dto.CategoryResponse{
		ID:        c.ID.String(),
		OrgID:     c.OrgID.String(),
		Name:      c.Name,
		Color:     c.Color,
		CreatedAt: c.CreatedAt,
	}
}
