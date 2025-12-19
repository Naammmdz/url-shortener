package model

import "time"

// User represents a registered user
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id" example:"1"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username" example:"john_doe"`
	Password  string    `gorm:"not null" json:"-"` // Hidden from JSON
	Email     string    `gorm:"uniqueIndex" json:"email" example:"john@example.com"`
	CreatedAt time.Time `json:"created_at" example:"2025-12-18T10:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2025-12-18T10:00:00Z"`
}
