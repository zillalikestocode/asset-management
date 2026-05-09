package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zillalikestocode/assetflow-core/internal/repository"
)

// LocationScope populates "locationIDs" in the gin context for manager users.
// Admin and technician requests are passed through unmodified.
func LocationScope(userRepo repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != "manager" {
			c.Next()
			return
		}

		userID, err := uuid.Parse(c.GetString("userID"))
		if err != nil {
			c.Next()
			return
		}

		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.Next()
			return
		}

		ids := make([]string, len(user.Locations))
		for i, l := range user.Locations {
			ids[i] = l.ID.String()
		}
		c.Set("locationIDs", ids)
		c.Next()
	}
}
