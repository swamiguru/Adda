import { NextRequest, NextResponse } from 'next/server';
import { rooms } from '@/lib/rooms';
import { getRedis, redisConfigured } from '@/lib/redis';

// Node, not edge: the Redis client speaks TCP.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Per-room presence, backed by Vercel Redis sorted sets.
 *
 * POST { id, room }  -> heartbeat, returns that room's count
 * GET  ?rooms=a,b    -> counts only, no write. Used by the hub.
 *
 * Each visitor writes its session id with a timestamp score. Anything
 * older than the stale window is evicted on the next write, and the
 * remaining cardinality is the count. No websockets, no connection state,
 * and it self-heals when someone closes the tab without saying goodbye.
 *
 * With no REDIS_URL set this returns nulls and the UI renders nothing,
 * so local dev and previews work with no database at all.
 */

const STALE_MS = 45_000; // must exceed the client heartbeat interval
const KEY_TTL_S = 300;

const key = (room: string) => `presence:${room}`;

// Only known slugs may be used as keys. Without this, anyone could write
// arbitrary keys into your database by posting a made-up room name.
const valid = new Set(rooms.map((r) => r.slug));

export async function POST(req: NextRequest) {
  if (!redisConfigured()) return NextResponse.json({ count: null });

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

  try {
    const redis = await getRedis();
    if (!redis) return NextResponse.json({ count: null });

    const now = Date.now();
    const k = key(room);

    const results = await redis
      .multi()
      .zRemRangeByScore(k, 0, now - STALE_MS)
      .zAdd(k, { score: now, value: id })
      .zCard(k)
      .expire(k, KEY_TTL_S)
      .exec();

    const count = Number(results?.[2] ?? 0);

    return NextResponse.json(
      { count: Number.isFinite(count) ? count : null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    // Presence is decoration. A visitor can't act on a database outage,
    // so there's no point surfacing one.
    return NextResponse.json({ count: null });
  }
}

export async function GET(req: NextRequest) {
  if (!redisConfigured()) return NextResponse.json({ counts: {} });

  const wanted = (req.nextUrl.searchParams.get('rooms') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => valid.has(s));

  if (!wanted.length) return NextResponse.json({ counts: {} });

  try {
    const redis = await getRedis();
    if (!redis) return NextResponse.json({ counts: {} });

    const now = Date.now();

    // Read-only: evict stale entries, then count. No zAdd, so merely
    // looking at the hub doesn't inflate the numbers.
    const tx = redis.multi();
    for (const room of wanted) {
      tx.zRemRangeByScore(key(room), 0, now - STALE_MS);
      tx.zCard(key(room));
    }
    const results = await tx.exec();

    const counts: Record<string, number> = {};
    wanted.forEach((room, i) => {
      counts[room] = Number(results?.[i * 2 + 1] ?? 0);
    });

    return NextResponse.json({ counts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ counts: {} });
  }
}
