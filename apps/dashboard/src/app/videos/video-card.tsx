/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowUpRight, Award, Eye, Loader2, MoreHorizontal, Trophy, Volume2, VolumeX, X, XCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Dialog, DropdownMenu } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { originLine } from "@/components/origin";
import { ReasonDialog } from "@/components/feedback";
import { useToast } from "@/components/toast";
import { StatusBadge } from "@/components/ui";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useVideoAction } from "@/lib/queries";
import { canMarkStale } from "@/lib/queue-actions";
import type { Video } from "@/lib/schemas";

const HOLD_MS = 450;   // a touch held this long plays the preview instead of opening the video
const SOUND_KEY = "videos:preview-sound";

/** Sound on hover previews: off by default, remembered on this device (owner, 2026-11-19). */
function useSound(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => { try { setOn(localStorage.getItem(SOUND_KEY) === "1"); } catch { /* storage blocked */ } }, []);
  const set = (v: boolean) => { setOn(v); try { localStorage.setItem(SOUND_KEY, v ? "1" : "0"); } catch { /* storage blocked */ } };
  return [on, set];
}

/** "0:32", "3:41": how YouTube labels a video's length. */
const clock = (sec: number) => { const s = Math.max(0, Math.round(sec)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

/** A playable file: the Release asset or /api/media/<id>/video. Empty or non-video links fall back to the thumbnail. */
const playable = (url: string) => !!url && (/\.(mp4|webm|mov)(\?|$)/i.test(url) || /\/api\/media\/[^/]+\/video/.test(url));

/**
 * One video in the grid. Hover (desktop) or a held tap (touch) plays a short muted preview; the
 * page passes `playing` so only one card plays at a time, and the <video> mounts only then.
 */
export function VideoCard({ v, index, best, playing, onPlay }: {
  v: Video; index: number; best: boolean; playing: boolean; onPlay: (id: string | null) => void;
}) {
  const [broken, setBroken] = useState(false);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useSound();
  const [open, setOpen] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const canPreview = playable(v.fileUrl) && !broken;
  const long = v.format === "long";

  useEffect(() => { if (!playing) setReady(false); }, [playing]);
  useEffect(() => () => { if (hold.current) clearTimeout(hold.current); }, []);

  const cancelHold = () => { if (hold.current) { clearTimeout(hold.current); hold.current = null; } };

  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(index, 18) * 0.02 }}
      className={`panel hover-raise group relative flex flex-col overflow-hidden bg-surface ${best ? "ring-2 ring-[#f5b301]/70" : ""}`}
      onPointerEnter={(e) => { if (e.pointerType === "mouse" && canPreview) onPlay(v.id); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse" && playing) onPlay(null); }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" || !canPreview) return;
        held.current = false;
        cancelHold();
        hold.current = setTimeout(() => { held.current = true; onPlay(playing ? null : v.id); }, HOLD_MS);
      }}
      onPointerUp={cancelHold} onPointerCancel={cancelHold}
      // a held tap plays the preview: it must not also open the video or the phone's link menu;
      // a plain click on a playable video opens the preview modal (details are one click away there)
      onClickCapture={(e) => {
        if (held.current) { e.preventDefault(); e.stopPropagation(); held.current = false; return; }
        // only clicks on the card itself: the modal, the ⋯ menu and its dialogs render in portals, and
        // React still bubbles their clicks here
        if (!e.currentTarget.contains(e.target as Node)) return;
        if (canPreview && !e.ctrlKey && !e.metaKey && !e.shiftKey && !(e.target as HTMLElement).closest("[data-card-control]")) {
          e.preventDefault(); e.stopPropagation(); onPlay(null); setOpen(true);
        }
      }}
      onContextMenu={(e) => { if (hold.current || held.current) e.preventDefault(); }}>
      <div className={`relative select-none ${long ? "bg-[#0a0d13]" : "bg-surface-3"}`} style={{ WebkitTouchCallout: "none" }}>
        <img src={v.thumbnailUrl} alt="" loading="lazy" draggable={false} className={`aspect-[4/5] w-full ${long ? "object-contain" : "object-cover object-top"}`} />
        {playing && canPreview && (
          <video src={v.fileUrl} muted={!sound} playsInline autoPlay loop preload="metadata" aria-hidden
            onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 20) e.currentTarget.currentTime = Math.min(3, d / 10); }}
            onPlaying={() => setReady(true)} onError={() => { setBroken(true); onPlay(null); }}
            className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"} ${long ? "object-contain" : "object-cover object-top"}`} />
        )}
        {playing && canPreview && !ready && (
          // a soft backdrop while the preview loads: the frame dims and blurs, a spinner sits in the middle
          <span aria-hidden className="absolute inset-0 grid place-items-center bg-[#0a0d13]/45 backdrop-blur-[3px] animate-fade">
            <span className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="size-7 animate-spin drop-shadow" />
              <span className="rounded-full bg-[#0a0d13]/60 px-2 py-0.5 text-[11px] font-medium">Loading preview</span>
            </span>
          </span>
        )}
        {playing && canPreview && (
          <button type="button" data-card-control onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSound(!sound); }}
            aria-label={sound ? "Mute previews" : "Turn preview sound on"} aria-pressed={sound}
            className="absolute right-2 bottom-9 z-10 grid size-8 place-items-center rounded-full bg-[#0a0d13]/75 text-white backdrop-blur transition hover:bg-[#0a0d13]/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft">
            {sound ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
          </button>
        )}
        <span className="absolute left-2 top-2"><StatusBadge status={v.status} /></span>
        <span className="absolute bottom-2 right-2 flex items-center gap-1">
          {long && <span className="rounded-full bg-[#0a0d13]/75 px-2 py-0.5 text-[11.5px] font-medium text-white backdrop-blur">Long</span>}
          {v.durationSec > 0 && <span className="rounded-md bg-[#0a0d13]/80 px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-white backdrop-blur" title="Length">{clock(v.durationSec)}</span>}
        </span>
        {v.totals && (
          <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium backdrop-blur ${best ? "bg-[#f5b301] text-[#1a1300]" : "bg-[#0a0d13]/75 text-white"}`}
            title={best ? "The channel's most-viewed video" : "Views"}>
            {best ? <Trophy aria-hidden className="size-3" /> : <Eye aria-hidden className="size-3" />}{fmtCompact(v.totals.views)}
            {best && <span className="sr-only">, the channel&apos;s best</span>}
          </span>
        )}
        {v.pickedAt && <span className="absolute left-2 top-9 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white"><Award aria-hidden className="size-3" />Up next</span>}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        {/* the whole card opens the video; the title is the link */}
        <Link href={`/videos/${v.id}`} className="line-clamp-2 pr-6 text-[13.5px] font-medium leading-snug after:absolute after:inset-0">{v.title}</Link>
        {originLine(v.origin) && <span className="mt-1 line-clamp-2 text-[12px] text-ink2" title={v.origin?.why ?? undefined}>{originLine(v.origin)}</span>}
        <span className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-3 text-[11.5px] text-muted">
          <span className="font-mono">{v.id}</span><span aria-hidden>·</span><span>{titleCase(v.topic.category)}</span><span aria-hidden>·</span><span>{fmtDateTime(v.upload?.publishAt ?? v.createdAt)}</span>
        </span>
      </div>
      <CardMenu v={v} />
      {canPreview && <PreviewModal v={v} open={open} onOpenChange={setOpen} long={long} />}
    </motion.li>
  );
}

/** Click a card: the video plays in a modal, with sound and controls; the details page is one click away. */
function PreviewModal({ v, open, onOpenChange, long }: { v: Video; open: boolean; onOpenChange: (o: boolean) => void; long: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!open) setReady(false); }, [open]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#05070b]/80 backdrop-blur-sm animate-fade" />
        <Dialog.Content aria-describedby={undefined}
          className={`fixed left-1/2 top-1/2 z-[71] flex max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-ring bg-surface shadow-pop animate-pop ${long ? "w-[min(960px,94vw)]" : "w-[min(420px,94vw)]"}`}>
          <div className="relative bg-black">
            <video src={v.fileUrl} controls autoPlay playsInline preload="auto" poster={v.thumbnailUrl}
              onPlaying={() => setReady(true)} onCanPlay={() => setReady(true)}
              className={`block w-full ${long ? "aspect-video" : "aspect-[9/16] max-h-[78vh]"} object-contain`} />
            {!ready && (
              <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center bg-[#0a0d13]/40 backdrop-blur-[2px]">
                <Loader2 className="size-9 animate-spin text-white drop-shadow" />
              </span>
            )}
            <Dialog.Close aria-label="Close preview"
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-[#0a0d13]/70 text-white backdrop-blur hover:bg-[#0a0d13]/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft">
              <X aria-hidden className="size-4" />
            </Dialog.Close>
          </div>
          <div className="flex items-center gap-3 p-3.5">
            <Dialog.Title className="line-clamp-2 flex-1 text-[14px] font-semibold leading-snug">{v.title}</Dialog.Title>
            <Link href={`/videos/${v.id}`} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-ring px-2.5 py-1.5 text-[12.5px] font-medium hover:bg-surface-3">
              Details <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The ⋯ menu: pick for the next upload, or mark stale with a reason. Sits above the card's link. */
function CardMenu({ v }: { v: Video }) {
  const act = useVideoAction();
  const toast = useToast();
  const [ask, setAsk] = useState<"pick" | "stale" | null>(null);
  const canPick = v.status === "queued";
  const canStale = canMarkStale(v.status);
  if (!canPick && !canStale) return null;
  const item = "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
  const unpick = () => act.mutate({ id: v.id, action: "unpick" }, { onSuccess: () => toast("Pick removed"), onError: (e) => toast(e.message, "error") });
  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger data-card-control aria-label={`Actions for ${v.title}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-[#0a0d13]/70 text-white outline-none backdrop-blur transition hover:bg-[#0a0d13]/90 focus-visible:ring-4 focus-visible:ring-brand-soft data-[state=open]:bg-[#0a0d13]/90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:data-[state=open]:opacity-100">
          <MoreHorizontal aria-hidden className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={4} className="z-50 w-[210px] animate-pop rounded-xl border border-ring bg-surface p-1 shadow-pop">
            {canPick && (v.pickedAt
              ? <DropdownMenu.Item disabled={act.isPending} onSelect={unpick} className={item}><XCircle aria-hidden className="size-3.5 text-muted" />Remove my pick</DropdownMenu.Item>
              : <DropdownMenu.Item disabled={act.isPending} onSelect={() => setAsk("pick")} className={item}><Award aria-hidden className="size-3.5 text-muted" />Upload next…</DropdownMenu.Item>)}
            {canStale && <DropdownMenu.Item disabled={act.isPending} onSelect={() => setAsk("stale")} className={`${item} text-critical-text`}><XCircle aria-hidden className="size-3.5" />Mark stale…</DropdownMenu.Item>}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ReasonDialog open={ask !== null} onOpenChange={(o) => !o && setAsk(null)} required={ask === "stale"}
        title={ask === "pick" ? "Upload this one next?" : "Mark this video stale?"}
        description={ask === "pick" ? "It goes out in the next slot, before the editor's ranking. Why this one? The editor and the next videos learn from your choices."
          : "It leaves the queue and will never be posted. Say why: the next videos and the improver learn from it."}
        placeholder={ask === "pick" ? "e.g. Strongest hook; big-money topic people love" : "e.g. Personal-budget topic; the hook gives the answer away"}
        confirmLabel={ask === "pick" ? "Upload next" : "Mark stale"}
        onSubmit={(reason) => {
          if (ask) act.mutate({ id: v.id, action: ask, reason: reason || undefined },
            { onSuccess: () => toast(ask === "pick" ? "Picked: it goes out in the next slot" : "Marked stale"), onError: (e) => toast(e.message, "error") });
          setAsk(null);
        }} />
    </>
  );
}
