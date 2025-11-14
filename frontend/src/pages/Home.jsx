import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user, loading, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to create page
    if (isAuthenticated) {
      navigate('/create');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-content">
        <div className="hero-section fade-in">
          <div className="cassette-icon">
            <div className="cassette-large">
              <div className="cassette-body">
                <div className="cassette-label">
                  <div className="label-lines"></div>
                </div>
                <div className="cassette-reels">
                  <div className="reel left-reel spinning"></div>
                  <div className="reel right-reel spinning"></div>
                </div>
                <div className="cassette-window"></div>
              </div>
            </div>
          </div>

          <h1 className="title">
            <span className="title-line">Mixtape</span>
            <span className="subtitle retro-text">Create. Share. Remember.</span>
          </h1>

          <p className="description">
            Curate your perfect playlist and share it as a beautiful retro cassette tape.
            Relive the nostalgia of making mixtapes for the people you care about.
          </p>

          <div className="cta-buttons">
            <button className="btn btn-primary btn-large" onClick={login}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect with Spotify
            </button>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <h3>Search & Select</h3>
              <p>Find your favorite tracks from Spotify's vast library</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎨</div>
              <h3>Customize</h3>
              <p>Add a personal title and message to your mixtape</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔗</div>
              <h3>Share</h3>
              <p>Send your mixtape link to friends and let them enjoy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
