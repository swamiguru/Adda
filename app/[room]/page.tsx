import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRoom, liveRooms } from '@/lib/rooms';
import { playlists } from '@/lib/playlists';
import Scene from '@/components/Scene';
import Haze from '@/components/Haze';
import Cassette from '@/components/Cassette';
import RoomClock from '@/components/RoomClock';
import Weather from '@/components/Weather';
import Presence from '@/components/Presence';

type Props = { params: Promise<{ room: string }> };

export function generateStaticParams() {
  return liveRooms.map((r) => ({ room: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { room: slug } = await params;
  const room = getRoom(slug);
  if (!room) return {};

  // Just the city. The layout's template appends "· Adda" - spelling it
  // out here too produced "Dilli — Adda · Adda" in the tab.
  const title = room.latin;
  const description = room.tagline;

  // Per-room card, falling back to the hub's if a room hasn't got one yet.
  const image = `/og/${room.slug}.jpg`;

  return {
    title,
    description,
    openGraph: {
      title: `${room.latin} · Adda`,
      description,
      type: 'music.playlist',
      images: [{ url: image, width: 1200, height: 630, alt: `${room.latin} — Adda` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function RoomPage({ params }: Props) {
  const { room: slug } = await params;
  const room = getRoom(slug);

  // `soon` rooms are listed on the hub but must not be reachable directly.
  if (!room || room.status !== 'live') notFound();

  const tracks = playlists[room.slug] ?? [];

  return (
    <main>
      <Scene
        src={room.scene}
        mobileSrc={room.sceneMobile}
        alt={`${room.latin} street scene`}
      />
      <Haze lat={room.lat} lon={room.lon} />

      <header className="hud">
        {/* Time and weather are one thought - where you are and what it's
            like there. Navigation is a different kind of thing and sits
            on its own. */}
        <div className="ambience">
          <RoomClock tz={room.tz} city={room.city} />
          <Weather lat={room.lat} lon={room.lon} />
        </div>

        <Presence room={room.slug} />

        <nav className="hud-nav">
          <Link href="/" className="back">
            <span aria-hidden="true">&#8592;</span> all rooms
          </Link>
        </nav>
      </header>

      <h1
        className="wordmark"
        style={{ ['--anchor-x' as string]: `${room.titleAnchor[0]}%` }}
      >
        {room.name}
      </h1>

      <footer className="dock">
        <Cassette tracks={tracks} room={room.slug} />
      </footer>
    </main>
  );
}
