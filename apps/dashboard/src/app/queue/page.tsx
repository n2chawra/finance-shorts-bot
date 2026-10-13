"use client";

import { useState } from "react";

import { Button, Card, Empty, ErrorNote, Loading, PageHeader, Thumb, Toggle, VideoLink } from "@/components/ui";
import { fmtDate, fmtDateTime, titleCase } from "@/lib/format";
import { useOverview, usePatchSettings, useQueue, useReorder, useVideoAction } from "@/lib/queries";
import type { VideoAction } from "@/lib/schemas";

const DAY_MS = 86_400_000;

export default function QueuePage() {
  const queue = useQueue();
  const overview = useOverview();
  const reorder = useReorder();
  const act = useVideoAction();
  const patch = usePatchSettings();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  if (queue.isLoading || overview.isLoading) return <Loading />;
  if (queue.error || !queue.data || !overview.data) return <ErrorNote error={queue.error ?? overview.error} />;
  const items = queue.data;
  const paused = overview.data.uploadsPaused;
  const busy = reorder.isPending || act.isPending;
  // the scheduled video takes the next slot; queued videos follow one per day
  const firstSlot = overview.data.nextUpload ? Date.parse(overview.data.nextUpload.publishAt) + DAY_MS : null;

  const move = (id: string, to: number) => {
    const ids = items.map((v) => v.id).filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    reorder.mutate(ids);
  };
  const run = (id: string, title: string, action: VideoAction) => {
    if (action === "delete" && !window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    act.mutate({ id, action });
  };

  return (
    <>
      <PageHeader title="Queue" sub={`${items.length} ready · one upload a day`}>
        <label className="flex items-center gap-3 text-sm">
          <span>{paused ? "Uploads paused" : "Uploads on"}</span>
          <Toggle label="Uploads on" checked={!paused} disabled={patch.isPending} onChange={(on) => patch.mutate({ uploadsPaused: !on })} />
        </label>
      </PageHeader>
      {(reorder.error || act.error || patch.error) && <div className="mb-4"><ErrorNote error={reorder.error ?? act.error ?? patch.error} /></div>}

      {overview.data.nextUpload && (
        <Card title="Up next (already scheduled)" className="mb-4">
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
        <Card className="!p-0">
          <ol>
            {items.map((v, i) => (
              <li key={v.id} draggable={!busy}
                onDragStart={(e) => { setDragging(v.id); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => { e.preventDefault(); setOver(v.id); }}
                onDragEnd={() => { setDragging(null); setOver(null); }}
                onDrop={(e) => { e.preventDefault(); if (dragging && dragging !== v.id) move(dragging, i); setDragging(null); setOver(null); }}
                className={`border-b border-line p-3 last:border-0 ${dragging === v.id ? "opacity-40" : ""} ${over === v.id && dragging !== v.id ? "bg-wash" : ""}`}>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="hidden cursor-grab select-none text-muted md:block" title="Drag to reorder">⠿</span>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-ink2">{i + 1}</span>
                  <Thumb src={v.thumbnailUrl} alt="" className="w-11" />
                  <div className="min-w-0 flex-1">
                    <VideoLink id={v.id} className="block truncate text-sm font-medium">{v.title}</VideoLink>
                    <div className="mt-0.5 text-xs text-muted">
                      {titleCase(v.templateId)} · {paused || !firstSlot ? "not scheduled" : `goes out ${fmtDate(new Date(firstSlot + i * DAY_MS).toISOString())}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button disabled={busy || i === 0} title="Move up" onClick={() => move(v.id, i - 1)}>↑</Button>
                    <Button disabled={busy || i === items.length - 1} title="Move down" onClick={() => move(v.id, i + 1)}>↓</Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 pl-9 md:pl-16">
                  <Button disabled={busy || paused} title={paused ? "Uploads are paused" : undefined} onClick={() => run(v.id, v.title, "upload-now")}>Upload now</Button>
                  <Button disabled={busy || i === items.length - 1} onClick={() => run(v.id, v.title, "skip")}>Skip (move to end)</Button>
                  <Button tone="danger" disabled={busy} onClick={() => run(v.id, v.title, "delete")}>Delete</Button>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}
      <p className="mt-3 text-xs text-muted">Reorder with the arrows, or drag a row on desktop. Sample data: changes reset when the dev server restarts.</p>
    </>
  );
}
