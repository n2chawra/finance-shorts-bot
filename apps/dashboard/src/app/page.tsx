"use client";

import { AlertOctagon, ArrowRight, Bot, CircleX, Clapperboard, Eye, Heart, Layers, Pause, Play, Rocket, Sparkles, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryBar, Sparkline, Tracker, type TrackerTone } from "@/components/charts";
import { Badge, Button, Card, Delta, Empty, ErrorNote, Loading, Meter, Num, PageHeader, Stagger, Stat, Thumb, type Tone, VideoLink } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtNum, fmtRelative, istDay } from "@/lib/format";
import { useAgents, useAnalytics, useNotifications, useOverview, usePatchSettings, useRuns, useSettings } from "@/lib/queries";
import { AGENTS, type Analytics, perThousand, type Run } from "@/lib/schemas";

/** Videos the routines aim to ship per IST day (generator setting `dailyVideoTarget`). */
const DAILY_TARGET = 3;
const DAY_MS = 86_400_000;

const MODES: Record<string, { label: string; tone: Tone }> = {
  video: { label: "Making videos", tone: "good" },
  template_work: { label: "Template work", tone: "info" },
  idle: { label: "Idle", tone: "neutral" },
  paused: { label: "Paused", tone: "warning" },
};

/** "2h 14m 09s" until `iso`, ticking every second. */
function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = Math.max(0, Math.floor((Date.parse(iso) - now) / 1000));
  if (s === 0) return <span>due now</span>;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span className="tabular-nums">{s >= 86400 ? `${Math.floor(s / 86400)}d ` : ""}{pad(Math.floor((s % 86400) / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}</span>;
}

/** Likes + comments per 1,000 views, as a short label. */
const fmtLoved = (t: { views: number; likes: number; comments: number }) => `${perThousand(t).toFixed(1)} per 1K views`;

/** Last 7 days against the 7 before, from the daily Analytics rows. */
function weekOverWeek(a: Analytics | undefined, key: "views" | "subsGained" | "likes") {
  if (!a) return { spark: [] as number[], delta: null as number | null };
  const days = a.daily.map((d) => d[key]);
  const last = days.slice(-7).reduce((x, y) => x + y, 0);
  const prev = days.slice(-14, -7).reduce((x, y) => x + y, 0);
  return { spark: days.slice(-14), delta: prev > 0 ? ((last - prev) / prev) * 100 : null };
}

/** Shipped and failed Short runs per IST day, for the last `n` days (long videos have their own weekly target). */
function dailyOutput(runs: Run[] | undefined, n: number) {
  const today = istDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const day = istDay(new Date(Date.now() - (n - 1 - i) * DAY_MS));
    const mine = (runs ?? []).filter((r) => r.kind === "video" && r.format !== "long" && istDay(r.startedAt) === day);
    const shipped = mine.filter((r) => r.status === "ok").length;
    const failed = mine.length - shipped;
    const tone: TrackerTone = shipped >= DAILY_TARGET ? "good" : shipped > 0 ? "warning" : mine.length ? "critical" : day === today ? "empty" : "empty";
    return { day, shipped, failed, tone, isToday: day === today };
  });
}

export default function OverviewPage() {
  const { data, error, isLoading } = useOverview();
  const analytics = useAnalytics();
  const runs = useRuns();
  const settings = useSettings();
  const notifications = useNotifications();
  const agents = useAgents();
  const patch = usePatchSettings();
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const g = data.generation;
  const set = (p: { uploadsPaused?: boolean; generationPaused?: boolean }, done: string) =>
    patch.mutate(p, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });
  const views = weekOverWeek(analytics.data, "views");
  const likes = weekOverWeek(analytics.data, "likes");
  const subs = weekOverWeek(analytics.data, "subsGained");
  const days = dailyOutput(runs.data, 14);
  const today = days[days.length - 1];
  const shipped14 = days.reduce((a, d) => a + d.shipped, 0);
  const metDays = days.filter((d) => d.shipped >= DAILY_TARGET).length;
  const c = data.counts;
  const inProgress = ["planned", "scripted", "verified", "rendered", "qa_passed"].reduce((a, s) => a + (c[s] ?? 0), 0);

  return (
    <Stagger>
      <PageHeader title="Overview" sub={new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }).format(new Date())}>
        <Badge tone={data.uploadsPaused ? "warning" : "good"} dot>{data.uploadsPaused ? "Uploads paused" : "Uploads on"}</Badge>
        <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
      </PageHeader>

      {(() => {
        const critical = notifications.data?.open.filter((n) => n.severity === "critical") ?? [];
        return critical.length > 0 && (
          <Link href="/notifications" className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-critical/30 bg-critical-soft px-4 py-3 transition-colors hover:border-critical/50">
            <span className="flex items-center gap-2 text-sm"><AlertOctagon aria-hidden className="size-4 text-critical" />
              <span><strong className="font-medium">{critical.length === 1 ? critical[0].title : `${critical.length} problems need you`}</strong> <span className="text-ink2">· the automation can&apos;t fix this by itself</span></span></span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium">How to fix <ArrowRight aria-hidden className="size-3.5" /></span>
          </Link>
        );
      })()}

      {data.uploadsPaused && (
        <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
          <p className="flex items-center gap-2 text-sm"><Pause aria-hidden className="size-4 text-warning-text" /><span><strong className="font-medium">Uploads are paused.</strong> <span className="text-ink2">The bot publishes nothing until you resume. Mark manual uploads from each video&apos;s page.</span></span></p>
          <Button tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ uploadsPaused: false }, "Uploads resumed")}>Resume uploads</Button>
        </div>
      )}

      <div data-testid="overview-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        <Stat label="Views" icon={Eye} href="/analytics" value={<Num value={data.allTime.views} fmt={fmtCompact} />}
          delta={<Delta value={views.delta} />} sub={`+${fmtNum(data.last7.views)} in 7 days${data.allTime.liveAt ? ` · live, ${fmtRelative(data.allTime.liveAt)}` : ""}`} chart={<Sparkline values={views.spark} />} />
        <Stat label="Subscribers · 7 days" icon={UserPlus} href="/analytics" value={<Num value={data.last7.subsGained} fmt={(n) => `+${fmtNum(n)}`} />}
          delta={<Delta value={subs.delta} />} sub="from YouTube Analytics" chart={<Sparkline values={subs.spark} color="var(--good)" />} />
        <Stat label="Likes" icon={Heart} href="/analytics" value={<Num value={data.allTime.likes} fmt={fmtCompact} />}
          delta={<Delta value={likes.delta} />}
          sub={`${fmtNum(data.allTime.comments)} comments · ${fmtLoved(data.allTime)} · +${fmtNum(data.last7.likes)} likes in 7 days`}
          chart={<Sparkline values={likes.spark} color="var(--likes)" />} />
        <Stat label="Backlog" icon={Layers} href="/queue" value={<><Num value={data.backlog} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-base font-normal text-muted">/ {data.backlogCap}</span></>}
          sub={`≈ ${Math.floor(data.backlog / (settings.data?.uploadTimes.length ?? 1))} days of uploads`} chart={<div className="pt-3"><Meter value={data.backlog} max={data.backlogCap} label="Backlog" /></div>} />
        <Stat label="Made today" icon={Clapperboard} href="/runs" value={<><Num value={today.shipped} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-base font-normal text-muted">/ {DAILY_TARGET}</span></>}
          sub={today.failed ? `${today.failed} failed attempt${today.failed === 1 ? "" : "s"}` : "Shorts · daily target"}
          chart={<div className="pt-3"><Meter value={today.shipped} max={DAILY_TARGET} label="Shorts made today" tone={today.shipped >= DAILY_TARGET ? "good" : "brand"} /></div>} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card title="Next upload" icon={Rocket} className="lg:col-span-2"
          action={<Link href="/queue" className="flex items-center gap-1 text-xs font-medium text-ink2 hover:text-ink">Queue <ArrowRight aria-hidden className="size-3.5" /></Link>}>
          {data.nextUpload ? (
            <div className="flex gap-4">
              <Thumb src={data.nextUpload.thumbnailUrl} alt="" className="w-[72px] md:w-20" />
              <div className="min-w-0 flex-1">
                <VideoLink id={data.nextUpload.videoId} className="line-clamp-2 text-[15px] font-medium">{data.nextUpload.title}</VideoLink>
                <div className="mt-3 font-mono text-[32px] font-medium leading-none tracking-tight md:text-[40px]">
                  {data.uploadsPaused ? <span className="font-sans text-2xl text-muted">Paused</span> : <Countdown iso={data.nextUpload.publishAt} />}
                </div>
                <div className="mt-2 text-[13px] text-muted">{fmtDateTime(data.nextUpload.publishAt)} IST · {fmtRelative(data.nextUpload.publishAt)}</div>
              </div>
            </div>
          ) : <Empty icon={Rocket} title="Nothing scheduled">{data.backlog ? "The next publish run picks the top of the queue." : "The queue is empty."}</Empty>}
        </Card>

        <Card title="Generation" icon={Bot}
          action={g.mode === "paused"
            ? <Button size="sm" tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ generationPaused: false }, "Generation resumed")}>Resume</Button>
            : <Button size="sm" icon={Pause} disabled={patch.isPending} onClick={() => set({ generationPaused: true }, "Generation paused")}>Pause</Button>}>
          <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
          <p className="mt-2 text-[13px] leading-relaxed text-ink2">{g.reason}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-[13px]">
            <div><dt className="text-xs text-muted">Template runs today</dt><dd className="mt-0.5 font-medium tabular-nums">{g.templateRunsToday} / {g.maxTemplateRunsPerDay}</dd></div>
            <div><dt className="text-xs text-muted">Templates</dt><dd className="mt-0.5 font-medium tabular-nums">{g.templates} / {g.maxTemplates}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Last run</dt><dd className="mt-0.5 font-medium">{g.lastRunAt ? `${fmtDateTime(g.lastRunAt)} · ${fmtRelative(g.lastRunAt)}` : "—"}</dd></div>
          </dl>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card title="Daily output" description={`Shorts shipped per day, last 14 days · target ${DAILY_TARGET}`} className="lg:col-span-2"
          action={<span className="text-right text-xs text-muted"><span data-testid="output-total" className="block text-sm font-medium text-ink tabular-nums">{shipped14} Shorts</span>target met {metDays}/14 days</span>}>
          {runs.isLoading ? <div className="skeleton h-8 rounded-md" /> : (
            <Tracker items={days.map((d) => ({
              key: d.day, tone: d.tone,
              tip: `${fmtDayKey(d.day)}${d.isToday ? " (today)" : ""}: ${d.shipped} shipped${d.failed ? `, ${d.failed} failed` : ""}`,
            }))} />
          )}
          <div className="mt-2 flex justify-between text-[11px] text-muted"><span>{fmtDayKey(days[0].day)}</span><span>Today</span></div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink2">
            <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-[2px] bg-good" />Target met</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-[2px] bg-warning" />Below target</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-[2px] bg-critical" />Only failures</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-[2px] bg-wash-2" />No runs</span>
          </div>
        </Card>

        <Card title="Pipeline" description="Every video by where it is now">
          <CategoryBar parts={[
            { key: "progress", label: "In progress", value: inProgress, className: "bg-muted" },
            { key: "queued", label: "Queued", value: c.queued ?? 0, className: "bg-brand", href: "/videos?status=queued" },
            { key: "scheduled", label: "Scheduled", value: c.scheduled ?? 0, className: "bg-series", href: "/videos?status=scheduled" },
            { key: "published", label: "Published", value: c.published ?? 0, className: "bg-good", href: "/videos?status=published" },
            { key: "failed", label: "Failed", value: c.failed ?? 0, className: "bg-critical", href: "/videos?status=failed" },
          ]} />
        </Card>
      </div>

      {(() => {
        const days = [...new Set((agents.data?.activity ?? []).map((a) => a.day))].sort();
        const last = days.at(-1);
        const rows = (agents.data?.activity ?? []).filter((a) => a.day === last);
        const label = { acted: "made a change", waited: "waited", blocked: "was blocked", nothing: "nothing to do" } as const;
        return (
          <Card title="Agents last night" icon={Sparkles} className="mt-3" description={last ? undefined : "The self-improving agents report here after their first night."}
            action={<Link href="/agents" className="flex items-center gap-1 text-xs font-medium text-ink2 hover:text-ink">Details <ArrowRight aria-hidden className="size-3.5" /></Link>}>
            {rows.length > 0 && (
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {AGENTS.map((k) => {
                  const a = rows.find((r) => r.agent === k);
                  return (
                    <li key={k} className="rounded-lg bg-surface-2 p-3 text-[13px]">
                      <div className="flex items-center justify-between gap-2"><span className="font-medium">{k[0].toUpperCase() + k.slice(1)}</span>
                        <span className="text-xs text-muted">{a ? label[a.decision] : "no report"}</span></div>
                      {a && <p className="mt-1 line-clamp-3 text-ink2">{a.summary}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })()}

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Latest published" icon={Upload} flush
          action={<Link href="/analytics" className="flex items-center gap-1 text-xs font-medium text-ink2 hover:text-ink">Analytics <ArrowRight aria-hidden className="size-3.5" /></Link>}>
          {data.recent.length === 0 ? <Empty icon={Upload} title="Nothing published yet">Published videos and their views show up here.</Empty> : (
            <ul>
              {data.recent.map((v) => (
                <li key={v.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0 md:px-5">
                  <Thumb src={v.thumbnailUrl} alt="" className="w-8" />
                  <div className="min-w-0 flex-1">
                    <VideoLink id={v.id} className="block truncate text-[13px] font-medium">{v.title}</VideoLink>
                    <span className="text-xs text-muted">{v.upload ? fmtRelative(v.upload.publishAt) : ""}</span>
                  </div>
                  <span className="shrink-0 text-right text-[13px]"><span className="font-medium tabular-nums">{fmtCompact(v.totals?.views ?? 0)}</span><span className="ml-1 text-xs text-muted">views</span></span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent failures" icon={CircleX} flush
          action={<Link href="/runs" className="flex items-center gap-1 text-xs font-medium text-ink2 hover:text-ink">Runs <ArrowRight aria-hidden className="size-3.5" /></Link>}>
          {data.recentFailures.length === 0 ? <Empty icon={CircleX} title="No failures">Every recent run shipped its video.</Empty> : (
            <ul>
              {data.recentFailures.map((f) => (
                <li key={f.videoId} className="flex gap-3 border-b border-line px-4 py-2.5 last:border-0 md:px-5">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-critical" />
                  <div className="min-w-0 text-[13px]">
                    <VideoLink id={f.videoId} className="font-medium">{f.title}</VideoLink>
                    <p className="mt-0.5 line-clamp-2 text-ink2">{f.reason}</p>
                    <p className="mt-0.5 text-xs text-muted">{fmtRelative(f.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Stagger>
  );
}
