"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { CornerDownLeft, Film, LogOut, Monitor, Moon, Pause, Play, Search, Sun, Tv } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog } from "radix-ui";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { getJson } from "@/lib/api";
import { channelBrand } from "@/lib/channel-brand";
import { fmtCompact, titleCase } from "@/lib/format";
import { useChannels, useOverview, usePatchSettings, useSwitchChannel } from "@/lib/queries";
import { SearchResultSchema } from "@/lib/search";
import { signOut } from "@/lib/sign-out";

import { NAV_ITEMS } from "./nav-items";
import { useToast } from "./toast";
import { Kbd } from "./ui";

/** A channel's logo (or its initials on its accent) at icon size. */
function ChannelMark({ id, name }: { id: string; name?: string }) {
  const b = channelBrand(id, name);
  return b.logo
    ? <Image src={b.logo} alt="" width={18} height={18} className="size-[18px] shrink-0 rounded-full" />
    : <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: b.accent }}>{b.initials}</span>;
}

/** The typed text, settled for ~150 ms. */
function useDebounced(value: string, ms = 150): string {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

const Ctx = createContext<() => void>(() => {});
/** Opens the command palette. */
export const useCommandMenu = () => useContext(Ctx);

const typing = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
};

/**
 * ⌘K / Ctrl+K palette: jump to a page, find a video, flip the pause switches, change theme.
 * Also "g then key" navigation (g q → Queue), Linear-style.
 */
export function CommandMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const overview = useOverview();
  const patch = usePatchSettings();
  const toast = useToast();
  const channels = useChannels();
  const switchChannel = useSwitchChannel();
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim());
  const search = useQuery({
    queryKey: ["search", q],
    queryFn: () => getJson(`/api/search?q=${encodeURIComponent(q)}`, SearchResultSchema),
    enabled: open && q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const found = q && query.trim() ? search.data : undefined;
  const current = channels.data?.current;
  /** Opens a page on a channel, switching to it first when it isn't the one on screen. */
  const openOn = (channelId: string, href: string) => {
    if (channelId !== current) switchChannel(channelId);
    router.push(href);
  };
  const pendingG = useRef<number>(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); return; }
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") { e.preventDefault(); setOpen(true); return; }
      if (e.key === "g") { pendingG.current = Date.now(); return; }
      if (Date.now() - pendingG.current < 1200) {
        const item = NAV_ITEMS.find((i) => i.key === e.key);
        pendingG.current = 0;
        if (item) { e.preventDefault(); router.push(item.href); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const run = useCallback((fn: () => void) => { setOpen(false); setQuery(""); fn(); }, []);
  const flip = (p: { uploadsPaused?: boolean; generationPaused?: boolean }, done: string) =>
    patch.mutate(p, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });
  const o = overview.data;

  return (
    <Ctx.Provider value={() => setOpen(true)}>
      {children}
      <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 animate-fade bg-[#0a0d13]/40 backdrop-blur-[2px]" />
          <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-[12vh] z-50 w-[min(600px,calc(100vw-1.5rem))] -translate-x-1/2 animate-pop overflow-hidden rounded-2xl border border-ring bg-surface shadow-pop">
            <Dialog.Title className="sr-only">Command menu</Dialog.Title>
            <Command loop>
              <div className="flex items-center gap-2.5 border-b border-line px-4">
                <Search aria-hidden className="size-4 text-muted" />
                <Command.Input autoFocus value={query} onValueChange={setQuery} placeholder="Search pages, channels, videos and actions…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted focus-visible:outline-none" />
                <Kbd>Esc</Kbd>
              </div>
              <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
                <Command.Empty>{query.trim() && (q !== query.trim() || search.isFetching) ? "Searching…" : "Nothing matches."}</Command.Empty>
                <Command.Group heading="Pages">
                  {NAV_ITEMS.map((i) => (
                    <Command.Item key={i.href} value={i.label} keywords={["go", "page"]} onSelect={() => run(() => router.push(i.href))}>
                      <i.icon aria-hidden className="size-4" />
                      <span className="flex-1">{i.label}</span>
                      <span className="flex gap-1"><Kbd>G</Kbd><Kbd>{i.key.toUpperCase()}</Kbd></span>
                    </Command.Item>
                  ))}
                </Command.Group>
                {o && (
                  <Command.Group heading="Actions">
                    <Command.Item value="uploads pause resume" onSelect={() => run(() => flip({ uploadsPaused: !o.uploadsPaused }, o.uploadsPaused ? "Uploads resumed" : "Uploads paused"))}>
                      {o.uploadsPaused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                      {o.uploadsPaused ? "Resume uploads" : "Pause uploads"}
                    </Command.Item>
                    <Command.Item value="generation pause resume" onSelect={() => run(() => flip({ generationPaused: o.generation.mode !== "paused" }, o.generation.mode === "paused" ? "Generation resumed" : "Generation paused"))}>
                      {o.generation.mode === "paused" ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                      {o.generation.mode === "paused" ? "Resume generation" : "Pause generation"}
                    </Command.Item>
                  </Command.Group>
                )}
                {(found?.channels.length ?? 0) > 0 && (
                  <Command.Group heading="Channels">
                    {found!.channels.map((c) => (
                      <Command.Item key={c.id} value={`channel ${c.name} ${c.id}`} keywords={[q]} onSelect={() => run(() => openOn(c.id, "/"))}>
                        <ChannelMark id={c.id} name={c.name} />
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        <span className="text-xs font-medium opacity-60">{c.id === current ? "Current" : <span className="inline-flex items-center gap-1"><Tv aria-hidden className="size-3" />Switch</span>}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {(found?.videos.length ?? 0) > 0 && (
                  <Command.Group heading="Videos">
                    {found!.videos.map((v) => (
                      <Command.Item key={v.id} value={`video ${v.title} ${v.id}`} keywords={[q, v.channelName]} onSelect={() => run(() => openOn(v.channelId, `/videos/${v.id}`))}>
                        <Film aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{v.title}</span>
                          <span className="flex items-center gap-1.5 text-xs opacity-60">
                            <ChannelMark id={v.channelId} name={v.channelName} />
                            <span className="truncate">{v.channelName}</span>
                            <span aria-hidden>·</span><span>{v.id}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-xs">
                          <span className="block font-medium">{titleCase(v.status)}</span>
                          <span className="block opacity-60">{v.views == null ? "–" : `${fmtCompact(v.views)} views`}</span>
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                <Command.Group heading="Theme">
                  <Command.Item value="theme light" onSelect={() => run(() => setTheme("light"))}><Sun aria-hidden className="size-4" />Light theme</Command.Item>
                  <Command.Item value="theme dark" onSelect={() => run(() => setTheme("dark"))}><Moon aria-hidden className="size-4" />Dark theme</Command.Item>
                  <Command.Item value="theme system" onSelect={() => run(() => setTheme("system"))}><Monitor aria-hidden className="size-4" />Match system</Command.Item>
                </Command.Group>
                <Command.Group heading="Account">
                  <Command.Item value="sign out log out" onSelect={() => run(() => signOut(() => fetch("/api/login", { method: "DELETE" }), () => { router.replace("/login"); router.refresh(); }))}>
                    <LogOut aria-hidden className="size-4" />Sign out
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-2.5 text-[11.5px] text-muted">
                <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> to move <Kbd><CornerDownLeft className="size-3" /></Kbd> to open</span>
                <span className="flex items-center gap-1"><Kbd>G</Kbd> then a letter jumps to a page</span>
              </div>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Ctx.Provider>
  );
}
