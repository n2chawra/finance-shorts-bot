"use client";

import { useIsFetching } from "@tanstack/react-query";
import { Bell, Check, ChevronsUpDown, LogOut, Menu, Monitor, Moon, Search, Sun, Tv, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog, DropdownMenu, ToggleGroup } from "radix-ui";
import { type CSSProperties, useEffect, useState } from "react";

import { type ChannelBrand, channelBrand } from "@/lib/channel-brand";

import { useChannels, useNotifications, useOverview, useSwitchChannel } from "@/lib/queries";
import { isPublicPage } from "@/lib/public-pages";
import { signOut as endSession } from "@/lib/sign-out";

import { Wordmark } from "./brand";
import { useHandUploadCount } from "./hand-uploads";
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

function NavList({ onNavigate, accent }: { onNavigate?: () => void; accent: string }) {
  const path = usePathname();
  const alerts = useAlerts();
  const byHand = useHandUploadCount();
  return (
    <nav aria-label="Main" className="flex flex-col gap-5 [@media(max-height:960px)]:gap-3">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="mb-1.5 px-2.5 text-[11px] font-medium text-muted [@media(max-height:960px)]:mb-1">{g.group}</div>
          <ul className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon, key }) => {
              const on = isActive(path, href);
              return (
                <li key={href}>
                  <Link href={href} onClick={onNavigate} aria-current={on ? "page" : undefined}
                    className={`group relative flex h-9 shrink-0 items-center [@media(max-height:960px)]:h-8 gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors ${on ? "font-medium text-ink" : "text-ink2 hover:bg-surface-3 hover:text-ink"}`}>
                    {on && (
                      <motion.span layoutId={onNavigate ? "nav-on-m" : "nav-on"} className="absolute inset-0 rounded-lg bg-brand-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                        {/* the channel's accent marks where you are */}
                        <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full" style={{ background: accent }} />
                      </motion.span>
                    )}
                    <Icon aria-hidden className={`relative size-4 shrink-0 ${on ? "text-brand" : "text-muted group-hover:text-ink2"}`} />
                    <span className="relative flex-1">{label}</span>
                    {href === "/notifications" && alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} className="relative" />}
                    {href === "/queue" && byHand.n > 0 && <Count n={byHand.n} critical={byHand.quota} className="relative" />}
                    {!onNavigate && !(href === "/notifications" && alerts.unread > 0) && !(href === "/queue" && byHand.n > 0) && <span className="relative hidden text-[10.5px] text-muted opacity-0 transition-opacity group-hover:opacity-100 xl:inline">G {key.toUpperCase()}</span>}
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
  const compact = (
    <Link href="/settings" aria-label={`System: uploads ${data.uploadsPaused ? "paused" : "on"}, ${mode[0].toLowerCase()}, backlog ${data.backlog} of ${data.backlogCap}`}
      className="hidden shrink-0 items-center gap-3 rounded-lg border border-ring bg-surface-2 px-2.5 py-1.5 text-[12px] transition-colors hover:border-ring-strong [@media(max-height:960px)]:flex">
      <span className="flex items-center gap-1.5 text-ink2"><span className={`size-1.5 rounded-full ${data.uploadsPaused ? "bg-warning" : "bg-good"}`} />Uploads</span>
      <span className="flex min-w-0 items-center gap-1.5 text-ink2"><span className={`size-1.5 shrink-0 rounded-full ${mode[1]}`} /><span className="truncate">{mode[0]}</span></span>
      <span className="ml-auto font-medium tabular-nums">{data.backlog}/{data.backlogCap}</span>
    </Link>
  );
  return (
    <>
    {compact}
    <Link href="/settings" className="block shrink-0 rounded-xl border border-ring bg-surface-2 p-3 text-[12.5px] transition-colors hover:border-ring-strong [@media(max-height:960px)]:hidden">
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
    </>
  );
}

/** A channel's logo tile (its initials on its accent when it has no logo). */
export function ChannelLogo({ brand, className = "size-8" }: { brand: ChannelBrand; className?: string }) {
  if (brand.logo) return <Image src={brand.logo} alt="" aria-hidden width={64} height={64} className={`shrink-0 rounded-lg object-cover ${className}`} />;
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-white ${className}`} style={{ background: brand.accent }}>
      {brand.initials}
    </span>
  );
}

/** The channel on screen, as its brand (name, short name, accent, logo). */
function useCurrentChannel() {
  const { data } = useChannels();
  const current = data?.channels.find((c) => c.id === data.current);
  return { data, current, brand: channelBrand(data?.current, current?.name) };
}

/** The channel the dashboard shows, and a menu to switch to another or manage them all. `compact` is the
 *  phone header's chip: logo and short name. */
function ChannelSwitcher({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { data, current, brand } = useCurrentChannel();
  const switchTo = useSwitchChannel();
  const router = useRouter();
  // the browser tab names the channel on screen (it said "Paisa Panchayat" on every channel)
  useEffect(() => { if (current && !compact) document.title = `${brand.name} · Studio`; }, [current, brand.name, compact]);
  return (
    <DropdownMenu.Root modal={false}>
      {compact ? (
        <DropdownMenu.Trigger aria-label={`Channel: ${brand.name}. Switch channel`}
          className="flex h-9 min-w-0 shrink items-center gap-1.5 rounded-lg py-1 pl-1 pr-1.5 outline-none transition-colors hover:bg-surface-3 focus-visible:ring-4 focus-visible:ring-brand-soft">
          {data ? <ChannelLogo brand={brand} className="size-7" /> : <span className="size-7 shrink-0 rounded-lg bg-surface-3" />}
          <span className="max-w-[96px] truncate text-[13px] font-semibold">{data ? brand.short : "…"}</span>
          <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted" />
        </DropdownMenu.Trigger>
      ) : (
        <DropdownMenu.Trigger aria-label="Switch channel" className="flex w-full shrink-0 items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left outline-none transition-colors hover:bg-surface-3 focus-visible:ring-4 focus-visible:ring-brand-soft">
          {data ? <ChannelLogo brand={brand} className="size-8" /> : <span className="size-8 shrink-0 rounded-lg bg-surface-3" />}
          <Wordmark name={current ? brand.name : "…"} sub={current && current.status !== "active" ? `Channel studio · ${current.status}` : "Channel studio"} />
          <ChevronsUpDown aria-hidden className="ml-auto size-4 shrink-0 text-muted" />
        </DropdownMenu.Trigger>
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} collisionPadding={8} className="z-50 w-[248px] animate-pop rounded-xl border border-ring bg-surface p-1 shadow-pop">
          <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-medium text-muted">Channels</DropdownMenu.Label>
          {(data?.channels ?? []).map((c) => {
            const b = channelBrand(c.id, c.name);
            return (
              <DropdownMenu.Item key={c.id} onSelect={() => { if (c.id !== data?.current) switchTo(c.id); onNavigate?.(); }}
                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-surface-3">
                <ChannelLogo brand={b} className="size-5 rounded-md" />
                <span className="flex-1 truncate" title={c.name}>{b.name}</span>
                <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${c.health ? { green: "bg-good", amber: "bg-warning", red: "bg-critical" }[c.health.color] : c.status === "active" ? "bg-good" : c.status === "paused" ? "bg-warning" : "bg-info"}`} />
                {c.id === data?.current ? <Check aria-hidden className="size-3.5 text-brand" /> : <span aria-hidden className="size-3.5" />}
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item onSelect={() => { router.push("/channels"); onNavigate?.(); }}
            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-surface-3">
            <Tv aria-hidden className="size-3.5 text-muted" />Manage channels
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/*
 * Sidebar layout: the switcher and search on top and the System card and account row at the foot never
 * shrink; only the page list between them scrolls (thin visible scrollbar, faded edges), so the card can't
 * cover the last group (it hid "Configure" at 1440x900). Below 960 px tall the card is a single row.
 */
function SidebarBody({ onNavigate, signOut }: { onNavigate?: () => void; signOut: () => void }) {
  const openPalette = useCommandMenu();
  const { brand } = useCurrentChannel();
  return (
    <>
      <ChannelSwitcher onNavigate={onNavigate} />
      <button type="button" onClick={() => { onNavigate?.(); openPalette(); }} aria-label="Search and commands"
        className="mt-4 flex h-9 w-full shrink-0 items-center gap-2 rounded-lg border border-ring bg-surface px-2.5 text-[13px] text-muted shadow-xs transition-colors hover:border-ring-strong hover:text-ink2 [@media(max-height:960px)]:mt-3">
        <Search aria-hidden className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <span className="flex items-center gap-0.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>
      </button>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pt-1 [mask-image:linear-gradient(to_bottom,transparent,#000_6px,#000_calc(100%-14px),transparent)] [scrollbar-width:thin] [@media(max-height:960px)]:mt-3">
        <NavList onNavigate={onNavigate} accent={brand.accent} />
      </div>
      <SystemCard />
      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-line pt-3 [@media(max-height:960px)]:mt-2 [@media(max-height:960px)]:pt-2">
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
  const { brand } = useCurrentChannel();
  if (path === "/login") return <main>{children}</main>;
  if (isPublicPage(path)) return <>{children}</>;

  const signOut = () => endSession(() => fetch("/api/login", { method: "DELETE" }), () => { router.replace("/login"); router.refresh(); });
  const { section, title } = pageTitle(path);
  const accentTop: CSSProperties = { borderTopColor: brand.accent };

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-[256px] shrink-0 border-r border-t-[3px] border-ring bg-surface lg:block" style={accentTop}>
        <div className="sticky top-0 flex h-[calc(100dvh-3px)] flex-col px-3 py-4 [@media(max-height:960px)]:py-3">
          <SidebarBody signOut={signOut} />
        </div>
      </aside>

      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 animate-fade bg-[#0a0d13]/40 lg:hidden" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] animate-slide-in flex-col border-r border-t-[3px] border-ring bg-surface px-3 py-4 shadow-pop lg:hidden" style={accentTop}>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Dialog.Close aria-label="Close menu" className="absolute right-3 top-5 grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink"><X aria-hidden className="size-4" /></Dialog.Close>
            <SidebarBody onNavigate={() => setDrawer(false)} signOut={signOut} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-t-[3px] border-ring bg-plane/80 px-4 backdrop-blur-xl sm:gap-3 md:px-8 lg:border-t-0" style={accentTop}>
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-1.5 grid size-9 place-items-center rounded-lg text-ink2 hover:bg-surface-3 lg:hidden"><Menu aria-hidden className="size-5" /></button>
          {/* phones and tablets: which channel is on screen, and the switcher */}
          <span className="flex min-w-0 shrink items-center gap-1 lg:hidden"><ChannelSwitcher compact /><span aria-hidden className="text-ring-strong">/</span></span>
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
