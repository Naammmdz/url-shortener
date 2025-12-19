package middleware

import (
	"net/http"
	"strconv"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

// OptionalAuth provides optional authentication
// Sets userID in context if authenticated, but doesn't block if not
func OptionalAuth(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, password, hasAuth := c.Request.BasicAuth()

		if hasAuth {
			user, err := userService.ValidateCredentials(username, password)
			if err == nil {
				// User authenticated successfully
				c.Set("userID", user.ID)
				c.Set("username", user.Username)
			}
		}

		c.Next()
	}
}

// RequireAuth requires authentication
func RequireAuth(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, password, hasAuth := c.Request.BasicAuth()

		if !hasAuth {
			c.Header("WWW-Authenticate", `Basic realm="restricted"`)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		user, err := userService.ValidateCredentials(username, password)
		if err != nil {
			c.Header("WWW-Authenticate", `Basic realm="restricted"`)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Store user info in context
		c.Set("userID", user.ID)
		c.Set("username", user.Username)
		c.Next()
	}
}

// AdminAuth requires admin authentication (for demo purposes)
func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if admin header is present
		adminKey := c.GetHeader("X-Admin-Key")
		if adminKey != "admin-secret-key" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}
		c.Next()
	}
}

// GetUserID helper to extract userID from context
func GetUserID(c *gin.Context) (uint, bool) {
	userIDInterface, exists := c.Get("userID")
	if !exists {
		return 0, false
	}

	switch v := userIDInterface.(type) {
	case uint:
		return v, true
	case int:
		return uint(v), true
	case string:
		id, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			return 0, false
		}
		return uint(id), true
	default:
		return 0, false
	}
}
