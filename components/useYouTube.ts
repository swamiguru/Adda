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

export type PlayerState = {
  ready: boolean;
  playing: boolean;
  index: number;
  position: number;
  duration: number;
  track: Track | undefined;
};

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

  const seek = useCallback((fraction: number) => {
    const p = playerRef.current;
    if (!p?.getDuration) return;
    const d = p.getDuration();
    if (d) p.seekTo(d * fraction, true);
  }, []);

  return {
    ready,
    playing,
    buffering,
    index,
    position,
    duration,
    track: tracks[index],
    toggle,
    next: () => skip(1),
    prev: () => skip(-1),
    seek,
  };
}
