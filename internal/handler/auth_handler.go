package handler

import (
	"net/http"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService service.UserService
	urlService  service.URLService
}

func NewAuthHandler(userService service.UserService, urlService service.URLService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		urlService:  urlService,
	}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required" example:"john_doe"`
	Email    string `json:"email" binding:"required,email" example:"john@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"password123"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"john_doe"`
	Password string `json:"password" binding:"required" example:"password123"`
}

type AuthResponse struct {
	ID       uint   `json:"id" example:"1"`
	Username string `json:"username" example:"john_doe"`
	Email    string `json:"email" example:"john@example.com"`
	Message  string `json:"message" example:"Login successful"`
}

type ClaimLinksRequest struct {
	AnonymousID string `json:"anonymous_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
}

// Register godoc
// @Summary      Register new user
// @Description  Create a new user account
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body RegisterRequest true "Registration details"
// @Success      201 {object} AuthResponse
// @Failure      400 {object} ErrorResponse
// @Router       /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userService.Register(req.Username, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Message:  "Registration successful",
	})
}

// Login godoc
// @Summary      User login
// @Description  Authenticate user with username and password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body LoginRequest true "Login credentials"
// @Success      200 {object} AuthResponse
// @Failure      401 {object} ErrorResponse
// @Router       /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: err.Error()})
		return
	}

	// Store user info in session/cookie (simplified for now)
	c.JSON(http.StatusOK, AuthResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Message:  "Login successful",
	})
}

// ClaimLinks godoc
// @Summary      Claim anonymous links
// @Description  Transfer ownership of anonymous links to logged-in user
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body ClaimLinksRequest true "Anonymous ID from cookie/localStorage"
// @Success      200 {object} map[string]interface{} "Links claimed successfully"
// @Failure      400 {object} ErrorResponse
// @Security     BasicAuth
// @Router       /api/auth/claim-links [post]
func (h *AuthHandler) ClaimLinks(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDInterface, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "User not authenticated"})
		return
	}
	userID := userIDInterface.(uint)

	var req ClaimLinksRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if err := h.urlService.ClaimAnonymousURLs(userID, req.AnonymousID); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Links claimed successfully",
		"user_id": userID,
	})
}
