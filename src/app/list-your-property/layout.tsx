import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Property | RokHaven Realty',
  description: 'List your luxury property with RokHaven Realty. We accept direct mandates only — no sub-mandates. Reach verified high-net-worth buyers and tenants in Lagos.',
};

export default function ListYourPropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
