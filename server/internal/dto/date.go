package dto

import (
	"fmt"
	"time"
)

// ParseDate parses a date string that may be either a date-only value
// ("2006-01-02") or a full RFC3339 timestamp ("2006-01-02T15:04:05Z07:00").
// Returns nil for empty or null strings.
func ParseDate(s *string) (*time.Time, error) {
	if s == nil || *s == "" {
		return nil, nil
	}
	// Try full RFC3339 first (covers timestamps already in correct format).
	if t, err := time.Parse(time.RFC3339, *s); err == nil {
		return &t, nil
	}
	// Fall back to date-only — HTML date inputs always send this format.
	t, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return nil, fmt.Errorf("invalid date %q: expected YYYY-MM-DD or RFC3339", *s)
	}
	return &t, nil
}
