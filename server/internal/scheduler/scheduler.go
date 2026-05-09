package scheduler

import (
	"fmt"
	"log"
	"time"

	"github.com/zillalikestocode/assetflow-core/internal/models"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
)

type Scheduler struct {
	scheduleRepo  repository.MaintenanceScheduleRepository
	workOrderRepo repository.WorkOrderRepository
	userRepo      repository.UserRepository
	ticker        *time.Ticker
	done          chan struct{}
}

func New(
	scheduleRepo repository.MaintenanceScheduleRepository,
	workOrderRepo repository.WorkOrderRepository,
	userRepo repository.UserRepository,
) *Scheduler {
	return &Scheduler{
		scheduleRepo:  scheduleRepo,
		workOrderRepo: workOrderRepo,
		userRepo:      userRepo,
		done:          make(chan struct{}),
	}
}

func (s *Scheduler) Start() {
	s.ticker = time.NewTicker(1 * time.Hour)
	go func() {
		s.check() // run immediately on startup
		for {
			select {
			case <-s.ticker.C:
				s.check()
			case <-s.done:
				return
			}
		}
	}()
	log.Println("maintenance scheduler started")
}

func (s *Scheduler) Stop() {
	if s.ticker != nil {
		s.ticker.Stop()
	}
	close(s.done)
}

func (s *Scheduler) check() {
	// Look ahead by the maximum sensible lead time (30 days) to catch schedules
	// that need a work order created in advance of their due date.
	horizon := time.Now().AddDate(0, 0, 30)
	schedules, err := s.scheduleRepo.FindDue(horizon)
	if err != nil {
		log.Printf("scheduler: error fetching due schedules: %v", err)
		return
	}

	now := time.Now()
	for _, sched := range schedules {
		// Only trigger if we're within LeadTimeDays of the due date.
		if sched.NextDueAt != nil {
			triggerAt := sched.NextDueAt.AddDate(0, 0, -sched.LeadTimeDays)
			if now.Before(triggerAt) {
				continue
			}
		}

		// Only handle asset-scoped schedules for now.
		if sched.AssetID == nil {
			continue
		}

		if err := s.createWorkOrder(&sched); err != nil {
			log.Printf("scheduler: error creating work order for schedule %s: %v", sched.ID, err)
			continue
		}

		// Advance the schedule.
		sched.LastTriggeredAt = &now
		if sched.ScheduleType == "time_based" && sched.IntervalDays != nil {
			base := now
			if sched.NextDueAt != nil {
				base = *sched.NextDueAt
			}
			next := base.AddDate(0, 0, *sched.IntervalDays)
			sched.NextDueAt = &next
		}
		if err := s.scheduleRepo.Update(&sched); err != nil {
			log.Printf("scheduler: error updating schedule %s: %v", sched.ID, err)
		}
	}
}

func (s *Scheduler) createWorkOrder(sched *models.MaintenanceSchedule) error {
	// Need a real user as CreatedByID — use the org's admin.
	admin, err := s.userRepo.FindAdminByOrg(sched.OrgID)
	if err != nil {
		return fmt.Errorf("no admin user found for org %s", sched.OrgID)
	}

	schedID := sched.ID
	wo := &models.WorkOrder{
		OrgRef:                models.OrgRef{OrgID: sched.OrgID},
		Title:                 fmt.Sprintf("[PM] %s", sched.Name),
		Description:           sched.Description,
		Priority:              sched.Priority,
		Status:                "open",
		Type:                  "scheduled",
		AssetID:               *sched.AssetID,
		CreatedByID:           admin.ID,
		MaintenanceScheduleID: &schedID,
		DueDate:               sched.NextDueAt,
		EstimatedHours:        sched.EstimatedHours,
		AssignedToID:          sched.DefaultAssigneeID,
	}

	return s.workOrderRepo.Create(wo)
}
