"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/queue", label: "Queue" },
  { href: "/calendar", label: "Calendar" },
  { href: "/videos", label: "Videos" },
  { href: "/templates", label: "Templates" },
  { href: "/analytics", label: "Analytics" },
  { href: "/runs", label: "Runs" },
  { href: "/settings", label: "Settings" },
];

function Brand() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="whitespace-nowrap text-base font-semibold tracking-tight">Finance Shorts Bot</span>
      <span className="rounded-full border border-ring px-2 py-0.5 text-[11px] font-medium text-ink2">Sample data</span>
    </div>
  );
}

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      {/* phone: sticky header with a scrolling tab row */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface md:hidden">
        <div className="px-4 pt-3">
          <Brand />
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active(i.href) ? "bg-ink font-medium text-surface" : "text-ink2"}`}>
              {i.label}
            </Link>
          ))}
        </nav>
      </header>
      {/* desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-line bg-surface p-4 md:flex">
        <Brand />
        <nav className="mt-6 flex flex-col gap-0.5">
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm ${active(i.href) ? "bg-wash font-medium text-ink" : "text-ink2 hover:bg-wash"}`}>
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
