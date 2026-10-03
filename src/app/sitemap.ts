// src/app/sitemap.ts
// Auto-generates /sitemap.xml at build time. Only lists public pages.
// Store pages (/stores/[storeId]) are public but not enumerated here
// (no static list of store ids) — they stay crawlable via links
// instead. Auth, dashboard, scheduling/booking flow, visit detail, and
// debug pages are excluded entirely (also blocked in robots.ts).

import type { MetadataRoute } from 'next';

const BASE_URL = 'https://bondoutfit.com';

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/for-customers',
  '/for-managers',
  '/how-it-works',
  '/the-psychology',
  '/text',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));
}
