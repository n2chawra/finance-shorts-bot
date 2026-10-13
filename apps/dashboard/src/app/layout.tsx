import type { Metadata, Viewport } from "next";

import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Shorts Bot",
  description: "Backlog, uploads and analytics for the Finance Shorts pipeline",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Nav />
          <main className="mx-auto max-w-5xl px-4 pb-16 pt-5 md:ml-56 md:px-8 md:pt-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
