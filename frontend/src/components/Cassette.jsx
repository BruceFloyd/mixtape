import { useEffect, useState } from 'react';
import './Cassette.css';

function Cassette({ mixtape, isPlaying, currentTrack }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="cassette-container">
      <div className="cassette">
        <div className="cassette-shell">
          {/* Top section with label */}
          <div className="cassette-label">
            <div className="label-content">
              <div className="label-title">{mixtape?.title || 'Mixtape'}</div>
              {mixtape?.creator_name && (
                <div className="label-by">by {mixtape.creator_name}</div>
              )}
              {mixtape?.message && (
                <div className="label-message">"{mixtape.message}"</div>
              )}
            </div>
          </div>

          {/* Cassette body */}
          <div className="cassette-body">
            {/* Reels */}
            <div className="reels-container">
              <div
                className="reel reel-left"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="reel-center"></div>
                <div className="reel-teeth">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="tooth"
                      style={{ transform: `rotate(${i * 60}deg)` }}
                    ></div>
                  ))}
                </div>
              </div>

              <div
                className="reel reel-right"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="reel-center"></div>
                <div className="reel-teeth">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="tooth"
                      style={{ transform: `rotate(${i * 60}deg)` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tape window */}
            <div className="tape-window">
              <div className="tape-visible" style={{
                transform: `scaleX(${isPlaying ? 0.95 : 1})`
              }}></div>
            </div>

            {/* Screw details */}
            <div className="screw screw-tl"></div>
            <div className="screw screw-tr"></div>
            <div className="screw screw-bl"></div>
            <div className="screw screw-br"></div>

            {/* Write-protect tabs */}
            <div className="write-tab write-tab-left"></div>
            <div className="write-tab write-tab-right"></div>
          </div>

          {/* Bottom label */}
          <div className="cassette-bottom-label">
            <div className="side-indicator">
              <span className="side-letter">A</span>
            </div>
            <div className="track-lines">
              {mixtape?.track_data?.slice(0, 10).map((track, idx) => (
                <div
                  key={idx}
                  className={`track-line ${currentTrack === idx ? 'active' : ''}`}
                >
                  <span className="track-num">{idx + 1}.</span>
                  <span className="track-title">{track.name}</span>
                </div>
              ))}
            </div>
            <div className="side-indicator">
              <span className="side-letter">B</span>
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className="cassette-shadow"></div>
      </div>
    </div>
  );
}

export default Cassette;
