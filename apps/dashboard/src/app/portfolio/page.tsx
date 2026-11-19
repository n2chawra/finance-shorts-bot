"use client";

import { ArrowRight, Award, BadgeDollarSign, ExternalLink, FlaskConical, LayoutGrid, Scale, Trophy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { MultiLineChart, Sparkline } from "@/components/charts";
import { CAT } from "@/components/studio-charts";
import { Badge, Card, Delta, Empty, ErrorNote, Loading, Meter, PageHeader, Stagger, type Tone } from "@/components/ui";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtNum, fmtRelative } from "@/lib/format";
import { CHANNEL_BRAND, brandName } from "@/lib/channel-brand";
import type { PortfolioChannel, PortfolioVideo, VerdictCall } from "@/lib/portfolio";
import { usePortfolio, useSwitchChannel } from "@/lib/queries";

const VERDICT_TONE: Record<VerdictCall, Tone> = { Growing: "good", Flat: "neutral", Falling: "critical", "Too early": "info", "Setting up": "neutral" };
const HEALTH: Record<"green" | "amber" | "red", { tone: Tone; label: string }> = {
  green: { tone: "good", label: "Healthy" }, amber: { tone: "warning", label: "Watch" }, red: { tone: "critical", label: "Needs you" },
};

const NO = <span className="text-muted">no data yet</span>;
const pct = (x: number | null, digits = 1) => (x === null ? null : `${(x * 100).toFixed(digits)}%`);
const change = (a: number | null, b: number | null) => (a === null || b === null || b <= 0 ? null : ((a - b) / b) * 100);
const signed = (n: number) => `${n > 0 ? "+" : ""}${fmtNum(n)}`;
const ytUrl = (v: PortfolioVideo) => (v.youtubeId ? (v.format === "short" ? `https://www.youtube.com/shorts/${v.youtubeId}` : `https://youtu.be/${v.youtubeId}`) : null);

function Avatar({ id, name, color, dim }: { id: string; name: string; color: string; dim?: boolean }) {
  const logo = CHANNEL_BRAND[id]?.logo;
  if (logo) return <Image src={logo} alt="" width={40} height={40} className={`size-10 shrink-0 rounded-xl object-cover shadow-xs ${dim ? "opacity-50" : ""}`} />;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  return <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl text-[14px] font-semibold text-white shadow-xs ${dim ? "opacity-50" : ""}`} style={{ background: color }}>{initials}</span>;
}

function VideoRow({ v }: { v: PortfolioVideo }) {
  const url = ytUrl(v);
  const body = (
    <>
      <span className="line-clamp-2 flex-1 text-[13px] font-medium leading-snug">{v.title}</span>
      <span className="shrink-0 text-right text-[12px] tabular-nums text-ink2">{fmtCompact(v.views)} views
        {v.stayed !== null && <span className="block text-[11.5px] text-muted">{pct(v.stayed, 0)} stayed</span>}
        {v.format === "long" && <span className="block text-[11.5px] text-muted">long video</span>}
      </span>
    </>
  );
  return url
    ? <a href={url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-3">{body}</a>
    : <div className="flex items-start gap-3 px-2 py-1.5">{body}</div>;
}

function Metric({ label, value, sub, delta }: { label: string; value: React.ReactNode; sub?: React.ReactNode; delta?: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-surface p-3">
      <div className="flex items-center justify-between gap-1 text-[11.5px] text-muted"><span className="truncate">{label}</span>{delta}</div>
      <div className="mt-1 text-[17px] font-semibold tabular-nums leading-tight">{value}</div>
      {sub && <div className="mt-0.5 truncate text-[11.5px] text-muted">{sub}</div>}
    </div>
  );
}

function ChannelCard({ c, color }: { c: PortfolioChannel; color: string }) {
  const router = useRouter();
  const switchTo = useSwitchChannel();
  const open = () => { switchTo(c.id); router.push("/"); };
  const setup = c.verdict.call === "Setting up";
  const health = c.health ? HEALTH[c.health.color] : null;
  return (
    <Card className={setup ? "opacity-70" : ""}>
      <div data-testid={`portfolio-${c.id}`} className="flex items-start gap-3">
        <Avatar id={c.id} name={brandName(c)} color={color} dim={setup} />
        <div className="min-w-0 flex-1">
          <h2 title={c.name} className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-[-0.01em]">{brandName(c)}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone={VERDICT_TONE[c.verdict.call]} dot>{c.verdict.call}</Badge>
            {setup ? <Badge tone="info">Stage: {c.stage}</Badge> : health ? <Badge tone={health.tone} dot>{health.label}</Badge> : <Badge>No health check yet</Badge>}
            {c.status === "paused" && <Badge tone="warning">Paused</Badge>}
          </div>
        </div>
        <button type="button" onClick={open} aria-label={`Open ${brandName(c)}`}
          className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-ink2 transition-colors hover:bg-surface-3 hover:text-ink">Open<ArrowRight aria-hidden className="size-3.5" /></button>
      </div>
      <p className="mt-3 text-[12.5px] leading-snug text-ink2">{c.verdict.why}</p>
      {health && c.health?.reason && <p className="mt-1 text-[12px] leading-snug text-muted">Health: {c.health.reason}</p>}

      {!setup && (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ring bg-line sm:grid-cols-3">
            <Metric label="Subscribers" value={c.subs === null ? NO : fmtNum(c.subs)}
              sub={c.subs7 === null ? undefined : `${signed(c.subs7)} 7d · ${signed(c.subs28 ?? 0)} 28d`} />
            <Metric label="Views 7d" value={c.views7 === null ? NO : fmtCompact(c.views7)} delta={<Delta value={change(c.views7, c.viewsPrev7)} />}
              sub={c.views28 === null ? undefined : `${fmtCompact(c.views28)} in 28d`} />
            <Metric label="Published 7d" value={c.published7} sub={`${fmtNum(c.publishedTotal)} in all`} />
            <Metric label="Median Short" value={c.medianShort14 === null ? NO : fmtCompact(c.medianShort14)}
              sub={c.shorts14 ? `${c.shorts14} Shorts, 2–14 days old` : "no Shorts 2–14 days old"} />
            <Metric label="Stayed to watch" value={pct(c.stayed28) ?? NO} sub="Shorts, 28 days" />
            <Metric label="% viewed" value={c.pctShort28 === null && c.pctLong28 === null ? NO : [c.pctShort28 !== null && `${c.pctShort28.toFixed(0)}% S`, c.pctLong28 !== null && `${c.pctLong28.toFixed(0)}% L`].filter(Boolean).join(" · ")}
              sub="Shorts · long, 28 days" />
          </dl>
          {c.spark.length > 1 && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11.5px] text-muted"><span>Daily views, 28 days</span>{c.statsThrough && <span>through {fmtDayKey(c.statsThrough)}</span>}</div>
              <Sparkline values={c.spark} color={color} height={40} />
            </div>
          )}
          <div className="mt-4 space-y-2 text-[12.5px]">
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted">Best this week</span>
              {c.best7 ? (ytUrl(c.best7)
                ? <a href={ytUrl(c.best7)!} target="_blank" rel="noreferrer" className="line-clamp-1 text-right font-medium hover:text-brand-text">{c.best7.title} · {fmtCompact(c.best7.views)}</a>
                : <span className="line-clamp-1 text-right font-medium">{c.best7.title} · {fmtCompact(c.best7.views)}</span>)
                : <span className="text-muted">nothing published</span>}
            </div>
            <div className="flex justify-between gap-3"><span className="text-muted">Backlog</span><span className="font-medium tabular-nums">{c.backlog.short} Shorts · {c.backlog.long} long</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted">Next upload</span>
              <span className="text-right font-medium">{c.uploadsPaused ? "Uploads paused" : c.nextUpload ? `${fmtDateTime(c.nextUpload.at)} IST${c.nextUpload.kind === "slot" ? " (slot)" : ""}` : "none planned"}</span></div>
          </div>
        </>
      )}
    </Card>
  );
}

type Col = { key: string; label: string; get: (c: PortfolioChannel) => number | null; fmt: (n: number) => string; hint: string };
const COLS: Col[] = [
  { key: "vps", label: "Views / Short", get: (c) => c.viewsPerShort, fmt: (n) => fmtCompact(n), hint: "average lifetime views, Shorts of the last 28 days" },
  { key: "subs", label: "Subs / 1K views", get: (c) => c.subsPer1k, fmt: (n) => n.toFixed(1), hint: "net subscribers per 1,000 views, 28 days" },
  { key: "stayed", label: "Stayed to watch", get: (c) => c.stayed28, fmt: (n) => `${(n * 100).toFixed(1)}%`, hint: "Shorts' engaged ÷ views, 28 days" },
  { key: "pctS", label: "% viewed (Shorts)", get: (c) => c.pctShort28, fmt: (n) => `${n.toFixed(0)}%`, hint: "average % viewed, Shorts, 28 days" },
  { key: "pctL", label: "% viewed (long)", get: (c) => c.pctLong28, fmt: (n) => `${n.toFixed(0)}%`, hint: "average % viewed, long videos, 28 days" },
];

function Comparison({ live, colors, days, daily }: { live: PortfolioChannel[]; colors: Map<string, string>; days: string[]; daily: Record<string, (number | null)[]> }) {
  const series = live.map((c) => ({ key: c.id, label: brandName(c), color: colors.get(c.id)!, values: daily[c.id] ?? days.map(() => null) }));
  const leaders = new Map(COLS.map((col) => {
    const vals = live.map((c) => col.get(c)).filter((v): v is number => v !== null);
    return [col.key, vals.length > 1 ? Math.max(...vals) : null];
  }));
  return (
    <Card title="Side by side" icon={Scale} accent="sky" className="mt-5" description="Daily views per channel, 28 days (YouTube Analytics, a 2–3 day lag), and who leads on each measure">
      {days.length === 0 || series.every((s) => s.values.every((v) => v === null)) ? <Empty title="No daily stats yet">The stats job fills this in every 3 hours.</Empty> : (
        <>
          <MultiLineChart labels={days.map(fmtDayKey)} series={series} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} />
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink2">
            {series.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />{s.label}</span>)}
          </div>
        </>
      )}
      <div className="-mx-5 mt-5 overflow-x-auto border-t border-line">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] text-muted">
              <th className="px-5 py-2.5 font-medium">Channel</th>
              {COLS.map((col) => <th key={col.key} title={col.hint} className="px-3 py-2.5 text-right font-medium">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {live.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5"><span className="flex items-center gap-2 font-medium"><span aria-hidden className="size-2 rounded-full" style={{ background: colors.get(c.id) }} />{brandName(c)}</span></td>
                {COLS.map((col) => {
                  const v = col.get(c);
                  const lead = v !== null && leaders.get(col.key) === v;
                  return (
                    <td key={col.key} className="px-3 py-2.5 text-right tabular-nums">
                      {v === null ? <span className="text-muted">—</span>
                        : <span className={lead ? "inline-flex items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 font-semibold text-good-text" : ""}>{lead && <Award aria-label="Leader" className="size-3.5" />}{col.fmt(v)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Working({ live, colors }: { live: PortfolioChannel[]; colors: Map<string, string> }) {
  return (
    <Card title="What's working" icon={Trophy} accent="sun" className="mt-5" description="Each channel's top 3 videos of the last 14 days, and its weekly test">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {live.map((c) => (
          <div key={c.id} className="rounded-xl border border-ring bg-surface-2 p-3">
            <div className="mb-2 flex items-center gap-2 px-2 text-[13.5px] font-semibold"><span aria-hidden className="size-2 rounded-full" style={{ background: colors.get(c.id) }} />{brandName(c)}</div>
            {c.top14.length ? <div className="space-y-0.5">{c.top14.map((v) => <VideoRow key={v.id} v={v} />)}</div> : <p className="px-2 py-3 text-[12.5px] text-muted">Nothing published in the last 14 days.</p>}
            <div className="mt-2 border-t border-line px-2 pt-2.5 text-[12px] leading-snug">
              <span className="flex items-center gap-1.5 font-medium text-ink2"><FlaskConical aria-hidden className="size-3.5" />Weekly loop{c.loop?.cycle != null ? ` · cycle ${c.loop.cycle}` : ""}</span>
              {c.loop ? (
                <>
                  <p className="mt-1 text-ink2">{c.loop.running ? <>Testing: {c.loop.description ?? c.loop.running}</> : "Between tests"}</p>
                  {c.loop.lastVerdict && <p className="mt-0.5 text-muted">Last verdict: {c.loop.lastVerdict.verdict} ({c.loop.lastVerdict.test ?? c.loop.lastVerdict.id})</p>}
                </>
              ) : <p className="mt-1 text-muted">No weekly loop data yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Goal({ label, value, max, fmt, note }: { label: string; value: number | null; max: number; fmt: (n: number) => string; note: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
        <span className="text-ink2">{label}</span>
        <span className="tabular-nums"><span className="font-semibold">{value === null ? "—" : fmt(value)}</span><span className="text-muted"> / {fmt(max)}</span></span>
      </div>
      <div className="mt-1.5"><Meter value={Math.max(0, value ?? 0)} max={max} label={label} tone={value !== null && value >= max ? "good" : "series"} /></div>
      <div className="mt-1 text-[11.5px] text-muted">{value === null ? "no data yet" : `${Math.min(100, (Math.max(0, value) / max) * 100).toFixed(1)}% · ${note}`}</div>
    </div>
  );
}

function Monetisation({ live, colors }: { live: PortfolioChannel[]; colors: Map<string, string> }) {
  return (
    <Card title="Toward the Partner Program" icon={BadgeDollarSign} accent="mint" className="mt-5"
      description="1,000 subscribers plus 4,000 long-form watch hours in 12 months, or 10M Shorts views in 90 days. Estimates from YouTube Analytics: YouTube counts public views only and decides at review.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {live.map((c) => {
          const pace = c.subs28 && c.subs28 > 0 && c.subs !== null && c.subs < 1000 ? Math.ceil((1000 - c.subs) / c.subs28) : null;
          return (
            <div key={c.id} className="space-y-3.5 rounded-xl border border-ring bg-surface-2 p-4">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold"><span aria-hidden className="size-2 rounded-full" style={{ background: colors.get(c.id) }} />{brandName(c)}</div>
              <Goal label="Subscribers" value={c.ypp.subs} max={1000} fmt={fmtNum}
                note={pace !== null ? `about ${pace} month${pace === 1 ? "" : "s"} at the last 28 days' pace (estimate)` : "estimate: net gained in 12 months"} />
              <Goal label="Watch hours, long (12 mo)" value={c.ypp.watchHoursLong365} max={4000} fmt={(n) => fmtNum(n)} note="estimate" />
              <Goal label="Shorts views (90 days)" value={c.ypp.shortsViews90} max={10_000_000} fmt={fmtCompact} note="estimate" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function PortfolioPage() {
  const { data, error, isLoading } = usePortfolio();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const colors = new Map(data.channels.map((c, i) => [c.id, CAT[i % CAT.length]]));
  const live = data.channels.filter((c) => c.verdict.call !== "Setting up");
  const through = live.map((c) => c.statsThrough).filter(Boolean).sort().at(-1);
  return (
    <Stagger>
      <PageHeader title="All channels" sub={<>Every channel side by side{through ? ` · Analytics through ${fmtDayKey(through)}` : ""} · updated {fmtRelative(data.generatedAt)}</>}>
        <Badge tone="info" icon={LayoutGrid}>{live.length} live · {data.channels.length - live.length} in setup</Badge>
      </PageHeader>
      {data.channels.length === 0 ? <Empty title="No channels yet">{data.source === "sample" ? "Sample mode: connect a database to see channels." : "Add a channel on the Channels page."}</Empty> : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.channels.map((c) => <ChannelCard key={c.id} c={c} color={colors.get(c.id)!} />)}
          </div>
          {live.length > 0 && <>
            <Comparison live={live} colors={colors} days={data.days} daily={data.daily} />
            <Working live={live} colors={colors} />
            <Monetisation live={live} colors={colors} />
          </>}
          <p className="mt-4 flex items-center gap-1.5 text-[11.5px] text-muted"><ExternalLink aria-hidden className="size-3" />Video titles open on YouTube. &ldquo;Open&rdquo; switches the dashboard to that channel.</p>
        </>
      )}
    </Stagger>
  );
}
