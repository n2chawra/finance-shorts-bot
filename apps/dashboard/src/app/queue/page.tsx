"use client";

import { AlertTriangle, ArrowDown, ArrowUp, CalendarClock, ChevronsDown, ChevronsUp, Clock, Download, ExternalLink, Film, Flame, GripVertical, ListOrdered, Smartphone, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CopyButton, MarkUploaded, uploadText } from "@/app/videos/[id]/publish-tools";
import { ActionMenu, Badge, Button, Card, ConfirmButton, Empty, ErrorNote, Loading, PageHeader, Stagger, Thumb, Toggle, VideoLink, buttonClass } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { type Format, type PlanSlot, madeBy, postingPlan, runway } from "@/lib/posting-plan";
import { useOverview, usePatchSettings, useQueue, useReorder, useSettings, useVideoAction, useVideos } from "@/lib/queries";
import { describeTimes } from "@/lib/slots";
import type { Settings, Video, VideoAction } from "@/lib/schemas";

const DONE: Record<VideoAction, string> = { skip: "Moved to the end of the queue", delete: "Video deleted", "upload-now": "Marked for upload on the next publish run" };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (ms: number) => new Date(ms).toISOString();

/** Where a video came from: the run that made it, and the feed topic behind it. */
function Origin({ v }: { v: Video }) {
  const s = v.style.source;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge>{madeBy(v)}</Badge>
      {s?.urgent ? <Badge tone="critical" icon={Flame}>{titleCase(s.urgent.level)} · post by {s.urgent.until.slice(5)}</Badge>
        : s?.feedId ? <Badge tone="info">{s.kind ? `${titleCase(s.kind)} topic` : "Feed topic"}</Badge>
        : <Badge tone="neutral">Evergreen pick</Badge>}
    </span>
  );
}

function SlotLabel({ slot, paused }: { slot: PlanSlot | undefined; paused: boolean }) {
  if (!slot) return <Badge>No slot yet</Badge>;
  if (slot.state === "due") return <Badge tone="warning" icon={Clock}>{paused ? "Post now" : "Uploading now"}</Badge>;
  return (
    <span className="leading-tight">
      <span className="block tabular-nums text-ink2">{fmtDateTime(iso(slot.at))}</span>
      <span className="text-xs text-muted">{fmtRelative(iso(slot.at))}</span>
    </span>
  );
}

/** The video to post next by hand, with everything YouTube Studio asks for one click away. */
function PostNext({ slot }: { slot: PlanSlot & { video: Video } }) {
  const v = slot.video;
  const { description } = uploadText(v);
  const due = slot.state === "due";
  return (
    <Card className={`mb-4 ${due ? "border-warning/40" : ""}`} title={due ? "Post this now" : "Post next"} icon={Upload}
      description={`${slot.format === "long" ? "Long video" : "Short"} slot ${fmtDateTime(iso(slot.at))} IST, ${fmtRelative(iso(slot.at))}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Thumb src={v.thumbnailUrl} alt="" className={v.format === "long" ? "w-24 aspect-video" : "w-14"} />
        <div className="min-w-0 flex-1">
          <VideoLink id={v.id} className="block text-[15px] font-medium leading-snug">{v.title}</VideoLink>
          <div className="mt-1.5"><Origin v={v} /></div>
          {slot.stale && <p className="mt-2 flex items-center gap-1.5 text-xs text-critical-text"><AlertTriangle aria-hidden className="size-3.5" />Its news is stale by this slot. Post it as soon as you can.</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <a href={v.fileUrl} download={`${v.id}.mp4`} className={buttonClass("default")}><Download aria-hidden className="size-4" />Download</a>
            <CopyButton text={v.title} label="Copy title" />
            <CopyButton text={description} label="Copy description" />
            <CopyButton text={v.tags.join(", ")} label="Copy tags" />
            <MarkUploaded v={v} />
          </div>
          <p className="mt-2 text-xs text-muted">After posting, press Mark as uploaded and paste the link: the next video moves up here.</p>
        </div>
      </div>
    </Card>
  );
}

function Section({ format, items, plan, settings, paused, busy, onMove, onAction }: {
  format: Format; items: Video[]; plan: PlanSlot[]; settings: Settings; paused: boolean; busy: boolean;
  onMove: (id: string, to: number) => void; onAction: (v: Video, a: VideoAction | "delete-confirm") => void;
}) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const slotOf = new Map(plan.filter((s) => s.video).map((s) => [s.video!.id, s]));
  const missed = plan.filter((s) => s.state === "missed");
  const r = runway(format, items, settings);
  const when = format === "short" ? `daily at ${describeTimes(settings.uploadTimes)}`
    : `${settings.longUploadDays.map((d) => WEEKDAYS[d]).join("/")} at ${describeTimes(settings.longUploadTimes)}`;
  const Icon = format === "short" ? Smartphone : Film;

  return (
    <section className="mb-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Icon aria-hidden className="size-4 text-muted" />{format === "short" ? "Shorts" : "Long videos"}
          <span className="font-normal text-muted">· {r.n} ready · posts {when}</span></h2>
        {r.days !== null && <span className="text-xs text-muted">{r.n ? `Enough for about ${r.days} day${r.days === 1 ? "" : "s"}` : "Nothing ready"}</span>}
      </div>
      {missed.map((s) => (
        <p key={s.at} className="mb-2 flex items-center gap-2 rounded-lg border border-critical/25 bg-critical-soft px-3 py-2 text-[13px]">
          <AlertTriangle aria-hidden className="size-4 shrink-0 text-critical" />
          <span><strong className="font-medium">Missed {fmtDateTime(iso(s.at))}:</strong> <span className="text-ink2">nothing was posted in this slot today.</span></span>
        </p>
      ))}
      {items.length === 0 ? <Card><Empty icon={ListOrdered} title={`No ${format === "short" ? "Shorts" : "long videos"} waiting`}>New videos land here about a minute after a run ships them.</Empty></Card> : (
        <Card flush>
          <div className="hidden grid-cols-[28px_32px_44px_1fr_170px_120px] items-center gap-3 border-b border-line bg-surface-2 px-4 py-2 text-xs font-medium text-muted md:grid">
            <span /><span>#</span><span /><span>Video and where it came from</span><span>Post at (IST)</span><span className="text-right">Actions</span>
          </div>
          <ol>
            <AnimatePresence initial={false}>
              {items.map((v, i) => {
                const slot = slotOf.get(v.id);
                return (
                  <motion.li key={v.id} layout exit={{ opacity: 0, height: 0 }} className="border-b border-line last:border-0">
                    {/* native drag-and-drop lives on an inner element: motion.li has its own drag props */}
                    <div draggable={!busy}
                      onDragStart={() => setDragging(v.id)}
                      onDragOver={(e) => { e.preventDefault(); setOver(v.id); }}
                      onDragEnd={() => { setDragging(null); setOver(null); }}
                      onDrop={(e) => { e.preventDefault(); if (dragging && dragging !== v.id) onMove(dragging, i); setDragging(null); setOver(null); }}
                      className={`grid grid-cols-[32px_44px_1fr_auto] items-center gap-3 px-3 py-2.5 transition-colors md:grid-cols-[28px_32px_44px_1fr_170px_120px] md:px-4 ${dragging === v.id ? "opacity-40" : ""} ${over === v.id && dragging !== v.id ? "bg-brand-soft" : "hover:bg-wash"}`}>
                      <GripVertical aria-hidden className="hidden size-4 cursor-grab text-muted md:block" />
                      <span className="grid size-7 place-items-center rounded-md border border-ring text-xs font-medium tabular-nums text-ink2">{i + 1}</span>
                      <Thumb src={v.thumbnailUrl} alt="" className={format === "long" ? "w-11 aspect-video" : "w-9"} />
                      <div className="min-w-0">
                        <VideoLink id={v.id} className="block truncate text-[13px] font-medium">{v.title}</VideoLink>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          <Origin v={v} /><span>{titleCase(v.topic.category)}</span>
                        </div>
                        {slot?.stale && (
                          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-critical-text">
                            <AlertTriangle aria-hidden className="size-3.5" />Stale by its slot.
                            {i > 0 && <button type="button" disabled={busy} onClick={() => onMove(v.id, 0)} className="inline-flex items-center gap-1 font-medium underline underline-offset-2"><ChevronsUp aria-hidden className="size-3.5" />Move to top</button>}
                          </p>
                        )}
                        <div className="mt-1 text-xs md:hidden"><SlotLabel slot={slot} paused={paused} /></div>
                      </div>
                      <div className="hidden text-[13px] md:block"><SlotLabel slot={slot} paused={paused} /></div>
                      <div className="col-start-4 row-start-1 flex justify-end gap-0.5 md:col-start-auto md:row-start-auto">
                        <Button size="sm" tone="ghost" iconOnly icon={ArrowUp} disabled={busy || i === 0} title="Move up" onClick={() => onMove(v.id, i - 1)}>Move up</Button>
                        <Button size="sm" tone="ghost" iconOnly icon={ArrowDown} disabled={busy || i === items.length - 1} title="Move down" onClick={() => onMove(v.id, i + 1)}>Move down</Button>
                        <ActionMenu items={[
                          { label: "Open video", icon: ExternalLink, onSelect: () => router.push(`/videos/${v.id}`) },
                          { label: "Upload now", icon: Upload, disabled: busy || paused, onSelect: () => onAction(v, "upload-now") },
                          { label: "Skip to end", icon: ChevronsDown, disabled: busy || i === items.length - 1, onSelect: () => onAction(v, "skip") },
                          "separator",
                          { label: "Delete…", icon: Trash2, danger: true, disabled: busy, onSelect: () => onAction(v, "delete-confirm") },
                        ]} />
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </Card>
      )}
    </section>
  );
}

export default function QueuePage() {
  const queue = useQueue();
  const overview = useOverview();
  const settings = useSettings();
  const published = useVideos({ status: "published" });
  const scheduled = useVideos({ status: "scheduled" });
  const reorder = useReorder();
  const act = useVideoAction();
  const patch = usePatchSettings();
  const toast = useToast();
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);

  if (queue.isLoading || overview.isLoading || settings.isLoading) return <Loading />;
  if (queue.error || !queue.data || !overview.data || !settings.data) return <ErrorNote error={queue.error ?? overview.error ?? settings.error} />;
  const items = queue.data;
  const s = settings.data;
  const paused = overview.data.uploadsPaused;
  const busy = reorder.isPending || act.isPending;
  const fail = (e: Error) => toast(e.message, "error");
  const posted = [...(published.data ?? []), ...(scheduled.data ?? [])];
  const byFormat = { short: items.filter((v) => v.format !== "long"), long: items.filter((v) => v.format === "long") };
  const plans = { short: postingPlan("short", items, posted, s), long: postingPlan("long", items, posted, s) };
  // the earliest slot that has a video waiting, across both formats
  const next = [...plans.short, ...plans.long].filter((x): x is PlanSlot & { video: Video } => x.video !== null && x.state !== "missed").sort((a, b) => a.at - b.at)[0];

  // each format is its own queue (the upload job takes them apart), so a move reorders one format only
  const move = (format: Format, id: string, to: number) => {
    const ids = byFormat[format].map((v) => v.id).filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    const other = byFormat[format === "short" ? "long" : "short"].map((v) => v.id);
    reorder.mutate(format === "short" ? [...ids, ...other] : [...other, ...ids], { onError: fail });
  };
  const onAction = (v: Video, a: VideoAction | "delete-confirm") => a === "delete-confirm" ? setConfirm({ id: v.id, title: v.title })
    : act.mutate({ id: v.id, action: a }, { onSuccess: () => toast(DONE[a]), onError: fail });

  return (
    <Stagger>
      <PageHeader title="Queue" sub={paused ? "You post by hand: each video below has its slot. Post the top card, then mark it uploaded." : "The bot uploads these in order, one per slot."}>
        <label className="flex h-8 items-center gap-2.5 rounded-lg border border-ring bg-surface px-3 text-[13px] shadow-card">
          <span className="font-medium">{paused ? "Uploads paused" : "Uploads on"}</span>
          <Toggle label="Uploads on" checked={!paused} disabled={patch.isPending}
            onChange={(on) => patch.mutate({ uploadsPaused: !on }, { onSuccess: () => toast(on ? "Uploads resumed" : "Uploads paused"), onError: fail })} />
        </label>
      </PageHeader>

      {paused && next && <PostNext slot={next} />}

      {!paused && overview.data.nextUpload && (
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info-soft text-info-text"><CalendarClock aria-hidden className="size-4" /></span>
            <Thumb src={overview.data.nextUpload.thumbnailUrl} alt="" className="w-9" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">Already scheduled on YouTube</div>
              <VideoLink id={overview.data.nextUpload.videoId} className="block truncate text-[13px] font-medium">{overview.data.nextUpload.title}</VideoLink>
            </div>
            <div className="hidden text-right text-xs text-muted sm:block">
              <div className="font-medium text-ink">{fmtDateTime(overview.data.nextUpload.publishAt)} IST</div>
              {fmtRelative(overview.data.nextUpload.publishAt)}
            </div>
          </div>
        </Card>
      )}

      {(["short", "long"] as const).map((f) => (
        <Section key={f} format={f} items={byFormat[f]} plan={plans[f]} settings={s} paused={paused} busy={busy}
          onMove={(id, to) => move(f, id, to)} onAction={onAction} />
      ))}

      <p className="mt-1 text-xs text-muted">
        Order within each list is the posting order: breaking and trending videos join at the top. Drag rows on desktop or use the arrows.
        A slot counts as done once a video of that format is marked uploaded within three hours of it.
      </p>

      <ConfirmButton hideTrigger open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} label="Delete" title="Delete this video?" confirmLabel="Delete video"
        description={`"${confirm?.title ?? ""}" will be removed from the queue. This cannot be undone.`} onConfirm={() => { if (confirm) act.mutate({ id: confirm.id, action: "delete" }, { onSuccess: () => toast(DONE.delete), onError: fail }); setConfirm(null); }} />
    </Stagger>
  );
}
