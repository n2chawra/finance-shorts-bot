import Link from "next/link";

import { LogoMark } from "./brand";

/** The frame of the public pages (/about, /privacy, /terms): no sidebar, no data, light and dark from the dashboard's colour roles. */
export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-plane text-ink">
      <header className="border-b border-ring bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/about" className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Channel Studio</span>
          </Link>
          <YouTubeBadge />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <footer className="border-t border-ring bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-[13px] text-ink2 sm:px-6">
          <span>© 2026 Channel Studio</span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/about" className="hover:text-ink">Home</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** A plain text badge (no YouTube logo files), linking to youtube.com. */
export function YouTubeBadge() {
  return (
    <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ring bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-ink hover:border-ring-strong">
      <span aria-hidden className="size-2 rounded-full bg-[#ff0000]" />
      Developed with YouTube
    </a>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <article className="space-y-4 text-[15px] leading-relaxed text-ink2 [&_a]:text-brand-text [&_a]:underline [&_a]:underline-offset-2 [&_h1]:text-[30px] [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:tracking-[-0.025em] [&_h1]:text-ink [&_h2]:pt-4 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-1.5">
      {children}
    </article>
  );
}
