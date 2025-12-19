package repository

import (
	"url-shortener/internal/model"

	"gorm.io/gorm"
)

type URLRepository interface {
	Create(url *model.URL) error
	FindByShortCode(code string) (*model.URL, error)
	FindByOriginalURL(originalURL string) (*model.URL, error)
	IncrementClicks(code string) error
	List() ([]model.URL, error)
	ListByUserID(userID uint) ([]model.URL, error)
	ListByAnonymousID(anonymousID string) ([]model.URL, error)
	ClaimAnonymousURLs(userID uint, anonymousID string) error
}

type urlRepository struct {
	db *gorm.DB
}

func NewURLRepository(db *gorm.DB) URLRepository {
	return &urlRepository{db: db}
}

func (r *urlRepository) Create(url *model.URL) error {
	return r.db.Create(url).Error
}

func (r *urlRepository) FindByShortCode(code string) (*model.URL, error) {
	var url model.URL
	err := r.db.Where("short_code = ?", code).First(&url).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func (r *urlRepository) FindByOriginalURL(originalURL string) (*model.URL, error) {
	var url model.URL
	err := r.db.Where("original_url = ?", originalURL).First(&url).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func (r *urlRepository) IncrementClicks(code string) error {
	return r.db.Model(&model.URL{}).
		Where("short_code = ?", code).
		UpdateColumn("clicks", gorm.Expr("clicks + ?", 1)).Error
}

func (r *urlRepository) List() ([]model.URL, error) {
	var urls []model.URL
	err := r.db.Order("created_at DESC").Find(&urls).Error
	return urls, err
}

func (r *urlRepository) ListByUserID(userID uint) ([]model.URL, error) {
	var urls []model.URL
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&urls).Error
	return urls, err
}

func (r *urlRepository) ListByAnonymousID(anonymousID string) ([]model.URL, error) {
	var urls []model.URL
	err := r.db.Where("anonymous_id = ?", anonymousID).Order("created_at DESC").Find(&urls).Error
	return urls, err
}

func (r *urlRepository) ClaimAnonymousURLs(userID uint, anonymousID string) error {
	return r.db.Model(&model.URL{}).
		Where("anonymous_id = ? AND user_id IS NULL", anonymousID).
		Update("user_id", userID).
		Update("anonymous_id", nil).
		Error
}
