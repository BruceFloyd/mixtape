# 🎵 Mixtape Setup Guide

This guide will walk you through setting up the Mixtape app from scratch. Follow each step carefully!

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Spotify Developer Account Setup](#spotify-developer-account-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

1. **Node.js 18 or higher**
   - Download from: https://nodejs.org/
   - Verify installation: \`node --version\`
   - Should output: v18.x.x or higher

2. **npm** (comes with Node.js)
   - Verify installation: \`npm --version\`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: \`git --version\`

### Required Accounts

1. **Spotify Premium Account**
   - The Web Playback SDK requires Premium
   - Sign up at: https://www.spotify.com/premium/

2. **Spotify Developer Account**
   - Sign up at: https://developer.spotify.com/dashboard
   - Use your existing Spotify account

---

## Spotify Developer Account Setup

### Step 1: Create a Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click **"Create app"** button
4. Fill in the form:

   \`\`\`
   App name: Mixtape
   App description: Create and share musical mixtapes as retro cassette tapes
   Website: http://localhost:5173
   Redirect URI: http://localhost:3000/api/auth/callback
   \`\`\`

5. Check the boxes:
   - ✅ Web API
   - ✅ Web Playback SDK

6. Click **"Save"**

### Step 2: Get Your Credentials

1. Click on your newly created app
2. Click **"Settings"** in the top right
3. You'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "View client secret" and copy

4. Keep these safe! You'll need them in the next step.

### Step 3: Verify Redirect URI

1. In Settings, scroll to **"Redirect URIs"**
2. Make sure you see: \`http://localhost:3000/api/auth/callback\`
3. If not, click **"Edit"** and add it

---

## Backend Setup

### Step 1: Navigate to Backend Directory

\`\`\`bash
cd backend
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install:
- express
- cors
- dotenv
- axios
- cookie-parser
- uuid
- better-sqlite3

### Step 3: Create Environment File

\`\`\`bash
cp .env.example .env
\`\`\`

### Step 4: Configure Environment Variables

Open \`.env\` in your text editor and fill in:

\`\`\`env
# Paste your Spotify credentials here
SPOTIFY_CLIENT_ID=YOUR_CLIENT_ID_HERE
SPOTIFY_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# These should work as-is for local development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
REDIRECT_URI=http://localhost:3000/api/auth/callback

# Generate a random string for session secret
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_random_secret_here

PORT=3000
\`\`\`

### Step 5: Generate Session Secret (Optional but recommended)

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

Copy the output and paste it as your \`SESSION_SECRET\`.

### Step 6: Test Backend

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
🎵 Mixtape backend running on http://localhost:3000
🎵 Make sure to set up your .env file with Spotify credentials
\`\`\`

Test the health endpoint:
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

Should return: \`{"status":"ok","message":"Mixtape API is running!"}\`

Keep this terminal window open!

---

## Frontend Setup

### Step 1: Open New Terminal

Keep the backend running and open a new terminal window.

### Step 2: Navigate to Frontend Directory

\`\`\`bash
cd frontend
\`\`\`

### Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install:
- react
- react-dom
- react-router-dom
- axios
- vite
- @vitejs/plugin-react

### Step 4: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
\`\`\`

---

## Running the Application

### You should now have TWO terminal windows running:

1. **Terminal 1 (Backend)**: Running on http://localhost:3000
2. **Terminal 2 (Frontend)**: Running on http://localhost:5173

### Open Your Browser

Navigate to: **http://localhost:5173**

You should see the Mixtape home page with:
- An animated cassette tape
- "Connect with Spotify" button
- Features section

---

## Testing

### Test 1: Spotify Authentication

1. Click **"Connect with Spotify"**
2. You'll be redirected to Spotify's login page
3. Log in with your Spotify account
4. Grant permissions to the app
5. You should be redirected back to the Create page

### Test 2: Search Functionality

1. In the search box, type a song name (e.g., "Bohemian Rhapsody")
2. Press Enter or click Search
3. You should see search results with album art

### Test 3: Create a Mixtape

1. Add 5-10 tracks to your mixtape
2. Enter a title (e.g., "Road Trip Vibes")
3. Add an optional message
4. Click **"Create Mixtape"**
5. You should see a success screen with a shareable link

### Test 4: Play a Mixtape

1. Copy the mixtape link
2. Open it in a new tab (or share with a friend)
3. Click the Play button
4. Music should start playing through your Spotify account

---

## Common Issues

### Issue: "Premium Required" Error

**Problem**: Free Spotify accounts cannot use the Web Playback SDK.

**Solution**: Upgrade to Spotify Premium at https://www.spotify.com/premium/

### Issue: Authentication Fails

**Problem**: Redirected back with an error after Spotify login.

**Solution**:
1. Check that your redirect URI in Spotify Dashboard exactly matches:
   \`http://localhost:3000/api/auth/callback\`
2. Make sure your Client ID and Secret are correct in \`.env\`
3. Clear your browser cookies and try again

### Issue: Backend Won't Start

**Problem**: Port 3000 is already in use.

**Solution**:
1. Find what's using port 3000:
   \`\`\`bash
   # On Mac/Linux
   lsof -i :3000

   # On Windows
   netstat -ano | findstr :3000
   \`\`\`
2. Kill that process or change the port in \`.env\`

### Issue: Frontend Won't Start

**Problem**: Port 5173 is already in use.

**Solution**:
1. Vite will automatically try the next available port
2. Or manually specify: \`npm run dev -- --port 5174\`
3. Update \`FRONTEND_URL\` in backend \`.env\` accordingly

### Issue: Database Errors

**Problem**: SQLite errors on startup.

**Solution**:
\`\`\`bash
cd backend
rm -rf db/*.db  # Delete existing database
npm run dev      # Restart - database will be recreated
\`\`\`

### Issue: Player Not Initializing

**Problem**: Cassette shows but music won't play.

**Solutions**:
1. Make sure you have Spotify Premium
2. Open browser DevTools (F12) and check Console for errors
3. Try closing other Spotify apps/browser tabs
4. Refresh the page
5. Log out and log back in

### Issue: Search Returns No Results

**Problem**: Search bar returns empty results.

**Solutions**:
1. Check that backend is running
2. Check browser Network tab for API errors
3. Verify your access token hasn't expired (log out and back in)
4. Check backend logs for Spotify API errors

### Issue: CORS Errors

**Problem**: Browser shows CORS policy errors.

**Solutions**:
1. Make sure backend is running on port 3000
2. Verify \`FRONTEND_URL\` in backend \`.env\` is correct
3. Clear browser cache
4. Restart both servers

---

## Next Steps

### Production Deployment

See the main README.md for deployment instructions.

### Customization

- **Colors**: Edit \`/frontend/src/index.css\`
- **Cassette Design**: Edit \`/frontend/src/components/Cassette.jsx\`
- **Features**: Add new routes in backend and frontend

### Database Management

The SQLite database is stored at:
\`\`\`
/backend/db/mixtapes.db
\`\`\`

You can view it with tools like:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer (VS Code extension)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

---

## Support

If you're still having issues:

1. Check the [Troubleshooting](#common-issues) section above
2. Review [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
3. Check browser console (F12) for error messages
4. Check backend terminal for error logs

---

**Happy mixtaping! 🎵**
