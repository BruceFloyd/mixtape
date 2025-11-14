// Spotify Web Playback SDK utilities

export const loadSpotifyPlayer = () => {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve(window.Spotify);
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve(window.Spotify);
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const initializePlayer = async (accessToken, onPlayerReady, onPlayerStateChanged) => {
  const { Player } = await loadSpotifyPlayer();

  const player = new Player({
    name: 'Mixtape Player',
    getOAuthToken: cb => { cb(accessToken); },
    volume: 0.8
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => {
    console.error('Initialization error:', message);
  });

  player.addListener('authentication_error', ({ message }) => {
    console.error('Authentication error:', message);
  });

  player.addListener('account_error', ({ message }) => {
    console.error('Account error:', message);
  });

  player.addListener('playback_error', ({ message }) => {
    console.error('Playback error:', message);
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    if (onPlayerReady) onPlayerReady(device_id);
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Player state changed
  player.addListener('player_state_changed', state => {
    if (onPlayerStateChanged) onPlayerStateChanged(state);
  });

  // Connect to the player
  const connected = await player.connect();

  if (!connected) {
    throw new Error('Failed to connect player');
  }

  return player;
};

export const playTracks = async (accessToken, deviceId, trackUris, position = 0) => {
  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({
      uris: trackUris,
      position_uri: trackUris[position]
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to start playback');
  }
};

export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
