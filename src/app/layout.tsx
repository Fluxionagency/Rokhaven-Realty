import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Luxury Real Estate in Lagos, Nigeria | RokHaven Realty",
  description: "RokHaven Realty is Nigeria's premier luxury real estate brand. Browse exclusive properties for sale, rent, and shortlet in Banana Island, Ikoyi, and Victoria Island.",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "RealEstateAgent"],
  name: "RokHaven Realty",
  url: "https://rokhaven.com",
  logo: "https://rokhaven.com/logo.png",
  telephone: "+2349167619009",
  email: "info@rokhaven.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  sameAs: [
    "https://www.instagram.com/rokhavenrealtyng",
    "https://www.tiktok.com/@rokhaven",
    "https://www.youtube.com/@RokHaven",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZWX72RMLW4"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZWX72RMLW4');
        `}</Script>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Providers>{children}</Providers>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
