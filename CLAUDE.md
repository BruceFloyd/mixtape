# CLAUDE.md - AI Assistant Guide for Mixtape Project

This document provides comprehensive information about the Mixtape codebase for AI assistants working on this project.

## Project Overview

**Mixtape** is a Spotify-powered web application that allows users to create and share musical mixtapes presented as animated retro cassette tapes. Users can search Spotify's music library, curate playlists, and share them through a nostalgic cassette player interface.

**Core Features:**
- Spotify OAuth authentication
- Track search using Spotify Web API
- Retro cassette UI with spinning reels animation
- Web playback using Spotify's Web Playback SDK (requires Premium)
- Shareable mixtape links with unique slugs
- Mobile responsive design
- Dual database support (PostgreSQL/SQLite)

## Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.20.1** - Client-side routing
- **Axios 1.6.2** - HTTP client for API calls
- **Spotify Web Playback SDK** - Music streaming (CDN loaded)

### Backend
- **Node.js (ESM modules)** - Runtime environment
- **Express 4.18.2** - Web server framework
- **PostgreSQL** (pg 8.11.3) - Production database
- **SQLite** (better-sqlite3 9.2.2) - Local development database
- **Axios 1.6.2** - HTTP client for Spotify API
- **cookie-parser 1.4.6** - Cookie handling
- **uuid 9.0.1** - Unique ID generation

### Deployment Stack
- **Railway** - Backend hosting + PostgreSQL
- **Vercel** - Frontend hosting + CDN

## Repository Structure

```
mixtape/
├── backend/                      # Express.js backend
│   ├── db/
│   │   └── database.js          # Database layer (dual SQLite/PostgreSQL)
│   ├── routes/
│   │   ├── auth.js              # Spotify OAuth routes
│   │   ├── mixtapes.js          # Mixtape CRUD operations
│   │   └── spotify.js           # Spotify API proxy routes
│   ├── server.js                # Express server entry point
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   ├── .env.production.example  # Production env template
│   └── railway.json             # Railway deployment config
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cassette.jsx    # Cassette player component
│   │   │   └── Cassette.css    # Cassette styling
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Create.jsx      # Mixtape creation interface
│   │   │   ├── MixtapePlayer.jsx # Playback page
│   │   │   └── MyMixtapes.jsx  # User's mixtape gallery
│   │   ├── utils/
│   │   │   ├── api.js          # Axios API client wrapper
│   │   │   └── spotify.js      # Spotify SDK utilities
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles + CSS variables
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Frontend dependencies
│   └── .env.production.example # Production env template
├── package.json                 # Root package.json (workspace scripts)
├── README.md                    # User-facing documentation
├── DEPLOYMENT.md                # Detailed deployment guide
├── SETUP_GUIDE.md               # Local setup instructions
└── .gitignore                   # Git ignore rules
```

## Key Architecture Patterns

### 1. Database Abstraction Layer

**Location:** `backend/db/database.js`

The database layer automatically switches between SQLite (development) and PostgreSQL (production) based on environment:

```javascript
// Detection logic
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
```

**Key Functions:**
- `createMixtape(mixtape)` - Insert new mixtape
- `getMixtapeBySlug(slug)` - Retrieve by URL slug
- `getMixtapeById(id)` - Retrieve by UUID
- `getUserMixtapes(userId)` - Get all user's mixtapes
- `incrementPlayCount(id)` - Track plays
- `saveUser(user)` - Upsert user record
- `getUser(spotifyId)` - Retrieve user
- `updateUserTokens(spotifyId, accessToken, refreshToken, expiresAt)` - Refresh tokens

**Important:** All functions handle both DB types internally. JSON fields (track_uris, track_data) are stringified for storage and parsed on retrieval.

### 2. Database Schema

#### `mixtapes` Table
```sql
id             TEXT PRIMARY KEY      -- UUID v4
slug           TEXT UNIQUE NOT NULL  -- URL-friendly identifier
title          TEXT NOT NULL         -- Mixtape title
message        TEXT                  -- Optional dedication message
creator_id     TEXT NOT NULL         -- Spotify user ID
creator_name   TEXT                  -- Display name
track_uris     TEXT NOT NULL         -- JSON array of Spotify URIs
track_data     TEXT NOT NULL         -- JSON array with track metadata
color_theme    TEXT                  -- UI color theme (default: 'retro')
created_at     BIGINT NOT NULL       -- Unix timestamp
play_count     INTEGER DEFAULT 0     -- Number of plays
```

#### `users` Table
```sql
spotify_id        TEXT PRIMARY KEY   -- Spotify user ID
display_name      TEXT               -- User's display name
email             TEXT               -- User email
profile_image     TEXT               -- Avatar URL
access_token      TEXT               -- Current OAuth access token
refresh_token     TEXT               -- OAuth refresh token
token_expires_at  BIGINT            -- Token expiration timestamp
created_at        BIGINT NOT NULL    -- User creation timestamp
```

### 3. Authentication Flow

**Implementation:** `backend/routes/auth.js`

1. **Login:** `GET /api/auth/login`
   - Redirects to Spotify OAuth with required scopes
   - Scopes: user-read-private, user-read-email, streaming, user-read-playback-state, user-modify-playback-state, playlist-read-private

2. **Callback:** `GET /api/auth/callback`
   - Receives auth code from Spotify
   - Exchanges for access/refresh tokens
   - Saves user to database
   - Sets HTTP-only cookie with user data
   - Redirects to frontend

3. **Session Check:** `GET /api/auth/me`
   - Returns current user from cookie
   - Frontend polls this on mount

4. **Token Refresh:** `POST /api/auth/refresh`
   - Uses refresh token to get new access token
   - Updates database and cookie

5. **Logout:** `POST /api/auth/logout`
   - Clears auth cookie

**Cookie Format:**
```javascript
{
  userId: 'spotify_user_id',
  accessToken: 'BQC...',
  refreshToken: 'AQB...',
  expiresAt: 1234567890000,
  displayName: 'User Name'
}
```

### 4. Frontend Routing

**Location:** `frontend/src/App.jsx`

```javascript
/                    → Home.jsx (landing page)
/create              → Create.jsx (mixtape builder)
/mixtapes/my         → MyMixtapes.jsx (user's mixtapes)
/m/:slug             → MixtapePlayer.jsx (playback page)
```

### 5. State Management

**Auth State:** `frontend/src/context/AuthContext.jsx`

Provides global authentication state using React Context:
- `user` - Current user object or null
- `loading` - Boolean for async auth checks
- `login()` - Redirect to OAuth
- `logout()` - Clear session
- `checkAuth()` - Verify current session

**Usage in components:**
```javascript
import { useAuth } from '../context/AuthContext';
const { user, loading, login, logout } = useAuth();
```

### 6. API Client Pattern

**Location:** `frontend/src/utils/api.js`

Centralized Axios instance with:
- Base URL from env: `import.meta.env.VITE_API_URL`
- `withCredentials: true` for cookie auth
- Automatic error handling

**Example Usage:**
```javascript
import api from '../utils/api';
const mixtape = await api.get(`/api/mixtapes/${slug}`);
```

## API Routes Reference

### Authentication (`/api/auth/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/login` | Initiate Spotify OAuth | No |
| GET | `/api/auth/callback` | OAuth callback handler | No |
| GET | `/api/auth/me` | Get current user | Yes (cookie) |
| POST | `/api/auth/refresh` | Refresh access token | Yes (cookie) |
| POST | `/api/auth/logout` | Clear session | Yes (cookie) |

### Spotify Proxy (`/api/spotify/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/spotify/search?q={query}` | Search tracks | Yes |
| GET | `/api/spotify/playlists` | Get user's playlists | Yes |
| GET | `/api/spotify/playlists/:id/tracks` | Get playlist tracks | Yes |

### Mixtapes (`/api/mixtapes/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/mixtapes` | Create new mixtape | Yes |
| GET | `/api/mixtapes/:slug` | Get mixtape by slug | No |
| POST | `/api/mixtapes/:id/play` | Increment play count | No |
| GET | `/api/mixtapes/user/mine` | Get user's mixtapes | Yes |

## Environment Variables

### Backend (`backend/.env`)

```bash
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# URLs
FRONTEND_URL=http://localhost:5173              # Dev: localhost, Prod: Vercel URL
BACKEND_URL=http://localhost:3000               # Dev: localhost, Prod: Railway URL
REDIRECT_URI=http://localhost:3000/api/auth/callback

# Security
SESSION_SECRET=random_32_character_string       # Generate unique secret

# Server
PORT=3000
NODE_ENV=development                            # 'production' in deployment

# Database (production only)
DATABASE_URL=postgresql://...                   # Auto-set by Railway
```

### Frontend (`frontend/.env`)

```bash
# API endpoint
VITE_API_URL=http://localhost:3000             # Dev: localhost, Prod: Railway URL
```

**Important:** Vite env vars must be prefixed with `VITE_` to be exposed to client.

## Development Workflow

### Initial Setup

```bash
# Install all dependencies
npm run install:all

# Configure environment
cd backend && cp .env.example .env
# Edit backend/.env with Spotify credentials

# Start development servers (requires 2 terminals)
npm run dev:backend   # Terminal 1 - runs on :3000
npm run dev:frontend  # Terminal 2 - runs on :5173
```

### Development Servers

**Backend:** `nodemon` watches for changes and auto-restarts
**Frontend:** Vite HMR (Hot Module Replacement) for instant updates

### Making Changes

#### Backend Changes

1. **Adding Routes:**
   - Create/modify files in `backend/routes/`
   - Import and mount in `backend/server.js`
   - Follow existing auth middleware patterns

2. **Database Changes:**
   - Modify schema in `backend/db/database.js`
   - Update both SQLite and PostgreSQL init functions
   - Handle both sync (SQLite) and async (PostgreSQL) operations
   - Delete `backend/db/mixtapes.db` to reset local DB

3. **API Integration:**
   - Use Axios for external calls
   - Handle token refresh in auth routes
   - Proxy Spotify API calls to avoid CORS

#### Frontend Changes

1. **Adding Pages:**
   - Create in `frontend/src/pages/`
   - Include both `.jsx` and `.css` files
   - Add route to `frontend/src/App.jsx`

2. **Adding Components:**
   - Create in `frontend/src/components/`
   - Use functional components with hooks
   - Keep styles in separate `.css` files

3. **Styling:**
   - CSS variables defined in `frontend/src/index.css`
   - Component-specific styles in component `.css` files
   - Mobile-first responsive design

### Code Style Conventions

**Backend:**
- ES6 modules (`import`/`export`)
- Async/await for asynchronous operations
- Express route handlers with error handling
- Cookie-based authentication (HTTP-only)

**Frontend:**
- Functional React components
- Hooks (useState, useEffect, useContext)
- Axios for API calls with `.then()/.catch()` or async/await
- React Router for navigation

**General:**
- Clear, descriptive variable names
- Comments for complex logic
- Error messages with helpful context

## Common Tasks

### Adding a New API Endpoint

1. Create route handler in appropriate file (`backend/routes/`)
2. Add authentication middleware if needed
3. Implement database operations via `database.js`
4. Update this documentation with new endpoint

### Adding a New Page

1. Create `PageName.jsx` and `PageName.css` in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add navigation links where appropriate

### Updating Spotify Scopes

1. Modify scopes array in `backend/routes/auth.js` (login route)
2. Users must re-authenticate to grant new permissions
3. Update Spotify Developer Dashboard if needed

### Database Migration

**Development (SQLite):**
```bash
cd backend
rm db/mixtapes.db  # Deletes database
npm run dev        # Recreates with new schema
```

**Production (PostgreSQL):**
- Update `initPostgres()` in `database.js`
- Railway auto-runs on deploy
- Existing data persists (only adds new tables/columns)

## Deployment

### Production Architecture

```
User Browser
    ↓
Vercel (Frontend) ← VITE_API_URL
    ↓
Railway (Backend) ← FRONTEND_URL (CORS)
    ↓
Railway PostgreSQL
    ↓
Spotify API
```

### Deployment Checklist

**Before Deploying:**
- [ ] Test locally with production-like environment
- [ ] Update Spotify redirect URIs in Developer Dashboard
- [ ] Generate secure SESSION_SECRET
- [ ] Review CORS settings in backend

**Backend (Railway):**
1. Connect GitHub repository
2. Set root directory to `backend`
3. Add PostgreSQL database (auto-configures DATABASE_URL)
4. Set all environment variables
5. Generate public domain
6. Update BACKEND_URL and REDIRECT_URI with Railway domain

**Frontend (Vercel):**
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add VITE_API_URL environment variable with Railway URL

**Post-Deployment:**
1. Update Spotify app settings with production URLs
2. Update Railway FRONTEND_URL with Vercel URL
3. Test full OAuth flow
4. Test mixtape creation and playback

See `DEPLOYMENT.md` for detailed step-by-step instructions.

## Important Files

### Configuration Files

- **`backend/railway.json`** - Railway deployment config (root directory, build command)
- **`frontend/vite.config.js`** - Vite config with proxy for local dev
- **`.gitignore`** - Excludes node_modules, .env, .db, build outputs

### Core Business Logic

- **`backend/routes/auth.js`** - OAuth flow, session management (165 lines)
- **`backend/db/database.js`** - Database abstraction layer (304 lines)
- **`frontend/src/pages/Create.jsx`** - Mixtape builder UI (290+ lines)
- **`frontend/src/pages/MixtapePlayer.jsx`** - Spotify Web Playback integration (240+ lines)
- **`frontend/src/components/Cassette.jsx`** - Animated cassette UI (120+ lines)

### Utilities

- **`frontend/src/utils/spotify.js`** - Spotify SDK initialization and player management
- **`frontend/src/utils/api.js`** - Axios configuration and error handling

## Testing & Debugging

### Local Testing

**Backend Health Check:**
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","message":"Mixtape API is running!"}
```

**Database Verification:**
```bash
# SQLite (local)
cd backend/db
sqlite3 mixtapes.db
.tables  # Should show: mixtapes, users
.schema mixtapes
```

**Frontend Build:**
```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

### Common Debugging Scenarios

**OAuth Redirect Issues:**
1. Check redirect URI matches exactly in Spotify Dashboard
2. Verify REDIRECT_URI env var matches
3. Check browser network tab for 400 errors

**CORS Errors:**
1. Verify FRONTEND_URL is set correctly in backend
2. Check `credentials: true` in both Axios config and Express CORS
3. Ensure cookies are being sent (`withCredentials`)

**Player Not Working:**
1. Verify Spotify Premium account
2. Check access token validity
3. Look for Web Playback SDK errors in browser console
4. Ensure streaming scope is granted

**Database Connection Failed:**
- Check DATABASE_URL format
- Verify PostgreSQL service is running (Railway)
- Check for query syntax differences (SQLite vs PostgreSQL)

## Security Considerations

### Current Implementation

1. **HTTP-only Cookies** - Prevents XSS attacks on tokens
2. **CORS Configuration** - Restricts cross-origin requests
3. **Environment Variables** - Secrets not in code
4. **Token Refresh** - Short-lived access tokens

### Known Limitations

1. **Session Secret** - Same secret across all instances (consider signed JWTs for scaling)
2. **CSRF Protection** - Not implemented (consider adding for production)
3. **Rate Limiting** - Not implemented (consider for API routes)
4. **Input Validation** - Basic validation only (consider adding schema validation)

### Best Practices for Contributors

- Never commit `.env` files
- Never log sensitive data (tokens, secrets)
- Validate and sanitize user input
- Use parameterized queries (already implemented in database.js)
- Keep dependencies updated for security patches

## Troubleshooting Guide

### "Premium Required" Error
- Spotify Web Playback SDK only works with Premium accounts
- No workaround available
- Suggest user upgrade or use Spotify app

### Database Locked (SQLite)
- Only occurs in development
- Close any database browser tools
- Restart backend server

### Build Failures

**Vite Build:**
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

**Railway Deploy:**
- Check build logs for errors
- Verify root directory is set to `backend`
- Ensure all env vars are set

### Token Expired Issues
- Implement automatic refresh before API calls
- Check token_expires_at timestamp
- Use refresh token to get new access token

## AI Assistant Guidelines

When working on this codebase:

1. **Preserve Dual Database Support** - Always update both SQLite and PostgreSQL code paths in `database.js`

2. **Maintain Authentication Pattern** - Use cookie-based auth, don't switch to headers/localStorage

3. **Follow File Structure** - Keep routes, components, and pages separated by concern

4. **Environment Variables** - Never hardcode values, always use env vars with examples

5. **Error Handling** - Provide user-friendly error messages, log technical details server-side

6. **Testing Changes** - Test both development and production configurations when modifying:
   - Database code (SQLite + PostgreSQL)
   - Environment-dependent code
   - OAuth flows
   - API endpoints

7. **Documentation** - Update this file when making architectural changes

8. **Git Workflow** - Feature branch: `claude/claude-md-mi3n1mzm9yio6uwd-01YKa5tkp9Hz6sSsMcKLVAhC`

## Quick Reference Commands

```bash
# Install dependencies
npm run install:all

# Development
npm run dev:backend      # Start backend on :3000
npm run dev:frontend     # Start frontend on :5173

# Production builds
npm run build:frontend   # Build frontend for deployment
npm run start:backend    # Start backend in production mode

# Database reset (local only)
rm backend/db/mixtapes.db && npm run dev:backend

# Test production build locally
cd frontend && npm run preview
```

## Additional Resources

- **Spotify Web API Docs:** https://developer.spotify.com/documentation/web-api
- **Spotify Web Playback SDK:** https://developer.spotify.com/documentation/web-playback-sdk
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Router:** https://reactrouter.com

---

**Last Updated:** November 17, 2025
**Maintained for:** AI Assistants (Claude, etc.)
**Version:** 1.0.0
