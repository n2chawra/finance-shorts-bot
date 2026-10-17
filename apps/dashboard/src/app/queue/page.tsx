"use client";

import { ArrowDown, ArrowUp, ChevronsDown, Clock, ExternalLink, GripVertical, ListOrdered, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ActionMenu, Badge, Button, Card, ConfirmButton, Empty, ErrorNote, Loading, PageHeader, Stagger, Thumb, Toggle, VideoLink } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { useOverview, usePatchSettings, useQueue, useReorder, useSettings, useVideoAction, useVideos } from "@/lib/queries";
import { describeTimes, upcomingSlots } from "@/lib/slots";
import type { VideoAction } from "@/lib/schemas";

const DONE: Record<VideoAction, string> = { skip: "Moved to the end of the queue", delete: "Video deleted", "upload-now": "Marked for upload on the next publish run" };

export default function QueuePage() {
  const queue = useQueue();
  const overview = useOverview();
  const settings = useSettings();
  const scheduled = useVideos({ status: "scheduled" });
  const reorder = useReorder();
  const act = useVideoAction();
  const patch = usePatchSettings();
  const toast = useToast();
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);

  if (queue.isLoading || overview.isLoading) return <Loading />;
  if (queue.error || !queue.data || !overview.data) return <ErrorNote error={queue.error ?? overview.error} />;
  const items = queue.data;
  const paused = overview.data.uploadsPaused;
  const busy = reorder.isPending || act.isPending;
  // queued videos take the upload slots after the last video already scheduled, one per slot
  const times = settings.data?.uploadTimes ?? ["19:07"];
  const lastScheduled = Math.max(Date.now() + 30 * 60_000, ...(scheduled.data ?? []).map((v) => (v.upload ? Date.parse(v.upload.publishAt) : 0)));
  const slots = upcomingSlots(lastScheduled, times, items.length);
  const goesOut = (i: number) => fmtDateTime(new Date(slots[i]).toISOString());
  const fail = (e: Error) => toast(e.message, "error");

  const move = (id: string, to: number) => {
    const ids = items.map((v) => v.id).filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    reorder.mutate(ids, { onError: fail });
  };
  const run = (id: string, action: VideoAction) => act.mutate({ id, action }, { onSuccess: () => toast(DONE[action]), onError: fail });

  return (
    <Stagger>
      <PageHeader title="Queue" sub={`${items.length} ready to publish · ${times.length} upload${times.length === 1 ? "" : "s"} a day at ${describeTimes(times)}, top first`}>
        <label className="flex h-8 items-center gap-2.5 rounded-lg border border-ring bg-surface px-3 text-[13px] shadow-card">
          <span className="font-medium">{paused ? "Uploads paused" : "Uploads on"}</span>
          <Toggle label="Uploads on" checked={!paused} disabled={patch.isPending}
            onChange={(on) => patch.mutate({ uploadsPaused: !on }, { onSuccess: () => toast(on ? "Uploads resumed" : "Uploads paused"), onError: fail })} />
        </label>
      </PageHeader>

      {overview.data.nextUpload && (
        <Card className="mb-3">
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info-soft text-info-text"><Clock aria-hidden className="size-4" /></span>
            <Thumb src={overview.data.nextUpload.thumbnailUrl} alt="" className="w-9" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">Already scheduled on YouTube</div>
              <VideoLink id={overview.data.nextUpload.videoId} className="block truncate text-[13px] font-medium">{overview.data.nextUpload.title}</VideoLink>
            </div>
            <div className="hidden text-right text-xs text-muted sm:block">
              <div className="font-medium text-ink">{fmtDateTime(overview.data.nextUpload.publishAt)} IST</div>
              {paused ? "paused" : fmtRelative(overview.data.nextUpload.publishAt)}
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 ? <Card><Empty icon={ListOrdered} title="The queue is empty">New videos land here about a minute after a routine run ships them.</Empty></Card> : (
        <Card flush>
          <div className="hidden grid-cols-[28px_32px_40px_1fr_150px_120px] items-center gap-3 border-b border-line bg-surface-2 px-4 py-2 text-xs font-medium text-muted md:grid">
            <span /><span>#</span><span /><span>Video</span><span>Goes out</span><span className="text-right">Actions</span>
          </div>
          <ol>
            <AnimatePresence initial={false}>
              {items.map((v, i) => (
                <motion.li key={v.id} layout exit={{ opacity: 0, height: 0 }} className="border-b border-line last:border-0">
                  {/* native drag-and-drop lives on an inner element: motion.li has its own drag props */}
                  <div draggable={!busy}
                    onDragStart={() => setDragging(v.id)}
                    onDragOver={(e) => { e.preventDefault(); setOver(v.id); }}
                    onDragEnd={() => { setDragging(null); setOver(null); }}
                    onDrop={(e) => { e.preventDefault(); if (dragging && dragging !== v.id) move(dragging, i); setDragging(null); setOver(null); }}
                    className={`grid grid-cols-[32px_36px_1fr_auto] items-center gap-3 px-3 py-2.5 transition-colors md:grid-cols-[28px_32px_40px_1fr_150px_120px] md:px-4 ${dragging === v.id ? "opacity-40" : ""} ${over === v.id && dragging !== v.id ? "bg-brand-soft" : "hover:bg-wash"}`}>
                    <GripVertical aria-hidden className="hidden size-4 cursor-grab text-muted md:block" />
                    <span className="grid size-7 place-items-center rounded-md border border-ring text-xs font-medium tabular-nums text-ink2">{i + 1}</span>
                    <Thumb src={v.thumbnailUrl} alt="" className="w-9" />
                    <div className="min-w-0">
                      <VideoLink id={v.id} className="block truncate text-[13px] font-medium">{v.title}</VideoLink>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                        <span>{titleCase(v.templateId)}</span><span aria-hidden>·</span><span>{titleCase(v.topic.category)}</span>
                        <span className="whitespace-nowrap md:hidden">· {paused ? "not scheduled" : goesOut(i)}</span>
                      </div>
                    </div>
                    <div className="hidden text-[13px] md:block">
                      {paused ? <Badge>Not scheduled</Badge> : <span className="tabular-nums text-ink2">{goesOut(i)}</span>}
                    </div>
                    <div className="col-start-4 row-start-1 flex justify-end gap-0.5 md:col-start-auto md:row-start-auto">
                      <Button size="sm" tone="ghost" iconOnly icon={ArrowUp} disabled={busy || i === 0} title="Move up" onClick={() => move(v.id, i - 1)}>Move up</Button>
                      <Button size="sm" tone="ghost" iconOnly icon={ArrowDown} disabled={busy || i === items.length - 1} title="Move down" onClick={() => move(v.id, i + 1)}>Move down</Button>
                      <ActionMenu items={[
                        { label: "Open video", icon: ExternalLink, onSelect: () => router.push(`/videos/${v.id}`) },
                        { label: "Upload now", icon: Upload, disabled: busy || paused, onSelect: () => run(v.id, "upload-now") },
                        { label: "Skip to end", icon: ChevronsDown, disabled: busy || i === items.length - 1, onSelect: () => run(v.id, "skip") },
                        "separator",
                        { label: "Delete…", icon: Trash2, danger: true, disabled: busy, onSelect: () => setConfirm({ id: v.id, title: v.title }) },
                      ]} />
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </Card>
      )}
      <p className="mt-3 text-xs text-muted">Drag rows on desktop or use the arrows. “Upload now” publishes on the next publish run; uploaded by hand? Use “Mark as uploaded” on the video&apos;s page.</p>

      <ConfirmButton hideTrigger open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} label="Delete" title="Delete this video?" confirmLabel="Delete video"
        description={`"${confirm?.title ?? ""}" will be removed from the queue. This cannot be undone.`} onConfirm={() => { if (confirm) run(confirm.id, "delete"); setConfirm(null); }} />
    </Stagger>
  );
}
