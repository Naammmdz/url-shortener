package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/gin-gonic/gin"
)

// BasicAuth provides basic authentication middleware
func BasicAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, password, hasAuth := c.Request.BasicAuth()

		if !hasAuth {
			c.Header("WWW-Authenticate", `Basic realm="restricted"`)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// In production, validate against database
		// For now, using simple validation
		if !validateCredentials(username, password) {
			c.Header("WWW-Authenticate", `Basic realm="restricted"`)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Store username in context for later use
		c.Set("username", username)
		c.Next()
	}
}

// validateCredentials validates username and password
// TODO: Replace with database lookup
func validateCredentials(username, password string) bool {
	// Demo credentials - replace with database lookup
	expectedUsername := "admin"
	expectedPassword := "password123"

	usernameMatch := subtle.ConstantTimeCompare([]byte(username), []byte(expectedUsername)) == 1
	passwordMatch := subtle.ConstantTimeCompare([]byte(password), []byte(expectedPassword)) == 1

	return usernameMatch && passwordMatch
}
