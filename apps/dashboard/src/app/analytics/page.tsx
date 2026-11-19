/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Activity, BarChart3, Clock, Compass, ExternalLink, Eye, Globe2, Heart, LayoutGrid, Lightbulb, MonitorSmartphone, MousePointerClick, Radio, Search, Share2,
  Sparkles, Timer, TrendingUp, Trophy, Users, UserPlus, Wand2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LineChart } from "@/components/charts";
import { Donut, Funnel, HourlyBars, MirrorBars, RankList, RetentionChart, WorldMap } from "@/components/studio-charts";
import { ContentTable } from "@/components/content-table";
import { AiChannelCard, AiDoNext, AiRefresh, AiVideoCard, HeroStat, MiniStat, StudioSkeleton, Tabs, VerdictBadge, Waiting } from "@/components/studio-parts";
import { Card, ErrorNote, PageHeader, Segmented, Stagger } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtNum, fmtRelative } from "@/lib/format";
import { label, viewedPct } from "@/lib/labels";
import { useStudio } from "@/lib/queries";
import { useYtTitles } from "@/lib/yt-titles";
import { METRIC as SCORE, median } from "@/lib/scorecard-logic";
import { STATS_AGE_CLASS, statsAge } from "@/lib/stats-age";
import type { Fmt, Range, Studio } from "@/lib/studio-schema";

const TABS = [
  { value: "overview", label: "Overview", icon: LayoutGrid },
  { value: "realtime", label: "Realtime", icon: Radio },
  { value: "content", label: "Content", icon: BarChart3 },
  { value: "reach", label: "Reach", icon: Compass },
  { value: "engagement", label: "Engagement", icon: Activity },
  { value: "audience", label: "Audience", icon: Users },
  { value: "works", label: "What works", icon: Wand2 },
  { value: "insights", label: "AI insights", icon: Sparkles },
] as const;
type Tab = (typeof TABS)[number]["value"];

const METRICS = {
  views: { label: "Views", get: (d: Studio["daily"][number]) => d.views, fmt: fmtCompact, full: (x: number) => `${fmtNum(x)} views`, color: "var(--c1)" },
  engaged: { label: "Engaged", get: (d: Studio["daily"][number]) => d.engagedViews, fmt: fmtCompact, full: (x: number) => `${fmtNum(x)} engaged views`, color: "var(--c3)" },
  watch: { label: "Watch hours", get: (d: Studio["daily"][number]) => d.watchMinutes / 60, fmt: (x: number) => x.toFixed(x < 10 ? 1 : 0), full: (x: number) => `${x.toFixed(1)} hours watched`, color: "var(--c7)" },
  subs: { label: "Subscribers", get: (d: Studio["daily"][number]) => d.subsGained - d.subsLost, fmt: fmtCompact, full: (x: number) => `${x >= 0 ? "+" : ""}${fmtNum(x)} subscribers`, color: "var(--c6)" },
  pct: { label: "% viewed", get: (d: Studio["daily"][number]) => d.avgViewPct, fmt: (x: number) => `${x.toFixed(0)}%`, full: (x: number) => `${x.toFixed(1)}% viewed`, color: "var(--c2)" },
} as const;
type Metric = keyof typeof METRICS;

const pct = (x: number | null, d = 0) => (x === null ? "—" : `${(x * 100).toFixed(d)}%`);
const dur = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("28");
  const [format, setFormat] = useState<Fmt>("all");
  const [tab, setTabState] = useState<Tab>("overview");
  const { data, error, isLoading } = useStudio(range, format);
  useEffect(() => {
    // read on load and on every hash change, so a link to /analytics#reach (or Back) while already here switches the tab
    const read = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.some((t) => t.value === h)) setTabState(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const setTab = (t: string) => {
    setTabState(t as Tab);
    try { window.history.replaceState(null, "", `#${t}`); } catch { /* ignore */ }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHeader title="Analytics" sub={data ? <Freshness data={data} /> : "Everything YouTube Studio shows that its APIs give, plus what it means"}>
        <Segmented label="Format" value={format} onChange={setFormat} options={[{ value: "all", label: "All" }, { value: "short", label: "Shorts" }, { value: "long", label: "Long" }]} />
        <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "7d" }, { value: "28", label: "28d" }, { value: "90", label: "90d" }, { value: "365", label: "1y" }]} />
      </PageHeader>
      <Tabs value={tab} onChange={setTab} tabs={[...TABS]} />
      {error ? <ErrorNote error={error} /> : isLoading || !data ? <StudioSkeleton /> : (
        <Stagger key={`${tab}${range}${format}`} className="space-y-5">
          {tab === "overview" && <Overview d={data} onJump={setTab} />}
          {tab === "realtime" && <RealtimeTab d={data} />}
          {tab === "content" && <Card flush title="Every video" icon={BarChart3} description="Sort by any column. Green is well above the column's median, red well below, grey near it."><ContentTable rows={data.content} /></Card>}
          {tab === "reach" && <Reach d={data} />}
          {tab === "engagement" && <Engagement d={data} />}
          {tab === "audience" && <Audience d={data} />}
          {tab === "works" && <Works d={data} />}
          {tab === "insights" && <Insights d={data} onJump={setTab} />}
          <StudioOnly />
        </Stagger>
      )}
    </div>
  );
}

function Freshness({ data }: { data: Studio }) {
  const age = statsAge(data.refreshed.through);
  return (
    <span>
      {/* coloured when the newest YouTube Analytics day is 4+ days old: the stats job has likely stopped */}
      <span data-testid="stats-age" data-tone={age.tone} className={STATS_AGE_CLASS[age.tone]}>
        {data.refreshed.through ? `Studio numbers through ${fmtDayKey(data.refreshed.through)} (YouTube lags ~2–3 days)` : age.label}
      </span>
      {/* the public counters run ahead of Analytics, which is why this is bigger than the totals below */}
      {data.realtime.totalNow > 0 && <> · <span className="font-medium text-ink" title="YouTube's public view counters, updated every few minutes; the same all-time total as the Overview page">live views now: {fmtNum(data.realtime.totalNow)}</span></>}
      {data.refreshed.daily && <> · daily numbers {fmtRelative(data.refreshed.daily)}</>}
      {data.refreshed.deep && <> · sources and audience {fmtRelative(data.refreshed.deep)}</>}
    </span>
  );
}

// ---------------- overview ----------------

/** Tailwind needs whole class names: the mini row's columns by how many tiles have data. */
const MINI_COLS: Record<number, string> = { 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" };

function Overview({ d, onJump }: { d: Studio; onJump: (t: string) => void }) {
  const [metric, setMetric] = useState<Metric>("views");
  const t = d.totals, p = d.previous;
  const m = METRICS[metric];
  const published = useMemo(() => {
    const by = new Map<string, Studio["content"]>();
    for (const c of d.content) {
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(c.publishAt));
      by.set(day, [...(by.get(day) ?? []), c]);
    }
    return by;
  }, [d.content]);
  const series = d.daily.map((x) => ({ label: fmtDayKey(x.day), value: m.get(x) }));
  const best = [...d.content].sort((a, b) => (b.vs48 ?? 0) - (a.vs48 ?? 0)).filter((c) => c.vs48 !== null);
  const prev = (k: "avgViewPct" | "impressions" | "likes" | "comments" | "shares") => (p ? p[k] : undefined);
  const minis = [
    <MiniStat key="pct" label="% viewed" value={`${t.avgViewPct.toFixed(1)}%`} now={t.avgViewPct} prev={prev("avgViewPct")} fmt={(x) => `${x.toFixed(1)} pts`} />,
    t.impressions !== null && <MiniStat key="imp" label="Impressions" value={fmtCompact(t.impressions)} now={t.impressions} prev={prev("impressions")} hint="Thumbnail impressions (Reporting API)" />,
    t.ctr !== null && <MiniStat key="ctr" label="Click-through" value={pct(t.ctr, 1)} />,
    <MiniStat key="likes" label="Likes" value={fmtCompact(t.likes)} now={t.likes} prev={prev("likes")} />,
    <MiniStat key="comments" label="Comments" value={fmtCompact(t.comments)} now={t.comments} prev={prev("comments")} />,
    <MiniStat key="shares" label="Shares" value={fmtCompact(t.shares)} now={t.shares} prev={prev("shares")} />,
  ].filter(Boolean);
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <HeroStat label="Views" icon={Eye} value={t.views} fmt={fmtCompact} prev={p?.views} spark={d.daily.map((x) => x.views)} sub={`${fmtNum(d.realtime.last48)} in the last 48 hours`} />
        <HeroStat label="Engaged views" icon={MousePointerClick} value={t.engagedViews} fmt={fmtCompact} prev={p?.engagedViews} spark={d.daily.map((x) => x.engagedViews)} accent="var(--c3)"
          sub={t.views ? `${pct(t.engagedViews / t.views)} of views stayed` : undefined} />
        <HeroStat label="Watch time" icon={Clock} value={t.watchHours} fmt={(x) => `${x.toFixed(x < 100 ? 1 : 0)} h`} prev={p?.watchHours} spark={d.daily.map((x) => x.watchMinutes)} accent="var(--c7)"
          sub={`${dur(t.avgViewSec)} average view`} />
        <HeroStat label="Subscribers" icon={UserPlus} value={t.subsGained - t.subsLost} fmt={(x) => `${x >= 0 ? "+" : ""}${fmtNum(x)}`} prev={p ? p.subsGained - p.subsLost : undefined}
          spark={d.daily.map((x) => x.subsGained - x.subsLost)} accent="var(--c6)" sub={`${fmtNum(t.subsGained)} gained · ${fmtNum(t.subsLost)} lost`} />
      </div>
      {/* a tile whose value is missing for the whole range is left out, with one note, never a row of empty boxes */}
      <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${MINI_COLS[minis.length] ?? "lg:grid-cols-6"}`}>
        {minis}
      </div>
      {t.impressions === null && t.ctr === null && (
        <p className="-mt-2 text-xs text-muted">Impressions and click-through arrive about 2 days after the YouTube Reporting API is switched on.</p>
      )}
      <Card title="Over time" icon={TrendingUp} action={<Segmented label="Metric" value={metric} onChange={setMetric} options={Object.entries(METRICS).map(([k, v]) => ({ value: k as Metric, label: v.label }))} />}
        description="Hover a day to see which videos went out that day">
        <LineChart data={series} fmt={m.fmt} fmtFull={m.full} color={m.color} height={260}
          detail={(i) => {
            const vs = published.get(d.daily[i]!.day);
            return vs?.length ? <div className="mt-1.5 space-y-1 border-t border-line pt-1.5">{vs.map((v) => (
              <div key={v.videoId} className="flex max-w-56 items-center gap-1.5"><img src={v.thumbnailUrl} alt="" className="h-6 w-3.5 border border-plane object-cover" /><span className="truncate text-ink2">{v.title}</span></div>
            ))}</div> : null;
          }} />
      </Card>
      {/* the analysis and the breakouts share a row of equal height; "Do next" runs full width under both */}
      <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_1fr]">
        <AiChannelCard ai={d.ai.channel} onJump={onJump} compact recs={false} className="h-full" />
        <Card title="Breakout videos" icon={Trophy} accent="sun" description="First 48 hours against the median of their format" className="h-full">
          {best.length ? (
            <ul className="space-y-2.5">
              {best.slice(0, 6).map((c, i) => (
                <li key={c.videoId}>
                  <Link href={`/videos/${c.videoId}`} className="panel-sm hover-raise flex items-center gap-3 bg-surface pr-2.5">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${i === 0 ? "bg-primary text-white" : "bg-surface-3 text-ink2"}`}>{i + 1}</span>
                    <img src={c.thumbnailUrl} alt="" className="my-1.5 h-11 w-6 border border-ring object-cover rounded-lg" />
                    <span className="min-w-0 flex-1 py-1.5"><span className="line-clamp-1 text-[13px] font-semibold">{c.title}</span><span className="text-xs font-medium text-muted">{fmtNum(c.views)} views · {c.avgViewPct?.toFixed(0) ?? "—"}% viewed</span></span>
                    <span className="rounded-full bg-good-soft px-2 py-0.5 text-[12px] font-semibold tabular-nums text-good-text">{c.vs48!.toFixed(1)}×</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Waiting icon={Trophy} title="No video has its first 48 hours yet">Breakouts appear two days after a video goes out.</Waiting>}
        </Card>
      </div>
      <AiDoNext ai={d.ai.channel} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Where views come from" icon={Compass} action={<JumpBtn onClick={() => onJump("reach")} />}><Donut slices={d.breakdowns.traffic} /></Card>
        <Card title="Top countries" icon={Globe2} action={<JumpBtn onClick={() => onJump("audience")} />}><RankList slices={d.breakdowns.country} kind="country" max={6} /></Card>
      </div>
    </>
  );
}

const JumpBtn = ({ onClick }: { onClick: () => void }) => <button type="button" onClick={onClick} className="shrink-0 px-2 py-1 text-xs font-semibold text-ink font-semibold hover:bg-tint-brand">More →</button>;

// ---------------- realtime ----------------

/** The watchdog (.github/workflows/watchdog.yml, cron "13 * * * *") reads the public counters once an hour. */
const STALE_MIN = 90;

function RealtimeTab({ d }: { d: Studio }) {
  const r = d.realtime;
  const labels = r.hours.map((h) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", day: "numeric", month: "short" }).format(new Date(h.hour)));
  if (!r.snapshotAt) return <Waiting icon={Radio} title="Realtime starts with the first hourly snapshot">The watchdog records every video&apos;s public counters once an hour. The chart fills in from the next hour.</Waiting>;
  const ageMin = Math.max(0, (Date.now() - new Date(r.snapshotAt).getTime()) / 60_000);
  const stale = ageMin > STALE_MIN;
  const ago = ageMin < 60 ? `${Math.round(ageMin)} min ago` : `${(ageMin / 60).toFixed(ageMin < 600 ? 1 : 0).replace(/\.0$/, "")} h ago`;
  return (
    <>
      <div data-testid="realtime-age" data-stale={stale} className={`panel-sm flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[13px] ${stale ? "bg-warning-soft text-warning-text" : "bg-surface text-ink2"}`}>
        <span className="flex items-center gap-2 font-semibold">
          {stale ? <Clock className="size-4" aria-hidden /> : <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-good" /></span>}
          Counters last read {ago}
        </span>
        <span className={stale ? "" : "text-muted"}>{stale ? "The hourly read is late, so these numbers are not live. " : ""}YouTube&apos;s public counters update hourly (a few minutes past each hour).</span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <HeroStat label="Last 48 hours" live={!stale} icon={Radio} value={r.last48} fmt={fmtNum} spark={r.hours.map((h) => h.views)} sub={stale ? `views up to the last read, ${ago}` : "views, from YouTube's public counters"} />
        <HeroStat label="Last hour" icon={Timer} value={stale ? null : r.last1} fmt={fmtNum} sub={stale ? "—, waiting for the next read" : `the hour before the last read, ${ago}`} />
        <HeroStat label="All-time views" icon={Eye} value={r.totalNow} fmt={fmtNum} sub="live, across published videos" />
      </div>
      <Card title="Views per hour" icon={Radio} description={stale ? `The 48 hours up to the last read (${ago}), IST. Updates hourly.` : "The last 48 hours, IST. Updates hourly; the bright bar is the latest hour."}>
        <HourlyBars values={r.hours.map((h) => h.views)} hours={labels} height={190} live={!stale} />
      </Card>
      <Card title="Top videos right now" icon={TrendingUp} description={stale ? `Views in the 48 hours up to the last read, ${ago}` : "Views in the last 48 hours"}>
        <ul className="divide-y divide-line">
          {r.top.map((v) => (
            <li key={v.videoId}>
              <Link href={`/videos/${v.videoId}`} className="flex items-center gap-4 py-2.5 hover:bg-wash">
                <img src={v.thumbnailUrl} alt="" className="h-12 w-7 border border-ring object-cover rounded-lg" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{v.title}</span>
                <span className="hidden w-48 sm:block"><HourlyBars values={v.hours} hours={labels} height={30} bare live={!stale} /></span>
                <span className="w-16 text-right font-semibold tabular-nums">{fmtNum(v.views48)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

// ---------------- reach ----------------

function Reach({ d }: { d: Studio }) {
  const t = d.totals;
  const b = d.breakdowns;
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Traffic sources" icon={Compass} description="How viewers found the videos"><Donut slices={b.traffic} /></Card>
        <Card title="From impression to subscriber" icon={MousePointerClick} description="Each step's rate against the one before">
          <Funnel steps={[
            { label: "Impressions", value: t.impressions, empty: "Impressions arrive ~2 days after the Reporting API is switched on" },
            { label: "Views", value: t.views, note: t.impressions ? "clicked or played" : undefined },
            { label: "Engaged views", value: t.engagedViews, note: "stayed past the start" },
            { label: "Liked", value: t.likes, note: "of engaged viewers liked" },
            { label: "Subscribed", value: t.subsGained, note: "of likers subscribed", approx: true },
          ]} />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="YouTube search terms" icon={Search} description="What people typed before watching">{b.search.length ? <RankList slices={b.search} max={12} /> : <Waiting icon={Search} title="No search views yet">Search terms appear once people find a video by searching.</Waiting>}</Card>
        <Card title="Suggested next to" icon={Lightbulb} description="Videos that YouTube showed ours beside">{b.suggested.length ? <SuggestedList d={d} /> : <Waiting icon={Lightbulb} title="Nothing suggested yet">Shown when YouTube recommends our videos next to others.</Waiting>}</Card>
        <Card title="External sites and apps" icon={ExternalLink} description="Links shared outside YouTube">{b.external.length ? <RankList slices={b.external} max={12} /> : <Waiting icon={ExternalLink} title="No outside traffic yet">WhatsApp, Instagram and Google links appear here.</Waiting>}</Card>
      </div>
      <Card title="Sharing" icon={Share2} description="Where viewers shared the videos">{b.sharing.length ? <RankList slices={b.sharing} unit="shares" /> : <Waiting icon={Share2} title="No shares in this range">Each share shows the app it went through.</Waiting>}</Card>
    </>
  );
}

function SuggestedList({ d }: { d: Studio }) {
  const ours = new Map(d.content.filter((c) => c.youtubeId).map((c) => [c.youtubeId!, c]));
  const rows = d.breakdowns.suggested.slice(0, 12);
  const { data: titles } = useYtTitles(rows.filter((s) => !ours.has(s.key) && /^[A-Za-z0-9_-]{11}$/.test(s.key)).map((s) => s.key));
  return (
    <ul className="space-y-1">
      {rows.map((s) => {
        const mine = ours.get(s.key);
        const other = titles?.get(s.key);
        const title = mine ? mine.title : other?.title ?? null;
        return (
          <li key={s.key}>
            <a href={`https://www.youtube.com/watch?v=${s.key}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] hover:bg-wash">
              <img src={`https://i.ytimg.com/vi/${s.key}/default.jpg`} alt="" loading="lazy" className="h-9 w-12 shrink-0 border border-ring object-cover rounded-md" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 font-semibold hover:underline">{title ?? s.key}</span>
                <span className="line-clamp-1 text-[11.5px] text-muted">{mine ? "Ours" : other?.channel ?? (title ? "" : "YouTube video")}</span>
              </span>
              <span className="font-semibold tabular-nums">{fmtNum(s.views)}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------- engagement ----------------

function Engagement({ d }: { d: Studio }) {
  const [f, setF] = useState<"short" | "long">(d.format === "long" ? "long" : "short");
  const curve = d.typicalCurve[f];
  const dur = f === "long" ? 500 : 70;
  const trend = d.hookTrend.filter((h) => h.hookHold !== null);
  const engaged = d.hookTrend.filter((h) => h.engagedRatio !== null);
  const t = d.totals;
  // Hook target: a Short should keep everyone who started through its first 3 s (replays push it past
  // 100%); a long video 70% at 30 s. Stayed to watch: the Scorecard's 50%.
  const hookTarget = d.format === "long" ? 70 : 100;
  const stayedTarget = SCORE.stayed.good * 100;
  const hookMed = median(trend.map((h) => h.hookHold! * 100));
  const engMed = median(engaged.map((h) => h.engagedRatio! * 100));
  const lines = (target: number, med: number | null, withHundred: boolean) => [
    ...(withHundred && target !== 100 ? [{ value: 100, label: "100% · everyone who started", color: "var(--muted)" }] : []),
    { value: target, label: target === 100 && withHundred ? "target 100% · everyone who started" : `target ${target}%`, color: "var(--good-text)" },
    ...(med !== null ? [{ value: med, label: `median ${med.toFixed(0)}%`, color: "var(--ink2)" }] : []),
  ];
  const hookMax = Math.max(0, ...trend.map((h) => h.hookHold!));
  return (
    <>
      <Card title="Typical audience retention" icon={Activity} description="The average curve of the last 10 videos of the format. Open a video to see its own curve, key frames and where people left."
        action={<Segmented label="Retention format" value={f} onChange={setF} options={[{ value: "short", label: "Shorts" }, { value: "long", label: "Long" }]} />}>
        {curve.length ? <RetentionChart curve={curve} typical={[]} drops={[]} duration={dur} format={f} /> : <Waiting icon={Activity} title="No curve yet">YouTube shows a retention curve once a video has enough views.</Waiting>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Hook hold, video by video" icon={Timer} description="Share still watching at 3 s (Shorts) or 30 s (long), oldest to newest">
          <LineChart data={trend.map((h) => ({ label: fmtDayKey(h.publishAt.slice(0, 10)), value: h.hookHold! * 100 }))} fmt={(x) => `${x.toFixed(0)}%`} fmtFull={(x) => `${x.toFixed(1)}% still watching`} color="var(--c2)"
            refLines={lines(hookTarget, hookMed, true)} href={(i) => `/videos/${trend[i]!.videoId}`} ariaLabel="Hook hold per video; Enter opens the video"
            detail={(i) => <div className="mt-1 max-w-56 truncate text-muted">{trend[i]?.title}</div>} />
          {hookMax > 1 && <p className="mt-1 text-xs text-muted">🔁 Above 100% = replays: people who loop the Short count again. Click a point to open that video.</p>}
        </Card>
        <Card title="Engaged views, video by video" icon={MousePointerClick} description="Engaged ÷ all views: the API's stand-in for Studio's stayed-to-watch">
          <LineChart data={engaged.map((h) => ({ label: fmtDayKey(h.publishAt.slice(0, 10)), value: h.engagedRatio! * 100 }))} fmt={(x) => `${x.toFixed(0)}%`} fmtFull={(x) => `${x.toFixed(1)}% engaged`} color="var(--c3)"
            refLines={lines(stayedTarget, engMed, false)} href={(i) => `/videos/${engaged[i]!.videoId}`} ariaLabel="Engaged views per video; Enter opens the video"
            detail={(i) => <div className="mt-1 max-w-56 truncate text-muted">{engaged[i]?.title}</div>} />
          <p className="mt-1 text-xs text-muted">Target {stayedTarget.toFixed(0)}% is the Scorecard&apos;s stayed-to-watch goal. Click a point to open that video.</p>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat label="Likes per 1K views" value={t.views ? ((t.likes / t.views) * 1000).toFixed(1) : "—"} />
        <MiniStat label="Comments per 1K views" value={t.views ? ((t.comments / t.views) * 1000).toFixed(2) : "—"} />
        <MiniStat label="Shares per 1K views" value={t.views ? ((t.shares / t.views) * 1000).toFixed(2) : "—"} />
        <MiniStat label="Subscribers per 1K views" value={t.views ? (((t.subsGained - t.subsLost) / t.views) * 1000).toFixed(2) : "—"} />
      </div>
    </>
  );
}

// ---------------- audience ----------------

function Audience({ d }: { d: Studio }) {
  const b = d.breakdowns;
  const sub = b.subscribed;
  return (
    <>
      <Card title="Where viewers are" icon={Globe2} description="Views by country; deeper blue means more views">
        <WorldMap slices={b.country} />
        <div className="mt-4 grid gap-x-6 md:grid-cols-2">
          <RankList slices={b.country.slice(0, 6)} kind="country" />
          <RankList slices={b.country.slice(6, 12)} kind="country" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Age and gender" icon={Users} description="Share of signed-in viewers (YouTube hides this per video)">{b.ageGender.length ? <MirrorBars slices={b.ageGender} /> : <Waiting icon={Users} title="Not enough viewers yet">YouTube shows age and gender above a privacy threshold.</Waiting>}</Card>
        <Card title="Devices" icon={MonitorSmartphone}><Donut slices={b.device} size={150} /></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Subscribers vs everyone else" icon={Heart} description="How much of each group's views, and how long they watch">
          <ul className="space-y-5">
            {sub.map((s, i) => (
              <li key={s.key}>
                <div className="flex items-baseline justify-between text-[13px]"><span className="font-semibold">{s.label}</span><span className="tabular-nums text-muted">{fmtNum(s.views)} views · {s.avgViewPct === null ? <b className="text-ink">—</b> : <b className="text-ink" title={viewedPct(s.avgViewPct).title}>{viewedPct(s.avgViewPct).text}</b>} viewed</span></div>
                <div className="mt-1.5 h-4 overflow-hidden border border-ring bg-surface rounded-lg"><div className="h-full border-r border-ring" style={{ width: `${Math.max(s.share * 100, 1)}%`, background: i ? "var(--c5)" : "var(--c1)" }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Operating systems" icon={MonitorSmartphone}><RankList slices={b.os} max={6} /></Card>
      </div>
    </>
  );
}

// ---------------- what works ----------------

function Works({ d }: { d: Studio }) {
  const [k, setK] = useState<"avgViewPct" | "views48" | "hookHold" | "engagedRatio">("avgViewPct");
  const fmt = { avgViewPct: (x: number) => `${x.toFixed(0)}%`, views48: fmtCompact, hookHold: (x: number) => `${(x * 100).toFixed(0)}%`, engagedRatio: (x: number) => `${(x * 100).toFixed(0)}%` }[k];
  if (!d.whatWorks.length) return <Waiting icon={Wand2} title="Needs a few more videos">Each group needs videos on both sides before a comparison means anything.</Waiting>;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink2">The median of each group, so one viral video can&apos;t skew it. Groups under 3 videos are faded.</p>
        <Segmented label="Measure" value={k} onChange={setK} options={[{ value: "avgViewPct", label: "% viewed" }, { value: "views48", label: "48 h views" }, { value: "hookHold", label: "Hook hold" }, { value: "engagedRatio", label: "Engaged" }]} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {d.whatWorks.map((a) => {
          const byValue = (x: (typeof a.groups)[number], y: (typeof a.groups)[number]) => (y[k] ?? -1) - (x[k] ?? -1);
          const solid = a.groups.filter((g) => g.n >= 3).sort(byValue);
          const thin = a.groups.filter((g) => g.n < 3).sort(byValue);
          const max = Math.max(...a.groups.map((g) => g[k] ?? 0), 1e-9);
          const row = (g: (typeof a.groups)[number], best: boolean) => (
            <li key={g.value} title={g.value} className={`relative flex items-center gap-2 px-2 py-1.5 text-[13px] ${g.n < 3 ? "opacity-45" : ""}`}>
              <span aria-hidden className="absolute inset-y-0 left-0" style={{ width: `${((g[k] ?? 0) / max) * 100}%`, background: best ? "color-mix(in oklab, var(--good) 22%, transparent)" : "var(--series-soft)" }} />
              <span className="relative min-w-0 flex-1 truncate">{label(g.value, a.attribute)}</span>
              <span className="relative rounded bg-surface/70 px-1 text-[10.5px] tabular-nums text-muted">n={g.n}</span>
              <span className="relative w-12 text-right font-semibold tabular-nums">{g[k] === null ? "—" : fmt(g[k]!)}</span>
            </li>
          );
          return (
            <Card key={a.attribute} title={a.label}>
              <ul className="space-y-1.5">
                {solid.map((g, i) => row(g, i === 0))}
                {thin.length > 0 && (
                  <li role="separator" className="flex items-center gap-2 pt-1 text-[10.5px] text-muted">
                    <span className="h-px flex-1 bg-ring" />fewer than 3 videos<span className="h-px flex-1 bg-ring" />
                  </li>
                )}
                {thin.map((g) => row(g, false))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// ---------------- AI insights ----------------

function Insights({ d, onJump }: { d: Studio; onJump: (t: string) => void }) {
  const counts = { hit: 0, okay: 0, miss: 0 };
  for (const c of d.content) if (c.verdict) counts[c.verdict]++;
  // the per-video verdicts age on their own (the auditor only writes them for videos 2 to 14 days old)
  const newest = d.ai.videos.map((a) => a.writtenAt).sort().at(-1);
  const stale = !!newest && Date.now() - Date.parse(newest) > 2 * 86_400_000;
  return (
    <>
      <AiChannelCard ai={d.ai.channel} onJump={onJump} />
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink2">
        <span>Every video&apos;s verdict:</span>
        {(["hit", "okay", "miss"] as const).map((v) => <span key={v} className="inline-flex items-center gap-1.5"><VerdictBadge verdict={v} /><b className="tabular-nums text-ink">{counts[v]}</b></span>)}
        <span className="text-xs text-muted">(AI where written, otherwise by views and % viewed against the median)</span>
        {newest && <span className="ml-auto inline-flex flex-wrap items-center gap-2 text-xs text-muted">
          Newest verdict {fmtRelative(newest)}{stale && <b className="rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-warning-text">stale</b>}<AiRefresh at={newest} />
        </span>}
      </div>
      {d.ai.videos.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {d.ai.videos.map((a) => <AiVideoCard key={a.videoId} ai={a} title={a.title} thumbnailUrl={a.thumbnailUrl} href={`/videos/${a.videoId}`} />)}
        </div>
      ) : <Waiting icon={Sparkles} title="Video verdicts arrive with the nightly auditor">It writes one for every video published 2 to 14 days ago.</Waiting>}
    </>
  );
}

function StudioOnly() {
  return (
    <p className="pt-3 text-center text-xs text-muted">
      Only in YouTube Studio (no API gives them): Shorts&apos; exact stayed-to-watch, returning vs new viewers, when your viewers are online, other channels they watch, and revenue.{" "}
      <a href="https://studio.youtube.com/" target="_blank" rel="noreferrer" className="font-semibold text-ink font-semibold hover:underline">Open Studio ↗</a>
    </p>
  );
}
