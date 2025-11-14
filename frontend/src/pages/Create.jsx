import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchTracks, createMixtape } from '../utils/api';
import './Create.css';

function Create() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [mixtapeTitle, setMixtapeTitle] = useState('');
  const [mixtapeMessage, setMixtapeMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mixtapeUrl, setMixtapeUrl] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      // Show welcome message or animation
    }
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results.tracks.items);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search tracks. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const addTrack = (track) => {
    if (selectedTracks.length >= 20) {
      alert('Maximum 20 tracks per mixtape');
      return;
    }

    if (selectedTracks.find(t => t.id === track.id)) {
      alert('Track already added');
      return;
    }

    setSelectedTracks([...selectedTracks, {
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      duration: track.duration_ms
    }]);
  };

  const removeTrack = (trackId) => {
    setSelectedTracks(selectedTracks.filter(t => t.id !== trackId));
  };

  const moveTrack = (index, direction) => {
    const newTracks = [...selectedTracks];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newTracks.length) return;

    [newTracks[index], newTracks[targetIndex]] = [newTracks[targetIndex], newTracks[index]];
    setSelectedTracks(newTracks);
  };

  const handleCreateMixtape = async () => {
    if (!mixtapeTitle.trim()) {
      alert('Please enter a mixtape title');
      return;
    }

    if (selectedTracks.length === 0) {
      alert('Please add at least one track');
      return;
    }

    setCreating(true);
    try {
      const result = await createMixtape({
        title: mixtapeTitle,
        message: mixtapeMessage,
        tracks: selectedTracks,
        colorTheme: 'retro'
      });

      setMixtapeUrl(result.mixtape.url);
      setShowSuccess(true);
    } catch (error) {
      console.error('Create mixtape error:', error);
      alert('Failed to create mixtape. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mixtapeUrl);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (showSuccess) {
    return (
      <div className="success-screen">
        <div className="success-content fade-in">
          <div className="success-icon">🎉</div>
          <h1>Mixtape Created!</h1>
          <p>Your mixtape is ready to share</p>

          <div className="mixtape-link-box">
            <input
              type="text"
              value={mixtapeUrl}
              readOnly
              className="mixtape-link-input"
            />
            <button onClick={copyToClipboard} className="btn btn-secondary">
              📋 Copy Link
            </button>
          </div>

          <div className="success-actions">
            <button
              onClick={() => navigate(mixtapeUrl.replace(window.location.origin, ''))}
              className="btn btn-primary"
            >
              🎵 Listen Now
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              ➕ Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <header className="create-header">
        <div className="container">
          <h1 className="page-title">Create Your Mixtape</h1>
          <p className="page-subtitle retro-text">
            Logged in as {user?.display_name || 'User'}
          </p>
        </div>
      </header>

      <div className="container create-container">
        <div className="create-grid">
          {/* Search Section */}
          <div className="search-section">
            <h2>Search Tracks</h2>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" disabled={searching}>
                {searching ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </form>

            <div className="search-results">
              {searchResults.map((track) => (
                <div key={track.id} className="track-item">
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="track-image"
                  />
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artists[0].name}</div>
                  </div>
                  <button
                    onClick={() => addTrack(track)}
                    className="btn-add"
                    title="Add to mixtape"
                  >
                    ➕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mixtape Builder Section */}
          <div className="mixtape-section">
            <h2>Your Mixtape</h2>

            <div className="mixtape-form">
              <input
                type="text"
                placeholder="Mixtape Title (e.g., Late Night Drives)"
                value={mixtapeTitle}
                onChange={(e) => setMixtapeTitle(e.target.value)}
                className="mixtape-title-input"
                maxLength={50}
              />

              <textarea
                placeholder="Optional message... (e.g., For those long drives home)"
                value={mixtapeMessage}
                onChange={(e) => setMixtapeMessage(e.target.value)}
                className="mixtape-message-input"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="selected-tracks">
              <div className="tracks-header">
                <span className="track-count">
                  {selectedTracks.length} / 20 tracks
                </span>
              </div>

              {selectedTracks.length === 0 ? (
                <div className="empty-state">
                  <p>🎵 Search and add tracks to your mixtape</p>
                </div>
              ) : (
                <div className="tracks-list">
                  {selectedTracks.map((track, index) => (
                    <div key={track.id} className="selected-track">
                      <div className="track-number">{index + 1}</div>
                      <img
                        src={track.albumArt}
                        alt={track.album}
                        className="track-image-small"
                      />
                      <div className="track-details">
                        <div className="track-name">{track.name}</div>
                        <div className="track-artist">{track.artist}</div>
                      </div>
                      <div className="track-actions">
                        <button
                          onClick={() => moveTrack(index, -1)}
                          disabled={index === 0}
                          className="btn-icon"
                          title="Move up"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => moveTrack(index, 1)}
                          disabled={index === selectedTracks.length - 1}
                          className="btn-icon"
                          title="Move down"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="btn-icon btn-remove"
                          title="Remove"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateMixtape}
              className="btn btn-primary btn-large btn-create"
              disabled={creating || selectedTracks.length === 0 || !mixtapeTitle.trim()}
            >
              {creating ? '🎵 Creating...' : '🎵 Create Mixtape'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
