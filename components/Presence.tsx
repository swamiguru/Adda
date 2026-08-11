'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Heartbeat interval. Must stay well under STALE_MS in the route or
 * visitors will flicker out of the count between beats.
 *
 * This is the main cost lever on the whole feature - read the presence
 * section of the README before lowering it.
 */
const BEAT_MS = 20_000;

function sessionId() {
  const KEY = 'presence-id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export default function Presence({ room }: { room: string }) {
  const [count, setCount] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = sessionId();

    const beat = async () => {
      // Don't spend requests on a tab nobody is looking at. Most open tabs
      // are background tabs, so this is by far the biggest saving.
      if (document.visibilityState !== 'visible') return;

      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, room }),
        });
        const data = await res.json();
        if (!cancelled) setCount(typeof data.count === 'number' ? data.count : null);
      } catch {
        /* keep the last known value on screen */
      }
    };

    const loop = () => {
      beat();
      timer.current = setTimeout(loop, BEAT_MS);
    };
    loop();

    // Beat immediately on return, so the number is fresh rather than 20s old.
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [room]);

  if (count === null) return null;

  return (
    <div className="presence">
      <span className="dot" aria-hidden="true" />
      <span>
        {count} <span className="muted">here</span>
      </span>
    </div>
  );
}
