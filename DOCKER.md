# URL Shortener - Docker Deployment

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Build and start all services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080
- Frontend on port 3000

### 2. Check service status

```bash
docker-compose ps
```

### 3. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Stop services

```bash
docker-compose down
```

### 5. Stop and remove volumes (deletes data)

```bash
docker-compose down -v
```

## Environment Variables

You can customize the deployment by creating a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=urlshortener
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Backend
JWT_SECRET=your-super-secret-jwt-key
SERVER_PORT=8080

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Production Deployment

### 1. Update environment variables

Edit `docker-compose.yml` and update:
- `JWT_SECRET` - Use a strong random secret
- `POSTGRES_PASSWORD` - Use a strong password
- `CORS_ALLOWED_ORIGINS` - Add your production domain

### 2. Build for production

```bash
docker-compose build --no-cache
```

### 3. Start services

```bash
docker-compose up -d
```

### 4. Health checks

Backend health endpoint:
```bash
curl http://localhost:8080/health
```

## Database Access

### Connect to PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d urlshortener
```

### Backup database

```bash
docker-compose exec postgres pg_dump -U postgres urlshortener > backup.sql
```

### Restore database

```bash
docker-compose exec -T postgres psql -U postgres -d urlshortener < backup.sql
```

## Troubleshooting

### Backend can't connect to database

Check if PostgreSQL is healthy:
```bash
docker-compose exec postgres pg_isready -U postgres
```

### Frontend can't connect to backend

Check backend logs:
```bash
docker-compose logs backend
```

Verify CORS settings in `docker-compose.yml`.

### Port conflicts

If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Change host port
```

## Development vs Production

### Development (SQLite)
```bash
cd url-shortener-backend
go run cmd/server/main.go
```

### Production (PostgreSQL + Docker)
```bash
docker-compose up -d
```

The backend automatically detects the database type based on `DB_HOST` environment variable.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend  │────▶│   Backend   │
│  (Port 80)  │     │  (Port 3000)│     │ (Port 8080) │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                        ┌─────────────┐
                                        │  PostgreSQL │
                                        │ (Port 5432) │
                                        └─────────────┘
```

## Volumes

- `postgres_data` - Persistent PostgreSQL data

## Networks

- `url-shortener-network` - Internal bridge network for service communication
