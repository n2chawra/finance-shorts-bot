"use client";

import { useIsFetching } from "@tanstack/react-query";
import { Bell, Clapperboard, LogOut, Menu, Monitor, Moon, PanelLeft, Search, Sun, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog, ToggleGroup } from "radix-ui";
import { useEffect, useState } from "react";

import { useNotifications, useOverview } from "@/lib/queries";

import { useCommandMenu } from "./command";
import { NAV, isActive, pageTitle } from "./nav-items";
import { Kbd, Tip } from "./ui";

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
    <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
      <span className="relative flex size-2">
        {!isError && !sample && <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-50" />}
        <span className={`relative inline-flex size-2 rounded-full ${isError ? "bg-critical" : sample ? "bg-muted" : "bg-good"}`} />
      </span>
      <span className="font-medium text-ink2">{label}</span>
      <span className="hidden tabular-nums sm:inline">· {fetching ? "updating…" : ago < 5 ? "just now" : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`}</span>
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
      className="inline-flex rounded-lg border border-ring bg-surface-2 p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}
          className="grid size-6 place-items-center rounded-md text-muted transition-colors hover:text-ink data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-card">
          <Icon aria-hidden className="size-3.5" />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1">
      <span className="brand-gradient grid size-7 shrink-0 place-items-center rounded-lg text-white shadow-card"><Clapperboard aria-hidden className="size-4" /></span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold tracking-tight">Money in 60</span>
          <span className="block truncate text-[11px] text-muted">Finance Shorts Bot</span>
        </span>
      )}
    </Link>
  );
}

/** Unread count with a red dot when something critical is open. */
function useAlerts() {
  const { data } = useNotifications();
  return { unread: data?.unread ?? 0, critical: (data?.open ?? []).some((n) => n.severity === "critical") };
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const alerts = useAlerts();
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV.map((g) => (
        <div key={g.group}>
          {!collapsed && <div className="mb-1 px-2 text-[11px] font-medium text-muted">{g.group}</div>}
          <ul className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon, key }) => {
              const on = isActive(path, href);
              const link = (
                <Link href={href} onClick={onNavigate} aria-current={on ? "page" : undefined} aria-label={collapsed ? label : undefined}
                  className={`group relative flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors ${on ? "font-medium text-ink" : "text-ink2 hover:bg-wash-2 hover:text-ink"} ${collapsed ? "justify-center" : ""}`}>
                  {on && <motion.span layoutId={collapsed ? "nav-on-c" : onNavigate ? "nav-on-m" : "nav-on"} className="absolute inset-0 rounded-lg border border-ring bg-surface shadow-card" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <Icon aria-hidden className={`relative size-4 shrink-0 ${on ? "text-brand-text" : ""}`} />
                  {!collapsed && <span className="relative flex-1">{label}</span>}
                  {href === "/notifications" && alerts.unread > 0 && (
                    <span className={`relative grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-white ${alerts.critical ? "bg-critical" : "bg-brand"} ${collapsed ? "absolute -right-0.5 -top-0.5" : ""}`}>{alerts.unread}</span>
                  )}
                  {!collapsed && !onNavigate && <span className="relative hidden text-[10px] tracking-wide text-muted opacity-0 transition-opacity group-hover:opacity-100 lg:inline">G {key.toUpperCase()}</span>}
                </Link>
              );
              return <li key={href}>{collapsed ? <Tip label={label}>{link}</Tip> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SearchButton({ wide }: { wide?: boolean }) {
  const open = useCommandMenu();
  return (
    <button type="button" onClick={open} aria-label="Search and commands"
      className={`flex h-8 items-center gap-2 rounded-lg border border-ring bg-surface px-2.5 text-[13px] text-muted shadow-card transition-colors hover:border-ring-strong hover:text-ink2 ${wide ? "w-full" : ""}`}>
      <Search aria-hidden className="size-3.5" />
      <span className={wide ? "flex-1 text-left" : "sr-only"}>Search…</span>
      {wide && <span className="flex items-center gap-0.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>}
    </button>
  );
}

function BellLink() {
  const { unread, critical } = useAlerts();
  return (
    <Tip label={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "Notifications"}>
      <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative grid size-8 place-items-center rounded-lg text-ink2 transition-colors hover:bg-wash-2 hover:text-ink">
        <Bell aria-hidden className="size-4" />
        {unread > 0 && (
          <span className={`absolute right-1 top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[9px] font-bold text-white ${critical ? "bg-critical" : "bg-brand"}`}>{unread}</span>
        )}
      </Link>
    </Tip>
  );
}

const COLLAPSE_KEY = "fsb.sidebar.collapsed";
const iconBtn = "grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-wash-2 hover:text-ink";

/**
 * The app frame: a collapsible sidebar on desktop, a slide-out menu on phones, and a sticky top bar
 * with the breadcrumb, live status and search. The sign-in page gets none of it.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const openPalette = useCommandMenu();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1"); } catch { /* storage blocked */ } }, []);
  if (path === "/login") return <main>{children}</main>;

  const toggle = () => setCollapsed((c) => { try { localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1"); } catch { /* storage blocked */ } return !c; });
  const signOut = async () => { await fetch("/api/login", { method: "DELETE" }); router.replace("/login"); router.refresh(); };
  const { section, title } = pageTitle(path);

  return (
    <div className="flex min-h-dvh">
      <aside className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-ring bg-plane py-3 transition-[width] duration-200 md:flex ${collapsed ? "w-[60px] px-2" : "w-60 px-3"}`}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          <Brand collapsed={collapsed} />
          {!collapsed && <Tip label="Collapse sidebar"><button type="button" onClick={toggle} aria-label="Collapse sidebar" className={iconBtn}><PanelLeft aria-hidden className="size-4" /></button></Tip>}
        </div>
        <div className="mt-4">
          {collapsed
            ? <Tip label="Search (Ctrl K)"><button type="button" onClick={openPalette} aria-label="Search" className="mx-auto grid size-8 place-items-center rounded-lg border border-ring bg-surface text-muted shadow-card hover:text-ink"><Search aria-hidden className="size-4" /></button></Tip>
            : <SearchButton wide />}
        </div>
        <div className="no-scrollbar mt-5 flex-1 overflow-y-auto"><NavList collapsed={collapsed} /></div>
        <div className={`flex border-t border-ring pt-3 ${collapsed ? "flex-col items-center gap-2" : "items-center justify-between"}`}>
          {collapsed
            ? <Tip label="Expand sidebar"><button type="button" onClick={toggle} aria-label="Expand sidebar" className={iconBtn}><PanelLeft aria-hidden className="size-4 rotate-180" /></button></Tip>
            : <ThemeSwitch />}
          <Tip label="Sign out"><button type="button" onClick={signOut} aria-label="Sign out" className={iconBtn}><LogOut aria-hidden className="size-4" /></button></Tip>
        </div>
      </aside>

      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 animate-fade bg-black/40 md:hidden" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] animate-slide-in flex-col border-r border-ring bg-plane p-3 md:hidden">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <div className="flex items-center justify-between">
              <Brand />
              <Dialog.Close aria-label="Close menu" className={iconBtn}><X aria-hidden className="size-4" /></Dialog.Close>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto"><NavList onNavigate={() => setDrawer(false)} /></div>
            <div className="flex items-center justify-between border-t border-ring pt-3">
              <ThemeSwitch />
              <button type="button" onClick={signOut} className="flex h-8 items-center gap-2 rounded-md px-2 text-[13px] text-ink2 hover:bg-wash-2"><LogOut aria-hidden className="size-4" />Sign out</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-ring bg-plane/80 px-4 backdrop-blur-md md:px-8">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-1.5 grid size-8 place-items-center rounded-md text-ink2 hover:bg-wash-2 md:hidden"><Menu aria-hidden className="size-5" /></button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            {section && <span className="hidden text-muted sm:inline">{section}</span>}
            {section && <span aria-hidden className="hidden text-ring-strong sm:inline">/</span>}
            <span className="truncate font-medium">{title}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <LiveStatus />
            <BellLink />
            <div className="md:hidden"><SearchButton /></div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-16 pt-6 md:px-8 md:pt-8">{children}</main>
      </div>
    </div>
  );
}
