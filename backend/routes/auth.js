import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { saveUser, getUser } from '../db/database.js';

const router = express.Router();

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Spotify OAuth scopes needed for the app
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' ');

// Step 1: Redirect to Spotify login
router.get('/login', (req, res) => {
  const state = uuidv4();
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.REDIRECT_URI,
    scope: SCOPES,
    state: state
  });

  res.cookie('spotify_auth_state', state, { httpOnly: true, maxAge: 600000 });
  res.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
});

// Step 2: Handle Spotify callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies.spotify_auth_state;

  if (!state || state !== storedState) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=state_mismatch`);
  }

  res.clearCookie('spotify_auth_state');

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile
    const userProfile = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    const user = userProfile.data;

    // Save user to database
    saveUser({
      spotify_id: user.id,
      display_name: user.display_name,
      email: user.email,
      profile_image: user.images?.[0]?.url || null,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: Date.now() + (expires_in * 1000),
      created_at: Date.now()
    });

    // Set session cookie
    res.cookie('spotify_user_id', user.id, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/create?login=success`);
  } catch (error) {
    console.error('Auth error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const userId = req.cookies.spotify_user_id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = getUser(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if token is expired
    if (Date.now() >= user.token_expires_at) {
      // Refresh token logic would go here
      return res.status(401).json({ error: 'Token expired' });
    }

    res.json({
      id: user.spotify_id,
      display_name: user.display_name,
      email: user.email,
      profile_image: user.profile_image,
      access_token: user.access_token
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('spotify_user_id');
  res.json({ success: true });
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  const userId = req.cookies.spotify_user_id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = getUser(userId);

    if (!user || !user.refresh_token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token
      }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Update user tokens in database
    updateUserTokens(
      userId,
      access_token,
      user.refresh_token,
      Date.now() + (expires_in * 1000)
    );

    res.json({ access_token });
  } catch (error) {
    console.error('Refresh token error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
