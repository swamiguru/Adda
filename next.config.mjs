/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com' }],
  },
  experimental: {
    // Wraps App Router navigations in document.startViewTransition, which
    // lets the hub card's artwork morph into the room's scene instead of
    // cutting. Browsers without support just navigate normally.
    viewTransition: true,
  },
};

export default nextConfig;
