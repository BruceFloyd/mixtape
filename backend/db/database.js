import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'mixtapes.db'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS mixtapes (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    creator_id TEXT NOT NULL,
    creator_name TEXT,
    track_uris TEXT NOT NULL,
    track_data TEXT NOT NULL,
    color_theme TEXT,
    created_at INTEGER NOT NULL,
    play_count INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    spotify_id TEXT PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    profile_image TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at INTEGER,
    created_at INTEGER NOT NULL
  )
`);

// Mixtape operations
export const createMixtape = (mixtape) => {
  const stmt = db.prepare(`
    INSERT INTO mixtapes (id, slug, title, message, creator_id, creator_name, track_uris, track_data, color_theme, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    mixtape.id,
    mixtape.slug,
    mixtape.title,
    mixtape.message || null,
    mixtape.creator_id,
    mixtape.creator_name || null,
    JSON.stringify(mixtape.track_uris),
    JSON.stringify(mixtape.track_data),
    mixtape.color_theme || 'retro',
    Date.now()
  );
};

export const getMixtapeBySlug = (slug) => {
  const stmt = db.prepare('SELECT * FROM mixtapes WHERE slug = ?');
  const mixtape = stmt.get(slug);

  if (mixtape) {
    mixtape.track_uris = JSON.parse(mixtape.track_uris);
    mixtape.track_data = JSON.parse(mixtape.track_data);
  }

  return mixtape;
};

export const getMixtapeById = (id) => {
  const stmt = db.prepare('SELECT * FROM mixtapes WHERE id = ?');
  const mixtape = stmt.get(id);

  if (mixtape) {
    mixtape.track_uris = JSON.parse(mixtape.track_uris);
    mixtape.track_data = JSON.parse(mixtape.track_data);
  }

  return mixtape;
};

export const getUserMixtapes = (userId) => {
  const stmt = db.prepare('SELECT * FROM mixtapes WHERE creator_id = ? ORDER BY created_at DESC');
  const mixtapes = stmt.all(userId);

  return mixtapes.map(m => ({
    ...m,
    track_uris: JSON.parse(m.track_uris),
    track_data: JSON.parse(m.track_data)
  }));
};

export const incrementPlayCount = (id) => {
  const stmt = db.prepare('UPDATE mixtapes SET play_count = play_count + 1 WHERE id = ?');
  return stmt.run(id);
};

// User operations
export const saveUser = (user) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (spotify_id, display_name, email, profile_image, access_token, refresh_token, token_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    user.spotify_id,
    user.display_name || null,
    user.email || null,
    user.profile_image || null,
    user.access_token,
    user.refresh_token,
    user.token_expires_at,
    user.created_at || Date.now()
  );
};

export const getUser = (spotifyId) => {
  const stmt = db.prepare('SELECT * FROM users WHERE spotify_id = ?');
  return stmt.get(spotifyId);
};

export const updateUserTokens = (spotifyId, accessToken, refreshToken, expiresAt) => {
  const stmt = db.prepare(`
    UPDATE users
    SET access_token = ?, refresh_token = ?, token_expires_at = ?
    WHERE spotify_id = ?
  `);

  return stmt.run(accessToken, refreshToken, expiresAt, spotifyId);
};

export default db;
