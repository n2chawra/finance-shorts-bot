"use client";

import { useMemo, useState } from "react";

import { Button, Card, Empty, ErrorNote, Loading, PageHeader, StatusBadge, Thumb, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, istDay } from "@/lib/format";
import { useOverview, useQueue, useVideos } from "@/lib/queries";
import type { Video } from "@/lib/schemas";

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Entry = { video: Video; kind: "published" | "scheduled" | "planned" };

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CalendarPage() {
  const videos = useVideos({});
  const queue = useQueue();
  const overview = useOverview();
  const today = istDay(new Date());
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const v of videos.data ?? []) {
      if (v.upload && (v.status === "published" || v.status === "scheduled")) map.set(istDay(v.upload.publishAt), { video: v, kind: v.status });
    }
    const next = overview.data?.nextUpload;
    if (next && !overview.data?.uploadsPaused) {
      (queue.data ?? []).forEach((v, i) => map.set(istDay(new Date(Date.parse(next.publishAt) + (i + 1) * DAY_MS)), { video: v, kind: "planned" }));
    }
    return map;
  }, [videos.data, queue.data, overview.data]);

  if (videos.isLoading || queue.isLoading || overview.isLoading) return <Loading />;
  if (videos.error || queue.error || overview.error) return <ErrorNote error={videos.error ?? queue.error ?? overview.error} />;

  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const picked = byDay.get(selected);
  const monthName = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);

  return (
    <>
      <PageHeader title="Calendar" sub="One upload a day, IST">
        <div className="flex items-center gap-2">
          <Button title="Previous month" onClick={() => shift(-1)}>←</Button>
          <span className="w-36 text-center text-sm font-medium">{monthName}</span>
          <Button title="Next month" onClick={() => shift(1)}>→</Button>
        </div>
      </PageHeader>

      <Card className="!p-2 md:!p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">{WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={`b${i}`} />;
            const k = key(ym.y, ym.m, d);
            const e = byDay.get(k);
            return (
              <button key={k} type="button" onClick={() => setSelected(k)} aria-pressed={selected === k}
                aria-label={`${d} ${monthName}${e ? `, ${e.kind}: ${e.video.title}` : ", no upload"}`}
                className={`flex aspect-square flex-col items-center justify-between rounded-xl border p-1 text-xs md:aspect-[4/3] md:p-2 ${selected === k ? "border-ink" : "border-ring"} ${k === today ? "bg-wash" : ""}`}>
                <span className={`self-start tabular-nums ${k === today ? "font-bold" : "text-ink2"}`}>{d}</span>
                {e?.kind === "published" && <span className="text-[11px] font-semibold tabular-nums"><span aria-hidden className="text-good">✓ </span>{fmtCompact(e.video.totals?.views ?? 0)}</span>}
                {e?.kind === "scheduled" && <span aria-hidden className="text-base font-bold text-series">◷</span>}
                {e?.kind === "planned" && <span aria-hidden className="text-base text-muted">○</span>}
                {!e && <span />}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-ink2">
          <span><span aria-hidden className="font-bold text-good">✓</span> Published (views)</span>
          <span><span aria-hidden className="font-bold text-series">◷</span> Scheduled</span>
          <span><span aria-hidden className="text-muted">○</span> Planned from queue order</span>
        </div>
      </Card>

      <Card title={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${selected}T00:00:00Z`))} className="mt-4">
        {picked ? (
          <div className="flex gap-3">
            <Thumb src={picked.video.thumbnailUrl} alt="" className="w-16" />
            <div className="min-w-0 text-sm">
              <VideoLink id={picked.video.id} className="font-medium">{picked.video.title}</VideoLink>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                <StatusBadge status={picked.video.status} />
                {picked.kind === "planned" ? <span>Planned for this day if the queue order holds</span> : <span>{fmtDateTime(picked.video.upload!.publishAt)} IST</span>}
              </div>
              {picked.video.totals && <p className="mt-1.5 text-ink2">{fmtCompact(picked.video.totals.views)} views · +{picked.video.totals.subsGained} subscribers</p>}
            </div>
          </div>
        ) : <Empty>No upload on this day.</Empty>}
      </Card>
    </>
  );
}
