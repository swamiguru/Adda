import Link from 'next/link';
import { rooms } from '@/lib/rooms';
import { playlists } from '@/lib/playlists';
import RoomClock from '@/components/RoomClock';
import HubPresence from '@/components/HubPresence';

export default function Hub() {
  return (
    <main className="hub-page">
      <div className="hub-inner">
        <header className="hub-head">
          <h1>अड्डा</h1>
          <p>
            Pick a place. Its songs, its sky, its clock — whatever time it happens to be
            there right now.
          </p>
        </header>

        <ul className="room-grid">
          {rooms.map((room) => {
            const count = playlists[room.slug]?.length ?? 0;
            const card = (
              <>
                <div
                  className="room-art"
                  style={
                    room.status === 'live'
                      ? { backgroundImage: `url('${room.scene}')` }
                      : undefined
                  }
                >
                  {room.status === 'soon' && <span className="soon-badge">soon</span>}
                </div>
                <div className="room-meta">
                  <div className="room-title">
                    <span className="room-name">{room.name}</span>
                    <span className="room-latin">{room.latin}</span>
                  </div>
                  <p className="room-tagline">{room.tagline}</p>
                  <div className="room-foot">
                    <RoomClock tz={room.tz} compact />
                    {room.status === 'live' && (
                      <>
                        <span className="sep">·</span>
                        <span>{count} tracks</span>
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
