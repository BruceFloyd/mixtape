# 🎵 Mixtape - Spotify-Powered Cassette Tape Experience

Create beautiful, shareable mixtapes presented as animated retro cassette tapes. Connect with Spotify, curate your perfect playlist, and share it with friends through a nostalgic cassette player interface.

![Mixtape Demo](https://via.placeholder.com/800x400.png?text=Mixtape+Demo)

## ✨ Features

- 🔐 **Spotify OAuth Integration** - Secure authentication with Spotify
- 🔍 **Track Search** - Search millions of songs from Spotify's library
- 🎨 **Retro Cassette UI** - Beautiful animated cassette tape with spinning reels
- 🎵 **Web Playback** - Stream music directly using Spotify's Web Playback SDK
- 🔗 **Shareable Links** - Each mixtape gets a unique URL to share
- 📱 **Mobile Responsive** - Works beautifully on all devices
- 💾 **SQLite Database** - Lightweight local storage for mixtapes
- 🎭 **Personalization** - Add custom titles and messages to your mixtapes

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Spotify Web Playback SDK** - Music streaming

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **SQLite (better-sqlite3)** - Database
- **Spotify Web API** - Music data and authentication

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- A **Spotify Premium** account (required for Web Playback SDK)
- A **Spotify Developer** account ([Sign up](https://developer.spotify.com/dashboard))

## 🛠️ Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd mixtape
\`\`\`

### 2. Set Up Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in the details:
   - **App Name**: Mixtape (or your choice)
   - **App Description**: Create and share musical mixtapes
   - **Redirect URI**: \`http://localhost:3000/api/auth/callback\`
   - **API**: Web API & Web Playback SDK
4. Save your app
5. Copy your **Client ID** and **Client Secret**

### 3. Configure Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
\`\`\`

Edit \`.env\` with your Spotify credentials:

\`\`\`env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=generate_a_random_string_here
PORT=3000
\`\`\`

### 4. Configure Frontend

\`\`\`bash
cd ../frontend
npm install
\`\`\`

### 5. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

### 6. Open in Browser

Navigate to: [http://localhost:5173](http://localhost:5173)

## 🎮 How to Use

### Creating a Mixtape

1. **Connect with Spotify** - Click "Connect with Spotify" on the home page
2. **Authorize** - Grant permissions to the app
3. **Search for Songs** - Use the search bar to find tracks
4. **Build Your Mixtape** - Add up to 20 tracks
5. **Customize** - Add a title and optional message
6. **Create** - Click "Create Mixtape" to generate your shareable link

### Sharing a Mixtape

1. Copy the unique URL from the success screen
2. Share it with friends via text, email, or social media
3. Recipients can listen by logging in with their Spotify account

### Playing a Mixtape

1. Click on a mixtape link
2. Login with Spotify (if not already logged in)
3. Press play on the cassette player
4. Use controls to navigate through tracks

## 🎨 Customization

### Color Themes

Edit the CSS variables in `/frontend/src/index.css`:

\`\`\`css
:root {
  --orange: #ff6b35;
  --teal: #4ecdc4;
  --beige: #f7e5d0;
  --dark-brown: #3d2817;
  /* ... */
}
\`\`\`

### Cassette Design

Modify the cassette component in:
- `/frontend/src/components/Cassette.jsx`
- `/frontend/src/components/Cassette.css`

## 📁 Project Structure

\`\`\`
mixtape/
├── backend/
│   ├── db/
│   │   └── database.js       # SQLite database operations
│   ├── routes/
│   │   ├── auth.js          # Spotify OAuth routes
│   │   ├── mixtapes.js      # Mixtape CRUD routes
│   │   └── spotify.js       # Spotify API routes
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cassette.jsx    # Cassette UI component
│   │   │   └── Cassette.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Create.jsx      # Mixtape creation
│   │   │   ├── MixtapePlayer.jsx  # Playback page
│   │   │   └── MyMixtapes.jsx  # User's mixtapes
│   │   ├── utils/
│   │   │   ├── api.js          # API client
│   │   │   └── spotify.js      # Spotify SDK utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`GET /api/auth/login\` - Initiate Spotify OAuth
- \`GET /api/auth/callback\` - OAuth callback handler
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/refresh\` - Refresh access token
- \`POST /api/auth/logout\` - Logout user

### Spotify
- \`GET /api/spotify/search?q={query}\` - Search tracks
- \`GET /api/spotify/playlists\` - Get user playlists
- \`GET /api/spotify/playlists/:id/tracks\` - Get playlist tracks

### Mixtapes
- \`POST /api/mixtapes\` - Create new mixtape
- \`GET /api/mixtapes/:slug\` - Get mixtape by slug
- \`POST /api/mixtapes/:id/play\` - Increment play count
- \`GET /api/mixtapes/user/mine\` - Get user's mixtapes

## 🐛 Troubleshooting

### "Premium Required" Error
The Spotify Web Playback SDK requires a Premium subscription. Free accounts cannot stream music.

### Player Not Initializing
1. Check that you have Spotify Premium
2. Verify your access token is valid
3. Check browser console for errors
4. Try refreshing the page

### OAuth Redirect Issues
1. Verify redirect URI in Spotify Dashboard matches your \`.env\`
2. Ensure backend is running on the correct port
3. Clear cookies and try again

### Database Errors
If you encounter database issues:
\`\`\`bash
cd backend
rm db/mixtapes.db  # Delete the database
npm start          # Restart - database will be recreated
\`\`\`

## 🚀 Deployment

### Backend (e.g., Railway, Render, Heroku)
1. Set environment variables in your hosting platform
2. Update \`REDIRECT_URI\` to your production URL
3. Deploy the \`/backend\` directory

### Frontend (e.g., Vercel, Netlify)
1. Build the frontend: \`npm run build\`
2. Deploy the \`/frontend/dist\` directory
3. Update backend \`FRONTEND_URL\` to your production URL

### Important: Update Spotify App Settings
1. Go to Spotify Developer Dashboard
2. Edit your app
3. Add production redirect URI: \`https://your-domain.com/api/auth/callback\`

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💖 Credits

- Built with love and nostalgia for the mixtape era
- Powered by [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- Fonts: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) & [VT323](https://fonts.google.com/specimen/VT323)

## 📧 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review [Spotify Web API docs](https://developer.spotify.com/documentation/web-api)
3. Open an issue on GitHub

---

Made with 🎵 by [Your Name]
