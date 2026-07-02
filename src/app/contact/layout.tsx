import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | RokHaven Realty',
  description: 'Get in touch with RokHaven Realty. Schedule a property viewing, make an enquiry, or speak to our team about luxury real estate in Lagos, Nigeria.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
