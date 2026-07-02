import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE = 'https://rokhaven.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/listings?cat=rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/listings?cat=shortlet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/list-your-property`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  let propertyRoutes: MetadataRoute.Sitemap = [];
  let journalRoutes: MetadataRoute.Sitemap = [];

  try {
    const properties = await prisma.property.findMany({
      select: { id: true, updatedAt: true },
      where: { status: 'ACTIVE' },
    });
    propertyRoutes = properties.map((p) => ({
      url: `${BASE}/listings/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // if db unavailable during static export, skip
  }

  try {
    const { client } = await import('@/sanity/client');
    const posts = await client.fetch<{ slug: string; publishedAt: string }[]>(
      `*[_type == "post" && defined(slug.current)]{ "slug": slug.current, publishedAt }`
    );
    journalRoutes = posts.map((p) => ({
      url: `${BASE}/journal/${p.slug}`,
      lastModified: new Date(p.publishedAt || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Sanity unavailable or not configured
  }

  return [...staticRoutes, ...propertyRoutes, ...journalRoutes];
}
