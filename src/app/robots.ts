import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/client-portal/', '/principal-portal/', '/api/', '/falcon-fadeyi-yaba/thank-you'],
      },
    ],
    sitemap: 'https://rokhaven.com/sitemap.xml',
  };
}
