import Link from 'next/link';
import { rooms } from '@/lib/rooms';
import { playlists } from '@/lib/playlists';
import RoomClock from '@/components/RoomClock';
import HubMeta from '@/components/HubMeta';
import HubPresence from '@/components/HubPresence';

/** A taste of what's in the room. Three is enough to say "music". */
const PREVIEW_COUNT = 3;

export default function Hub() {
  return (
    <main className="hub-page">
      <div className="hub-inner">
        <header className="hub-head">
          <h1>
            अड्डा <span className="latin">Adda</span>
          </h1>
          {/* Leads with what it is. The old copy said "its songs" mid-sentence,
              by which point a stranger had already decided this was a travel
              site. Say music, say press play. */}
          <p>
            Hindi songs from Indian cities. Pick a place and press play — it runs on
            that city&rsquo;s own clock, under its own weather.
          </p>
        </header>

        <ul className="room-grid">
          {rooms.map((room) => {
            const tracks = playlists[room.slug] ?? [];
            const preview = tracks.slice(0, PREVIEW_COUNT).map((t) => t.title);

            const card = (
              <>
                <div
                  className="room-art"
                  style={
                    room.status === 'live'
                      ? {
                          backgroundImage: `url('${room.scene}')`,
                          // Pairs with the room's scene so the artwork
                          // morphs across the navigation rather than cutting.
                          viewTransitionName: `scene-${room.slug}`,
                        }
                      : undefined
                  }
                >
                  {room.status === 'soon' && <span className="soon-badge">soon</span>}
                  {room.status === 'live' && (
                    // The only verb on the page. Without it nothing promised
                    // that clicking a card would do anything at all.
                    <span className="room-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M8 5.2v13.6L19 12z" />
                      </svg>
                      Play
                    </span>
                  )}
                </div>

                <div className="room-meta">
                  <div className="room-title">
                    <span className="room-name">{room.name}</span>
                    <span className="room-latin">{room.latin}</span>
                  </div>
                  <p className="room-tagline">{room.tagline}</p>

                  {preview.length > 0 && (
                    <p className="room-preview">
                      {preview.join(' · ')}
                      {tracks.length > PREVIEW_COUNT && ' …'}
                    </p>
                  )}

                  <div className="room-foot">
                    <RoomClock tz={room.tz} compact />
                    {room.status === 'live' && (
                      <>
                        <HubMeta lat={room.lat} lon={room.lon} />
                        <span className="sep">·</span>
                        <span>{tracks.length} songs</span>
                        <HubPresence room={room.slug} />
                      </>
                    )}
                  </div>
                </div>
              </>
            );

            return (
              <li key={room.slug} className={`room-card ${room.status}`}>
                {room.status === 'live' ? (
                  <Link href={`/${room.slug}`}>{card}</Link>
                ) : (
                  <div aria-disabled="true">{card}</div>
                )}
              </li>
            );
          })}
        </ul>

        <footer className="hub-foot">
          <a href="https://builtbyswami.com" target="_blank" rel="noopener noreferrer">
            builtbyswami.com
          </a>
        </footer>
      </div>
    </main>
  );
}
