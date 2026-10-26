import type { Metadata } from 'next';
import { penthouses } from '../../_config/penthouses';
import ThankYouPage from '../../_components/ThankYouPage';

const cfg = penthouses['old-ikoyi-maisonette'];

export const metadata: Metadata = {
  title: 'Thank You — Old Ikoyi Maisonette Penthouse | RokHaven Realty',
  robots: { index: false, follow: false },
};

export default function OldIkoyiMaisonetteThankYou() {
  return <ThankYouPage cfg={cfg} propertyHref="/penthouses/old-ikoyi-maisonette" />;
}
