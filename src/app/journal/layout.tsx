import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Insights & Luxury Living | RokHaven Journal',
  description: 'Expert perspectives on Lagos luxury real estate — market trends, neighbourhood guides, investment insights, and the art of luxury living. RokHaven Realty Journal.',
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
