import express from 'express';
import axios from 'axios';
import { getUser } from '../db/database.js';

const router = express.Router();
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Middleware to check authentication and get access token
const requireAuth = async (req, res, next) => {
  const userId = req.cookies.spotify_user_id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = getUser(userId);

  if (!user || !user.access_token) {
    return res.status(401).json({ error: 'User not found or no access token' });
  }

  // Check if token is expired
  if (Date.now() >= user.token_expires_at) {
    return res.status(401).json({ error: 'Token expired', needsRefresh: true });
  }

  req.accessToken = user.access_token;
  req.user = user;
  next();
};

// Search for tracks
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      headers: { 'Authorization': `Bearer ${req.accessToken}` },
      params: {
        q,
        type: 'track',
        limit
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get user's playlists
router.get('/playlists', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me/playlists`, {
      headers: { 'Authorization': `Bearer ${req.accessToken}` },
      params: { limit: 50 }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Get playlists error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Get playlist tracks
router.get('/playlists/:id/tracks', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${SPOTIFY_API_URL}/playlists/${id}/tracks`, {
      headers: { 'Authorization': `Bearer ${req.accessToken}` },
      params: { limit: 100 }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Get playlist tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get playlist tracks' });
  }
});

// Get track details
router.get('/tracks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${SPOTIFY_API_URL}/tracks/${id}`, {
      headers: { 'Authorization': `Bearer ${req.accessToken}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Get track error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

export default router;
