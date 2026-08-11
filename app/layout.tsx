import type { Metadata, Viewport } from 'next';
import './globals.css';

const title = 'Adda';
const description = 'Pick a city. Its songs, its sky, its clock.';

export const metadata: Metadata = {
  // Needed for relative OG image paths to resolve to absolute URLs.
  // Set NEXT_PUBLIC_SITE_URL in Vercel; the fallback only covers local dev.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: title, template: '%s · Adda' },
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: title,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Adda' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2A2320',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Warm up the YouTube origins before the player is created. */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
