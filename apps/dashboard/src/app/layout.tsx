import type { Metadata, Viewport } from "next";
import { Archivo_Black, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { Shell } from "@/components/nav";
import { Providers } from "@/components/providers";

import "./globals.css";

// text, numbers and the loud display face (titles, big figures, the brand)
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const jet = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jet", display: "swap" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "Paisa Panchayat · Control room",
  description: "Backlog, uploads, analytics and agents for the Paisa Panchayat channel",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0b0b0b" }, { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // next-themes sets data-theme on <html> before hydration
    <html lang="en" suppressHydrationWarning className={`${grotesk.variable} ${jet.variable} ${archivo.variable}`}>
      <body className="antialiased">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
