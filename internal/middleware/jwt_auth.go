package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
	// Use environment variable or default secret (change in production!)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-this-in-production"
	}
	jwtSecret = []byte(secret)
}

// Claims represents JWT claims
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateAccessToken generates a short-lived access token (15 minutes)
func GenerateAccessToken(userID uint, username string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken generates a long-lived refresh token (7 days)
func GenerateRefreshToken(userID uint, username string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates JWT token and returns claims
func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

// OptionalJWT provides optional JWT authentication
// Sets userID in context if valid token present, but doesn't block if not
func OptionalJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader != "" {
			// Extract token from "Bearer <token>"
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				claims, err := ValidateToken(parts[1])
				if err == nil {
					// Token valid, set user info in context
					c.Set("userID", claims.UserID)
					c.Set("username", claims.Username)
				}
			}
		}

		c.Next()
	}
}

// RequireJWT requires valid JWT authentication
func RequireJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Use: Bearer <token>",
			})
			return
		}

		claims, err := ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			return
		}

		// Store user info in context
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)

		c.Next()
	}
}

// GetUserID retrieves userID from context (helper function)
func GetUserIDFromJWT(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return 0, false
	}

	id, ok := userID.(uint)
	return id, ok
}
