import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ListingsClient from './ListingsClient';

type Props = { searchParams: Promise<{ cat?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat } = await searchParams;
  if (cat === 'rent') {
    return {
      title: 'Luxury Properties for Rent in Lagos | RokHaven Realty',
      description: 'Find premium apartments, duplexes, and houses for rent in Ikoyi, Victoria Island, and Banana Island. Verified luxury rentals — RokHaven Realty.',
    };
  }
  if (cat === 'shortlet') {
    return {
      title: 'Shortlet Apartments & Serviced Residences in Lagos | RokHaven Realty',
      description: 'Book luxury shortlet apartments and serviced residences in Lagos. Fully furnished, flexible stays in Ikoyi, VI, and Banana Island — RokHaven Realty.',
    };
  }
  return {
    title: 'Luxury Properties for Sale in Lagos | RokHaven Realty',
    description: 'Browse exclusive houses, apartments, and penthouses for sale in Banana Island, Ikoyi, and Victoria Island, Lagos. Direct mandates only — RokHaven Realty.',
  };
}

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
