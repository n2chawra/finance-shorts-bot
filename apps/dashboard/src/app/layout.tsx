import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

import { Shell } from "@/components/nav";
import { Providers } from "@/components/providers";

import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// display face for page titles, card headings and the brand
const brand = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brand", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Paisa Panchayat · Studio",
  description: "Backlog, uploads, analytics and agents for the Paisa Panchayat channel",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f6f4ef" }, { media: "(prefers-color-scheme: dark)", color: "#0c0b09" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // next-themes sets data-theme on <html> before hydration
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${brand.variable}`}>
      <body className="antialiased">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
