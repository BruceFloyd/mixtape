import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMixtape, incrementPlayCount } from '../utils/api';
import { initializePlayer, playTracks, formatDuration } from '../utils/spotify';
import Cassette from '../components/Cassette';
import './MixtapePlayer.css';

function MixtapePlayer() {
  const { slug } = useParams();
  const { user, loading, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mixtape, setMixtape] = useState(null);
  const [loadingMixtape, setLoadingMixtape] = useState(true);
  const [error, setError] = useState(null);

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Load mixtape data
  useEffect(() => {
    loadMixtape();
  }, [slug]);

  // Initialize Spotify player when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.access_token && !player) {
      initPlayer();
    }
  }, [isAuthenticated, user, player]);

  // Update current track from player state
  useEffect(() => {
    if (playerState && mixtape) {
      const trackUri = playerState.track_window.current_track.uri;
      const trackIndex = mixtape.track_uris.indexOf(trackUri);
      if (trackIndex !== -1) {
        setCurrentTrack(trackIndex);
      }
      setIsPlaying(!playerState.paused);
    }
  }, [playerState, mixtape]);

  const loadMixtape = async () => {
    try {
      const data = await getMixtape(slug);
      setMixtape(data);
    } catch (err) {
      console.error('Failed to load mixtape:', err);
      setError('Mixtape not found');
    } finally {
      setLoadingMixtape(false);
    }
  };

  const initPlayer = async () => {
    try {
      const spotifyPlayer = await initializePlayer(
        user.access_token,
        (devId) => setDeviceId(devId),
        (state) => setPlayerState(state)
      );
      setPlayer(spotifyPlayer);
    } catch (err) {
      console.error('Failed to initialize player:', err);
      setError('Failed to initialize player. Please refresh and try again.');
    }
  };

  const handlePlay = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!deviceId || !mixtape) return;

    try {
      if (!hasPlayed) {
        await playTracks(user.access_token, deviceId, mixtape.track_uris, 0);
        await incrementPlayCount(mixtape.id);
        setHasPlayed(true);
      } else {
        player.resume();
      }
    } catch (err) {
      console.error('Playback error:', err);
      alert('Failed to start playback. Make sure you have Spotify Premium.');
    }
  };

  const handlePause = () => {
    if (player) {
      player.pause();
    }
  };

  const handleNext = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const handlePrevious = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const handleTrackSelect = async (index) => {
    if (!deviceId || !mixtape || !user?.access_token) return;

    try {
      await playTracks(user.access_token, deviceId, mixtape.track_uris, index);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loadingMixtape) {
    return (
      <div className="player-loading">
        <div className="spinner"></div>
        <p>Loading mixtape...</p>
      </div>
    );
  }

  if (error || !mixtape) {
    return (
      <div className="player-error">
        <div className="error-content">
          <h1>😕 Oops!</h1>
          <p>{error || 'Mixtape not found'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-page">
      <div className="player-container">
        <header className="player-header">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back
          </button>
          <button onClick={copyToClipboard} className="btn btn-outline btn-share">
            🔗 Share Mixtape
          </button>
        </header>

        <Cassette
          mixtape={mixtape}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
        />

        <div className="player-controls">
          <div className="controls-main">
            <button
              onClick={handlePrevious}
              className="btn-control"
              disabled={!isAuthenticated || currentTrack === 0}
              title="Previous"
            >
              ⏮️
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                className="btn-control btn-play-pause"
                title="Pause"
              >
                ⏸️
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="btn-control btn-play-pause"
                title={isAuthenticated ? 'Play' : 'Login to Play'}
              >
                ▶️
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-control"
              disabled={!isAuthenticated || currentTrack === mixtape.track_uris.length - 1}
              title="Next"
            >
              ⏭️
            </button>
          </div>

          {!isAuthenticated && (
            <div className="login-prompt">
              <p>🎵 Login with Spotify to play this mixtape</p>
              <button onClick={login} className="btn btn-primary">
                Connect with Spotify
              </button>
            </div>
          )}

          {isAuthenticated && playerState && (
            <div className="now-playing">
              <div className="now-playing-track">
                {playerState.track_window.current_track.name}
              </div>
              <div className="now-playing-artist">
                {playerState.track_window.current_track.artists[0].name}
              </div>
            </div>
          )}
        </div>

        <div className="tracklist">
          <h2>Tracklist</h2>
          <div className="tracks">
            {mixtape.track_data.map((track, index) => (
              <div
                key={track.id}
                className={`track-item ${currentTrack === index && isPlaying ? 'playing' : ''}`}
                onClick={() => isAuthenticated && handleTrackSelect(index)}
              >
                <div className="track-number">{index + 1}</div>
                <img
                  src={track.albumArt}
                  alt={track.album}
                  className="track-album-art"
                />
                <div className="track-info-main">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <div className="track-duration">
                  {formatDuration(track.duration)}
                </div>
                {currentTrack === index && isPlaying && (
                  <div className="playing-indicator">
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <footer className="player-footer">
          <p>
            Created by <strong>{mixtape.creator_name || 'Anonymous'}</strong>
          </p>
          <p className="play-count">
            {mixtape.play_count > 0 && `Played ${mixtape.play_count} times`}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default MixtapePlayer;
