#!/usr/bin/env node
/**
 * Pulls a YouTube playlist into lib/playlist.json.
 *
 *   YT_API_KEY=xxx PLAYLIST_ID=PLxxxx ROOM=dilli npm run playlist
 *
 * Writes to lib/playlists/<ROOM>.json. Get a key from
 * console.cloud.google.com -> YouTube Data API v3. Quota cost is trivial
 * (1 unit per 50 items) so the free tier is plenty.
 *
 * The playlist ID is the `list=` parameter of your playlist URL.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.YT_API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;
const ROOM = process.env.ROOM;

if (!API_KEY || !PLAYLIST_ID || !ROOM) {
  console.error('Missing YT_API_KEY, PLAYLIST_ID or ROOM.\n');
  console.error('  YT_API_KEY=xxx PLAYLIST_ID=PLxxxx ROOM=dilli npm run playlist');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(ROOM)) {
  console.error('ROOM must be a lowercase slug, e.g. dilli');
  process.exit(1);
}

/**
 * YouTube titles are messy. "Artist - Title (Official Video) [HD]" is typical.
 * This does a decent first pass; expect to hand-correct a few in the JSON.
 */
function parseTitle(rawTitle, channelTitle) {
  let title = rawTitle
    .replace(/\((official|full|hd|hq|lyrical|audio|video|song|4k)[^)]*\)/gi, '')
    .replace(/\[(official|full|hd|hq|lyrical|audio|video|song|4k)[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let artist = channelTitle;

  const dash = title.split(/\s+[-–—|]\s+/);
  if (dash.length >= 2) {
    artist = dash[0].trim();
    title = dash.slice(1).join(' - ').trim();
  }

  return { title, artist };
}

async function fetchPage(pageToken) {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet,status');
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('playlistId', PLAYLIST_ID);
  url.searchParams.set('key', API_KEY);
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const tracks = [];
  let pageToken;
  let skipped = 0;

  do {
    const data = await fetchPage(pageToken);

    for (const item of data.items ?? []) {
      const s = item.snippet;
      const videoId = s?.resourceId?.videoId;

      // Private and deleted videos come back with no usable snippet.
      // They will silently break playback if you leave them in.
      if (!videoId || s.title === 'Private video' || s.title === 'Deleted video') {
        skipped++;
        continue;
      }

      const { title, artist } = parseTitle(s.title, s.videoOwnerChannelTitle ?? s.channelTitle ?? '');

      tracks.push({
        id: videoId,
        title,
        artist,
        cover: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  const out = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'lib',
    'playlists',
    `${ROOM}.json`,
  );
  await writeFile(out, JSON.stringify(tracks, null, 2) + '\n');

  console.log(`Wrote ${tracks.length} tracks to lib/playlists/${ROOM}.json`);
  if (skipped) console.log(`Skipped ${skipped} private/deleted item(s)`);
  console.log('\nTitles are auto-parsed and will need a pass by hand.');
  console.log(`If this is a new room, register it in lib/rooms.ts and lib/playlists/index.ts.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
