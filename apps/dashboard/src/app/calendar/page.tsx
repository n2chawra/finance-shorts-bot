/* eslint-disable @next/next/no-img-element */
"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, StatusBadge, Thumb, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, istDay } from "@/lib/format";
import { useOverview, useQueue, useSettings, useVideos } from "@/lib/queries";
import { postingPlan } from "@/lib/posting-plan";
import { describeTimes } from "@/lib/slots";
import type { Video } from "@/lib/schemas";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];   // settings count days from Sunday = 0
type Kind = "published" | "scheduled" | "planned";
type Entry = { video: Video; kind: Kind; at: number };

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
  const settings = useSettings();
  const today = istDay(new Date());
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);

  const times = useMemo(() => settings.data?.uploadTimes ?? ["19:07"], [settings.data]);
  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const add = (e: Entry) => { const k = istDay(new Date(e.at)); map.set(k, [...(map.get(k) ?? []), e].sort((a, b) => a.at - b.at)); };
    const posted: Video[] = [];
    for (const v of videos.data ?? []) {
      if (v.upload && (v.status === "published" || v.status === "scheduled")) {
        add({ video: v, kind: v.status, at: Date.parse(v.upload.publishAt) });
        posted.push(v);
      }
    }
    // planned: the Queue page's posting plan, so long videos land on their own days and times
    // and breaking/trending Shorts take their trend slots
    const s = settings.data;
    if (!overview.data?.uploadsPaused) {
      const q = queue.data ?? [];
      const plan = s ? [...postingPlan("short", q, posted, s), ...postingPlan("long", q, posted, s)] : [];
      for (const slot of plan) if (slot.video) add({ video: slot.video, kind: "planned", at: slot.at });
    }
    return map;
  }, [videos.data, queue.data, overview.data, settings.data]);

  if (videos.isLoading || queue.isLoading || overview.isLoading) return <Loading />;
  if (videos.error || queue.error || overview.error) return <ErrorNote error={videos.error ?? queue.error ?? overview.error} />;

  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const picked = byDay.get(selected) ?? [];
  const monthName = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const long = settings.data;
  const longWhen = long?.longUploadDays.length && long.longUploadTimes.length
    ? ` · long videos ${[...long.longUploadDays].sort().map((d) => LONG_DAYS[d]).join("/")} at ${describeTimes(long.longUploadTimes)}` : "";
  const monthCount = [...byDay.keys()].filter((k) => k.startsWith(key(ym.y, ym.m, 1).slice(0, 7))).length;

  return (
    <Stagger>
      <PageHeader title="Calendar" sub={`${times.length} Short${times.length === 1 ? "" : "s"} a day at ${describeTimes(times)}${longWhen}`}>
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
              const list = byDay.get(k) ?? [];
              const on = selected === k;
              return (
                <button key={k} type="button" onClick={() => setSelected(k)} aria-pressed={on}
                  aria-label={`${d} ${monthName}${list.length ? `, ${list.map((e) => `${KIND[e.kind].label}: ${e.video.title}`).join("; ")}` : ", no upload"}`}
                  className={`relative flex min-h-16 flex-col gap-1 p-1.5 text-left text-xs transition-colors md:min-h-[92px] md:p-2 ${edge} ${on ? "bg-brand-soft" : "hover:bg-wash"}`}>
                  <span className={`grid size-6 place-items-center rounded-full tabular-nums ${k === today ? "bg-primary font-semibold text-primary-ink" : on ? "font-medium text-ink" : "text-ink2"}`}>{d}</span>
                  <span className="flex flex-col gap-1">
                    {list.map((e) => (
                      <span key={e.video.id} className="flex min-w-0 items-center gap-1.5">
                        <img src={e.video.thumbnailUrl} alt="" loading="lazy" className={`hidden shrink-0 rounded-[3px] border border-ring object-cover md:block ${e.video.format === "long" ? "aspect-video w-7" : "aspect-[9/16] w-4"} ${e.kind === "planned" ? "opacity-60" : ""}`} />
                        <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${KIND[e.kind].dot}`} />
                        <span className="hidden truncate text-[11px] text-ink2 md:inline">{e.kind === "published" ? `${fmtCompact(e.video.totals?.views ?? 0)} views` : new Date(e.at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card title={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${selected}T00:00:00Z`))}>
            {picked.length ? (
              <ul className="flex flex-col divide-y divide-line">
                {picked.map((e) => (
                  <li key={e.video.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <Thumb src={e.video.thumbnailUrl} alt="" className={e.video.format === "long" ? "w-20 self-start aspect-video" : "w-12"} />
                    <div className="min-w-0 text-[13px]">
                      <VideoLink id={e.video.id} className="line-clamp-2 font-medium">{e.video.title}</VideoLink>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <StatusBadge status={e.video.status} />
                        <span>{fmtDateTime(new Date(e.at).toISOString())} IST{e.kind === "planned" ? " · if the queue order holds" : ""}</span>
                      </div>
                      {e.video.totals && <p className="mt-1 text-xs text-ink2">{fmtCompact(e.video.totals.views)} views · +{e.video.totals.subsGained} subscribers</p>}
                    </div>
                  </li>
                ))}
              </ul>
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
