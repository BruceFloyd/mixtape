import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import mixtapeRoutes from './routes/mixtapes.js';
import spotifyRoutes from './routes/spotify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mixtapes', mixtapeRoutes);
app.use('/api/spotify', spotifyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mixtape API is running!' });
});

app.listen(PORT, () => {
  console.log(`🎵 Mixtape backend running on http://localhost:${PORT}`);
  console.log(`🎵 Make sure to set up your .env file with Spotify credentials`);
});
