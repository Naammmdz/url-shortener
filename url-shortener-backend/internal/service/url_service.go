package service

import (
	"errors"
	"net/url"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"gorm.io/gorm"
)

type URLService interface {
	CreateShortURL(originalURL string, userID *uint, anonymousID *string) (*model.URL, error)
	GetByShortCode(code string) (*model.URL, error)
	RedirectAndCount(code string) (string, error)
	ListURLs() ([]model.URL, error)
	ListUserURLs(userID uint) ([]model.URL, error)
	ListAnonymousURLs(anonymousID string) ([]model.URL, error)
	ClaimAnonymousURLs(userID uint, anonymousID string) error
}

type urlService struct {
	repo repository.URLRepository
}

func NewURLService(repo repository.URLRepository) URLService {
	return &urlService{repo: repo}
}

func (s *urlService) CreateShortURL(originalURL string, userID *uint, anonymousID *string) (*model.URL, error) {
	// Validate URL
	if !isValidURL(originalURL) {
		return nil, errors.New("invalid URL format")
	}

	// Generate unique short code
	shortCode, err := s.generateUniqueCode()
	if err != nil {
		return nil, err
	}

	// Create new URL entry with ownership
	urlEntry := &model.URL{
		ShortCode:   shortCode,
		OriginalURL: originalURL,
		UserID:      userID,
		AnonymousID: anonymousID,
		Clicks:      0,
	}

	if err := s.repo.Create(urlEntry); err != nil {
		return nil, err
	}

	return urlEntry, nil
}

func (s *urlService) GetByShortCode(code string) (*model.URL, error) {
	return s.repo.FindByShortCode(code)
}

func (s *urlService) RedirectAndCount(code string) (string, error) {
	urlEntry, err := s.repo.FindByShortCode(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("short URL not found")
		}
		return "", err
	}

	// Increment click count asynchronously
	go s.repo.IncrementClicks(code)

	return urlEntry.OriginalURL, nil
}

func (s *urlService) ListURLs() ([]model.URL, error) {
	return s.repo.List()
}

func (s *urlService) ListUserURLs(userID uint) ([]model.URL, error) {
	return s.repo.ListByUserID(userID)
}

func (s *urlService) ListAnonymousURLs(anonymousID string) ([]model.URL, error) {
	return s.repo.ListByAnonymousID(anonymousID)
}

func (s *urlService) ClaimAnonymousURLs(userID uint, anonymousID string) error {
	return s.repo.ClaimAnonymousURLs(userID, anonymousID)
}

// generateUniqueCode generates a unique short code
func (s *urlService) generateUniqueCode() (string, error) {
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		code, err := gonanoid.New(8)
		if err != nil {
			return "", err
		}

		// Check if code already exists
		_, err = s.repo.FindByShortCode(code)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code, nil
		}
	}
	return "", errors.New("failed to generate unique code")
}

// isValidURL validates if the string is a valid URL
func isValidURL(str string) bool {
	u, err := url.Parse(str)
	return err == nil && u.Scheme != "" && u.Host != ""
}
