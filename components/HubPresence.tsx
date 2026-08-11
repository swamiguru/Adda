'use client';

import { useEffect, useState } from 'react';

/**
 * Read-only count for a hub card. Deliberately does NOT heartbeat -
 * browsing the hub shouldn't make it look like you're in every room.
 *
 * One shared fetch for all cards, cached briefly so N cards cost one
 * request rather than N.
 */

let inflight: Promise<Record<string, number>> | null = null;
let cachedAt = 0;
const TTL_MS = 15_000;

function fetchCounts(rooms: string[]): Promise<Record<string, number>> {
  const fresh = Date.now() - cachedAt < TTL_MS;
  if (inflight && fresh) return inflight;

  cachedAt = Date.now();
  inflight = fetch(`/api/presence?rooms=${rooms.join(',')}`)
    .then((r) => (r.ok ? r.json() : { counts: {} }))
    .then((d) => d.counts ?? {})
    .catch(() => ({}));

  return inflight;
}

export default function HubPresence({ room }: { room: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // The batch key is the room itself; the module-level cache collapses
    // sibling cards mounting in the same tick into one request.
    fetchCounts([room]).then((counts) => {
      if (!cancelled && typeof counts[room] === 'number' && counts[room] > 0) {
        setCount(counts[room]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [room]);

  if (count === null) return null;

  return (
    <>
      <span className="sep">·</span>
      <span className="here">
        <span className="dot" aria-hidden="true" />
        {count} here
      </span>
    </>
  );
}
