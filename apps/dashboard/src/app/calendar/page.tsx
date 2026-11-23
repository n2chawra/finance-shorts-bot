"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Eye, Heart, Trophy, Upload } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, Stat, StatusBadge, Thumb, Tip, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, fmtNum, istDay } from "@/lib/format";
import { useOverview, useQueue, useSettings, useVideos, useChannels } from "@/lib/queries";
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
const KIND: Record<Kind, { dot: string; chip: string; label: string }> = {
  published: { dot: "bg-good", chip: "bg-good-soft font-medium text-good-text", label: "Published" },
  scheduled: { dot: "bg-series", chip: "bg-tint-blue font-medium text-info-text", label: "Scheduled" },
  planned: { dot: "border-[1.5px] border-muted", chip: "border border-line bg-surface text-ink2", label: "Planned (queue order)" },   // hollow: told from scheduled by shape, not colour alone
};
const MAX_CHIPS = 4;   // 3 Shorts and a long video fit; more shows "+N more"
const CHIP_LONG = "w-3 rounded-[2px]";   // a long video's chip mark: the legend's dash, so it reads as long even when "Long" doesn't fit
// "Long" only where the chip has room for it beside the time; a narrow cell keeps the time whole and the dash
const LongTag = () => <span className="ml-auto hidden shrink-0 @min-[100px]:inline rounded-[4px] bg-brand-soft px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide text-brand-text">Long</span>;

export default function CalendarPage() {
  const videos = useVideos({});
  const queue = useQueue();
  const overview = useOverview();
  const settings = useSettings();
  const channels = useChannels();
  // a channel in setup has no upload slots of its own yet: no slot plan, no "nothing ready" warnings
  const me = channels.data?.channels.find((c) => c.id === channels.data!.current);
  const live = channels.data ? me?.status === "active" : true;
  const launchedAt = me?.setup?.stage === "launched" && me.setup.updatedAt ? Date.parse(me.setup.updatedAt) : 0;
  const noLong = settings.data?.longPerWeek === 0;   // no long videos: no long slots on the calendar
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
        else if (slot.state === "upcoming" && live && slot.at >= launchedAt && !(noLong && slot.format === "long")) { const k = istDay(new Date(slot.at)); gaps.set(k, [...(gaps.get(k) ?? []), { at: slot.at, format: slot.format }]); }
      }
    }
    return { map, gaps };
  }, [videos.data, queue.data, overview.data, settings.data, live, launchedAt, noLong]);

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
  const longWhen = !noLong && long?.longUploadDays.length && long.longUploadTimes.length
    ? ` · long videos ${[...long.longUploadDays].sort().map((d) => LONG_DAYS[d]).join("/")} at ${describeTimes(long.longUploadTimes)}` : "";
  const monthCount = [...byDay.map.keys()].filter((k) => k.startsWith(key(ym.y, ym.m, 1).slice(0, 7))).length;
  // views of the videos published on a day (their lifetime views, live where available)
  const published = (k: string) => (byDay.map.get(k) ?? []).filter((e) => e.kind === "published");
  const dayViews = (k: string) => published(k).reduce((a, e) => a + (e.video.totals?.views ?? 0), 0);
  const dayLikes = (k: string) => published(k).reduce((a, e) => a + (e.video.totals?.likes ?? 0), 0);
  const monthDays = Array.from({ length: days }, (_, i) => key(ym.y, ym.m, i + 1));
  const monthViews = monthDays.reduce((a, k) => a + dayViews(k), 0);
  const monthVideos = monthDays.reduce((a, k) => a + published(k).length, 0);
  const bestDay = monthDays.reduce<string | null>((b, k) => (dayViews(k) > (b ? dayViews(b) : 0) ? k : b), null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const dayTip = (k: string) => {
    const n = published(k).length, v = dayViews(k);
    return n ? `${fmtNum(v)} views and ${fmtNum(dayLikes(k))} likes from ${n} video${n === 1 ? "" : "s"} published this day` : "No video published this day";
  };

  return (
    <Stagger>
      <PageHeader title="Calendar" sub={live ? `${times.length} Short${times.length === 1 ? "" : "s"} a day at ${describeTimes(times)}${longWhen}` : "This channel is in setup: its uploads start at Launch"}>
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
              const chips: { at: number; entry?: Entry; gap?: Gap }[] = [...list.map((e) => ({ at: e.at, entry: e })), ...gaps.map((g) => ({ at: g.at, gap: g }))].sort((a, b) => a.at - b.at);
              return (
                <Tip key={k} label={dayTip(k)}>
                <button type="button" onClick={() => setSelected(k)} aria-pressed={on}
                  aria-label={`${d} ${monthName}${list.length ? `, ${list.map((e) => `${KIND[e.kind].label}${e.video.format === "long" ? " long video" : ""}: ${e.video.title}`).join("; ")}` : gaps.length ? "" : ", no upload"}${gaps.map((g) => `, nothing ready for the ${hhmm(g.at)} ${g.format === "long" ? "long-video" : "Short"} slot`).join("")}`}
                  className={`@container/day relative flex min-h-16 flex-col gap-1.5 p-1.5 text-left text-xs transition-colors md:min-h-[116px] md:gap-2 md:p-2 ${edge} ${on ? "bg-brand-soft shadow-[inset_0_0_0_1.5px_var(--color-brand)]" : "hover:bg-surface-2"}`}>
                  <span className="flex items-center justify-between gap-1">
                    <span className={`grid size-6 place-items-center rounded-full text-[12.5px] tabular-nums ${k === today ? "bg-primary font-semibold text-white" : on ? "font-semibold text-ink" : "font-medium text-ink2"}`}>{d}</span>
                    {published(k).length > 1 && <span className="hidden items-center gap-1 text-[11px] font-semibold tabular-nums text-ink2 md:inline-flex" title="views of the day's videos"><Eye aria-hidden className="size-3 text-muted" />{fmtCompact(views)}</span>}
                  </span>
                  {/* narrow days (phones, and laptops where the side panel squeezes the month): one mark per upload */}
                  <span className="flex flex-wrap items-center gap-1 @min-[76px]/day:hidden">
                    {list.map((e) => <span key={e.video.id} aria-hidden data-kind={e.kind} className={`h-2 shrink-0 ${e.video.format === "long" ? LONG_MARK : "w-2 rounded-full"} ${KIND[e.kind].dot}`} />)}
                    {gaps.map((g) => <span key={`gap-${g.format}-${g.at}`} aria-hidden data-gap className={`h-2 shrink-0 border border-dashed border-warning ${g.format === "long" ? LONG_MARK : "w-2 rounded-full"}`} />)}
                  </span>
                  {/* days wide enough for a chip: one even chip per slot, in time order */}
                  <span className="@container hidden flex-col gap-1 @min-[76px]/day:flex">
                    {chips.slice(0, MAX_CHIPS).map((c) => c.gap ? (
                      <span key={`gap-${c.gap.format}-${c.gap.at}`} data-gap className="flex h-[22px] min-w-0 items-center gap-1 rounded-md border border-dashed border-warning/70 px-1 text-[11px] leading-none text-warning-text">
                        <span aria-hidden className={`h-1.5 shrink-0 border border-dashed border-warning ${c.gap.format === "long" ? CHIP_LONG : "w-1.5 rounded-full"}`} />
                        <span className="shrink-0 tabular-nums">{hhmm(c.gap.at)}</span>
                        <span className={`hidden ${c.gap.format === "long" ? "@min-[140px]:inline" : "@min-[92px]:inline"}`}>empty</span>
                        {c.gap.format === "long" && <LongTag />}
                      </span>
                    ) : (
                      <span key={c.entry!.video.id} className={`flex h-[22px] min-w-0 items-center gap-1 overflow-hidden rounded-md px-1 text-[11px] leading-none tabular-nums ${KIND[c.entry!.kind].chip}`}>
                        <span aria-hidden className={`h-1.5 shrink-0 ${c.entry!.video.format === "long" ? CHIP_LONG : "w-1.5 rounded-full"} ${KIND[c.entry!.kind].dot} ${c.entry!.kind === "published" ? "hidden @min-[96px]:block" : ""}`} />
                        {c.entry!.kind === "published" ? (
                          <>
                            <span className="shrink-0" aria-label={`${fmtNum(c.entry!.video.totals?.views ?? 0)} views`}>{fmtCompact(c.entry!.video.totals?.views ?? 0)}</span>
                            <span data-testid="day-likes" className="inline-flex shrink-0 items-center gap-0.5 font-normal opacity-80"><Heart aria-label="likes" className="size-2.5 shrink-0" />{fmtCompact(c.entry!.video.totals?.likes ?? 0)}</span>
                          </>
                        ) : <span className="shrink-0">{hhmm(c.entry!.at)}</span>}
                        {c.entry!.video.format === "long" && <LongTag />}
                      </span>
                    ))}
                    {chips.length > MAX_CHIPS && <span className="px-1.5 text-[10.5px] font-medium text-muted">+{chips.length - MAX_CHIPS} more</span>}
                  </span>
                </button>
                </Tip>
              );
            }), (() => {
              const total = row.reduce<number>((a, d) => a + (d === null ? 0 : dayViews(key(ym.y, ym.m, d))), 0);
              const likes = row.reduce<number>((a, d) => a + (d === null ? 0 : dayLikes(key(ym.y, ym.m, d))), 0);
              const n = row.reduce<number>((a, d) => a + (d === null ? 0 : published(key(ym.y, ym.m, d)).length), 0);
              return (
                <div key={`w${w}`} data-testid="week-views" className={`flex flex-col items-center justify-center gap-0.5 bg-surface-2 px-1 text-center ${w < weeks.length - 1 ? "border-b border-line" : ""}`}>
                  <span className="text-[13px] font-semibold tabular-nums text-ink md:text-[15px]">{total ? fmtCompact(total) : "—"}</span>
                  {n > 0 && <span data-testid="week-likes" className="flex items-center gap-0.5 text-[11px] font-medium tabular-nums text-ink2 md:text-[12px]"><Heart aria-label="likes" className="size-3 text-critical" />{fmtCompact(likes)}</span>}
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
                      {e.video.totals && <p className="mt-1.5 text-[12.5px] text-ink2">{fmtCompact(e.video.totals.views)} views · {fmtCompact(e.video.totals.likes)} likes · +{e.video.totals.subsGained} subscribers</p>}
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
