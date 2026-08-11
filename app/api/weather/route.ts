import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Weather for a room's coordinates. Open-Meteo: free, no key, no attribution.
 *
 * Coordinates come from the query string rather than the visitor's IP,
 * because the room's weather is the point - a visitor in Berlin looking at
 * Dilli should see Delhi's monsoon, not Berlin's drizzle.
 */

// Guarded against arbitrary lat/lon so this can't be used as an open proxy
// to hammer Open-Meteo with whatever coordinates someone feels like.
function valid(n: number, max: number) {
  return Number.isFinite(n) && Math.abs(n) <= max;
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get('lat'));
  const lon = Number(req.nextUrl.searchParams.get('lon'));

  if (!valid(lat, 90) || !valid(lon, 180)) {
    return NextResponse.json({ error: 'bad coordinates' }, { status: 400 });
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,weather_code');

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(String(res.status));

    const data = await res.json();

    return NextResponse.json(
      {
        temp: data.current?.temperature_2m ?? 0,
        code: data.current?.weather_code ?? 0,
      },
      // 15 min at the edge. Weather doesn't move fast, and this keeps the
      // route well clear of Hobby's request ceiling.
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
