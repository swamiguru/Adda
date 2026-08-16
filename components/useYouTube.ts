'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from '@/lib/types';

/**
 * Thin wrapper over the YouTube IFrame Player API.
 *
 * A NOTE ON TERMS OF SERVICE, because it matters:
 * YouTube requires the embedded player to be at least 200x200px and not
 * hidden or obscured. Sites in this genre routinely bury it in a 1px div.
 * That is a ToS violation and a real (if small) takedown risk.
 *
 * The default here keeps a compliant 200x200 player visible in the corner,
 * styled to read as part of the scene. If you'd rather hide it, that's your
 * call to make knowingly - see PLAYER_VISIBLE in Cassette.tsx.
 */

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });

  return apiPromise;
}

export function useYouTube(tracks: Track[], mountId: string) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Keep index in a ref so the API event handlers, which are bound once,
  // always read the current value rather than a stale closure.
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    let cancelled = false;

    loadApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(mountId, {
        width: 200,
        height: 200,
        videoId: tracks[0]?.id,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange: (e: any) => {
            const YT = window.YT;

            // BUFFERING has to be surfaced. Without it the button sits on
            // "play" while the video spins up, which reads as a dead click -
            // and on a cold cache that gap is a couple of seconds.
            setBuffering(e.data === YT.PlayerState.BUFFERING);

            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
            if (e.data === YT.PlayerState.ENDED) {
              // Advance rather than stop. Wraps at the end of the playlist.
              const next = (indexRef.current + 1) % tracks.length;
              setIndex(next);
              playerRef.current?.loadVideoById(tracks[next].id);
            }
          },
          onError: () => {
            // Region-blocked or removed video. Skip it rather than dead-ending.
            const next = (indexRef.current + 1) % tracks.length;
            setIndex(next);
            playerRef.current?.loadVideoById(tracks[next].id);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // Deliberately mount-once. The player owns its own lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountId]);

  // Poll for position. The IFrame API has no timeupdate event.
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      setPosition(p.getCurrentTime() ?? 0);
      setDuration(p.getDuration() ?? 0);
    }, 250);
    return () => clearInterval(t);
  }, [ready]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing]);

  const skip = useCallback(
    (delta: number) => {
      const p = playerRef.current;
      if (!p) return;
      const next = (indexRef.current + delta + tracks.length) % tracks.length;
      setIndex(next);
      setPosition(0);
      p.loadVideoById(tracks[next].id);
    },
    [tracks],
  );

  const next = useCallback(() => skip(1), [skip]);
  const prev = useCallback(() => skip(-1), [skip]);

  const seek = useCallback((fraction: number) => {
    const p = playerRef.current;
    if (!p?.getDuration) return;
    const d = p.getDuration();
    if (d) p.seekTo(d * fraction, true);
  }, []);

  const track = tracks[index];

  /**
   * Lock screen, Control Centre, headphone buttons, car stereo.
   * Without this the OS shows nothing useful for a tab that's playing
   * audio, which for a site people leave running in the background is
   * the difference between a toy and something usable.
   */
  useEffect(() => {
    if (!ready || !track || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || 'Adda',
      album: 'Adda',
      artwork: [
        { src: track.cover, sizes: '320x180', type: 'image/jpeg' },
        { src: `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
      ],
    });

    const handlers: [MediaSessionAction, () => void][] = [
      ['play', () => playerRef.current?.playVideo()],
      ['pause', () => playerRef.current?.pauseVideo()],
      ['previoustrack', prev],
      ['nexttrack', next],
    ];

    for (const [action, fn] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        // Older browsers reject unknown actions rather than ignoring them.
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          /* ignore */
        }
      }
    };
  }, [ready, track, next, prev]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }, [playing]);

  /**
   * Keep the screen awake while playing.
   *
   * This is NOT background playback, and background playback is not
   * achievable here. In February 2026 Google began enforcing it server-side
   * as a Premium-only feature: lock the phone and a YouTube embed stops
   * within seconds, on Android and iOS Safari alike. The only real route
   * to lock-screen audio is self-hosted, licensed files.
   *
   * What this does fix is the far more common failure - the phone
   * auto-locking after thirty idle seconds while someone is listening.
   * The lock is held only while playing, and released on pause, so it
   * never sits there draining a battery for a paused tab.
   */
  useEffect(() => {
    if (!playing || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      // The API rejects while the page is hidden; that's expected, not an error.
      if (document.visibilityState !== 'visible') return;
      try {
        sentinel = await (navigator as any).wakeLock.request('screen');
        if (cancelled) {
          sentinel?.release();
          sentinel = null;
        }
      } catch {
        /* Unsupported, or refused on low battery. Nothing to tell the user. */
      }
    };

    acquire();

    // The browser drops the lock whenever the page is hidden, so it has to
    // be taken again each time the tab comes back.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !sentinel) acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [playing]);

  /** Space to play/pause, arrows to skip - what people expect of a player. */
  useEffect(() => {
    if (!ready) return;

    const onKey = (e: KeyboardEvent) => {
      // Don't hijack a focused control; Space and Enter belong to it.
      const el = e.target as HTMLElement | null;
      if (el && (el.closest('button, a, input, textarea, [contenteditable]') || el.isContentEditable)) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault(); // Space would otherwise scroll
        toggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, toggle, next, prev]);

  return {
    ready,
    playing,
    buffering,
    index,
    position,
    duration,
    track,
    toggle,
    next,
    prev,
    seek,
  };
}
