import { createClient, type RedisClientType } from 'redis';

/**
 * Shared Redis client for the presence counter.
 *
 * Backed by Vercel Redis (Storage tab), which hands over a standard
 * REDIS_URL connection string. Node runtime only - this speaks the Redis
 * TCP protocol, which the edge runtime can't do.
 *
 * Serverless functions are reused between invocations, so the client is
 * cached at module scope. Creating one per request would exhaust the
 * connection limit almost immediately under any real traffic.
 */

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

export function redisConfigured() {
  return Boolean(process.env.REDIS_URL);
}

export async function getRedis(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) return null;
  if (client?.isOpen) return client;

  // Collapse concurrent cold-start requests onto one connection attempt.
  if (connecting) return connecting;

  connecting = (async () => {
    const c = createClient({ url: process.env.REDIS_URL }) as RedisClientType;

    // Without a listener, a dropped connection throws an unhandled error
    // and takes the whole function instance down with it.
    c.on('error', () => {});

    await c.connect();
    client = c;
    connecting = null;
    return c;
  })();

  try {
    return await connecting;
  } catch {
    connecting = null;
    return null;
  }
}
