import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine which database to use based on environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

let db;
let dbType;

if (isProduction && process.env.DATABASE_URL) {
  // Use PostgreSQL in production
  console.log('🐘 Using PostgreSQL database');
  const { default: pg } = await import('pg');
  const { Pool } = pg;

  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
      rejectUnauthorized: false
    }
  });

  dbType = 'postgres';
  await initPostgres();
} else {
  // Use SQLite for local development
  console.log('💾 Using SQLite database (local development)');
  const { default: Database } = await import('better-sqlite3');
  db = new Database(join(__dirname, 'mixtapes.db'));
  dbType = 'sqlite';
  initSQLite();
}

// Initialize SQLite tables
function initSQLite() {
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
      token_expires_at BIGINT,
      created_at BIGINT NOT NULL
    )
  `);
}

// Initialize PostgreSQL tables
async function initPostgres() {
  await db.query(`
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
      created_at BIGINT NOT NULL,
      play_count INTEGER DEFAULT 0
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      spotify_id TEXT PRIMARY KEY,
      display_name TEXT,
      email TEXT,
      profile_image TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at BIGINT,
      created_at BIGINT NOT NULL
    )
  `);
}

// Mixtape operations
export const createMixtape = async (mixtape) => {
  if (dbType === 'postgres') {
    const result = await db.query(
      `INSERT INTO mixtapes (id, slug, title, message, creator_id, creator_name, track_uris, track_data, color_theme, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
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
      ]
    );
    return result.rows[0];
  } else {
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
  }
};

export const getMixtapeBySlug = async (slug) => {
  let mixtape;

  if (dbType === 'postgres') {
    const result = await db.query('SELECT * FROM mixtapes WHERE slug = $1', [slug]);
    mixtape = result.rows[0];
  } else {
    const stmt = db.prepare('SELECT * FROM mixtapes WHERE slug = ?');
    mixtape = stmt.get(slug);
  }

  if (mixtape) {
    mixtape.track_uris = JSON.parse(mixtape.track_uris);
    mixtape.track_data = JSON.parse(mixtape.track_data);
    // Convert bigint to number for timestamps
    mixtape.created_at = Number(mixtape.created_at);
    if (mixtape.token_expires_at) mixtape.token_expires_at = Number(mixtape.token_expires_at);
  }

  return mixtape;
};

export const getMixtapeById = async (id) => {
  let mixtape;

  if (dbType === 'postgres') {
    const result = await db.query('SELECT * FROM mixtapes WHERE id = $1', [id]);
    mixtape = result.rows[0];
  } else {
    const stmt = db.prepare('SELECT * FROM mixtapes WHERE id = ?');
    mixtape = stmt.get(id);
  }

  if (mixtape) {
    mixtape.track_uris = JSON.parse(mixtape.track_uris);
    mixtape.track_data = JSON.parse(mixtape.track_data);
    mixtape.created_at = Number(mixtape.created_at);
  }

  return mixtape;
};

export const getUserMixtapes = async (userId) => {
  let mixtapes;

  if (dbType === 'postgres') {
    const result = await db.query(
      'SELECT * FROM mixtapes WHERE creator_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    mixtapes = result.rows;
  } else {
    const stmt = db.prepare('SELECT * FROM mixtapes WHERE creator_id = ? ORDER BY created_at DESC');
    mixtapes = stmt.all(userId);
  }

  return mixtapes.map(m => ({
    ...m,
    track_uris: JSON.parse(m.track_uris),
    track_data: JSON.parse(m.track_data),
    created_at: Number(m.created_at)
  }));
};

export const incrementPlayCount = async (id) => {
  if (dbType === 'postgres') {
    const result = await db.query(
      'UPDATE mixtapes SET play_count = play_count + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } else {
    const stmt = db.prepare('UPDATE mixtapes SET play_count = play_count + 1 WHERE id = ?');
    return stmt.run(id);
  }
};

// User operations
export const saveUser = async (user) => {
  if (dbType === 'postgres') {
    const result = await db.query(
      `INSERT INTO users (spotify_id, display_name, email, profile_image, access_token, refresh_token, token_expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (spotify_id)
       DO UPDATE SET
         display_name = $2,
         email = $3,
         profile_image = $4,
         access_token = $5,
         refresh_token = $6,
         token_expires_at = $7
       RETURNING *`,
      [
        user.spotify_id,
        user.display_name || null,
        user.email || null,
        user.profile_image || null,
        user.access_token,
        user.refresh_token,
        user.token_expires_at,
        user.created_at || Date.now()
      ]
    );
    return result.rows[0];
  } else {
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
  }
};

export const getUser = async (spotifyId) => {
  let user;

  if (dbType === 'postgres') {
    const result = await db.query('SELECT * FROM users WHERE spotify_id = $1', [spotifyId]);
    user = result.rows[0];
  } else {
    const stmt = db.prepare('SELECT * FROM users WHERE spotify_id = ?');
    user = stmt.get(spotifyId);
  }

  if (user) {
    user.created_at = Number(user.created_at);
    user.token_expires_at = Number(user.token_expires_at);
  }

  return user;
};

export const updateUserTokens = async (spotifyId, accessToken, refreshToken, expiresAt) => {
  if (dbType === 'postgres') {
    const result = await db.query(
      `UPDATE users
       SET access_token = $1, refresh_token = $2, token_expires_at = $3
       WHERE spotify_id = $4
       RETURNING *`,
      [accessToken, refreshToken, expiresAt, spotifyId]
    );
    return result.rows[0];
  } else {
    const stmt = db.prepare(`
      UPDATE users
      SET access_token = ?, refresh_token = ?, token_expires_at = ?
      WHERE spotify_id = ?
    `);
    return stmt.run(accessToken, refreshToken, expiresAt, spotifyId);
  }
};

export default db;
