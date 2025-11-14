import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createMixtape,
  getMixtapeBySlug,
  getMixtapeById,
  getUserMixtapes,
  incrementPlayCount,
  getUser
} from '../db/database.js';

const router = express.Router();

// Create a new mixtape
router.post('/', async (req, res) => {
  const userId = req.cookies.spotify_user_id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = getUser(userId);
    const { title, message, tracks, colorTheme } = req.body;

    if (!title || !tracks || tracks.length === 0) {
      return res.status(400).json({ error: 'Title and tracks are required' });
    }

    // Generate unique ID and slug
    const id = uuidv4();
    const slug = generateSlug(title);

    const mixtape = {
      id,
      slug,
      title,
      message: message || null,
      creator_id: userId,
      creator_name: user.display_name,
      track_uris: tracks.map(t => t.uri),
      track_data: tracks,
      color_theme: colorTheme || 'retro'
    };

    createMixtape(mixtape);

    res.json({
      success: true,
      mixtape: {
        id,
        slug,
        title,
        url: `${process.env.FRONTEND_URL}/mixtape/${slug}`
      }
    });
  } catch (error) {
    console.error('Create mixtape error:', error);
    res.status(500).json({ error: 'Failed to create mixtape' });
  }
});

// Get mixtape by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const mixtape = getMixtapeBySlug(slug);

    if (!mixtape) {
      return res.status(404).json({ error: 'Mixtape not found' });
    }

    res.json(mixtape);
  } catch (error) {
    console.error('Get mixtape error:', error);
    res.status(500).json({ error: 'Failed to get mixtape' });
  }
});

// Increment play count
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    incrementPlayCount(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Increment play count error:', error);
    res.status(500).json({ error: 'Failed to update play count' });
  }
});

// Get user's mixtapes
router.get('/user/mine', async (req, res) => {
  const userId = req.cookies.spotify_user_id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const mixtapes = getUserMixtapes(userId);
    res.json(mixtapes);
  } catch (error) {
    console.error('Get user mixtapes error:', error);
    res.status(500).json({ error: 'Failed to get mixtapes' });
  }
});

// Helper function to generate URL-safe slug
function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

export default router;
