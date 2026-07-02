import type { Metadata } from 'next';

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

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
