package config

import (
	"fmt"
	"log"
	"os"
	"url-shortener/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	var db *gorm.DB
	var err error

	// Check if running in production (PostgreSQL)
	dbHost := os.Getenv("DB_HOST")
	if dbHost != "" {
		// PostgreSQL configuration from environment
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", "postgres"),
			getEnv("DB_NAME", "urlshortener"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_SSLMODE", "disable"),
		)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to PostgreSQL:", err)
		}
		log.Println("Connected to PostgreSQL database")
	} else {
		// SQLite for local development
		db, err = gorm.Open(sqlite.Open("url_shortener.db"), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to SQLite:", err)
		}
		log.Println("Connected to SQLite database")
	}

	// Auto migrate models
	if err := db.AutoMigrate(&model.User{}, &model.URL{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database initialized successfully")
	return db
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
