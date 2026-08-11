'use client';

import { useWeather, haziness } from './useWeather';

/**
 * A veil over the scene whose thickness follows the room's real weather.
 *
 * Two soft layers drifting at different speeds and directions, so the
 * movement never reads as a repeating loop. Peak opacity is deliberately
 * tiny - if you can consciously see this working, it's turned up too far.
 * The point is that the air feels different on a foggy morning, not that
 * anyone notices a weather effect.
 */
export default function Haze({ lat, lon }: { lat: number; lon: number }) {
  const wx = useWeather(lat, lon);
  if (!wx) return null;

  const t = haziness(wx.code);

  return (
    <div className="haze" aria-hidden="true">
      <div className="haze-layer haze-a" style={{ opacity: 0.14 * t }} />
      <div className="haze-layer haze-b" style={{ opacity: 0.1 * t }} />
    </div>
  );
}
