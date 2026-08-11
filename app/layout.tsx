import type { Metadata, Viewport } from 'next';
import { Anek_Latin, Anek_Devanagari } from 'next/font/google';
import './globals.css';

/**
 * Anek, drawn by Ek Type in Bombay. Latin and Devanagari are separate
 * families from one superfamily, so the two scripts share proportions
 * and colour instead of looking bolted together.
 *
 * Self-hosted by next/font at build time - no request to Google at
 * runtime, and no layout shift.
 */
const anekLatin = Anek_Latin({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-latin',
  display: 'swap',
});

const anekDevanagari = Anek_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

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
    <html lang="en" className={`${anekLatin.variable} ${anekDevanagari.variable}`}>
      <head>
        {/* Warm up the YouTube origins before the player is created. */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
