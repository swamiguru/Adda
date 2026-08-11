import { NextRequest, NextResponse } from 'next/server';
import { rooms } from '@/lib/rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Per-room presence, backed by Upstash Redis sorted sets.
 *
 * POST { id, room }  -> heartbeat, returns that room's count
 * GET  ?rooms=a,b    -> counts only, no write. Used by the hub.
 *
 * Each visitor writes its session id with a timestamp score. Anything
 * older than the stale window is evicted on the next write, and the
 * remaining cardinality is the count. No websockets, no connection state,
 * and it self-heals when someone closes the tab without saying goodbye.
 *
 * Without UPSTASH_REDIS_REST_URL / _TOKEN this returns nulls and the UI
 * renders nothing, so local dev and previews work with no Redis at all.
 */

const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const STALE_MS = 45_000; // must exceed the client heartbeat interval
const KEY_TTL_S = 300;

const key = (room: string) => `presence:${room}`;

// Only known slugs may be used as keys. Without this, anyone could write
// arbitrary keys into your Redis by posting a made-up room name.
const valid = new Set(rooms.map((r) => r.slug));

async function pipeline(commands: string[][]) {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!URL_ || !TOKEN) return NextResponse.json({ count: null });

  let id: string;
  let room: string;
  try {
    const body = await req.json();
    id = String(body?.id ?? '').slice(0, 64);
    room = String(body?.room ?? '');
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  if (!id || !valid.has(room)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const now = Date.now();
  const k = key(room);

  try {
    const out = await pipeline([
      ['ZREMRANGEBYSCORE', k, '0', String(now - STALE_MS)],
      ['ZADD', k, String(now), id],
      ['ZCARD', k],
      ['EXPIRE', k, String(KEY_TTL_S)],
    ]);
    const count = Number(out?.[2]?.result ?? 0);
    return NextResponse.json(
      { count: Number.isFinite(count) ? count : null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    // Presence is decoration. A visitor can't act on a Redis outage,
    // so there's no point surfacing one.
    return NextResponse.json({ count: null });
  }
}

export async function GET(req: NextRequest) {
  if (!URL_ || !TOKEN) return NextResponse.json({ counts: {} });

  const wanted = (req.nextUrl.searchParams.get('rooms') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => valid.has(s));

  if (!wanted.length) return NextResponse.json({ counts: {} });

  const now = Date.now();

  try {
    // Read-only: evict stale entries, then count. No ZADD, so simply
    // looking at the hub doesn't inflate the numbers.
    const commands = wanted.flatMap((room) => [
      ['ZREMRANGEBYSCORE', key(room), '0', String(now - STALE_MS)],
      ['ZCARD', key(room)],
    ]);
    const out = await pipeline(commands);

    const counts: Record<string, number> = {};
    wanted.forEach((room, i) => {
      counts[room] = Number(out?.[i * 2 + 1]?.result ?? 0);
    });

    return NextResponse.json({ counts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ counts: {} });
  }
}
