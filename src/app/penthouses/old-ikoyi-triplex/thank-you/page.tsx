import type { Metadata } from 'next';
import { penthouses } from '../../_config/penthouses';
import ThankYouPage from '../../_components/ThankYouPage';

const cfg = penthouses['old-ikoyi-triplex'];

export const metadata: Metadata = {
  title: 'Thank You — Old Ikoyi Triplex Penthouse | RokHaven Realty',
  robots: { index: false, follow: false },
};

export default function OldIkoyiTriplexThankYou() {
  return <ThankYouPage cfg={cfg} propertyHref="/penthouses/old-ikoyi-triplex" />;
}
