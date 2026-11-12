"use client";

import { ChevronDown, Eye, Gauge, Hand, Timer, TrendingUp } from "lucide-react";
import { Accordion } from "radix-ui";
import { useState } from "react";

import { LineChart } from "@/components/charts";
import { type Accent, Badge, Card, Delta, Empty, ErrorNote, Loading, PageHeader, Segmented, Stagger, Stat, VideoLink } from "@/components/ui";
import { fmtDayKey, fmtNum, fmtRelative, titleCase } from "@/lib/format";
import { change, type ImpactChange, type ImpactVideo, type ImpactWeek } from "@/lib/impact";
import { useImpact } from "@/lib/queries";

type Metric = "views" | "viewed" | "stayed" | "seconds";
const METRICS: { value: Metric; label: string }[] = [
  { value: "views", label: "Views (48 h)" }, { value: "viewed", label: "% viewed" },
  { value: "stayed", label: "Stayed to watch" }, { value: "seconds", label: "View time" },
];
const pick = (w: { medianViews48h: number | null; avgViewPct: number | null; stayedToWatch: number | null; avgViewSec: number | null }, m: Metric) =>
  m === "views" ? w.medianViews48h : m === "viewed" ? w.avgViewPct : m === "stayed" ? (w.stayedToWatch === null ? null : w.stayedToWatch * 100) : w.avgViewSec;
const fmtMetric = (m: Metric) => (n: number) => m === "views" ? fmtNum(n) : m === "seconds" ? `${n.toFixed(1)} s` : `${n.toFixed(0)}%`;
const pct = (n: number | null) => (n === null ? "–" : `${n.toFixed(0)}%`);
const stayed = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);

type Filter = "all" | "helped" | "hurt" | "waiting";
/** Before/after is a hint, not proof: several changes land the same week. Up or down only past ±25%. */
const verdict = (c: ImpactChange): Exclude<Filter, "all"> => c.after.n === 0 || c.viewsRatio === null ? "waiting" : c.viewsRatio >= 1.25 ? "helped" : c.viewsRatio <= 0.8 ? "hurt" : "waiting";

export default function ImpactPage() {
  const { data, error, isLoading } = useImpact();
  const [metric, setMetric] = useState<Metric>("views");
  const [filter, setFilter] = useState<Filter>("all");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  if (!data.weeks.length) {
    return (
      <Stagger>
        <PageHeader title="Impact" sub="What each improvement did to the channel" />
        <Empty icon={TrendingUp} title="No impact data yet">The improver writes it each night (improvement/weekly/impact.json); it shows here after the next ingest.</Empty>
      </Stagger>
    );
  }
  const weeks = data.weeks;
  const last = weeks[weeks.length - 1], prev = weeks.length > 1 ? weeks[weeks.length - 2] : null;
  const shown = data.changes.filter((c) => filter === "all" || verdict(c) === filter);
  const counts = { helped: 0, hurt: 0, waiting: 0 };
  for (const c of data.changes) counts[verdict(c)]++;

  return (
    <Stagger>
      <PageHeader title="Impact" sub={<>Is the automation making the channel better? Shorts by publish week, and every change with the Shorts before and after it{data.updatedAt ? ` · updated ${fmtRelative(data.updatedAt)}` : ""}</>} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <WeekStat label="Median views in 48 h" accent="sky" icon={Eye} last={last} prev={prev} m="views" />
        <WeekStat label="Average % viewed" accent="mint" icon={Gauge} last={last} prev={prev} m="viewed" />
        <WeekStat label="Stayed to watch" accent="lime" icon={Hand} last={last} prev={prev} m="stayed" sub="didn't swipe away" />
        <WeekStat label="Average view time" accent="pink" icon={Timer} last={last} prev={prev} m="seconds" />
      </div>

      <Card title="Week by week" description="Shorts published that week (IST). Stayed to watch is the share of viewers who didn't swipe away; YouTube shows a Short to more people when it rises." className="mt-5" accent="sun"
        action={<Segmented label="Metric" value={metric} onChange={setMetric} options={METRICS} />}>
        <LineChart height={200} fmt={fmtMetric(metric)}
          data={weeks.map((w) => ({ label: `Week of ${fmtDayKey(w.week)}`, value: pick(w, metric) ?? 0 }))}
          detail={(i) => <WeekDetail w={weeks[i]} />} />
      </Card>

      <Card flush className="mt-5" accent="sky" title="This week's Shorts" description={`Week of ${fmtDayKey(last.week)} · ${last.n} Shorts with 48-hour numbers, most viewed first`}>
        <Videos videos={last.videos} />
      </Card>

      <div className="mb-4 mt-10 flex flex-wrap items-end justify-between gap-3 border-b border-ring pb-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Every change and what followed</h2>
          <p className="mt-2 max-w-3xl text-[13px] font-medium text-muted">Median 48-hour views of the Shorts in the 14 days before vs after. Several changes often land the same week, so this is a hint; the A/B tests on the Agents page give the proof.</p>
        </div>
        <Segmented label="Filter changes" value={filter} onChange={setFilter} options={[
          { value: "all", label: `All ${data.changes.length}` }, { value: "helped", label: `Up ${counts.helped}` },
          { value: "hurt", label: `Down ${counts.hurt}` }, { value: "waiting", label: `Unclear ${counts.waiting}` },
        ]} />
      </div>
      {shown.length === 0 ? <Empty title="Nothing here">No change matches this filter.</Empty> : (
        <Accordion.Root type="multiple" className="space-y-3">
          {shown.map((c) => <ChangeRow key={c.id} c={c} />)}
        </Accordion.Root>
      )}
    </Stagger>
  );
}

function WeekStat({ label, icon, last, prev, m, sub, accent }: { label: string; icon: typeof Eye; last: ImpactWeek; prev: ImpactWeek | null; m: Metric; sub?: string; accent?: Accent }) {
  const now = pick(last, m), before = prev ? pick(prev, m) : null;
  return (
    <Stat label={label} accent={accent} icon={icon} value={now === null ? "–" : fmtMetric(m)(now)} delta={<Delta value={change(before, now)} />}
      sub={`${sub ? `${sub} · ` : ""}week of ${fmtDayKey(last.week)}${prev ? ` vs ${fmtDayKey(prev.week)}` : ""}`} />
  );
}

function WeekDetail({ w }: { w: ImpactWeek }) {
  return (
    <div className="text-xs">
      <div>{w.n} Shorts · median {w.medianViews48h === null ? "–" : fmtNum(w.medianViews48h)} views · {pct(w.avgViewPct)} viewed · {stayed(w.stayedToWatch)} stayed · {w.avgViewSec ?? "–"} s</div>
      {w.videos[0] && <div className="mt-1 text-muted">Best: {w.videos[0].title} ({fmtNum(w.videos[0].views48h ?? 0)})</div>}
    </div>
  );
}

function Videos({ videos }: { videos: ImpactVideo[] }) {
  if (!videos.length) return <p className="px-4 py-3 text-xs text-muted md:px-5">No Shorts with 48-hour numbers yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead className="border-b border-ring bg-ink text-left text-[11px] text-plane">
          <tr>
            <th className="px-4 py-2 font-semibold md:px-5">Video</th><th className="px-2 py-2 text-right font-semibold">Views 48 h</th>
            <th className="px-2 py-2 text-right font-semibold">% viewed</th><th className="px-4 py-2 text-right font-semibold md:px-5">Stayed</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id} className="border-b border-line last:border-0">
              <td className="max-w-0 px-4 py-2 md:px-5"><VideoLink id={v.id} className="block truncate font-semibold">{v.title || v.id}</VideoLink><span className="text-xs font-medium text-muted">{fmtDayKey(v.day)}</span></td>
              <td className="px-2 py-2 text-right tabular-nums">{v.views48h === null ? "–" : fmtNum(v.views48h)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{pct(v.avgViewPct)}</td>
              <td className="px-4 py-2 text-right tabular-nums md:px-5">{stayed(v.stayedToWatch)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TONE = { helped: "good", hurt: "critical", waiting: "neutral" } as const;
const LABEL = { helped: "Views up", hurt: "Views down", waiting: "Unclear yet" } as const;

function ChangeRow({ c }: { c: ImpactChange }) {
  const v = verdict(c);
  const row = (k: string, b: string, a: string, d: number | null) => (
    <div className="flex items-center justify-between gap-2 py-1"><span className="text-muted">{k}</span><span className="tabular-nums">{b} → {a} <Delta value={d} /></span></div>
  );
  return (
    <Accordion.Item value={c.id} className="panel bg-surface">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-tint-brand data-[state=open]:border-b data-[state=open]:border-ring data-[state=open]:bg-surface-2 rounded-md">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">{c.description || c.id}</div>
            <div className="mt-1 text-xs font-medium text-muted">{fmtDayKey(c.day)} · {titleCase(c.area ?? "change")} · {titleCase(c.status)}{c.sameWeek ? ` · ${c.sameWeek} other changes within 3 days` : ""}</div>
          </div>
          <span className="hidden border border-ring bg-surface px-2 py-0.5 text-xs font-medium tabular-nums sm:block rounded-lg">{c.before.medianViews48h === null ? "–" : fmtNum(c.before.medianViews48h)} → {c.after.medianViews48h === null ? "–" : fmtNum(c.after.medianViews48h)}</span>
          <Badge tone={TONE[v]}>{LABEL[v]}</Badge>
          <span className="grid size-8 shrink-0 place-items-center border border-ring bg-surface rounded-lg"><ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:" /></span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="px-4 py-4 text-[13px] font-medium">
        <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
          <div>
            <div className="mb-1 text-xs text-muted">14 days before ({c.before.n} Shorts) → after ({c.after.n})</div>
            {row("Median views 48 h", c.before.medianViews48h === null ? "–" : fmtNum(c.before.medianViews48h), c.after.medianViews48h === null ? "–" : fmtNum(c.after.medianViews48h), change(c.before.medianViews48h, c.after.medianViews48h))}
            {row("% viewed", pct(c.before.avgViewPct), pct(c.after.avgViewPct), change(c.before.avgViewPct, c.after.avgViewPct))}
            {row("Stayed to watch", stayed(c.before.stayedToWatch), stayed(c.after.stayedToWatch), change(c.before.stayedToWatch, c.after.stayedToWatch))}
            {row("View time", `${c.before.avgViewSec ?? "–"} s`, `${c.after.avgViewSec ?? "–"} s`, change(c.before.avgViewSec, c.after.avgViewSec))}
          </div>
          <div className="min-w-0 border border-line">
            <div className="border-b border-line px-4 py-2 text-xs text-muted md:px-5">Shorts after it, most viewed first</div>
            <Videos videos={c.afterVideos} />
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
