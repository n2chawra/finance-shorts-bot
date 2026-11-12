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
import { AiChannelCard, AiVideoCard, ContentTable, HeroStat, MiniStat, StudioSkeleton, Tabs, VerdictBadge, Waiting } from "@/components/studio-parts";
import { Card, ErrorNote, PageHeader, Segmented, Stagger } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtNum, fmtRelative } from "@/lib/format";
import { useStudio } from "@/lib/queries";
import { STATS_AGE_CLASS, statsAge } from "@/lib/stats-age";
import { pctChange } from "@/lib/studio-calc";
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
          {tab === "content" && <Card flush title="Every video" icon={BarChart3} description="Sort by any column. Cells are tinted against the column's median: green above, red below."><ContentTable rows={data.content} /></Card>}
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
      <span data-testid="stats-age" data-tone={age.tone} className={STATS_AGE_CLASS[age.tone]}>{age.label}</span>
      {data.refreshed.daily && <> · daily numbers {fmtRelative(data.refreshed.daily)}</>}
      {data.refreshed.deep && <> · sources and audience {fmtRelative(data.refreshed.deep)}</>}
    </span>
  );
}

// ---------------- overview ----------------

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
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <HeroStat label="Views" icon={Eye} value={t.views} fmt={fmtCompact} delta={pctChange(t.views, p?.views)} spark={d.daily.map((x) => x.views)} sub={`${fmtNum(d.realtime.last48)} in the last 48 hours`} />
        <HeroStat label="Engaged views" icon={MousePointerClick} value={t.engagedViews} fmt={fmtCompact} delta={pctChange(t.engagedViews, p?.engagedViews)} spark={d.daily.map((x) => x.engagedViews)} accent="var(--c3)"
          sub={t.views ? `${pct(t.engagedViews / t.views)} of views stayed` : undefined} />
        <HeroStat label="Watch time" icon={Clock} value={t.watchHours} fmt={(x) => `${x.toFixed(x < 100 ? 1 : 0)} h`} delta={pctChange(t.watchHours, p?.watchHours)} spark={d.daily.map((x) => x.watchMinutes)} accent="var(--c7)"
          sub={`${dur(t.avgViewSec)} average view`} />
        <HeroStat label="Subscribers" icon={UserPlus} value={t.subsGained - t.subsLost} fmt={(x) => `${x >= 0 ? "+" : ""}${fmtNum(x)}`} delta={pctChange(t.subsGained - t.subsLost, p ? p.subsGained - p.subsLost : null)}
          spark={d.daily.map((x) => x.subsGained - x.subsLost)} accent="var(--c6)" sub={`${fmtNum(t.subsGained)} gained · ${fmtNum(t.subsLost)} lost`} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MiniStat label="% viewed" value={`${t.avgViewPct.toFixed(1)}%`} delta={pctChange(t.avgViewPct, p?.avgViewPct)} />
        <MiniStat label="Impressions" value={t.impressions === null ? "—" : fmtCompact(t.impressions)} delta={t.impressions !== null ? pctChange(t.impressions, p?.impressions) : undefined} hint="Thumbnail impressions (Reporting API)" />
        <MiniStat label="Click-through" value={pct(t.ctr, 1)} />
        <MiniStat label="Likes" value={fmtCompact(t.likes)} delta={pctChange(t.likes, p?.likes)} />
        <MiniStat label="Comments" value={fmtCompact(t.comments)} delta={pctChange(t.comments, p?.comments)} />
        <MiniStat label="Shares" value={fmtCompact(t.shares)} delta={pctChange(t.shares, p?.shares)} />
      </div>
      <Card title="Over time" icon={TrendingUp} action={<Segmented label="Metric" value={metric} onChange={setMetric} options={Object.entries(METRICS).map(([k, v]) => ({ value: k as Metric, label: v.label }))} />}
        description="Hover a day to see which videos went out that day">
        <LineChart data={series} fmt={m.fmt} fmtFull={m.full} color={m.color} height={260}
          detail={(i) => {
            const vs = published.get(d.daily[i]!.day);
            return vs?.length ? <div className="mt-1.5 space-y-1 border-t-2 border-line pt-1.5">{vs.map((v) => (
              <div key={v.videoId} className="flex max-w-56 items-center gap-1.5"><img src={v.thumbnailUrl} alt="" className="h-6 w-3.5 border border-plane object-cover" /><span className="truncate text-ink2">{v.title}</span></div>
            ))}</div> : null;
          }} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <AiChannelCard ai={d.ai.channel} onJump={onJump} compact />
        <Card title="Breakout videos" icon={Trophy} accent="sun" description="First 48 hours against the median of their format">
          <ul className="space-y-2.5">
            {best.slice(0, 5).map((c, i) => (
              <li key={c.videoId}>
                <Link href={`/videos/${c.videoId}`} className="nb-sm nb-press flex items-center gap-3 bg-surface pr-2.5">
                  <span className={`grid w-10 self-stretch place-items-center border-r-2 border-edge font-display text-[18px] ${i === 0 ? "bg-lime text-on-accent" : "bg-surface-2"}`}>{i + 1}</span>
                  <img src={c.thumbnailUrl} alt="" className="my-1.5 h-11 w-6 border-2 border-edge object-cover" />
                  <span className="min-w-0 flex-1 py-1.5"><span className="line-clamp-1 text-[13px] font-bold">{c.title}</span><span className="font-mono text-[10.5px] font-bold uppercase text-muted">{fmtNum(c.views)} views · {c.avgViewPct?.toFixed(0) ?? "—"}% viewed</span></span>
                  <span className="border-2 border-edge bg-mint px-1.5 font-display text-[14px] tabular-nums text-on-accent">{c.vs48!.toFixed(1)}×</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Where views come from" icon={Compass} action={<JumpBtn onClick={() => onJump("reach")} />}><Donut slices={d.breakdowns.traffic} /></Card>
        <Card title="Top countries" icon={Globe2} action={<JumpBtn onClick={() => onJump("audience")} />}><RankList slices={d.breakdowns.country} kind="country" max={6} /></Card>
      </div>
    </>
  );
}

const JumpBtn = ({ onClick }: { onClick: () => void }) => <button type="button" onClick={onClick} className="shrink-0 px-2 py-1 text-xs font-semibold text-ink font-bold hover:bg-lime/25">More →</button>;

// ---------------- realtime ----------------

function RealtimeTab({ d }: { d: Studio }) {
  const r = d.realtime;
  const labels = r.hours.map((h) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", day: "numeric", month: "short" }).format(new Date(h.hour)));
  if (!r.snapshotAt) return <Waiting icon={Radio} title="Realtime starts with the first hourly snapshot">The watchdog records every video&apos;s public counters once an hour. The chart fills in from the next hour.</Waiting>;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <HeroStat label="Last 48 hours" live value={r.last48} fmt={fmtNum} spark={r.hours.map((h) => h.views)} sub="views, from YouTube's public counters" />
        <HeroStat label="Last hour" icon={Timer} value={r.last1} fmt={fmtNum} sub={`updated ${fmtRelative(r.snapshotAt)}`} />
        <HeroStat label="All-time views" icon={Eye} value={r.totalNow} fmt={fmtNum} sub="live, across published videos" />
      </div>
      <Card title="Views per hour" icon={Radio} description="The last 48 hours, IST. Refreshes every minute; the bright bar is this hour.">
        <HourlyBars values={r.hours.map((h) => h.views)} hours={labels} height={190} />
      </Card>
      <Card title="Top videos right now" icon={TrendingUp} description="Views in the last 48 hours">
        <ul className="divide-y-2 divide-line">
          {r.top.map((v) => (
            <li key={v.videoId}>
              <Link href={`/videos/${v.videoId}`} className="flex items-center gap-4 py-2.5 hover:bg-wash">
                <img src={v.thumbnailUrl} alt="" className="h-12 w-7 border-2 border-edge object-cover" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{v.title}</span>
                <span className="hidden w-48 sm:block"><HourlyBars values={v.hours} hours={labels} height={30} bare /></span>
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
            { label: "Impressions", value: t.impressions },
            { label: "Views", value: t.views, note: t.impressions ? "clicked or played" : "impressions need the Reporting API" },
            { label: "Engaged views", value: t.engagedViews, note: "stayed past the start" },
            { label: "Liked", value: t.likes, note: "of engaged viewers liked" },
            { label: "Subscribed", value: t.subsGained, note: "of likers… roughly, subscribed" },
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
  return (
    <ul className="space-y-1">
      {d.breakdowns.suggested.slice(0, 12).map((s) => {
        const mine = ours.get(s.key);
        return (
          <li key={s.key} className="flex items-center gap-2 px-2 py-1.5 text-[13px] hover:bg-wash">
            <a href={`https://www.youtube.com/watch?v=${s.key}`} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">{mine ? `Ours: ${mine.title}` : s.key}</a>
            <span className="font-semibold tabular-nums">{fmtNum(s.views)}</span>
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
  const t = d.totals;
  return (
    <>
      <Card title="Typical audience retention" icon={Activity} description="The average curve of the last 10 videos of the format. Open a video to see its own curve, key frames and where people left."
        action={<Segmented label="Retention format" value={f} onChange={setF} options={[{ value: "short", label: "Shorts" }, { value: "long", label: "Long" }]} />}>
        {curve.length ? <RetentionChart curve={curve} typical={[]} drops={[]} duration={dur} format={f} /> : <Waiting icon={Activity} title="No curve yet">YouTube shows a retention curve once a video has enough views.</Waiting>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Hook hold, video by video" icon={Timer} description="Share still watching at 3 s (Shorts) or 30 s (long), oldest to newest">
          <LineChart data={trend.map((h) => ({ label: fmtDayKey(h.publishAt.slice(0, 10)), value: h.hookHold! * 100 }))} fmt={(x) => `${x.toFixed(0)}%`} fmtFull={(x) => `${x.toFixed(1)}% still watching`} color="var(--c2)"
            detail={(i) => <div className="mt-1 max-w-56 truncate text-muted">{trend[i]?.title}</div>} />
        </Card>
        <Card title="Engaged views, video by video" icon={MousePointerClick} description="Engaged ÷ all views: the API's stand-in for Studio's stayed-to-watch">
          <LineChart data={d.hookTrend.filter((h) => h.engagedRatio !== null).map((h) => ({ label: fmtDayKey(h.publishAt.slice(0, 10)), value: h.engagedRatio! * 100 }))} fmt={(x) => `${x.toFixed(0)}%`} fmtFull={(x) => `${x.toFixed(1)}% engaged`} color="var(--c3)"
            detail={(i) => <div className="mt-1 max-w-56 truncate text-muted">{d.hookTrend.filter((h) => h.engagedRatio !== null)[i]?.title}</div>} />
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
                <div className="flex items-baseline justify-between text-[13px]"><span className="font-semibold">{s.label}</span><span className="tabular-nums text-muted">{fmtNum(s.views)} views · <b className="text-ink">{s.avgViewPct?.toFixed(0) ?? "—"}%</b> viewed</span></div>
                <div className="mt-1.5 h-4 overflow-hidden border-2 border-edge bg-surface"><div className="h-full border-r-2 border-edge" style={{ width: `${Math.max(s.share * 100, 1)}%`, background: i ? "var(--c5)" : "var(--c1)" }} /></div>
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
          const groups = [...a.groups].sort((x, y) => (y[k] ?? -1) - (x[k] ?? -1));
          const max = Math.max(...groups.map((g) => g[k] ?? 0), 1e-9);
          return (
            <Card key={a.attribute} title={a.label}>
              <ul className="space-y-1.5">
                {groups.map((g, i) => (
                  <li key={g.value} className={`relative flex items-center gap-2  px-2 py-1.5 text-[13px] ${g.n < 3 ? "opacity-45" : ""}`}>
                    <span aria-hidden className="absolute inset-y-0 left-0 " style={{ width: `${((g[k] ?? 0) / max) * 100}%`, background: i === 0 && g.n >= 3 ? "color-mix(in oklab, var(--good) 22%, transparent)" : "var(--series-soft)" }} />
                    <span className="relative min-w-0 flex-1 truncate">{g.value}</span>
                    <span className="relative rounded bg-surface/70 px-1 text-[10.5px] tabular-nums text-muted">n={g.n}</span>
                    <span className="relative w-12 text-right font-semibold tabular-nums">{g[k] === null ? "—" : fmt(g[k]!)}</span>
                  </li>
                ))}
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
  return (
    <>
      <AiChannelCard ai={d.ai.channel} onJump={onJump} />
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink2">
        <span>Every video&apos;s verdict:</span>
        {(["hit", "okay", "miss"] as const).map((v) => <span key={v} className="inline-flex items-center gap-1.5"><VerdictBadge verdict={v} /><b className="tabular-nums text-ink">{counts[v]}</b></span>)}
        <span className="text-xs text-muted">(AI where written, otherwise by views and % viewed against the median)</span>
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
      <a href="https://studio.youtube.com/" target="_blank" rel="noreferrer" className="font-semibold text-ink font-bold hover:underline">Open Studio ↗</a>
    </p>
  );
}
