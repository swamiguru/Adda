'use client';

import { useEffect, useState } from 'react';

export default function Clock() {
  // Null until mounted. Rendering a time on the server guarantees a
  // hydration mismatch, since the server clock and timezone differ.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <div className="clock" aria-hidden="true" />;

  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const [hhmm, meridiem] = time.split(' ');

  return (
    <div className="clock">
      <span className="hhmm">{hhmm?.replace(':', ' ')}</span>
      <span className="meridiem">{meridiem?.toLowerCase()}</span>
    </div>
  );
}
