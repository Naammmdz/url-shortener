package service

import (
	"errors"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	Register(username, email, password string) (*model.User, error)
	Login(username, password string) (*model.User, error)
	GetByID(id uint) (*model.User, error)
	ValidateCredentials(username, password string) (*model.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) Register(username, email, password string) (*model.User, error) {
	// Check if user already exists
	_, err := s.repo.FindByUsername(username)
	if err == nil {
		return nil, errors.New("username already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &model.User{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) Login(username, password string) (*model.User, error) {
	user, err := s.repo.FindByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (s *userService) GetByID(id uint) (*model.User, error) {
	return s.repo.FindByID(id)
}

func (s *userService) ValidateCredentials(username, password string) (*model.User, error) {
	return s.Login(username, password)
}
