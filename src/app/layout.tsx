import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "RokHaven Realty — Where Legacy Lives",
  description: "Nigeria's premier luxury real estate brand for high-net-worth individuals. Discover exclusive curated properties in Banana Island, Ikoyi, Victoria Island, and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
