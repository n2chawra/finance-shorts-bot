"use client";

import { ArrowDown, ArrowUp, ChevronsDown, Clock, GripVertical, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button, Card, ConfirmButton, Empty, ErrorNote, Loading, PageHeader, Thumb, Toggle, VideoLink } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDate, fmtDateTime, titleCase } from "@/lib/format";
import { useOverview, usePatchSettings, useQueue, useReorder, useVideoAction } from "@/lib/queries";
import type { VideoAction } from "@/lib/schemas";

const DAY_MS = 86_400_000;
const DONE: Record<VideoAction, string> = { skip: "Moved to the end of the queue", delete: "Video deleted", "upload-now": "Marked for upload on the next publish run" };

export default function QueuePage() {
  const queue = useQueue();
  const overview = useOverview();
  const reorder = useReorder();
  const act = useVideoAction();
  const patch = usePatchSettings();
  const toast = useToast();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  if (queue.isLoading || overview.isLoading) return <Loading />;
  if (queue.error || !queue.data || !overview.data) return <ErrorNote error={queue.error ?? overview.error} />;
  const items = queue.data;
  const paused = overview.data.uploadsPaused;
  const busy = reorder.isPending || act.isPending;
  // the scheduled video takes the next slot; queued videos follow one per day
  const firstSlot = overview.data.nextUpload ? Date.parse(overview.data.nextUpload.publishAt) + DAY_MS : null;
  const fail = (e: Error) => toast(e.message, "error");

  const move = (id: string, to: number) => {
    const ids = items.map((v) => v.id).filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    reorder.mutate(ids, { onError: fail });
  };
  const run = (id: string, action: VideoAction) => act.mutate({ id, action }, { onSuccess: () => toast(DONE[action]), onError: fail });

  return (
    <>
      <PageHeader title="Queue" sub={`${items.length} ready · one upload a day`}>
        <label className="flex items-center gap-3 rounded-xl border border-ring bg-surface px-3 py-2 text-sm shadow-card">
          <span className="font-medium">{paused ? "Uploads paused" : "Uploads on"}</span>
          <Toggle label="Uploads on" checked={!paused} disabled={patch.isPending}
            onChange={(on) => patch.mutate({ uploadsPaused: !on }, { onSuccess: () => toast(on ? "Uploads resumed" : "Uploads paused"), onError: fail })} />
        </label>
      </PageHeader>

      {overview.data.nextUpload && (
        <Card title="Up next (already scheduled)" icon={Clock} className="mb-4">
          <div className="flex items-center gap-3">
            <Thumb src={overview.data.nextUpload.thumbnailUrl} alt="" className="w-11" />
            <div className="min-w-0">
              <VideoLink id={overview.data.nextUpload.videoId} className="block truncate text-sm font-medium">{overview.data.nextUpload.title}</VideoLink>
              <span className="text-xs text-muted">{paused ? "Paused · was " : ""}{fmtDateTime(overview.data.nextUpload.publishAt)} IST</span>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 ? <Card><Empty>The queue is empty.</Empty></Card> : (
        <Card className="!p-0 overflow-hidden">
          <ol>
            <AnimatePresence initial={false}>
              {items.map((v, i) => (
                <motion.li key={v.id} layout exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b border-line last:border-0">
                  {/* native drag-and-drop lives on an inner element: motion.li has its own drag props */}
                  <div draggable={!busy}
                  onDragStart={() => setDragging(v.id)}
                  onDragOver={(e) => { e.preventDefault(); setOver(v.id); }}
                  onDragEnd={() => { setDragging(null); setOver(null); }}
                  onDrop={(e) => { e.preventDefault(); if (dragging && dragging !== v.id) move(dragging, i); setDragging(null); setOver(null); }}
                  className={`bg-surface p-3 md:px-4 ${dragging === v.id ? "opacity-40" : ""} ${over === v.id && dragging !== v.id ? "!bg-brand-soft" : ""}`}>
                  <div className="flex items-center gap-3">
                    <GripVertical aria-hidden className="hidden size-4 cursor-grab text-muted md:block" />
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-semibold tabular-nums text-brand-text">{i + 1}</span>
                    <Thumb src={v.thumbnailUrl} alt="" className="w-11" />
                    <div className="min-w-0 flex-1">
                      <VideoLink id={v.id} className="block truncate text-sm font-medium">{v.title}</VideoLink>
                      <div className="mt-0.5 text-xs text-muted">
                        {titleCase(v.templateId)} · {paused || !firstSlot ? "not scheduled" : `goes out ${fmtDate(new Date(firstSlot + i * DAY_MS).toISOString())}`}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button iconOnly icon={ArrowUp} disabled={busy || i === 0} title="Move up" onClick={() => move(v.id, i - 1)}>Move up</Button>
                      <Button iconOnly icon={ArrowDown} disabled={busy || i === items.length - 1} title="Move down" onClick={() => move(v.id, i + 1)}>Move down</Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 pl-10 md:pl-[4.75rem]">
                    <Button icon={Upload} disabled={busy || paused} title={paused ? "Uploads are paused" : undefined} onClick={() => run(v.id, "upload-now")}>Upload now</Button>
                    <Button icon={ChevronsDown} disabled={busy || i === items.length - 1} onClick={() => run(v.id, "skip")}>Skip to end</Button>
                    <ConfirmButton label="Delete" icon={Trash2} disabled={busy} title="Delete this video?" confirmLabel="Delete video"
                      description={`"${v.title}" will be removed from the queue. This cannot be undone.`} onConfirm={() => run(v.id, "delete")} />
                  </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </Card>
      )}
      <p className="mt-3 text-xs text-muted">Reorder with the arrows, or drag a row on desktop. Sample data: changes reset when the dev server restarts.</p>
    </>
  );
}
