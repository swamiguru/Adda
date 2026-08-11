'use client';

import { useEffect, useState } from 'react';

export type Wx = { temp: number; code: number };

/**
 * Shared weather fetch. Two components need the same answer - the HUD
 * readout and the haze veil - and they shouldn't cost two requests.
 * The in-flight promise is cached at module scope so whichever mounts
 * first wins and the other rides along.
 */
const cache = new Map<string, Promise<Wx | null>>();

function load(lat: number, lon: number): Promise<Wx | null> {
  const key = `${lat},${lon}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const p = fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && typeof d.temp === 'number' ? (d as Wx) : null))
    .catch(() => null);

  cache.set(key, p);
  return p;
}

export function useWeather(lat: number, lon: number): Wx | null {
  const [wx, setWx] = useState<Wx | null>(null);

  useEffect(() => {
    let cancelled = false;
    load(lat, lon).then((d) => {
      if (!cancelled) setWx(d);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return wx;
}

/** Open-Meteo WMO codes, collapsed to something a person would say. */
export function describe(code: number): string {
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

/**
 * How thick the air looks, 0 to 1.
 *
 * Deliberately not a weather animation. The scenes are painted at a fixed
 * golden hour, so falling rain over an obvious sunset reads as a bug.
 * Haze is the one atmospheric effect that never contradicts the artwork -
 * and in Delhi it's the honest default most of the year anyway.
 */
export function haziness(code: number): number {
  if (code === 0) return 0.1; // clear, still not clean air
  if (code <= 2) return 0.22;
  if (code === 3) return 0.42; // overcast
  if (code <= 48) return 0.75; // fog
  if (code <= 57) return 0.5; // drizzle
  if (code <= 67) return 0.6; // rain
  if (code <= 82) return 0.62; // showers
  return 0.7; // storm
}
