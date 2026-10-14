/* eslint-disable @next/next/no-img-element */
"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, StatusBadge, Thumb, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, istDay } from "@/lib/format";
import { useOverview, useQueue, useVideos } from "@/lib/queries";
import type { Video } from "@/lib/schemas";

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Kind = "published" | "scheduled" | "planned";
type Entry = { video: Video; kind: Kind };

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const KIND: Record<Kind, { dot: string; label: string }> = {
  published: { dot: "bg-good", label: "Published" },
  scheduled: { dot: "bg-series", label: "Scheduled" },
  planned: { dot: "bg-muted", label: "Planned (queue order)" },
};

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
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const picked = byDay.get(selected);
  const monthName = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const monthCount = [...byDay.keys()].filter((k) => k.startsWith(key(ym.y, ym.m, 1).slice(0, 7))).length;

  return (
    <Stagger>
      <PageHeader title="Calendar" sub="One upload a day at the set time, IST">
        <div className="flex items-center gap-1">
          <Button iconOnly icon={ChevronLeft} title="Previous month" onClick={() => shift(-1)}>Previous month</Button>
          <span className="w-36 text-center text-[13px] font-medium">{monthName}</span>
          <Button iconOnly icon={ChevronRight} title="Next month" onClick={() => shift(1)}>Next month</Button>
          <Button onClick={() => { setYm({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }); setSelected(today); }}>Today</Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card flush>
          <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-center text-xs font-medium text-muted">
            {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const edge = `${i % 7 !== 6 ? "border-r" : ""} ${i < cells.length - 7 ? "border-b" : ""} border-line`;
              if (d === null) return <div key={`b${i}`} className={`bg-surface-2/50 ${edge}`} />;
              const k = key(ym.y, ym.m, d);
              const e = byDay.get(k);
              const on = selected === k;
              return (
                <button key={k} type="button" onClick={() => setSelected(k)} aria-pressed={on}
                  aria-label={`${d} ${monthName}${e ? `, ${KIND[e.kind].label}: ${e.video.title}` : ", no upload"}`}
                  className={`relative flex min-h-16 flex-col gap-1 p-1.5 text-left text-xs transition-colors md:min-h-[92px] md:p-2 ${edge} ${on ? "bg-brand-soft" : "hover:bg-wash"}`}>
                  <span className={`grid size-6 place-items-center rounded-full tabular-nums ${k === today ? "bg-primary font-semibold text-primary-ink" : on ? "font-medium text-ink" : "text-ink2"}`}>{d}</span>
                  {e && (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <img src={e.video.thumbnailUrl} alt="" loading="lazy" className={`hidden aspect-[9/16] w-5 shrink-0 rounded-[3px] border border-ring object-cover md:block ${e.kind === "planned" ? "opacity-60" : ""}`} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1"><span aria-hidden className={`size-1.5 shrink-0 rounded-full ${KIND[e.kind].dot}`} />
                          <span className="hidden truncate text-[11px] text-ink2 md:inline">{e.kind === "published" ? `${fmtCompact(e.video.totals?.views ?? 0)} views` : e.kind === "scheduled" ? "Scheduled" : "Planned"}</span>
                        </span>
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card title={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${selected}T00:00:00Z`))}>
            {picked ? (
              <div>
                <div className="flex gap-3">
                  <Thumb src={picked.video.thumbnailUrl} alt="" className="w-16" />
                  <div className="min-w-0 text-[13px]">
                    <VideoLink id={picked.video.id} className="line-clamp-3 font-medium">{picked.video.title}</VideoLink>
                    <div className="mt-2"><StatusBadge status={picked.video.status} /></div>
                  </div>
                </div>
                <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                  {picked.kind === "planned" ? "Goes out on this day if the queue order holds." : `${fmtDateTime(picked.video.upload!.publishAt)} IST`}
                </p>
                {picked.video.totals && <p className="mt-1 text-[13px] text-ink2">{fmtCompact(picked.video.totals.views)} views · +{picked.video.totals.subsGained} subscribers</p>}
              </div>
            ) : <Empty icon={CalendarDays}>No upload on this day.</Empty>}
          </Card>
          <Card title="Legend" description={`${monthCount} day${monthCount === 1 ? "" : "s"} with an upload this month`}>
            <ul className="flex flex-col gap-2 text-[13px] text-ink2">
              {(Object.keys(KIND) as Kind[]).map((k) => <li key={k} className="flex items-center gap-2"><span aria-hidden className={`size-2 rounded-full ${KIND[k].dot}`} />{KIND[k].label}</li>)}
            </ul>
          </Card>
        </div>
      </div>
    </Stagger>
  );
}
