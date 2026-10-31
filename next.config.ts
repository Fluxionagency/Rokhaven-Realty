import type { NextConfig } from "next";

// The 3D site is static HTML in public/3d (shared assets in public/map, plans, gallery, media).
// These rewrites serve it on clean URLs ahead of the app routes, so `/` and the Falcon funnel
// URLs used by the running ads show the new pages. Delete a line to fall back to the old page.
const LISTINGS = ['banana-island', 'old-ikoyi-triplex', 'ikoyi-maisonette', 'victoria-island', 'banana-island-tower', 'falcon-fadeyi-yaba'];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/3d/index.html' },
        ...LISTINGS.map((slug) => ({ source: `/${slug}`, destination: `/3d/${slug}.html` })),
        { source: '/falcon-fadeyi-yaba/thank-you', destination: '/3d/thank-you.html' },
        { source: '/enquiry-received', destination: '/3d/thank-you.html' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      { source: '/enquiry-received', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
      { source: '/falcon-fadeyi-yaba/thank-you', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
      { source: '/map/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
