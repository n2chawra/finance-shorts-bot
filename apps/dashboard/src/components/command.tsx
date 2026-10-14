"use client";

import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { CornerDownLeft, Film, LogOut, Monitor, Moon, Pause, Play, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog } from "radix-ui";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { getJson } from "@/lib/api";
import { useOverview, usePatchSettings } from "@/lib/queries";
import { VideoSchema } from "@/lib/schemas";

import { NAV_ITEMS } from "./nav-items";
import { useToast } from "./toast";
import { Kbd } from "./ui";

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
  const videos = useQuery({ queryKey: ["videos", ""], queryFn: () => getJson("/api/videos", z.array(VideoSchema)), enabled: open });
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

  const run = useCallback((fn: () => void) => { setOpen(false); fn(); }, []);
  const flip = (p: { uploadsPaused?: boolean; generationPaused?: boolean }, done: string) =>
    patch.mutate(p, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });
  const o = overview.data;

  return (
    <Ctx.Provider value={() => setOpen(true)}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 animate-fade bg-black/30 backdrop-blur-[1px]" />
          <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-[12vh] z-50 w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2 animate-pop overflow-hidden rounded-xl border border-ring bg-surface shadow-lift">
            <Dialog.Title className="sr-only">Command menu</Dialog.Title>
            <Command loop>
              <div className="flex items-center gap-2 border-b border-line px-3">
                <Search aria-hidden className="size-4 text-muted" />
                <Command.Input autoFocus placeholder="Search pages, videos and actions…" className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted focus-visible:outline-none" />
                <Kbd>Esc</Kbd>
              </div>
              <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
                <Command.Empty>Nothing matches.</Command.Empty>
                <Command.Group heading="Go to">
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
                {(videos.data?.length ?? 0) > 0 && (
                  <Command.Group heading="Videos">
                    {videos.data!.slice(0, 60).map((v) => (
                      <Command.Item key={v.id} value={`${v.title} ${v.id}`} keywords={[v.topic.title]} onSelect={() => run(() => router.push(`/videos/${v.id}`))}>
                        <Film aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">{v.title}</span>
                        <span className="font-mono text-[11px] text-muted">{v.id}</span>
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
                  <Command.Item value="sign out log out" onSelect={() => run(async () => { await fetch("/api/login", { method: "DELETE" }); router.replace("/login"); router.refresh(); })}>
                    <LogOut aria-hidden className="size-4" />Sign out
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px] text-muted">
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
