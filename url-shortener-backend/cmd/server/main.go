package main

import (
	"log"
	"url-shortener/config"
	_ "url-shortener/docs" // Import generated docs
	"url-shortener/internal/handler"
	"url-shortener/internal/middleware"
	"url-shortener/internal/repository"
	"url-shortener/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           URL Shortener API
// @version         2.0
// @description     A URL shortening service with authentication and anonymous user support
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  contact@sobanhang.com

// @license.name  MIT
// @license.url   http://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey  BearerAuth
// @in                          header
// @name                        Authorization
// @description                 Type "Bearer" followed by a space and JWT token.

func main() {
	// Initialize database
	db := config.InitDB()

	// Initialize repositories
	urlRepo := repository.NewURLRepository(db)
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	urlService := service.NewURLService(urlRepo)
	userService := service.NewUserService(userRepo)

	// Initialize handlers
	urlHandler := handler.NewURLHandler(urlService)
	authHandler := handler.NewAuthHandler(userService, urlService)

	// Setup router
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public routes (no auth required)
	r.GET("/:code", urlHandler.RedirectURL) // Redirect route
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)

			// Protected: requires JWT authentication
			authProtected := auth.Group("")
			authProtected.Use(middleware.RequireJWT())
			{
				authProtected.POST("/claim-links", authHandler.ClaimLinks)
			}
		}

		// URL routes with optional JWT authentication
		// Creates link as authenticated user if logged in, or as anonymous if not
		api.POST("/shorten", middleware.OptionalJWT(), urlHandler.CreateShortURL)
		api.GET("/urls", middleware.OptionalJWT(), urlHandler.ListURLs)
		api.GET("/urls/:code", urlHandler.GetURLInfo)
	}

	log.Println("🚀 Server starting on :8080...")
	log.Println("📚 Swagger docs: http://localhost:8080/swagger/index.html")
	log.Println("👤 Anonymous users: Create links without auth")
	log.Println("🔐 Registered users: Use JWT Bearer token")
	log.Println("🎫 Login/Register returns: access_token (15min) + refresh_token (7days)")
	log.Println("🔗 Claim links: POST /api/auth/claim-links with anonymous_id")

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
