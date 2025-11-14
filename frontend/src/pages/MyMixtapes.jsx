import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserMixtapes } from '../utils/api';
import './MyMixtapes.css';

function MyMixtapes() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mixtapes, setMixtapes] = useState([]);
  const [loadingMixtapes, setLoadingMixtapes] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMixtapes();
    }
  }, [isAuthenticated]);

  const loadMixtapes = async () => {
    try {
      const data = await getUserMixtapes();
      setMixtapes(data);
    } catch (error) {
      console.error('Failed to load mixtapes:', error);
    } finally {
      setLoadingMixtapes(false);
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/mixtape/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading || loadingMixtapes) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your mixtapes...</p>
      </div>
    );
  }

  return (
    <div className="my-mixtapes-page">
      <header className="page-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>My Mixtapes</h1>
              <p className="user-info">
                {user?.display_name && `Welcome back, ${user.display_name}!`}
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => navigate('/create')}
                className="btn btn-primary"
              >
                ➕ Create New
              </button>
              <button onClick={logout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {mixtapes.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">📼</div>
            <h2>No Mixtapes Yet</h2>
            <p>Start creating your first mixtape and share it with the world!</p>
            <button
              onClick={() => navigate('/create')}
              className="btn btn-primary btn-large"
            >
              🎵 Create Your First Mixtape
            </button>
          </div>
        ) : (
          <div className="mixtapes-grid">
            {mixtapes.map((mixtape) => (
              <div key={mixtape.id} className="mixtape-card fade-in">
                <div className="mixtape-card-header">
                  <h3>{mixtape.title}</h3>
                  {mixtape.message && (
                    <p className="mixtape-message">"{mixtape.message}"</p>
                  )}
                </div>

                <div className="mixtape-card-body">
                  <div className="mixtape-stats">
                    <div className="stat">
                      <span className="stat-icon">🎵</span>
                      <span className="stat-value">
                        {mixtape.track_uris.length} tracks
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">▶️</span>
                      <span className="stat-value">
                        {mixtape.play_count || 0} plays
                      </span>
                    </div>
                  </div>

                  <div className="mixtape-preview">
                    {mixtape.track_data.slice(0, 3).map((track, idx) => (
                      <div key={idx} className="preview-track">
                        <img
                          src={track.albumArt}
                          alt={track.album}
                          className="preview-img"
                        />
                      </div>
                    ))}
                    {mixtape.track_data.length > 3 && (
                      <div className="preview-more">
                        +{mixtape.track_data.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="mixtape-date">
                    Created {new Date(mixtape.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mixtape-card-actions">
                  <button
                    onClick={() => navigate(`/mixtape/${mixtape.slug}`)}
                    className="btn btn-primary btn-full"
                  >
                    🎵 Play
                  </button>
                  <button
                    onClick={() => copyLink(mixtape.slug)}
                    className="btn btn-secondary btn-full"
                  >
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyMixtapes;
