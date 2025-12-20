# ⚠️ GO VERSION WARNING

## Current Setup
- **go.mod:** Go 1.22 (locked for Docker compatibility)
- **Dockerfile:** golang:1.22-alpine
- **Local Go:** 1.25.5 (development version)

## IMPORTANT: DO NOT run `go mod tidy` without constraints!

Your local Go 1.25.5 will automatically upgrade `go.mod` to 1.24.0, breaking Docker builds.

### Safe Commands:
```bash
# Always use GOTOOLCHAIN=local
GOTOOLCHAIN=local go mod tidy

# Or use Docker for dependency management
docker run --rm -v "$PWD":/app -w /app golang:1.22-alpine go mod tidy
```

### Why This Matters:
- Docker images only have stable Go releases (currently 1.22)
- Go 1.24+ doesn't exist yet in official images
- Local go mod tidy detects your 1.25.5 and sets incompatible version

### Fix If Broken:
```bash
# Reset go.mod to 1.22
sed -i '' 's/go 1\.[0-9]*/go 1.22/' go.mod
GOTOOLCHAIN=local go mod tidy
```
