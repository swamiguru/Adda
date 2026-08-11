export type Room = {
  slug: string;
  /** Display name, in script. */
  name: string;
  /** Latin transliteration, used for metadata and alt text. */
  latin: string;
  tagline: string;
  /** IANA zone. The clock shows the room's time, not the visitor's. */
  tz: string;
  lat: number;
  lon: number;
  /** Label shown next to the temperature. */
  city: string;
  scene: string;
  /**
   * Portrait-composed version for phones. Optional - falls back to `scene`.
   *
   * Not a crop of the landscape file. A 16:9 image under `cover` on a
   * 390x844 viewport shows roughly a quarter of its width, so the mobile
   * scene has to be drawn as its own composition or most of it is lost.
   */
  sceneMobile?: string;
  /** Where the wordmark can sit without fighting the artwork: [x%, y%]. */
  titleAnchor: [number, number];
  status: 'live' | 'soon';
};

/**
 * Adding a room is: one entry here, one scene in /public/scenes,
 * one playlist in /lib/playlists. Nothing else needs to change.
 *
 * `soon` rooms render on the hub as unclickable placeholders. Listing
 * them honestly is better than either faking them or hiding the plan.
 */
export const rooms: Room[] = [
  {
    slug: 'dilli',
    name: 'दिल्ली',
    latin: 'Dilli',
    tagline: 'India Gate, golden hour',
    tz: 'Asia/Kolkata',
    lat: 28.6315,
    lon: 77.2167,
    city: 'Delhi',
    scene: '/scenes/dilli.webp',
    sceneMobile: '/scenes/dilli-portrait.webp',
    // Left of centre: the arch sits on the right in both scenes, so the
    // open sky is on the left.
    titleAnchor: [33, 16],
    status: 'live',
  },
  {
    slug: 'bambai',
    name: 'बम्बई',
    latin: 'Bambai',
    tagline: 'Marine Drive after the rain',
    tz: 'Asia/Kolkata',
    lat: 18.9435,
    lon: 72.8234,
    city: 'Mumbai',
    scene: '/scenes/bambai.webp',
    titleAnchor: [50, 16],
    status: 'soon',
  },
  {
    slug: 'lucknow',
    name: 'लखनऊ',
    latin: 'Lucknow',
    tagline: 'Hazratganj, evening',
    tz: 'Asia/Kolkata',
    lat: 26.8467,
    lon: 80.9462,
    city: 'Lucknow',
    scene: '/scenes/lucknow.webp',
    titleAnchor: [50, 16],
    status: 'soon',
  },
];

export const liveRooms = rooms.filter((r) => r.status === 'live');

export function getRoom(slug: string): Room | undefined {
  return rooms.find((r) => r.slug === slug);
}
