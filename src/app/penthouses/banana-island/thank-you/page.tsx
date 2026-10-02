import type { Metadata } from 'next';
import { penthouses } from '../../_config/penthouses';
import ThankYouPage from '../../_components/ThankYouPage';

const cfg = penthouses['banana-island'];

export const metadata: Metadata = {
  title: 'Thank You — Banana Island Penthouse | RokHaven Realty',
  robots: { index: false, follow: false },
};

export default function BananaIslandThankYou() {
  return <ThankYouPage cfg={cfg} propertyHref="/penthouses/banana-island" />;
}
