package model

import "time"

// URL represents a shortened URL entry
type URL struct {
	ID          uint      `gorm:"primaryKey" json:"id" example:"1"`
	UserID      *uint     `gorm:"index" json:"user_id,omitempty" example:"1"`                                         // Nullable - for logged-in users
	AnonymousID *string   `gorm:"index" json:"anonymous_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"` // Nullable - for anonymous users
	ShortCode   string    `gorm:"uniqueIndex;not null" json:"short_code" example:"abc12345"`
	OriginalURL string    `gorm:"not null" json:"original_url" example:"https://example.com/very/long/path"`
	Clicks      int64     `gorm:"default:0" json:"clicks" example:"42"`
	CreatedAt   time.Time `json:"created_at" example:"2025-12-18T10:00:00Z"`
	UpdatedAt   time.Time `json:"updated_at" example:"2025-12-18T10:00:00Z"`
}
