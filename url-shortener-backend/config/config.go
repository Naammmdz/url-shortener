package config

import (
	"log"
	"url-shortener/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	// Using SQLite for simplicity (can be changed to PostgreSQL/MySQL)
	db, err := gorm.Open(sqlite.Open("url_shortener.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate models
	if err := db.AutoMigrate(&model.User{}, &model.URL{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database initialized successfully")
	return db
}
