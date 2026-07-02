import { prisma } from '@/lib/prisma';
import ListingsClient from './ListingsClient';

export default async function ListingsPage() {
  let initialProperties: {
    id: string;
    title: string;
    price: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    sqm: number | null;
    category: 'SALE' | 'RENT' | 'SHORTLET';
    type: string;
    badge: string | null;
    images: string;
  }[] = [];

  try {
    const rows = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        bedrooms: true,
        bathrooms: true,
        sqm: true,
        category: true,
        type: true,
        badge: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    initialProperties = rows as typeof initialProperties;
  } catch {
    // DB unavailable — client will fetch via API
  }

  return <ListingsClient initialProperties={initialProperties} />;
}
