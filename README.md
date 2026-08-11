# Adda

Pick a city. Its songs, its sky, its clock.

```bash
npm install
npm run dev
```

Next 16, React 19. `/` is the hub, `/[room]` is a room.

---

## Adding a room

Three files, nothing else:

1. **`lib/rooms.ts`** — add an entry. Set `status: 'soon'` until the rest exists.
2. **`public/scenes/<slug>.webp`** — the illustration, cropped full-bleed.
3. **`lib/playlists/<slug>.json`** — the tracks, then register it in `lib/playlists/index.ts`.

```bash
YT_API_KEY=xxx PLAYLIST_ID=PLxxxx ROOM=bambai npm run playlist
```

`soon` rooms show on the hub as placeholders and 404 if visited directly. Listing them honestly beats either faking them or hiding the plan.

---

## The bit that makes it work

**The clock and weather show the room's time, not the visitor's.** If you're in London looking at Dilli, it says 11:40pm and 31° and storm. That one inversion is most of what turns this from a music player into a window — it's worth protecting if you refactor.

Timezone comes from `tz` in `lib/rooms.ts`, weather from `lat`/`lon` via Open-Meteo (free, no key, no attribution).

---

## Playback

The YouTube IFrame API drives a real embed. Playlists are static JSON of video IDs.

**On the ToS:** the player renders at 200×200 and visible, in the corner. YouTube requires embeds be at least that size and not obscured, and sites in this genre routinely violate it by hiding the iframe in a 1px div. `PLAYER_VISIBLE` in `components/Cassette.tsx` turns it off if you want — made an explicit choice rather than a default you inherit unknowingly.

Better idea than hiding it: style it into the scene as a shop-window screen. Compliant, and it stops being an apology.

Failed videos auto-skip. Labels sometimes disable embedding on official uploads, so if a track vanishes instantly that's why — find another upload of it.

---

## Presence

Add a free Upstash Redis database (Vercel → Storage) and the two vars in `.env.example` inject themselves. Without them the counter renders nothing — no error, no empty state — so dev and previews are untouched.

Per room. Each visitor writes its session id into `presence:<room>` with a timestamp score every 20s; each write evicts entries older than 45s and returns the cardinality. The hub reads counts without writing, so browsing the list doesn't make it look like you're in every room at once.

**Before lowering the heartbeat interval:** Upstash free tier is 500K commands/month, each heartbeat spends 4, so 20s beats give roughly 700 visitor-hours. Three things keep it in budget:

- Heartbeats pause when the tab isn't visible — the biggest saving, since most open tabs are background tabs
- 20s beat against a 45s stale window, so a missed beat doesn't flicker someone out
- Failures render nothing; a visitor can't act on a Redis outage

If traffic grows, lengthen the interval before reaching for a paid tier. 20s → 45s roughly halves cost and nobody notices.

Session id lives in `sessionStorage`, so one person with three tabs counts as three. Most sites in this genre behave that way and it flatters the number — swap to an IP hash if you'd rather be honest.

---

## Deploying

Intended shape:

```
builtbyswami.com          The Daily Tech Roundup
builtbyswami.com/labs     Index of mini apps
adda.builtbyswami.com     This
```

Separate Vercel project from the roundup, so a build error here can't take the news site down. Add `adda.builtbyswami.com` in the project's domain settings — no purchase needed, subdomains on a domain you own are free.

Keep the apex domain and every app project on the **same** Vercel account. Attaching a subdomain across accounts means domain verification each time.

Scenes live in `public/`, so they go to the CDN and count against Fast Data Transfer rather than Blob — the right call on Hobby, where Blob's 1GB is the tightest limit. The weather route caches 15 min at the edge.

All fine under Hobby's non-commercial terms as long as there are no ads, sponsorships, or affiliate links.

---

## Known gaps

- **The Dilli scene is 1368×750.** Soft on large displays, and worst on phones where `cover` crops to a narrow slice and magnifies. Upscale it 2–3× — this flat vector-ish style takes AI upscaling unusually well.
- **Two garbled signs** remain in the shadowed arcade. Painting them out as dark rectangles is quicker than re-prompting.
- **Two blank artist fields** in `lib/playlists/dilli.json` — "Dilli Dilli" and "Ainvayi Ainvayi" had unusable YouTube metadata.
- **No OG image.** This gets shared as a link; that's most of the first impression.
- **Mobile is coded for but not tested on a real device.** The 200×200 player and the dock compete for space below 760px; there's a media query for it, but a real phone is the only way to know.
