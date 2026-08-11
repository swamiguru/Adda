'use client';

import { useYouTube } from './useYouTube';
import type { Track } from '@/lib/types';

/**
 * Set to false to hide the YouTube iframe. Read the ToS note in
 * useYouTube.ts first - it's a knowing choice, not a default.
 */
const PLAYER_VISIBLE = true;

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function Cassette({ tracks, room }: { tracks: Track[]; room: string }) {
  // Namespaced per room so a client-side navigation can't leave two
  // players fighting over the same mount element.
  const mountId = `yt-${room}`;

  const { ready, playing, buffering, position, duration, track, toggle, next, prev, seek } =
    useYouTube(tracks, mountId);

  const fraction = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <div className="cassette">
      <div className="pill">
        {/* A 78rpm record rather than a tape spool - closer to the music,
            and the rosette label gives it something to be at 40px.
            Deliberately not an Ashoka Chakra: it's a protected national
            symbol and spinning it as player decoration invites trouble. */}
        <svg
          className={`reel ${playing || buffering ? 'spinning' : ''}`}
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="19" fill="#221913" stroke="rgba(242,228,206,0.2)" strokeWidth="1" />

          {/* Grooves. Sub-pixel strokes read as sheen rather than lines. */}
          {[16.6, 14.8, 13.2, 11.7].map((r) => (
            <circle
              key={r}
              cx="20"
              cy="20"
              r={r}
              fill="none"
              stroke="rgba(242,228,206,0.1)"
              strokeWidth="0.55"
            />
          ))}

          <circle cx="20" cy="20" r="9" fill="#a84b32" />
          <circle cx="20" cy="20" r="9" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />

          {/* Eight-petal rangoli rosette. Any more petals and it turns to
              mush at this size. */}
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="20"
              cy="15.1"
              rx="1.45"
              ry="2.7"
              fill="rgba(242,228,206,0.88)"
              transform={`rotate(${i * 45} 20 20)`}
            />
          ))}

          <circle cx="20" cy="20" r="2.6" fill="#a84b32" />
          <circle cx="20" cy="20" r="1.3" fill="#221913" />
        </svg>

        <div className="meta">
          <div className="title">{track?.title ?? '—'}</div>
          <div className="sub">
            <span className="artist">{track?.artist || fmt(position)}</span>
            {track?.artist && (
              <>
                <span className="dot-sep">·</span>
                <span className="time">
                  {fmt(position)} / {duration ? fmt(duration) : '—:—'}
                </span>
              </>
            )}
          </div>
          <div
            className="scrub"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fraction * 100)}
            tabIndex={0}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - r.left) / r.width);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') seek(Math.min(fraction + 0.05, 1));
              if (e.key === 'ArrowLeft') seek(Math.max(fraction - 0.05, 0));
            }}
          >
            <div className="scrub-fill" style={{ width: `${fraction * 100}%` }} />
          </div>
        </div>

        <div className="transport">
          <button onClick={prev} disabled={!ready} aria-label="Previous track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 5v14l-11-7z" />
              <rect x="5" y="5" width="2.4" height="14" />
            </svg>
          </button>

          <button
            className={buffering ? 'play buffering' : 'play'}
            onClick={toggle}
            disabled={!ready}
            aria-label={playing ? 'Pause' : 'Play'}
            aria-busy={buffering}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6.5" y="5" width="3.6" height="14" />
                <rect x="13.9" y="5" width="3.6" height="14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4.6v14.8L19.5 12z" />
              </svg>
            )}
          </button>

          <button onClick={next} disabled={!ready} aria-label="Next track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5v14l11-7z" />
              <rect x="16.6" y="5" width="2.4" height="14" />
            </svg>
          </button>
        </div>
      </div>

      {/* The iframe stays 200x200 and unobscured, as YouTube requires.
          Framed as a shop-window screen so it reads as part of the scene
          rather than a stray embed. */}
      <div className={PLAYER_VISIBLE ? 'yt-frame' : 'yt-frame hidden'}>
        <div className="yt-screen">
          <div id={mountId} />
        </div>
        <div className="yt-shelf" aria-hidden="true" />
      </div>
    </div>
  );
}
