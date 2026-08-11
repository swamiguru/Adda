'use client';

import { useWeather, describe } from './useWeather';

/**
 * Conditions where the room is, not where the visitor is.
 *
 * No city name here on purpose - the clock above already says "in Delhi",
 * and having it twice in one header was the loudest flaw up there.
 */
export default function Weather({ lat, lon }: { lat: number; lon: number }) {
  const wx = useWeather(lat, lon);

  // Nothing rather than a skeleton. A placeholder would be noisier than
  // the thing it stands in for.
  if (!wx) return <div className="weather" aria-hidden="true" />;

  return (
    <div className="weather">
      <span className="desc">{describe(wx.code)}</span>
      <span className="sep">&middot;</span>
      <span className="temp">{Math.round(wx.temp)}&deg;</span>
    </div>
  );
}
