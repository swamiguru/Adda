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
  /**
   * A 24px-wide inline placeholder, shown blurred until the real scene
   * decodes. Inline rather than a file so it costs no extra request and
   * paints on the very first frame.
   */
  scenePlaceholder?: string;
  sceneMobilePlaceholder?: string;
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
    scenePlaceholder: 'data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAADQBACdASoYAA4APsFOoEqnpCMhsAgA8BgJbACdMoRwIsAA3zU7uTtmx/6NORzsQAD+W38vqwvBdnt9C6yCfYaz0ZSFL06AE3N24hBk7PgCi4fctfj446x1fUSaDFMhtMHVL5mMrV0CsJJoXQ+ALmFbGLIKut/yd+eEWGDcx9SGXulFtC1ifRd7nNSxiy5azqbyyMf81+6qK+qNHCst0COKDAq/NdjwMZrnsXlFrgAAAA==',
    sceneMobilePlaceholder: 'data:image/webp;base64,UklGRiIBAABXRUJQVlA4IBYBAAAQCACdASoYAB4APsFap04npSOiKAgA8BgJbACdMoR1d7Nw5jucADBVf1VyyvpYwfwU5NdjDPf8cJssg4+Y2CpZ7TDoYEtoXVWAAMtEEHbV2R9i/GJNBd1bQt5nBxko1W926d9YvYEOh9RHSZfDuQO12OF7o/8PaG4+fIaGlGpcqtk+N0ybl4tFgykOcngwTpKRJhzrI4PZz9pmmm0hEtuFactG26BzM+8+A2AUUKQ2K927exEqGi9ZAOzZuzbolGA9AR3sCSS3pfo0ZccHXGaJ5Myl6vdRcjJKLUmR5PFuts7KNQ6gwQ4VMZS0UTwjqSnm8rOeFVduAx84/pL5v/ChkC1F7AI+/bQKcZpc18ptnpXfSAAAAA==',
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
