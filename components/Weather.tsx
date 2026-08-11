'use client';

import { useEffect, useState } from 'react';

type Wx = { temp: number; code: number };

/** Open-Meteo WMO codes, collapsed to something a person would actually say. */
function describe(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 2) return 'part sun';
  if (code === 3) return 'overcast';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  if (code <= 86) return 'snow';
  return 'storm';
}

/** Weather where the room is, not where the visitor is. */
export default function Weather({
  lat,
  lon,
  city,
}: {
  lat: number;
  lon: number;
  city: string;
}) {
  const [wx, setWx] = useState<Wx | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.temp === 'number') setWx(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  // Nothing rather than a skeleton - a placeholder here would be noisier
  // than the thing it stands in for.
  if (!wx) return <div className="weather" aria-hidden="true" />;

  return (
    <div className="weather">
      <span className="temp">{Math.round(wx.temp)}&deg;</span>
      <span className="desc">
        {describe(wx.code)} in {city}
      </span>
    </div>
  );
}
