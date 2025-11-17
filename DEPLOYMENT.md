# 🚀 Deployment Guide - Railway + Vercel

This guide will walk you through deploying your Mixtape app to production using Railway (backend) and Vercel (frontend). Both platforms offer free tiers!

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ A GitHub account (for connecting to Railway/Vercel)
- ✅ Your code pushed to a GitHub repository
- ✅ Spotify Developer App created with Client ID and Secret
- ✅ Tested the app locally and confirmed it works

---

## Part 1: Deploy Backend to Railway

### Step 1: Sign Up for Railway

1. Go to [Railway.app](https://railway.app/)
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `mixtape` repository
4. Railway will detect it's a Node.js project

### Step 3: Configure the Backend Service

1. After deployment starts, click on your project
2. Click on the service that was created
3. Go to **Settings** → **Root Directory**
4. Set to: `backend`
5. Click **"Save"**

### Step 4: Add PostgreSQL Database

1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a database and connect it automatically
4. The `DATABASE_URL` environment variable will be auto-populated

### Step 5: Set Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NODE_ENV=production
SESSION_SECRET=generate_random_32_char_string
PORT=3000
```

**Important**: Don't set `FRONTEND_URL`, `BACKEND_URL`, or `REDIRECT_URI` yet - we'll do that after getting your URLs!

### Step 6: Get Your Backend URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://your-app.up.railway.app`
4. **Copy this URL** - you'll need it!

### Step 7: Update Environment Variables

Go back to **Variables** and add:

```env
BACKEND_URL=https://your-app.up.railway.app
REDIRECT_URI=https://your-app.up.railway.app/api/auth/callback
```

**Note**: We'll add `FRONTEND_URL` after deploying to Vercel.

### Step 8: Update Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app → **Settings**
3. **Redirect URIs** → **Edit**
4. Add your new redirect URI: `https://your-app.up.railway.app/api/auth/callback`
5. Click **"Add"** → **"Save"**

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to [Vercel.com](https://vercel.com/)
2. Click **"Start Deploying"**
3. Sign up with GitHub
4. Authorize Vercel to access your repositories

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `mixtape` repository and click **"Import"**
3. Vercel will detect it's a Vite project

### Step 3: Configure Build Settings

1. **Root Directory**: Set to `frontend`
2. **Framework Preset**: Vite (auto-detected)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `dist` (auto-filled)

### Step 4: Set Environment Variables

1. Expand **"Environment Variables"**
2. Add this variable:

```env
VITE_API_URL=https://your-app.up.railway.app
```

Replace with your actual Railway backend URL from Part 1, Step 6.

3. Click **"Deploy"**

### Step 5: Get Your Frontend URL

1. After deployment completes (2-3 minutes), you'll see:
   - **"Visit"** button
   - Your live URL: `https://your-app.vercel.app`
2. **Copy this URL**!

### Step 6: Update Backend with Frontend URL

1. Go back to **Railway**
2. Open your backend service
3. Go to **Variables**
4. Add/Update:

```env
FRONTEND_URL=https://your-app.vercel.app
```

5. Railway will automatically redeploy with the new variable

### Step 7: Update Spotify App (Again)

1. Go back to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app → **Settings**
3. Update **Website** to: `https://your-app.vercel.app`
4. Click **"Save"**

---

## Part 3: Test Your Deployment

### 1. Visit Your App

Open your Vercel URL: `https://your-app.vercel.app`

You should see the home page with the animated cassette!

### 2. Test Authentication

1. Click **"Connect with Spotify"**
2. You should be redirected to Spotify login
3. After login, you should be redirected back to your app

### 3. Test Creating a Mixtape

1. Search for songs
2. Add a few tracks
3. Create a mixtape
4. You should get a shareable link

### 4. Test Playback

1. Open the mixtape link
2. Click **Play**
3. Music should stream through Spotify

### 5. Check for Errors

If anything doesn't work:

1. Open browser DevTools (F12) → Console
2. Check Railway logs: **Deployments** → **View Logs**
3. Check Vercel logs: **Deployments** → **Functions**

---

## 🔧 Troubleshooting

### Backend Won't Start

**Check Railway Logs:**
1. Go to Railway → Your Service → **Deployments**
2. Click on latest deployment → **View Logs**
3. Look for errors

**Common Issues:**
- Missing environment variables
- Database connection failed
- Port binding error (Railway handles this automatically, but check `PORT=3000` is set)

### Frontend Can't Connect to Backend

**Check these:**
1. ✅ `VITE_API_URL` is set in Vercel
2. ✅ CORS is allowing your Vercel domain
3. ✅ Backend is actually running (check Railway status)

**Fix:**
- Redeploy frontend after updating `VITE_API_URL`
- Check browser Network tab for CORS errors

### Spotify Login Fails

**Check these:**
1. ✅ Redirect URI matches exactly in Spotify Dashboard
2. ✅ `REDIRECT_URI` environment variable is correct in Railway
3. ✅ Client ID and Secret are correct

**Common mistake:**
```
❌ http://your-app.up.railway.app  (missing https)
✅ https://your-app.up.railway.app
```

### Database Connection Error

**In Railway:**
1. Make sure PostgreSQL service is running
2. Check `DATABASE_URL` is automatically set
3. Try redeploying the backend

### 500 Internal Server Error

1. Check Railway logs for stack trace
2. Usually means a database query failed
3. Make sure PostgreSQL is connected

---

## 🔄 Updating Your App

### After Making Code Changes:

**Method 1: Automatic (Recommended)**
```bash
git add .
git commit -m "Description of changes"
git push
```

Both Railway and Vercel will auto-deploy! ✨

**Method 2: Manual Redeploy**
- Railway: Go to **Deployments** → Click **"Deploy"**
- Vercel: Go to **Deployments** → Click **"Redeploy"**

### Database Migrations

If you change the database schema:

1. Railway PostgreSQL persists data across deploys
2. Update `database.js` with new schema
3. Deploy - tables will be created automatically
4. Old data remains intact

---

## 💰 Free Tier Limits

### Railway (Free Tier)
- $5 free credit per month
- Enough for ~500 hours of runtime
- 1GB RAM, 1 vCPU
- PostgreSQL: 1GB storage

**Upgrading:**
- $5/month for more resources
- Add credit card to remove limits

### Vercel (Free Tier)
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions included
- Custom domains supported

**Upgrading:**
- $20/month Pro plan for more bandwidth
- Team features

---

## 🎯 Next Steps

### Custom Domain (Optional)

**For Vercel (Frontend):**
1. Vercel → **Settings** → **Domains**
2. Add your domain (e.g., `mixtape.fm`)
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in Railway

**For Railway (Backend):**
1. Railway → **Settings** → **Networking**
2. Add custom domain
3. Update DNS records
4. Update Spotify redirect URI

### Enable HTTPS Everywhere

Both Railway and Vercel automatically provide SSL certificates!

### Monitoring

**Railway:**
- View logs in real-time
- Check CPU/Memory usage
- Set up alerts

**Vercel:**
- Analytics dashboard
- Error tracking
- Performance metrics

---

## 📊 Environment Variables Cheatsheet

### Railway (Backend)

| Variable | Example | Required |
|----------|---------|----------|
| `SPOTIFY_CLIENT_ID` | `abc123...` | ✅ Yes |
| `SPOTIFY_CLIENT_SECRET` | `xyz789...` | ✅ Yes |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ Yes |
| `BACKEND_URL` | `https://your-app.up.railway.app` | ✅ Yes |
| `REDIRECT_URI` | `https://your-app.up.railway.app/api/auth/callback` | ✅ Yes |
| `SESSION_SECRET` | `random_32_char_string` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `PORT` | `3000` | ✅ Yes |
| `DATABASE_URL` | Auto-set by Railway | ✅ Auto |

### Vercel (Frontend)

| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_URL` | `https://your-app.up.railway.app` | ✅ Yes |
| `NODE_ENV` | `production` | Auto-set |

---

## 🎉 Success!

Your app is now live! Share your mixtape URL with friends and start creating!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.up.railway.app/api/health`

---

## 🆘 Still Having Issues?

1. Check [Railway Documentation](https://docs.railway.app/)
2. Check [Vercel Documentation](https://vercel.com/docs)
3. Check [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
4. Review your Railway and Vercel logs
5. Make sure all environment variables are set correctly

**Common mistakes:**
- Forgetting to update Spotify redirect URIs
- CORS issues (wrong `FRONTEND_URL`)
- Database not connected
- Environment variables not set in Vercel

---

**Made with 🎵 - Now go make some mixtapes!**
