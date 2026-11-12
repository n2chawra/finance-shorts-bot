"use client";

import { useIsFetching } from "@tanstack/react-query";
import { Bell, ChevronsUpDown, LogOut, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog, ToggleGroup } from "radix-ui";
import { useEffect, useState } from "react";

import { useNotifications, useOverview } from "@/lib/queries";

import { LogoMark, Wordmark } from "./brand";
import { useCommandMenu } from "./command";
import { NAV, NAV_ITEMS, isActive, pageTitle } from "./nav-items";
import { Kbd, Tip } from "./ui";

/*
 * The frame: a sidebar with every page (grouped), the system's state and the account controls; a
 * slim top bar with the breadcrumb, live status and alerts. Below lg the sidebar becomes a drawer and
 * phones get a bottom tab bar. The sign-in page gets none of it.
 */

/** "Live · 12s ago" with a pulsing dot; says "updating…" while a refresh is in flight. */
export function LiveStatus() {
  const { data, dataUpdatedAt, isError } = useOverview();
  const fetching = useIsFetching() > 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!data) return null;
  const ago = Math.max(0, Math.round((now - dataUpdatedAt) / 1000));
  const sample = data.source === "sample";
  const label = sample ? "Sample data" : isError ? "Offline, retrying" : "Live";
  return (
    <span className="flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-ring bg-surface px-3 text-xs text-muted shadow-xs">
      <span className="relative flex size-2">
        {!isError && !sample && <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-50" />}
        <span className={`relative inline-flex size-2 rounded-full ${isError ? "bg-critical" : sample ? "bg-warning" : "bg-good"}`} />
      </span>
      <span className="font-medium text-ink2">{label}</span>
      <span className="hidden tabular-nums sm:inline">{fetching ? "updating…" : ago < 5 ? "just now" : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`}</span>
    </span>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [{ value: "light", label: "Light theme", icon: Sun }, { value: "system", label: "Match system theme", icon: Monitor }, { value: "dark", label: "Dark theme", icon: Moon }];
  return (
    <ToggleGroup.Root type="single" value={mounted ? theme : undefined} onValueChange={(v) => v && setTheme(v)} aria-label="Theme"
      className="inline-flex rounded-lg bg-surface-3 p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}
          className="grid h-7 w-8 place-items-center rounded-md text-muted transition-colors hover:text-ink data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-xs">
          <Icon aria-hidden className="size-3.5" />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

/** Unread count, and whether something critical is open. */
function useAlerts() {
  const { data } = useNotifications();
  return { unread: data?.unread ?? 0, critical: (data?.open ?? []).some((n) => n.severity === "critical") };
}

function Count({ n, critical, className = "" }: { n: number; critical: boolean; className?: string }) {
  return <span className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10.5px] font-semibold tabular-nums text-white ${critical ? "bg-critical" : "bg-brand"} ${className}`}>{n}</span>;
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const alerts = useAlerts();
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="mb-1.5 px-2.5 text-[11px] font-medium text-muted">{g.group}</div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon, key }) => {
              const on = isActive(path, href);
              return (
                <li key={href}>
                  <Link href={href} onClick={onNavigate} aria-current={on ? "page" : undefined}
                    className={`group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors ${on ? "font-medium text-ink" : "text-ink2 hover:bg-surface-3 hover:text-ink"}`}>
                    {on && <motion.span layoutId={onNavigate ? "nav-on-m" : "nav-on"} className="absolute inset-0 rounded-lg bg-brand-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                    <Icon aria-hidden className={`relative size-4 shrink-0 ${on ? "text-brand" : "text-muted group-hover:text-ink2"}`} />
                    <span className="relative flex-1">{label}</span>
                    {href === "/notifications" && alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} className="relative" />}
                    {!onNavigate && !(href === "/notifications" && alerts.unread > 0) && <span className="relative hidden text-[10.5px] text-muted opacity-0 transition-opacity group-hover:opacity-100 xl:inline">G {key.toUpperCase()}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Uploads and generation at a glance, at the foot of the sidebar. */
function SystemCard() {
  const { data } = useOverview();
  if (!data) return null;
  const mode = { video: ["Making videos", "bg-good"], template_work: ["Template work", "bg-series"], idle: ["Idle", "bg-muted"], paused: ["Paused", "bg-warning"] }[data.generation.mode];
  return (
    <Link href="/settings" className="block rounded-xl border border-ring bg-surface-2 p-3 text-[12.5px] transition-colors hover:border-ring-strong">
      <div className="text-[11px] font-medium text-muted">System</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-ink2">Uploads</span>
        <span className="flex items-center gap-1.5 font-medium"><span className={`size-1.5 rounded-full ${data.uploadsPaused ? "bg-warning" : "bg-good"}`} />{data.uploadsPaused ? "Paused" : "On"}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-ink2">Generation</span>
        <span className="flex items-center gap-1.5 font-medium"><span className={`size-1.5 rounded-full ${mode[1]}`} />{mode[0]}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-ink2">Backlog</span>
        <span className="font-medium tabular-nums">{data.backlog} / {data.backlogCap}</span>
      </div>
    </Link>
  );
}

function SidebarBody({ onNavigate, signOut }: { onNavigate?: () => void; signOut: () => void }) {
  const openPalette = useCommandMenu();
  return (
    <>
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-surface-3">
        <LogoMark className="size-8" />
        <Wordmark sub="Channel studio" />
        <ChevronsUpDown aria-hidden className="ml-auto size-4 text-muted" />
      </Link>
      <button type="button" onClick={() => { onNavigate?.(); openPalette(); }} aria-label="Search and commands"
        className="mt-4 flex h-9 w-full items-center gap-2 rounded-lg border border-ring bg-surface px-2.5 text-[13px] text-muted shadow-xs transition-colors hover:border-ring-strong hover:text-ink2">
        <Search aria-hidden className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <span className="flex items-center gap-0.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>
      </button>
      <div className="no-scrollbar mt-5 flex-1 overflow-y-auto pb-4"><NavList onNavigate={onNavigate} /></div>
      <SystemCard />
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <ThemeSwitch />
        <Tip label="Sign out">
          <button type="button" onClick={signOut} aria-label="Sign out"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] text-ink2 transition-colors hover:bg-surface-3 hover:text-ink">
            <LogOut aria-hidden className="size-4" /><span className="lg:hidden">Sign out</span>
          </button>
        </Tip>
      </div>
    </>
  );
}

function BellLink() {
  const { unread, critical } = useAlerts();
  return (
    <Tip label={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "Notifications"}>
      <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative grid size-8 place-items-center rounded-full border border-ring bg-surface text-ink2 shadow-xs transition-colors hover:text-ink">
        <Bell aria-hidden className="size-4" />
        {unread > 0 && <Count n={unread} critical={critical} className="absolute -right-1.5 -top-1.5 ring-2 ring-plane" />}
      </Link>
    </Tip>
  );
}

/** Phones: four pages and a "More" button that opens the drawer. */
const QUICK = ["/", "/queue", "/videos", "/analytics"];

function BottomBar({ onMore }: { onMore: () => void }) {
  const path = usePathname();
  const alerts = useAlerts();
  const items = QUICK.map((h) => NAV_ITEMS.find((i) => i.href === h)!);
  return (
    <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ring bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const on = isActive(path, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-1 text-[10.5px] font-medium ${on ? "text-brand" : "text-muted"}`}>
            <Icon aria-hidden className="size-5" />{label}
          </Link>
        );
      })}
      <button type="button" onClick={onMore} aria-label="More pages" className="relative flex h-14 flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-muted">
        <Menu aria-hidden className="size-5" />More
        {alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} className="absolute right-[22%] top-1.5" />}
      </button>
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const openPalette = useCommandMenu();
  const [drawer, setDrawer] = useState(false);
  if (path === "/login") return <main>{children}</main>;

  const signOut = async () => { await fetch("/api/login", { method: "DELETE" }); router.replace("/login"); router.refresh(); };
  const { section, title } = pageTitle(path);

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-[256px] shrink-0 border-r border-ring bg-surface lg:block">
        <div className="sticky top-0 flex h-dvh flex-col px-3 py-4">
          <SidebarBody signOut={signOut} />
        </div>
      </aside>

      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 animate-fade bg-[#0a0d13]/40 lg:hidden" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] animate-slide-in flex-col border-r border-ring bg-surface px-3 py-4 shadow-pop lg:hidden">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Dialog.Close aria-label="Close menu" className="absolute right-3 top-5 grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink"><X aria-hidden className="size-4" /></Dialog.Close>
            <SidebarBody onNavigate={() => setDrawer(false)} signOut={signOut} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ring bg-plane/80 px-4 backdrop-blur-xl md:px-8">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-1.5 grid size-9 place-items-center rounded-lg text-ink2 hover:bg-surface-3 lg:hidden"><Menu aria-hidden className="size-5" /></button>
          <Link href="/" aria-label="Overview" className="lg:hidden"><LogoMark className="size-7" /></Link>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px]">
            {section && <span className="hidden text-muted sm:inline">{section}</span>}
            {section && <span aria-hidden className="hidden text-ring-strong sm:inline">/</span>}
            <span className="truncate font-medium">{title}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:block"><LiveStatus /></span>
            <button type="button" onClick={openPalette} aria-label="Search" className="grid size-8 place-items-center rounded-full border border-ring bg-surface text-ink2 shadow-xs hover:text-ink lg:hidden"><Search aria-hidden className="size-4" /></button>
            <BellLink />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pb-24 pt-7 md:px-8 md:pb-14 md:pt-8">{children}</main>
      </div>

      <BottomBar onMore={() => setDrawer(true)} />
    </div>
  );
}
