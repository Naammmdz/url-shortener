# URL Shortener Service 🔗

A production-grade URL shortening service with authentication and anonymous user support, built with Golang.

**Test assignment for Golang Intern position at FINAN COMPANY LIMITED**

## 📋 Problem Description

URL Shortener is a service similar to bit.ly or tinyurl that:
- Shortens long URLs into concise, shareable links
- Automatically redirects users from short links to original URLs
- Tracks click analytics
- **Supports both authenticated and anonymous users**
- **Allows anonymous users to claim their links after registration**

## 📁 Project Structure

This is a **monorepo** containing both backend (Go) and frontend (Next.js):

```
url-shortener/
├── url-shortener-backend/       # Go Backend API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # Application entry point
│   ├── internal/
│   │   ├── handler/
│   │   │   ├── auth_handler.go  # Authentication endpoints
│   │   │   └── url_handler.go   # URL shortening endpoints
│   │   ├── service/
│   │   │   ├── user_service.go  # User business logic
│   │   │   └── url_service.go   # URL business logic
│   │   ├── repository/
│   │   │   ├── user_repository.go
│   │   │   └── url_repository.go
│   │   ├── model/
│   │   │   ├── user.go          # User model
│   │   │   └── url.go           # URL model
│   │   └── middleware/
│   │       └── auth.go          # JWT authentication middleware
│   ├── config/
│   │   └── config.go            # Configuration
│   ├── docs/                    # Swagger documentation
│   ├── go.mod
│   ├── go.sum
│   └── README.md
│
└── url-shortener-frontend/      # Next.js Frontend
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Home page
    │   ├── providers.tsx        # Context providers
    │   ├── login/
    │   └── register/
    ├── components/
    │   ├── create-short-url.tsx # URL creation form
    │   ├── url-list.tsx         # URLs dashboard
    │   ├── link-detail.tsx      # URL analytics
    │   ├── login-form.tsx       # Login form
    │   └── register-form.tsx    # Registration form
    ├── contexts/
    │   └── auth-context.tsx     # Authentication state
    ├── lib/
    │   ├── api.ts               # API helper with auto token refresh
    │   └── cookies.ts           # Secure cookie utilities
    ├── types/
    │   ├── auth.ts              # Auth type definitions
    │   └── link.ts              # Link type definitions
    ├── package.json
    ├── next.config.js
    └── .env.local               # Environment variables
```

## 🚀 How to Run

### Prerequisites
- **Go** 1.21 or higher
- **Node.js** 18+ and npm
- **Git**

### Quick Start

#### 1. Clone Repository
```bash
git clone <repository-url>
cd url-shortener
```

#### 2. Run Backend (Terminal 1)
```bash
# Navigate to backend directory
cd url-shortener-backend

# Install Go dependencies
go mod download

# Generate Swagger docs (optional, already generated)
go run github.com/swaggo/swag/cmd/swag@latest init -g cmd/server/main.go

# Set JWT secret (optional, uses default in development)
export JWT_SECRET="your-secret-key"

# Run server
go run cmd/server/main.go
```

Backend will start on **`http://localhost:8080`**
- API Endpoints: `http://localhost:8080/api/`
- Swagger UI: `http://localhost:8080/swagger/index.html`
- Health Check: `http://localhost:8080/health`

#### 3. Run Frontend (Terminal 2)
```bash
# Navigate to frontend directory
cd url-shortener-frontend

# Install Node.js dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8080" > .env.local

# Run development server
npm run dev
```

Frontend will start on **`http://localhost:3000`**

#### 4. Access Application
Open your browser and visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger/index.html

### Development Workflow

**Backend Changes:**
- Edit files in `url-shortener-backend/`
- Restart: `go run cmd/server/main.go`
- Regenerate Swagger: `swag init -g cmd/server/main.go`

**Frontend Changes:**
- Edit files in `url-shortener-frontend/`
- Hot reload is automatic (Next.js dev server)

### Environment Variables

**Backend** (`url-shortener-backend/`)
```bash
# Optional - defaults provided for development
export JWT_SECRET="your-super-secret-key"  # Default: "your-secret-key"
export PORT="8080"                          # Default: 8080
```

**Frontend** (`url-shortener-frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Troubleshooting

**Backend Issues:**
- Port 8080 already in use? → Change `PORT` in code or kill process: `lsof -ti:8080 | xargs kill`
- Database errors? → Delete `url_shortener.db` and restart
- Swagger not showing? → Run `swag init -g cmd/server/main.go` in backend folder

**Frontend Issues:**
- API connection failed? → Check backend is running on port 8080
- Cookie errors? → Clear browser cookies and refresh
- Port 3000 in use? → Next.js will automatically use 3001

## API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:8080/swagger/index.html
```

### API Endpoints

#### Authentication Endpoints

##### 1. Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful"
}
```

##### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

##### 3. Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

##### 4. Claim Anonymous Links (Protected)
```bash
POST /api/auth/claim-links
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "anonymous_id": "550e8400-e29b-41d4-a716-446655440000"
}

Response (200):
{
  "message": "Links claimed successfully",
  "user_id": 1
}
```

#### URL Shortening Endpoints

##### 5. Create Short URL (Public or Authenticated)
```bash
# Anonymous user (no auth header)
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/path"
}

Response (201):
{
  "short_code": "abc12345",
  "short_url": "http://localhost:8080/abc12345",
  "original_url": "https://example.com/very/long/path",
  "anonymous_id": "550e8400-e29b-41d4-a716-446655440000"
}

# Authenticated user (with JWT token)
POST /api/shorten
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://example.com/very/long/path"
}

Response (201):
{
  "short_code": "xyz67890",
  "short_url": "http://localhost:8080/xyz67890",
  "original_url": "https://example.com/very/long/path"
}
```

##### 6. Redirect to Original URL
```bash
GET /:code
# Example: http://localhost:8080/abc12345
# Returns: 301 Redirect to original URL
```

##### 7. Get URL Information
```bash
GET /api/urls/:code
# Example: GET /api/urls/abc12345

Response (200):
{
  "id": 1,
  "short_code": "abc12345",
  "original_url": "https://example.com/very/long/path",
  "clicks": 42,
  "created_at": "2025-12-18T10:00:00Z",
  "updated_at": "2025-12-18T10:00:00Z"
}
```

##### 8. List All URLs
```bash
# Anonymous user (no auth header) - returns only their anonymous links
GET /api/urls
# Returns links associated with anonymous_id from client

# Authenticated user (with JWT token) - returns only their user links
GET /api/urls
Authorization: Bearer <access_token>

Response (200):
{
  "total": 10,
  "urls": [...]
}
```

##### 9. Health Check
```bash
GET /health

Response (200):
{
  "status": "ok"
}
```

## Tech Stack

- **Language:** Go 1.21+
- **Web Framework:** Gin
- **ORM:** GORM
- **Database:** SQLite (easily switchable to PostgreSQL/MySQL)
- **ID Generation:** go-nanoid
- **Authentication:** JWT (JSON Web Tokens) + bcrypt password hashing
- **CORS:** gin-contrib/cors
- **API Documentation:** Swagger (OpenAPI 3.0)

## 🔐 JWT Authentication Flow

### Token Types
- **Access Token**: Short-lived (15 minutes) - used for API requests
- **Refresh Token**: Long-lived (7 days) - used to get new access tokens

### Frontend Integration

```javascript
// 1. Login/Register
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john_doe', password: 'password123' })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// 2. Make authenticated requests
const shortenResponse = await fetch('http://localhost:8080/api/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  },
  body: JSON.stringify({ url: 'https://example.com' })
});

// 3. Refresh token when access token expires
const refreshResponse = await fetch('http://localhost:8080/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token: localStorage.getItem('refresh_token') })
});

const refreshData = await refreshResponse.json();
localStorage.setItem('access_token', refreshData.access_token);
localStorage.setItem('refresh_token', refreshData.refresh_token);
```

### Environment Variables

Set custom JWT secret (recommended for production):

```bash
export JWT_SECRET="your-super-secret-key-change-this"
go run cmd/server/main.go
```

Default secret is used if not set (for development only).

---

## 🏗️ Architecture & Design Decisions

### 1. **Clean Architecture (3-Layer Pattern)**

**Decision:** Separate code into Handler → Service → Repository layers

**Why?**
- ✅ **Separation of Concerns**: Each layer has a single responsibility
- ✅ **Testability**: Easy to mock dependencies and unit test each layer
- ✅ **Maintainability**: Changes in one layer don't affect others
- ✅ **Scalability**: Easy to add new features or swap implementations

**Trade-offs:**
- ❌ More boilerplate code compared to monolithic approach
- ✅ **Worth it** because code is more organized and professional

```
Handler (HTTP)  →  Service (Business Logic)  →  Repository (Database)
     ↓                      ↓                         ↓
Gin Context         Domain Logic                  GORM
```

### 2. **Database: SQLite**

**Why SQLite?**
- ✅ **Zero configuration** - no database server needed
- ✅ **Perfect for development and demo**
- ✅ **File-based** - easy to backup and version control
- ✅ **Easy migration path** to PostgreSQL/MySQL (just change driver)

**Trade-offs:**
- ❌ **Not suitable for high-traffic production** (limited concurrent writes)
- ❌ **Single-file limitation**
- ✅ **But perfect for this test** and easily upgradeable

**Production Migration:**
```go
// Just change driver in config/config.go:
// SQLite:
db, err := gorm.Open(sqlite.Open("url_shortener.db"), &gorm.Config{})

// PostgreSQL:
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
```

### 3. **Short Code Generation: NanoID**

**Algorithm:** Random URL-safe string generation with collision detection

**Why NanoID?**
- ✅ **URL-safe alphabet** (no special characters)
- ✅ **Collision-resistant** (8 characters = ~22 million years to 1% collision probability)
- ✅ **Fast and simple**
- ✅ **Industry-proven** (used by many production apps)

**Implementation:**
```go
func generateUniqueCode() (string, error) {
    maxRetries := 5
    for i := 0; i < maxRetries; i++ {
        code, _ := gonanoid.New(8)  // Generate 8-char code
        
        // Check if exists in database
        _, err := repo.FindByShortCode(code)
        if err == gorm.ErrRecordNotFound {
            return code, nil  // Unique!
        }
    }
    return "", errors.New("failed to generate unique code")
}
```

**Alternatives considered:**
- ❌ **Base62 encoding**: Requires counter/sequence (adds complexity)
- ❌ **Hash (MD5/SHA)**: Results too long, needs truncation (collision risk)
- ✅ **NanoID**: Simple, secure, proven

### 4. **Anonymous User System (Production-Ready Feature!)**

**The Problem:**
How do we let users create links without registration, but still allow them to claim ownership later?

**The Solution:**

#### Database Schema:
```sql
CREATE TABLE urls (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NULL,           -- For registered users
    anonymous_id VARCHAR(255) NULL, -- For anonymous users
    short_code VARCHAR(8) UNIQUE,
    original_url TEXT,
    clicks INTEGER DEFAULT 0
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)  -- bcrypt hashed
);
```

#### Flow:

**1. Anonymous User Creates Link:**
```bash
POST /api/shorten
{
  "url": "https://example.com/long"
}

Response:
{
  "short_code": "abc12345",
  "short_url": "http://localhost:8080/abc12345",
  "anonymous_id": "anon-xyz789"  ← Frontend stores this in localStorage/cookie
}
```

**2. User Registers/Logs In:**
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**3. User Claims Their Anonymous Links:**
```bash
POST /api/auth/claim-links
Authorization: Basic am9objpwYXNzd29yZA==
{
  "anonymous_id": "anon-xyz789"
}

Backend executes:
UPDATE urls 
SET user_id = 1, anonymous_id = NULL
WHERE anonymous_id = 'anon-xyz789' AND user_id IS NULL
```

**Why This Approach?**
- ✅ **Production-grade UX**: Like real products (bit.ly, tinyurl)
- ✅ **Great story to tell**: Shows system design thinking
- ✅ **Demonstrates UX awareness**: Users don't lose their links!
- ✅ **Database design skills**: Nullable columns, proper indexing

**Trade-offs:**
- ❌ Slightly more complex than "auth-only"
- ✅ **Massively better for production** and interview discussion

### 5. **Authentication: JWT (JSON Web Tokens) + bcrypt**

**Why JWT?**
- ✅ **Industry standard** for modern web apps
- ✅ **Stateless** - no server-side session storage
- ✅ **Frontend-friendly** - easy to use with React/Vue/Angular
- ✅ **Token expiration** - built-in security with automatic timeout
- ✅ **Refresh tokens** - better UX (15min access + 7day refresh)

**Implementation:**
- ✅ **Access Token**: 15 minutes (for API requests)
- ✅ **Refresh Token**: 7 days (to get new access tokens)
- ✅ **bcrypt** for password hashing (industry standard, cost factor 10)
- ✅ **HS256 signing algorithm** (HMAC-SHA256)
- ✅ **Claims include**: user_id, username, exp, iat, nbf

**Security Best Practices:**
- ✅ **Environment variable** for JWT secret (JWT_SECRET)
- ✅ **Short access token lifetime** (15min reduces hijack window)
- ✅ **Token validation** on every protected request
- ✅ **HTTPS required in production**

**Production Upgrade Path:**
```
JWT → OAuth2 / SSO
(Current)   (Future: Google/GitHub login)
```

### 6. **API Design: RESTful**

**Why REST?**
- ✅ **Standard HTTP methods** (GET, POST, PUT, DELETE)
- ✅ **Widely understood** by all developers
- ✅ **HTTP status codes** for errors (200, 201, 400, 401, 404)
- ✅ **Stateless** - scales horizontally

**Alternatives:**
- ❌ **GraphQL**: Overkill for simple CRUD
- ❌ **gRPC**: Requires protobuf, not web-friendly

---

## 🔍 Handling Edge Cases & Concurrency

### 1. **URL Validation**
```go
func isValidURL(str string) bool {
    u, err := url.Parse(str)
    return err == nil && u.Scheme != "" && u.Host != ""
}
```
- ✅ Must have `scheme` (http/https)
- ✅ Must have `host` (example.com)
- ✅ Prevents invalid inputs

### 2. **Concurrency - Unique Short Code**
**Problem:** Two requests generate same code simultaneously

**Solution:**
- ✅ **Database unique constraint** on `short_code` column
- ✅ **Retry logic** with max attempts (5)
- ✅ **GORM handles DB locking** automatically

```go
type URL struct {
    ShortCode string `gorm:"uniqueIndex;not null"` // ← Database-level constraint
}
```

### 3. **Click Tracking Performance**
**Problem:** Recording clicks shouldn't slow down redirects

**Solution:** **Async increment with goroutine**
```go
func (s *urlService) RedirectAndCount(code string) (string, error) {
    urlEntry, _ := s.repo.FindByShortCode(code)
    
    // Increment asynchronously (non-blocking)
    go s.repo.IncrementClicks(code)
    
    return urlEntry.OriginalURL, nil  // User redirected immediately!
}
```

### 4. **Index Optimization**
```go
type URL struct {
    ShortCode   string  `gorm:"uniqueIndex"` // Fast lookups
    UserID      *uint   `gorm:"index"`       // Fast user queries
    AnonymousID *string `gorm:"index"`       // Fast anonymous queries
}
```

---

## 💪 Challenges & Solutions

### Challenge 1: **Supporting Both Auth & Anonymous Users**
**Problem:** How to handle optional authentication elegantly?

**Solution:** Created `OptionalAuth` middleware
```go
func OptionalAuth() gin.HandlerFunc {
    // If auth header present → validate & set userID
    // If not present → continue anyway (anonymous)
}
```
- ✅ Single endpoint handles both cases
- ✅ Clean separation of concerns

### Challenge 2: **Link Ownership Transfer**
**Problem:** Claiming anonymous links without losing data

**Solution:** Atomic database update
```go
UPDATE urls 
SET user_id = ?, anonymous_id = NULL
WHERE anonymous_id = ? AND user_id IS NULL
```
- ✅ **Atomic operation** prevents race conditions
- ✅ **Preserves clicks** and creation date
- ✅ **Prevents double-claiming** with `user_id IS NULL` check

### Challenge 3: **Password Security**
**Problem:** Never store plain-text passwords

**Solution:** bcrypt with proper cost factor
```go
hashedPassword, _ := bcrypt.GenerateFromPassword(
    []byte(password), 
    bcrypt.DefaultCost  // Cost = 10 (recommended)
)
```

---

## ⚠️ Current Limitations & Future Improvements

### Current Limitations:
- ❌ **No rate limiting** - could be abused
- ❌ **No custom aliases** (e.g., `short.url/my-custom-link`)
- ❌ **No link expiration** feature
- ❌ **Basic analytics** (only click count, no geo/device/referrer data)
- ❌ **No QR code generation**
- ❌ **SQLite not production-ready** for high traffic

### If I Had More Time:
1. **JWT Token Blacklist/Revocation**
   - Redis-based token blacklist for logout
   - Invalidate tokens before expiry
   - Track active sessions

2. **Caching Layer (Redis)**
   - Cache frequently accessed URLs
   - Reduce database load
   - Sub-millisecond response times

3. **Advanced Analytics**
   - User-Agent parsing (device, browser)
   - GeoIP location tracking
   - Referrer tracking
   - Time-series click data

4. **Custom Aliases**
   ```bash
   POST /api/shorten
   {
     "url": "https://example.com",
     "custom_alias": "my-link"  ← User-defined
   }
   ```

5. **Link Expiration**
   ```go
   type URL struct {
       ExpiresAt *time.Time `json:"expires_at"`
   }
   ```

6. **Rate Limiting**
   ```go
   // Per IP or per user
   middleware.RateLimit(100, time.Hour)
   ```

7. **Unit & Integration Tests**
   - Handler tests with mock services
   - Service tests with mock repositories
   - Integration tests with test database

7. **CI/CD Pipeline**
   - GitHub Actions for automated testing
   - Docker image building
   - Automated deployment

---

## 🎯 Development Progress

- [x] Initialize project structure
- [x] Implement Clean Architecture (3 layers)
- [x] Setup database with GORM
- [x] Implement URL shortening logic
- [x] Add NanoID generation with collision detection
- [x] Implement redirect with click tracking
- [x] Add user authentication system
- [x] Implement anonymous user support
- [x] Add link claiming functionality
- [x] Setup Swagger documentation
- [x] Add proper error handling
- [x] Implement input validation
- [x] Add database indexes
- [x] Migrate to secure cookie storage (replaced localStorage)
- [x] Add automatic token refresh on 401 errors
- [x] Implement CORS configuration for frontend
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add rate limiting
- [ ] Deploy to cloud platform

---

## 📄 License

MIT
