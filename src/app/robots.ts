// src/app/robots.ts
// Auto-generates /robots.txt. Blocks auth, dashboard, the scheduling/
// booking flow, visit detail pages, and the debug QR page from being
// crawled or indexed. Store pages (/stores/[storeId]) are
// intentionally left crawlable — they're public.

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api',
        '/api/',
        '/auth',
        '/auth/',
        '/dashboard',
        '/dashboard/',
        '/debug-qr',
        '/schedule',
        '/schedule/',
        '/visits',
        '/visits/',
      ],
    },
    sitemap: 'https://bondoutfit.com/sitemap.xml',
  };
}
