/* eslint-disable @next/next/no-img-element */
"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Eye, Trophy, Upload } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, Stat, StatusBadge, Thumb, Tip, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, fmtNum, istDay } from "@/lib/format";
import { useOverview, useQueue, useSettings, useVideos } from "@/lib/queries";
import { postingPlan } from "@/lib/posting-plan";
import { describeTimes } from "@/lib/slots";
import type { Video } from "@/lib/schemas";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_MARK = "w-3.5 rounded-sm";   // long videos get a dash on phones (no room for "Long"), so they stand apart without colour
const LONG_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];   // settings count days from Sunday = 0
type Kind = "published" | "scheduled" | "planned";
type Entry = { video: Video; kind: Kind; at: number };
type Gap = { at: number; format: "short" | "long" };   // the first slot nothing is ready for

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const KIND: Record<Kind, { dot: string; label: string }> = {
  published: { dot: "bg-good", label: "Published" },
  scheduled: { dot: "bg-series", label: "Scheduled" },
  planned: { dot: "border-[1.5px] border-muted", label: "Planned (queue order)" },   // hollow: told from scheduled by shape, not colour alone
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
    const gaps = new Map<string, Gap[]>();
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
      for (const slot of plan) {
        if (slot.video) add({ video: slot.video, kind: "planned", at: slot.at });
        else if (slot.state === "upcoming") { const k = istDay(new Date(slot.at)); gaps.set(k, [...(gaps.get(k) ?? []), { at: slot.at, format: slot.format }]); }
      }
    }
    return { map, gaps };
  }, [videos.data, queue.data, overview.data, settings.data]);

  if (videos.isLoading || queue.isLoading || overview.isLoading) return <Loading />;
  if (videos.error || queue.error || overview.error) return <ErrorNote error={videos.error ?? queue.error ?? overview.error} />;

  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const picked = byDay.map.get(selected) ?? [];
  const pickedGaps = byDay.gaps.get(selected) ?? [];
  const hhmm = (at: number) => new Date(at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const monthName = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const long = settings.data;
  const longWhen = long?.longUploadDays.length && long.longUploadTimes.length
    ? ` · long videos ${[...long.longUploadDays].sort().map((d) => LONG_DAYS[d]).join("/")} at ${describeTimes(long.longUploadTimes)}` : "";
  const monthCount = [...byDay.map.keys()].filter((k) => k.startsWith(key(ym.y, ym.m, 1).slice(0, 7))).length;
  // views of the videos published on a day (their lifetime views, live where available)
  const published = (k: string) => (byDay.map.get(k) ?? []).filter((e) => e.kind === "published");
  const dayViews = (k: string) => published(k).reduce((a, e) => a + (e.video.totals?.views ?? 0), 0);
  const monthDays = Array.from({ length: days }, (_, i) => key(ym.y, ym.m, i + 1));
  const monthViews = monthDays.reduce((a, k) => a + dayViews(k), 0);
  const monthVideos = monthDays.reduce((a, k) => a + published(k).length, 0);
  const bestDay = monthDays.reduce<string | null>((b, k) => (dayViews(k) > (b ? dayViews(b) : 0) ? k : b), null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const dayTip = (k: string) => {
    const n = published(k).length, v = dayViews(k);
    return n ? `${fmtNum(v)} views from ${n} video${n === 1 ? "" : "s"} published this day` : "No video published this day";
  };

  return (
    <Stagger>
      <PageHeader title="Calendar" sub={`${times.length} Short${times.length === 1 ? "" : "s"} a day at ${describeTimes(times)}${longWhen}`}>
        <div className="flex items-center gap-2">
          <Button iconOnly icon={ChevronLeft} title="Previous month" onClick={() => shift(-1)}>Previous month</Button>
          <span className="w-40 text-center text-[14px] font-semibold">{monthName}</span>
          <Button iconOnly icon={ChevronRight} title="Next month" onClick={() => shift(1)}>Next month</Button>
          <Button onClick={() => { setYm({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }); setSelected(today); }}>Today</Button>
        </div>
      </PageHeader>

      <div data-testid="month-views" className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label={`Views · ${monthName}`} icon={Eye} accent="sky" value={fmtNum(monthViews)} sub="lifetime views of the videos published this month" />
        <Stat label="Videos published" icon={Upload} accent="mint" value={String(monthVideos)} sub={monthVideos ? `${fmtCompact(monthViews / monthVideos)} views each on average` : "none yet this month"} />
        <Stat label="Best day" icon={Trophy} accent="sun" value={bestDay ? fmtCompact(dayViews(bestDay)) : "—"}
          sub={bestDay ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${bestDay}T00:00:00Z`)) : "no views yet"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card flush>
          <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_64px] border-b border-line bg-surface-2 text-center md:grid-cols-[repeat(7,minmax(0,1fr))_92px]">
            {WEEKDAYS.map((d) => <div key={d} className="py-2.5 text-[12px] font-medium text-muted">{d}</div>)}
            <div className="border-l border-line py-2.5 text-[12px] font-semibold text-ink2">Week</div>
          </div>
          <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_64px] md:grid-cols-[repeat(7,minmax(0,1fr))_92px]">
            {weeks.flatMap((row, w) => [...row.map((d, j) => {
              const i = w * 7 + j;
              const edge = `border-r ${i < cells.length - 7 ? "border-b" : ""} border-line`;
              if (d === null) return <div key={`b${i}`} className={`bg-surface-2/60 ${edge}`} />;
              const k = key(ym.y, ym.m, d);
              const list = byDay.map.get(k) ?? [];
              const gaps = byDay.gaps.get(k) ?? [];
              const on = selected === k;
              const views = dayViews(k);
              return (
                <Tip key={k} label={dayTip(k)}>
                <button type="button" onClick={() => setSelected(k)} aria-pressed={on}
                  aria-label={`${d} ${monthName}${list.length ? `, ${list.map((e) => `${KIND[e.kind].label}${e.video.format === "long" ? " long video" : ""}: ${e.video.title}`).join("; ")}` : gaps.length ? "" : ", no upload"}${gaps.map((g) => `, nothing ready for the ${hhmm(g.at)} ${g.format === "long" ? "long-video" : "Short"} slot`).join("")}`}
                  className={`relative flex min-h-16 flex-col gap-1.5 p-1.5 text-left text-xs transition-colors md:min-h-[104px] md:p-2 ${edge} ${on ? "bg-brand-soft" : "hover:bg-surface-2"}`}>
                  <span className="flex items-center justify-between gap-1">
                    <span className={`grid size-6 place-items-center rounded-full text-[12.5px] tabular-nums ${k === today ? "bg-primary font-semibold text-white" : on ? "font-semibold text-ink" : "font-medium text-ink2"}`}>{d}</span>
                    {published(k).length > 1 && <span className="hidden rounded-md bg-tint-blue px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-info-text md:inline">{fmtCompact(views)}</span>}
                  </span>
                  <span className="flex flex-col gap-1">
                    {list.map((e) => (
                      <span key={e.video.id} className="flex min-w-0 items-center gap-1.5 md:gap-1">
                        <img src={e.video.thumbnailUrl} alt="" loading="lazy" className={`hidden shrink-0 rounded-[3px] object-cover md:block ${e.video.format === "long" ? "aspect-video w-7" : "aspect-[9/16] w-4"} ${e.kind === "planned" ? "opacity-60" : ""}`} />
                        <span aria-hidden data-kind={e.kind} className={`h-2 shrink-0 ${e.video.format === "long" ? `${LONG_MARK} md:w-2 md:rounded-full` : "w-2 rounded-full"} ${KIND[e.kind].dot}`} />
                        <span className="hidden truncate text-[11.5px] text-ink2 md:inline">{e.kind === "published" ? `${fmtCompact(e.video.totals?.views ?? 0)} views` : new Date(e.at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })}{e.video.format === "long" && <span className="ml-1 font-semibold text-brand-text">Long</span>}</span>
                      </span>
                    ))}
                    {gaps.map((g) => (
                      <span key={`gap-${g.format}`} data-gap className="flex min-w-0 items-center gap-1.5 md:gap-1">
                        <span aria-hidden className={`h-2 shrink-0 border border-dashed border-warning ${g.format === "long" ? `${LONG_MARK} md:w-2 md:rounded-full` : "w-2 rounded-full"}`} />
                        <span className="hidden truncate text-[11.5px] text-warning-text md:inline">Nothing ready{g.format === "long" && <span className="ml-1 font-semibold text-brand-text">Long</span>}</span>
                      </span>
                    ))}
                  </span>
                </button>
                </Tip>
              );
            }), (() => {
              const total = row.reduce<number>((a, d) => a + (d === null ? 0 : dayViews(key(ym.y, ym.m, d))), 0);
              const n = row.reduce<number>((a, d) => a + (d === null ? 0 : published(key(ym.y, ym.m, d)).length), 0);
              return (
                <div key={`w${w}`} data-testid="week-views" className={`flex flex-col items-center justify-center gap-0.5 bg-surface-2 px-1 text-center ${w < weeks.length - 1 ? "border-b border-line" : ""}`}>
                  <span className="text-[13px] font-semibold tabular-nums text-ink md:text-[15px]">{total ? fmtCompact(total) : "—"}</span>
                  <span className="text-[10.5px] text-muted md:text-[11px]">{n ? `${n} video${n === 1 ? "" : "s"}` : "views"}</span>
                </div>
              );
            })()])}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title={new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${selected}T00:00:00Z`))}>
            {pickedGaps.map((g) => (
              <p key={`gap-${g.format}`} className="mb-4 rounded-lg border border-dashed border-warning/60 bg-warning-soft px-3 py-2.5 text-[13px] text-warning-text">
                Nothing is ready for the {hhmm(g.at)} IST {g.format === "long" ? "long-video" : "Short"} slot. <Link href="/queue" className="font-medium underline underline-offset-2">Open the queue</Link>
              </p>
            ))}
            {picked.length ? (
              <ul className="flex flex-col gap-3">
                {picked.map((e) => (
                  <li key={e.video.id} className="flex gap-3 rounded-xl border border-ring bg-surface-2 p-3">
                    <Thumb src={e.video.thumbnailUrl} alt="" className={e.video.format === "long" ? "w-20 self-start aspect-video" : "w-12"} />
                    <div className="min-w-0 text-[13px]">
                      <VideoLink id={e.video.id} className="line-clamp-2 font-medium">{e.video.title}</VideoLink>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <StatusBadge status={e.video.status} />
                        {e.video.format === "long" && <Badge tone="brand">Long</Badge>}
                        <span className="text-xs">{fmtDateTime(new Date(e.at).toISOString())} IST{e.kind === "planned" ? " · if the queue order holds" : ""}</span>
                      </div>
                      {e.video.totals && <p className="mt-1.5 text-[12.5px] text-ink2">{fmtCompact(e.video.totals.views)} views · +{e.video.totals.subsGained} subscribers</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : !pickedGaps.length && <Empty icon={CalendarDays}>No upload on this day.</Empty>}
          </Card>
          <Card title="Legend" description={`${monthCount} day${monthCount === 1 ? "" : "s"} with an upload this month`}>
            <ul className="flex flex-col gap-2.5 text-[13px] text-ink2">
              {(Object.keys(KIND) as Kind[]).map((k) => <li key={k} className="flex items-center gap-2.5"><span aria-hidden className={`size-2.5 rounded-full ${KIND[k].dot}`} />{KIND[k].label}</li>)}
              <li className="flex items-center gap-2.5"><span aria-hidden className={`h-2.5 ${LONG_MARK} bg-muted`} />Long video</li>
              <li className="flex items-center gap-2.5"><span aria-hidden className="size-2.5 rounded-full border border-dashed border-warning" />Nothing ready for this slot yet</li>
            </ul>
          </Card>
        </div>
      </div>
    </Stagger>
  );
}
