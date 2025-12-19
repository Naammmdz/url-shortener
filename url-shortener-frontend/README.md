# URL Shortener Frontend

A clean, minimal frontend for a URL shortener service built with Next.js and HeroUI.

## Features

- **Authentication**: Login and registration with custom backend API
- **Create Short URLs**: Input a long URL and get a shortened version
- **Copy to Clipboard**: Quick copy button for generated short URLs
- **List All URLs**: View all shortened URLs in a table with:
  - Short URL code
  - Original URL
  - Click count
  - Creation timestamp
- **Link Details**: Click to view detailed information about any link
- **Responsive Design**: Works on desktop and mobile devices
- **Loading & Error States**: Proper feedback for all async operations

## Prerequisites

- Node.js 18+ installed
- Backend API running (or mock API setup)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Base URL

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Replace `http://localhost:3000` with your actual backend API URL.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Contract

The frontend expects the following REST API endpoints:

### Authentication

#### POST /auth/register
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Login an existing user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### Links

#### POST /api/links
Create a new short URL

**Request:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "code": "abc123",
  "url": "https://example.com/very/long/url",
  "clicks": 0,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### GET /api/links
List all shortened URLs

**Response:**
```json
[
  {
    "code": "abc123",
    "url": "https://example.com/very/long/url",
    "clicks": 5,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

#### GET /api/links/{code}
Get details for a specific short link

**Response:**
```json
{
  "code": "abc123",
  "url": "https://example.com/very/long/url",
  "clicks": 5,
  "createdAt": "2025-01-01T00:00:00Z",
  "lastAccessedAt": "2025-01-02T00:00:00Z"
}
```

## Project Structure

```
├── app/
│   ├── page.tsx              # Main page (protected)
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── create-short-url.tsx  # URL creation form
│   ├── url-list.tsx          # Table of all URLs
│   ├── link-detail.tsx       # Detailed link view modal
│   ├── login-form.tsx        # Login form component
│   ├── register-form.tsx     # Registration form component
│   ├── protected-route.tsx   # Route protection wrapper
│   └── user-menu.tsx         # User dropdown menu
├── contexts/
│   └── auth-context.tsx      # Authentication context provider
├── types/
│   ├── link.ts               # Link TypeScript types
│   └── auth.ts               # Auth TypeScript types
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: HeroUI v3
- **Icons**: lucide-react
- **Language**: TypeScript

## Building for Production

```bash
npm run build
npm start
```

## Notes

- Authentication uses JWT tokens stored in localStorage
- Protected routes redirect unauthenticated users to /login
- The backend handles all URL redirects
- All API calls use standard fetch with proper error handling
- The UI is developer-oriented with a clean, minimal design
