# URL Shortener Service

A URL shortening service built with Golang - Test assignment for Golang Intern position at FINAN COMPANY LIMITED.

## Problem Description

URL Shortener is a service that allows users to shorten long URLs into concise, shareable links. When accessing the shortened link, users are automatically redirected to the original URL.

## Project Structure

```
url-shortener/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── handler/
│   │   └── url_handler.go    # HTTP handlers
│   ├── service/
│   │   └── url_service.go    # Business logic
│   ├── repository/
│   │   └── url_repository.go # Data access layer
│   └── model/
│       └── url.go            # Domain models
├── config/
│   └── config.go             # Configuration
├── migrations/
├── .env.example
├── .gitignore
├── go.mod
└── README.md
```

## How to Run

### Requirements:
- Go 1.21 or higher
- Git

### Steps:

1. **Clone repository:**
```bash
git clone <repository-url>
cd url-shortener
```

2. **Install dependencies:**
```bash
go mod download
```

3. **Run server:**
```bash
go run cmd/server/main.go
```

## Tech Stack

- **Language:** Go 1.21+
- **Web Framework:** Gin
- **ORM:** GORM
- **Database:** SQLite
- **ID Generation:** go-nanoid
- **CORS:** gin-contrib/cors

## Development Progress

- [x] Initialize project structure
- [ ] Implement models
- [ ] Implement repository layer
- [ ] Implement service layer
- [ ] Implement handlers
- [ ] Setup database configuration
- [ ] Testing
- [ ] Documentation

## License

MIT
