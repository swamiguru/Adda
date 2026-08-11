'use client';

import { useYouTube } from './useYouTube';
import type { Track } from '@/lib/types';

/**
 * Set to false to hide the YouTube iframe. Read the ToS note in
 * useYouTube.ts before you do - it's a knowing choice, not a default.
 */
const PLAYER_VISIBLE = true;

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Reel radius grows as tape winds on. Purely cosmetic, but it's the detail that sells it. */
function reelRadius(fraction: number, side: 'left' | 'right') {
  const t = side === 'left' ? 1 - fraction : fraction;
  return 9 + t * 11;
}

export default function Cassette({ tracks, room }: { tracks: Track[]; room: string }) {
  // Mount id is namespaced by room so a client-side navigation between
  // rooms can't have two players fighting over the same element.
  const mountId = `yt-${room}`;

  const { ready, playing, buffering, position, duration, track, toggle, next, prev, seek } =
    useYouTube(tracks, mountId);

  const fraction = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <div className="cassette">
      <div className="shell">
        <div className="label">
          <span className="side">A</span>
          <div className="meta">
            <div className="title">{track?.title ?? '—'}</div>
            <div className="artist">{track?.artist ?? ''}</div>
          </div>
        </div>

        <svg className="reels" viewBox="0 0 200 70" aria-hidden="true">
          <rect x="4" y="6" width="192" height="58" rx="4" className="window" />
          {/* Tape spanning the two hubs; thins as it plays out */}
          <path d={`M 56 ${35 - reelRadius(fraction, 'left')} L 144 ${35 - reelRadius(fraction, 'right')}`} className="tape" />
          <path d={`M 56 ${35 + reelRadius(fraction, 'left')} L 144 ${35 + reelRadius(fraction, 'right')}`} className="tape" />

          {(['left', 'right'] as const).map((side) => {
            const cx = side === 'left' ? 56 : 144;
            return (
              <g key={side}>
                <circle cx={cx} cy="35" r={reelRadius(fraction, side)} className="wound" />
                <g
                  className="hub"
                  style={{
                    transformOrigin: `${cx}px 35px`,
                    animationPlayState: playing || buffering ? 'running' : 'paused',
                  }}
                >
                  <circle cx={cx} cy="35" r="8" className="hubcore" />
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <rect
                      key={deg}
                      x={cx - 1}
                      y="28"
                      width="2"
                      height="5"
                      className="tooth"
                      transform={`rotate(${deg} ${cx} 35)`}
                    />
                  ))}
                </g>
              </g>
            );
          })}
        </svg>

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

        <div className="row">
          <span className="time">{fmt(position)}</span>

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

          <span className="time">{duration ? fmt(duration) : '—:—'}</span>
        </div>
      </div>

      <div className={PLAYER_VISIBLE ? 'yt-frame' : 'yt-frame hidden'}>
        <div id={mountId} />
      </div>
    </div>
  );
}
