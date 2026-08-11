'use client';

import { useEffect, useState } from 'react';

/**
 * Shows the time in the ROOM's timezone, not the visitor's. That inversion
 * is most of what makes this feel like a window rather than a player - if
 * you're in London looking at Dilli, it should say 11:40pm.
 */
export default function RoomClock({
  tz,
  city,
  compact = false,
}: {
  tz: string;
  city?: string;
  /** Hub cards want a normal "1:22 pm". The big room clock uses the
      spaced "1 22 pm" treatment, which reads as a typo at small sizes. */
  compact?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Held back until mount. Rendering a clock on the server guarantees a
  // hydration mismatch the moment the second ticks over.
  if (!now) return <div className="clock" aria-hidden="true" />;

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(now);

  const [hhmm, meridiem] = time.split(' ');

  return (
    <div className="clock">
      <span className="hhmm">{compact ? hhmm : hhmm?.replace(':', ' ')}</span>
      <span className="meridiem">
        {meridiem?.toLowerCase()}
        {city ? ` in ${city}` : ''}
      </span>
    </div>
  );
}
