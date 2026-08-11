import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Anek_Latin, Anek_Devanagari } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const GTM_ID = 'GTM-PBZQFB32';

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

/**
 * Search copy and social copy do different jobs, so they're written
 * separately.
 *
 * Search has to explain the thing to someone who has never heard of it -
 * "Adda" on its own tells Google nothing. Social has to make someone stop
 * scrolling, and the strongest line we have is the inversion: the clock
 * shows the city's time, not yours.
 *
 * Rough limits before truncation: 60 chars for a search title, 155 for a
 * description, and about 45 for an OG title in a feed.
 */
const seoTitle = 'Adda — pick a city, hear its songs';
const seoDescription =
  'Pick a city and hear its songs, under its own sky and its own clock. Delhi first: 31 songs at India Gate, golden hour.';

const socialTitle = 'The clock here shows Delhi’s time, not yours';
const socialDescription = 'Pick a city. Its songs, its sky, its clock.';

export const metadata: Metadata = {
  // Needed for relative OG image paths to resolve to absolute URLs.
  // Set NEXT_PUBLIC_SITE_URL in Vercel; the fallback only covers local dev.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: seoTitle, template: '%s · Adda' },
  description: seoDescription,
  applicationName: 'Adda',
  alternates: { canonical: '/' },
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    type: 'website',
    siteName: 'Adda',
    url: '/',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Adda — India Gate at golden hour' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: socialDescription,
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Google Tag Manager.
            afterInteractive rather than beforeInteractive: GTM doesn't need
            to run before hydration, and loading it first would delay the
            scene and the player for no measurement benefit. */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body>
        {/* GTM noscript fallback. Must be the first thing in the body. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
