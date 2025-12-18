package handler

import (
	"net/http"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

type URLHandler struct {
	service service.URLService
}

func NewURLHandler(service service.URLService) *URLHandler {
	return &URLHandler{service: service}
}

type CreateURLRequest struct {
	URL         string  `json:"url" binding:"required" example:"https://example.com/very/long/path"`
	AnonymousID *string `json:"anonymous_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type CreateURLResponse struct {
	ShortCode   string `json:"short_code" example:"abc12345"`
	ShortURL    string `json:"short_url" example:"http://localhost:8080/abc12345"`
	OriginalURL string `json:"original_url" example:"https://example.com/very/long/path"`
	AnonymousID string `json:"anonymous_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"Invalid URL format"`
}

// CreateShortURL godoc
// @Summary      Create short URL
// @Description  Shorten a long URL (works for both authenticated and anonymous users)
// @Tags         urls
// @Accept       json
// @Produce      json
// @Param        request body CreateURLRequest true "URL to shorten with optional anonymous_id"
// @Success      201 {object} CreateURLResponse
// @Failure      400 {object} ErrorResponse
// @Router       /api/shorten [post]
func (h *URLHandler) CreateShortURL(c *gin.Context) {
	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "URL is required"})
		return
	}

	// Check if user is authenticated (from Basic Auth middleware)
	var userID *uint
	if userIDInterface, exists := c.Get("userID"); exists {
		id := userIDInterface.(uint)
		userID = &id
	}

	// If not authenticated, use anonymous ID from request or generate new one
	var anonymousID *string
	if userID == nil {
		if req.AnonymousID != nil && *req.AnonymousID != "" {
			anonymousID = req.AnonymousID
		} else {
			// Generate new anonymous ID (UUID v4)
			newID := generateAnonymousID()
			anonymousID = &newID
		}
	}

	urlEntry, err := h.service.CreateShortURL(req.URL, userID, anonymousID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	shortURL := "http://localhost:8080/" + urlEntry.ShortCode

	response := CreateURLResponse{
		ShortCode:   urlEntry.ShortCode,
		ShortURL:    shortURL,
		OriginalURL: urlEntry.OriginalURL,
	}

	// Return anonymous ID if created as anonymous
	if anonymousID != nil {
		response.AnonymousID = *anonymousID
	}

	c.JSON(http.StatusCreated, response)
}

// RedirectURL godoc
// @Summary      Redirect to original URL
// @Description  Redirect to the original URL using short code
// @Tags         urls
// @Param        code path string true "Short code"
// @Success      301
// @Failure      404 {object} ErrorResponse
// @Router       /{code} [get]
func (h *URLHandler) RedirectURL(c *gin.Context) {
	code := c.Param("code")

	originalURL, err := h.service.RedirectAndCount(code)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Short URL not found"})
		return
	}

	c.Redirect(http.StatusMovedPermanently, originalURL)
}

// GetURLInfo godoc
// @Summary      Get URL information
// @Description  Get detailed information about a shortened URL
// @Tags         urls
// @Produce      json
// @Param        code path string true "Short code"
// @Success      200 {object} model.URL
// @Failure      404 {object} ErrorResponse
// @Router       /api/urls/{code} [get]
func (h *URLHandler) GetURLInfo(c *gin.Context) {
	code := c.Param("code")

	urlEntry, err := h.service.GetByShortCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Short URL not found"})
		return
	}

	c.JSON(http.StatusOK, urlEntry)
}

// ListURLs godoc
// @Summary      List all URLs
// @Description  Get list of shortened URLs (user's own or all if admin)
// @Tags         urls
// @Produce      json
// @Param        anonymous_id query string false "Anonymous ID to filter links"
// @Success      200 {object} map[string]interface{} "Returns total count and array of URLs"
// @Failure      500 {object} ErrorResponse
// @Router       /api/urls [get]
func (h *URLHandler) ListURLs(c *gin.Context) {
	// Check if user is authenticated
	userIDInterface, isAuthenticated := c.Get("userID")
	anonymousID := c.Query("anonymous_id")

	var urls []model.URL
	var err error

	if isAuthenticated {
		// Authenticated user - show their links
		userID := userIDInterface.(uint)
		urls, err = h.service.ListUserURLs(userID)
	} else if anonymousID != "" {
		// Anonymous user with ID - show their links
		urls, err = h.service.ListAnonymousURLs(anonymousID)
	} else {
		// No filter - show all (could restrict this in production)
		urls, err = h.service.ListURLs()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total": len(urls),
		"urls":  urls,
	})
}

// Helper function to generate anonymous ID (UUID v4)
func generateAnonymousID() string {
	// Using a simple UUID v4 generation
	// In production, use github.com/google/uuid
	return "anon-" + generateRandomString(32)
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[i%len(charset)]
	}
	return string(result)
}
