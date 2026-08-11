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
    // Mumbai, not Bambai. The pattern this site sets is the vernacular
    // name - दिल्ली rather than Delhi - and Mumbai is the local name that
    // Bombay anglicised, not the other way round.
    slug: 'mumbai',
    name: 'मुंबई',
    latin: 'Mumbai',
    tagline: 'Marine Drive after the rain',
    tz: 'Asia/Kolkata',
    lat: 18.9435,
    lon: 72.8234,
    city: 'Mumbai',
    scene: '/scenes/mumbai.webp',
    sceneMobile: '/scenes/mumbai-portrait.webp',
    scenePlaceholder: 'data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAABQBQCdASoYAA4APsFOoUqnpCMhsAgA8BgJQBOmUGP9jGwUD9Vff/AeRSOa6NCv7XW4JpAA+dM3gQxoz6aia5lyvUm2rLJn8rDSEF2WdqbS5zlkSr0NO/VD8L6s5hiKqp03JAIsrJBLl8YQuQvdS8M6fEkz4kYZuR7oXirYks781H9CkOxKo2hlcJXL2aLP/j46ZgAAAAA=',
    sceneMobilePlaceholder: 'data:image/webp;base64,UklGRvoAAABXRUJQVlA4IO4AAABQBgCdASoYACYAPsFYoE0npSKiKrgMAPAYCWJg61NWunUAT71jF3l6KAdPTOcB8Z5J6kezE5z2tAaegAD+8KLs3q0oX05JcxxDZ/oSiPERpkcybYLD7bhjnucSdYC8VBwWZvHxia/2o8LRj7wuQaRDqep6KdZ0qLwwQS/u/8Ws+9A1yqU2Uo5vBWp8nQjij2rEx3LWYdiQUdt0zWTB6zf6u41aEi6lcyiaZAYZvqAT+aJMXc+gg2UNMDVxY0H1iljIhyG3IHTtHcDhBRVjtYAIedEDvc/RjTIL6mUSO9T4dAU0CnbXAt8qnrAx7gAA',
    // Upper left is heavy cloud in both scenes - the quietest, darkest
    // area, and white type sits on it cleanly.
    titleAnchor: [30, 16],
    status: 'live',
  },
  {
    // गोवा rather than the Konkani गोंय: the vernacular-name rule that
    // gave us Mumbai would give Goem here, but almost nobody outside Goa
    // reads it. Legibility wins over purity for a room nobody has heard of.
    slug: 'goa',
    name: 'गोवा',
    latin: 'Goa',
    tagline: 'Fontainhas, late afternoon',
    tz: 'Asia/Kolkata',
    // Panjim.
    lat: 15.4989,
    lon: 73.8278,
    city: 'Panjim',
    scene: '/scenes/goa.webp',
    sceneMobile: '/scenes/goa-portrait.webp',
    scenePlaceholder: 'data:image/webp;base64,UklGRt4AAABXRUJQVlA4INIAAABQBQCdASoYAA4APsFOoEqnpCMhsAgA8BgJbACdLwGUBi2dkZleB7pS2qpNUavwD+Q7UKAA/ubn/OQJg9vp8BohPyVo6pHcoZDNVhi/3F56caY+0A0QpE1z7IX+EKeU3VbpMWeuk8AgGiZOqpE259RuLcgrrLiPSgixT4L6rTc2w19yXF0WC2sYl2OTVxH1mjuokoW8EibOUGIB7SZTZRfl0ZIHQzg5+/DX4kQCK5PBd5nk/nzbF1WwCueQfZDS1VTb6jrziCHGtZrRljuni9n+AAA=',
    sceneMobilePlaceholder: 'data:image/webp;base64,UklGRnIBAABXRUJQVlA4IGYBAABQBwCdASoYAB4APsFapk6npSOiKAgA8BgJbACdMoMYPZOeAc8rpqo5VBDIF6vCEE6MeF4l9boiSi9Ov6bjBjPfdDQAAP7ppc2ClPQ+LWcMWeRHySQ88sDZ5pk39oKfcyu3MOvoCX/UqW7gvZEdiJkcZBIFVhLZVyWcuIRS+RXWw1ooGgONoJlJwR/sMA+B3IT7kdNeqghpuzNy+LHi56wn7s7Z1JNybJgKHX2OzCY3oRdlAlE89G3C1t70LWkf5cxE7i9ovKnFlf9Ssfuw3KHyAIQy+MPjuoyWZUMRatzFqoyx+NwnZiWDAKtGk59jBSc5J/DuYcZz8aLZTLHr5oKmayN2YzK5l48N7RiW097vUkM1I6TnP3EYntHp4KOY3fu96JF8JhXd13EBd/HWm3M4zkv2I6qBDzhzPn0m74MLilsjLMw7nu4LcSl64Qixmkvff+UcY9E2gW5UqppNCtX8VjCm6QAA',
    // The bright slot of sky between the rooflines runs up the middle of
    // both scenes, so the wordmark stays centred here.
    titleAnchor: [50, 16],
    status: 'live',
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
