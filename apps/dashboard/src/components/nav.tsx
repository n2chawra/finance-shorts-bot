"use client";

import { useIsFetching } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog, ToggleGroup } from "radix-ui";
import { useEffect, useState } from "react";

import { fmtCompact, fmtDateTime } from "@/lib/format";
import { useNotifications, useOverview, useSettings } from "@/lib/queries";

import { LogoMark, Wordmark } from "./brand";
import { useCommandMenu } from "./command";
import { NAV, NAV_ITEMS, isActive } from "./nav-items";
import { Tip } from "./ui";

/*
 * The frame: a black masthead (brand, search, live status, alerts), a lime ticker with the channel's
 * state, and a tab strip with every page. Phones get a bottom tab bar and a full-screen menu instead
 * of the strip. The sign-in page gets none of it.
 */

/** Masthead colours stay the same in both themes. */
const MAST = "bg-[#0b0b0b] text-[#f3eee1]";

/** "LIVE · 12s ago" with a blinking square; says "updating…" while a refresh is in flight. */
export function LiveStatus() {
  const { data, dataUpdatedAt, isError } = useOverview();
  const fetching = useIsFetching() > 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!data) return null;
  const ago = Math.max(0, Math.round((now - dataUpdatedAt) / 1000));
  const sample = data.source === "sample";
  const label = sample ? "Sample data" : isError ? "Offline" : "Live";
  return (
    <span className="flex h-9 items-center gap-2 whitespace-nowrap border-2 border-[#f3eee1]/30 px-2.5 font-mono text-[11px] font-bold uppercase tracking-wider">
      <span className={`size-2.5 border border-[#f3eee1] ${isError ? "bg-red" : sample ? "bg-sun" : "animate-pulse-dot bg-lime"}`} />
      <span>{label}</span>
      <span className="hidden tabular-nums text-[#f3eee1]/60 lg:inline">{fetching ? "updating…" : ago < 5 ? "just now" : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`}</span>
    </span>
  );
}

function ThemeSwitch({ onDark }: { onDark?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [{ value: "light", label: "Light theme", icon: Sun }, { value: "system", label: "Match system theme", icon: Monitor }, { value: "dark", label: "Dark theme", icon: Moon }];
  return (
    <ToggleGroup.Root type="single" value={mounted ? theme : undefined} onValueChange={(v) => v && setTheme(v)} aria-label="Theme"
      className={`inline-flex h-9 border-2 ${onDark ? "border-[#f3eee1]/30" : "border-edge bg-surface"}`}>
      {options.map(({ value, label, icon: Icon }, i) => (
        <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}
          className={`grid w-8 place-items-center transition-colors data-[state=on]:bg-lime data-[state=on]:text-[#0b0b0b] ${i ? (onDark ? "border-l-2 border-[#f3eee1]/30" : "border-l-2 border-edge") : ""} ${onDark ? "text-[#f3eee1]/70 hover:text-[#f3eee1]" : "text-ink2 hover:text-ink"}`}>
          <Icon aria-hidden strokeWidth={2.5} className="size-3.5" />
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
  return <span className={`grid h-5 min-w-5 place-items-center border-2 border-[#0b0b0b] px-1 font-mono text-[10px] font-bold tabular-nums text-[#0b0b0b] ${critical ? "bg-red" : "bg-sun"} ${className}`}>{n}</span>;
}

function BellLink() {
  const { unread, critical } = useAlerts();
  return (
    <Tip label={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "Notifications"}>
      <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative grid size-9 place-items-center border-2 border-[#f3eee1]/30 transition-colors hover:border-lime hover:text-lime">
        <Bell aria-hidden strokeWidth={2.5} className="size-4" />
        {unread > 0 && <Count n={unread} critical={critical} className="absolute -right-2.5 -top-2.5" />}
      </Link>
    </Tip>
  );
}

/** One scrolling line of what the channel is doing right now. Decorative: the same facts live on the pages. */
function Ticker() {
  const { data } = useOverview();
  const settings = useSettings();
  if (!data) return <div className="h-8 border-b-2 border-edge bg-lime" />;
  const times = settings.data?.uploadTimes.join(" · ");
  const facts = [
    data.uploadsPaused ? "Uploads paused" : "Uploads on",
    times ? `Shorts at ${times} IST` : null,
    `Backlog ${data.backlog} / ${data.backlogCap}`,
    `${fmtCompact(data.allTime.views)} views all time`,
    `+${fmtCompact(data.last7.views)} views this week`,
    `+${data.last7.subsGained} subscribers this week`,
    data.nextUpload ? `Next upload ${fmtDateTime(data.nextUpload.publishAt)} IST` : "Nothing scheduled",
    `Generation: ${data.generation.mode.replace("_", " ")}`,
  ].filter(Boolean) as string[];
  const row = facts.map((f, i) => <span key={i} className="flex shrink-0 items-center gap-5 pr-5"><span>{f}</span><span aria-hidden>✦</span></span>);
  return (
    <div aria-hidden className="h-8 overflow-hidden border-b-2 border-edge bg-lime text-[#0b0b0b]">
      <div className="flex h-full w-max animate-marquee items-center whitespace-nowrap font-mono text-[11.5px] font-bold uppercase tracking-wider">
        {row}{row}
      </div>
    </div>
  );
}

/** The desktop tab strip: every page, grouped, the current one a lime block. */
function NavStrip() {
  const path = usePathname();
  const alerts = useAlerts();
  return (
    <nav aria-label="Main" className="sticky top-0 z-30 hidden border-b-2 border-edge bg-surface md:block">
      <div className="no-scrollbar mx-auto flex max-w-[1520px] items-stretch overflow-x-auto px-4 md:px-8">
        {NAV.map((g, gi) => (
          <div key={g.group} className={`flex shrink-0 items-center gap-0.5 py-2 ${gi ? "ml-2 border-l-2 border-edge pl-2" : ""}`}>
            <span className="nb-label mr-1 hidden !text-[9.5px] text-muted 2xl:inline">{g.group}</span>
            {g.items.map(({ href, label, icon: Icon, key }) => {
              const on = isActive(path, href);
              return (
                <Link key={href} href={href} aria-current={on ? "page" : undefined} title={`${label} (G then ${key.toUpperCase()})`}
                  className={`relative flex h-9 shrink-0 items-center gap-1.5 border-2 px-2.5 text-[12.5px] font-bold uppercase tracking-wide transition-[transform,box-shadow,background-color] ${
                    on ? "border-edge bg-lime text-on-accent shadow-[3px_3px_0_0_var(--hard)]" : "border-transparent text-ink2 hover:-translate-y-0.5 hover:border-edge hover:bg-surface hover:text-ink hover:shadow-[2px_2px_0_0_var(--hard)]"}`}>
                  <Icon aria-hidden strokeWidth={2.5} className="hidden size-4 2xl:block" />
                  {label}
                  {href === "/notifications" && alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

/** Phones: four pages and a "More" button that opens the full menu. */
const QUICK = ["/", "/queue", "/videos", "/analytics"];

function BottomBar({ onMore }: { onMore: () => void }) {
  const path = usePathname();
  const alerts = useAlerts();
  const items = QUICK.map((h) => NAV_ITEMS.find((i) => i.href === h)!);
  const moreOn = !items.some((i) => isActive(path, i.href));
  return (
    <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-edge bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const on = isActive(path, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex h-16 flex-col items-center justify-center gap-1 border-r-2 border-edge text-[10px] font-bold uppercase tracking-wide ${on ? "bg-lime text-on-accent" : "text-ink2"}`}>
            <Icon aria-hidden strokeWidth={2.5} className="size-5" />{label}
          </Link>
        );
      })}
      <button type="button" onClick={onMore} aria-label="More pages"
        className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide ${moreOn ? "bg-lime text-on-accent" : "text-ink2"}`}>
        <Menu aria-hidden strokeWidth={2.5} className="size-5" />More
        {alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} className="absolute right-3 top-2" />}
      </button>
    </nav>
  );
}

const ACCENTS = ["bg-lime", "bg-sky", "bg-pink", "bg-sun"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const openPalette = useCommandMenu();
  const [menu, setMenu] = useState(false);
  const alerts = useAlerts();
  if (path === "/login") return <main>{children}</main>;

  const signOut = async () => { await fetch("/api/login", { method: "DELETE" }); router.replace("/login"); router.refresh(); };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className={`${MAST} border-b-2 border-edge`}>
        <div className="mx-auto flex h-16 max-w-[1520px] items-center gap-3 px-4 md:h-[72px] md:px-8">
          <Link href="/" aria-label="Paisa Panchayat, overview" className="flex min-w-0 items-center gap-3">
            <LogoMark className="size-9 md:size-10" />
            <span className="hidden sm:block"><Wordmark tone="rail" /></span>
          </Link>
          <button type="button" onClick={openPalette} aria-label="Search and commands"
            className="ml-auto flex h-9 items-center gap-2 border-2 border-[#f3eee1]/30 px-3 font-mono text-[12px] font-bold uppercase tracking-wider text-[#f3eee1]/70 transition-colors hover:border-lime hover:text-lime md:ml-8 md:w-[320px] lg:w-[420px]">
            <Search aria-hidden strokeWidth={3} className="size-4" />
            <span className="hidden flex-1 text-left md:inline">Jump to anything…</span>
            <span className="hidden border-2 border-current px-1 text-[10px] md:inline">Ctrl K</span>
          </button>
          <div className="flex items-center gap-2.5 md:ml-auto">
            <span className="hidden md:block"><LiveStatus /></span>
            <span className="hidden lg:block"><ThemeSwitch onDark /></span>
            <BellLink />
            <Tip label="Sign out">
              <button type="button" onClick={signOut} aria-label="Sign out"
                className="hidden size-9 place-items-center border-2 border-[#f3eee1]/30 transition-colors hover:border-red hover:text-red md:grid">
                <LogOut aria-hidden strokeWidth={2.5} className="size-4" />
              </button>
            </Tip>
          </div>
        </div>
      </header>
      <Ticker />
      <NavStrip />

      <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 pb-28 pt-7 md:px-8 md:pb-16 md:pt-10">{children}</main>

      <footer className="hidden border-t-2 border-edge bg-surface md:block">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between px-8 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
          <span>Paisa Panchayat · control room</span>
          <span>Press G then a letter to jump · Ctrl K to search</span>
        </div>
      </footer>

      <BottomBar onMore={() => setMenu(true)} />

      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Portal>
          <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-50 flex animate-slide-up flex-col overflow-y-auto bg-plane md:hidden">
            <div className={`${MAST} flex h-16 shrink-0 items-center justify-between border-b-2 border-edge px-4`}>
              <Dialog.Title className="font-display text-xl uppercase">All pages</Dialog.Title>
              <Dialog.Close aria-label="Close menu" className="grid size-10 place-items-center border-2 border-[#f3eee1]/40"><X aria-hidden strokeWidth={3} className="size-5" /></Dialog.Close>
            </div>
            <div className="flex flex-col gap-6 p-4">
              {NAV.map((g, gi) => (
                <div key={g.group}>
                  <div className="nb-label mb-2 text-muted">{g.group}</div>
                  <ul className="grid grid-cols-2 gap-3">
                    {g.items.map(({ href, label, icon: Icon }) => {
                      const on = isActive(path, href);
                      return (
                        <li key={href}>
                          <Link href={href} onClick={() => setMenu(false)} aria-current={on ? "page" : undefined}
                            className={`nb nb-press flex h-20 flex-col justify-between p-3 ${on ? `${ACCENTS[gi % ACCENTS.length]} on-accent` : "bg-surface"}`}>
                            <span className="flex items-center justify-between">
                              <Icon aria-hidden strokeWidth={2.5} className="size-5" />
                              {href === "/notifications" && alerts.unread > 0 && <Count n={alerts.unread} critical={alerts.critical} />}
                            </span>
                            <span className="font-display text-[15px] uppercase">{label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="flex items-center justify-between border-t-2 border-edge pt-4">
                <ThemeSwitch />
                <button type="button" onClick={signOut} className="nb-sm nb-press flex h-10 items-center gap-2 bg-red px-4 text-[12.5px] font-bold uppercase text-on-accent">
                  <LogOut aria-hidden strokeWidth={2.5} className="size-4" />Sign out
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
