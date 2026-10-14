"use client";

import { BarChart3, CalendarDays, Clapperboard, Film, LayoutDashboard, LayoutTemplate, ListOrdered, LogOut, type LucideIcon, Monitor, Moon, Settings, Sun, Workflow } from "lucide-react";
import { useIsFetching } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ToggleGroup } from "radix-ui";
import { useEffect, useState } from "react";

import { useOverview } from "@/lib/queries";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/queue", label: "Queue", icon: ListOrdered },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/videos", label: "Videos", icon: Film },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/runs", label: "Runs", icon: Workflow },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** "Live · 12s ago" with a pulsing dot; spins while a refresh is in flight. */
function LiveStatus() {
  const { data, dataUpdatedAt, isError } = useOverview();
  const fetching = useIsFetching() > 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!data) return <span className="block text-[11px] font-medium text-muted">&nbsp;</span>;
  const ago = Math.max(0, Math.round((now - dataUpdatedAt) / 1000));
  const label = data.source === "sample" ? "Sample data" : isError ? "Offline, retrying" : "Live";
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted" aria-live="off">
      <span className="relative flex size-2">
        {!isError && data.source !== "sample" && <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" />}
        <span className={`relative inline-flex size-2 rounded-full ${isError ? "bg-critical" : data.source === "sample" ? "bg-muted" : "bg-good"}`} />
      </span>
      {label}
      <span className="tabular-nums">· {fetching ? "updating…" : ago < 5 ? "just now" : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`}</span>
    </span>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-gradient grid size-9 shrink-0 place-items-center rounded-xl text-brand-ink shadow-card"><Clapperboard aria-hidden className="size-5" /></span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-[15px] font-semibold tracking-tight">Finance Shorts</span>
        <LiveStatus />
      </span>
    </div>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [{ value: "light", label: "Light theme", icon: Sun }, { value: "system", label: "Match system theme", icon: Monitor }, { value: "dark", label: "Dark theme", icon: Moon }];
  return (
    <ToggleGroup.Root type="single" value={mounted ? theme : undefined} onValueChange={(v) => v && setTheme(v)} aria-label="Theme"
      className="inline-flex rounded-xl border border-ring bg-surface-2 p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}
          className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:text-ink data-[state=on]:bg-surface data-[state=on]:text-brand-text data-[state=on]:shadow-card">
          <Icon aria-hidden className="size-4" />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

function SignOut() {
  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/login", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  };
  return (
    <button type="button" onClick={signOut} aria-label="Sign out" title="Sign out"
      className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-wash hover:text-ink">
      <LogOut aria-hidden className="size-4" />
    </button>
  );
}

export function Nav() {
  const path = usePathname();
  if (path === "/login") return null;
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      {/* phone: sticky header with a scrolling tab row */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Brand />
          <div className="flex items-center gap-1"><ThemeSwitch /><SignOut /></div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2.5">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${active(href) ? "font-medium text-brand-ink" : "text-ink2"}`}>
              {active(href) && <motion.span layoutId="tab-pill" className="brand-gradient absolute inset-0 rounded-full" />}
              <Icon aria-hidden className="relative size-4" />
              <span className="relative">{label}</span>
            </Link>
          ))}
        </nav>
      </header>
      {/* desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface/80 p-4 backdrop-blur-md md:flex">
        <Brand />
        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${active(href) ? "font-medium text-brand-text" : "text-ink2 hover:text-ink"}`}>
              {active(href)
                ? <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-brand-soft" />
                : <span className="absolute inset-0 rounded-xl bg-wash opacity-0 transition-opacity group-hover:opacity-100" />}
              {active(href) && <motion.span layoutId="side-bar" className="brand-gradient absolute -left-4 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full" />}
              <Icon aria-hidden className="relative size-[18px] transition-transform group-hover:scale-110" />
              <span className="relative">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between">
          <ThemeSwitch />
          <SignOut />
        </div>
      </aside>
    </>
  );
}
