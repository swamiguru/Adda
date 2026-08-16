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

  const count = playlists[room.slug]?.length ?? 0;
  const image = `/og/${room.slug}.jpg`;

  // Search: says what the page is to someone who's never heard of it.
  // The layout template appends "· Adda", so don't repeat it here.
  const seoTitle = `${room.latin} — songs from ${room.city}`;
  const seoDescription =
    `${count} songs from ${room.city}, playing under ${room.tagline}. ` +
    `Shows ${room.city}'s real time and weather, wherever you are.`;

  // Social: the native script reads as itself in a feed, and the hook is
  // the inversion rather than a description of the page.
  const socialTitle = `${room.name} · Adda`;
  const socialDescription = `${room.tagline}. ${count} songs, and ${room.city}'s own clock.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: `/${room.slug}` },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      type: 'music.playlist',
      url: `/${room.slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: `${room.latin} — ${room.tagline}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [image],
    },
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
        placeholder={room.scenePlaceholder}
        mobilePlaceholder={room.sceneMobilePlaceholder}
        transitionName={`scene-${room.slug}`}
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
          {/* The way out. Screen-off playback is Premium-only and enforced
              server-side, and a cross-origin embed can't see Premium status
              anyway - so anyone who wants this in their pocket needs the app. */}
          <a
            className="yt-link"
            href={room.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this playlist in YouTube Music — needed for playback with the screen off"
          >
            YouTube Music <span aria-hidden="true">&#8599;</span>
          </a>
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
