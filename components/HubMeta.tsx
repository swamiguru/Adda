'use client';

import { useWeather, describe } from './useWeather';

/**
 * Live weather for a hub card.
 *
 * The clocks are the reason this exists. Every room is currently in IST,
 * so three cards showing the same time made the site's headline feature
 * look decorative or broken. Weather genuinely differs between Delhi,
 * Mumbai and Panjim, so it's what proves the cards are live.
 */
export default function HubMeta({ lat, lon }: { lat: number; lon: number }) {
  const wx = useWeather(lat, lon);
  if (!wx) return null;

  return (
    <>
      <span className="sep">&middot;</span>
      <span>
        {describe(wx.code)} {Math.round(wx.temp)}&deg;
      </span>
    </>
  );
}
