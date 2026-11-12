/* eslint-disable @next/next/no-img-element */
"use client";

import { AlertOctagon, ArrowRight, ArrowUpRight, Bot, CircleX, Clapperboard, Eye, Heart, Layers, Pause, Play, Rocket, Sparkles, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryBar, Sparkline, Tracker, type TrackerTone } from "@/components/charts";
import { type Accent, Badge, Button, Card, Delta, Empty, ErrorNote, IconTile, Loading, Meter, Num, PageHeader, Stagger, Stat, Thumb, type Tone, VideoLink } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtNum, fmtRelative, istDay } from "@/lib/format";
import { useAgents, useAnalytics, useNotifications, useOverview, usePatchSettings, useRuns, useSettings } from "@/lib/queries";
import { lastNight } from "@/lib/last-night";
import { AGENTS, perThousand, type Run } from "@/lib/schemas";
import { STATS_AGE_CLASS, statsAge } from "@/lib/stats-age";
import { weekOverWeek } from "@/lib/totals";

/** Shorts the routine makes a day before settings load (the setting `dailyVideoTarget`: 3). */
const DEFAULT_TARGET = 3;
const DAY_MS = 86_400_000;

const MODES: Record<string, { label: string; tone: Tone }> = {
  video: { label: "Making videos", tone: "good" },
  template_work: { label: "Template work", tone: "info" },
  idle: { label: "Idle", tone: "neutral" },
  paused: { label: "Paused", tone: "warning" },
};

/** Each agent's colour on the "last night" board (the same as on the Agents page). */
const AGENT_ACCENT: Record<string, Accent> = {
  auditor: "sky", research: "grape", improver: "lime", dashboard: "pink", scout: "sun", studio: "tang", monthly: "mint", reviewer: "mint",
};

/** "02 : 14 : 09" until `iso`, ticking every second, each unit in its own tile. */
function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = Math.max(0, Math.floor((Date.parse(iso) - now) / 1000));
  if (s === 0) return <span className="text-3xl font-semibold tracking-tight">Due now</span>;
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts: [string, string][] = [
    ...(s >= 86400 ? [[String(Math.floor(s / 86400)), "days"] as [string, string]] : []),
    [pad(Math.floor((s % 86400) / 3600)), "hours"], [pad(Math.floor((s % 3600) / 60)), "minutes"], [pad(s % 60), "seconds"],
  ];
  return (
    <span className="flex items-start gap-2">
      {parts.map(([v, unit], i) => (
        <span key={unit} className="flex items-start gap-2">
          {i > 0 && <span aria-hidden className="pt-2 text-2xl font-light text-muted md:pt-3 md:text-3xl">:</span>}
          <span className="flex flex-col items-center">
            <span className="min-w-[64px] rounded-xl border border-ring bg-surface px-2.5 py-2 text-center text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums shadow-xs md:min-w-[78px] md:text-[42px]">{v}</span>
            <span className="mt-1.5 text-[11px] text-muted">{unit}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

/** "Good morning" by the hour in IST. */
function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(new Date()));
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Likes + comments per 1,000 views, as a short label. */
const fmtLoved = (t: { views: number; likes: number; comments: number }) => `${perThousand(t).toFixed(1)} per 1K views`;

/** Shipped and failed Short runs per IST day, for the last `n` days (long videos have their own weekly target). */
function dailyOutput(runs: Run[] | undefined, n: number, target = DEFAULT_TARGET) {
  const today = istDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const day = istDay(new Date(Date.now() - (n - 1 - i) * DAY_MS));
    const mine = (runs ?? []).filter((r) => r.kind === "video" && r.format !== "long" && istDay(r.startedAt) === day);
    const shipped = mine.filter((r) => r.status === "ok").length;
    const failed = mine.length - shipped;
    const tone: TrackerTone = shipped >= target ? "good" : shipped > 0 ? "warning" : mine.length ? "critical" : "empty";
    return { day, shipped, failed, tone, isToday: day === today };
  });
}

const More = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-ink2 transition-colors hover:bg-surface-3 hover:text-ink">{children}<ArrowRight aria-hidden className="size-3.5" /></Link>
);

export default function OverviewPage() {
  const { data, error, isLoading } = useOverview();
  const analytics = useAnalytics();
  const runs = useRuns();
  const settings = useSettings();
  const DAILY_TARGET = settings.data?.dailyVideoTarget ?? DEFAULT_TARGET;
  const notifications = useNotifications();
  const agents = useAgents();
  const patch = usePatchSettings();
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const g = data.generation;
  const set = (p: { uploadsPaused?: boolean; generationPaused?: boolean }, done: string) =>
    patch.mutate(p, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });
  const views = weekOverWeek(analytics.data?.daily ?? [], "views");
  const likes = weekOverWeek(analytics.data?.daily ?? [], "likes");
  const subs = weekOverWeek(analytics.data?.daily ?? [], "subsGained");
  const age = analytics.data && statsAge(analytics.data.statsThrough);
  const statsLine = age ? <span data-testid="stats-age" data-tone={age.tone} className={STATS_AGE_CLASS[age.tone]}>{age.label}</span> : "from YouTube Analytics";
  const days = dailyOutput(runs.data, 14, DAILY_TARGET);
  const today = days[days.length - 1];
  const shipped14 = days.reduce((a, d) => a + d.shipped, 0);
  const metDays = days.filter((d) => d.shipped >= DAILY_TARGET).length;
  const c = data.counts;
  const inProgress = ["planned", "scripted", "verified", "rendered", "qa_passed"].reduce((a, s) => a + (c[s] ?? 0), 0);
  const critical = notifications.data?.open.filter((n) => n.severity === "critical") ?? [];
  const { day: lastDay, byAgent } = lastNight(agents.data?.activity ?? []);
  const decided = { acted: "Made a change", waited: "Waited", blocked: "Blocked", nothing: "Nothing to do" } as const;
  const decidedTone = { acted: "good", waited: "info", blocked: "critical", nothing: "neutral" } as const;

  return (
    <Stagger>
      <PageHeader title="Overview" sub={<>{greeting()}. {new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }).format(new Date())} · here&apos;s how the channel is doing today.</>}>
        <Badge tone={data.uploadsPaused ? "warning" : "good"} dot>{data.uploadsPaused ? "Uploads paused" : "Uploads on"}</Badge>
        <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
      </PageHeader>

      {critical.length > 0 && (
        <Link href="/notifications" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-critical/25 bg-critical-soft px-4 py-3 transition-colors hover:border-critical/45">
          <span className="flex items-center gap-3">
            <IconTile icon={AlertOctagon} accent="red" />
            <span className="text-[13.5px]"><span className="font-semibold">{critical.length === 1 ? critical[0].title : `${critical.length} problems need you`}</span>
              <span className="block text-ink2">The automation can&apos;t fix this by itself.</span></span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-lg border border-ring bg-surface px-3 py-1.5 text-[12.5px] font-medium shadow-xs">How to fix <ArrowRight aria-hidden className="size-3.5" /></span>
        </Link>
      )}

      {data.uploadsPaused && (
        <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
          <p className="flex items-center gap-3 text-[13.5px]"><IconTile icon={Pause} accent="sun" />
            <span><span className="font-semibold">Uploads are paused.</span> <span className="text-ink2">The bot publishes nothing until you resume. Mark manual uploads from each video&apos;s page.</span></span></p>
          <Button tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ uploadsPaused: false }, "Uploads resumed")}>Resume uploads</Button>
        </div>
      )}

      {/* the numbers */}
      <div data-testid="overview-stats" className="grid grid-cols-2 gap-4 lg:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        <Stat label="Views" icon={Eye} accent="sky" href="/analytics" value={<Num value={data.allTime.views} fmt={fmtCompact} />}
          delta={<Delta value={views.delta} />} sub={`+${fmtNum(data.last7.views)} in 7 days${data.allTime.liveAt ? ` · live, ${fmtRelative(data.allTime.liveAt)}` : ""}`} chart={<Sparkline values={views.spark} color="var(--c1)" />} />
        <Stat label="New subs" icon={UserPlus} accent="mint" href="/analytics" value={<Num value={data.last7.subsGained} fmt={(n) => `+${fmtNum(n)}`} />}
          delta={<Delta value={subs.delta} />} sub={<>Last 7 days · {statsLine}</>} chart={<Sparkline values={subs.spark} color="var(--good)" />} />
        <Stat label="Likes" icon={Heart} accent="pink" href="/analytics" value={<Num value={data.allTime.likes} fmt={fmtCompact} />}
          delta={<Delta value={likes.delta} />}
          sub={`${fmtNum(data.allTime.comments)} comments · ${fmtLoved(data.allTime)}`}
          chart={<Sparkline values={likes.spark} color="var(--likes)" />} />
        <Stat label="Backlog" icon={Layers} accent="grape" href="/queue" value={<><Num value={data.backlog} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-lg font-medium text-muted">/ {data.backlogCap}</span></>}
          sub={`≈ ${Math.floor(data.backlog / (settings.data?.uploadTimes.length ?? 1))} days of uploads`} chart={<Meter value={data.backlog} max={data.backlogCap} label="Backlog" tone="series" />} />
        <Stat label="Made today" icon={Clapperboard} accent="sun" href="/videos" value={<><Num value={today.shipped} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-lg font-medium text-muted">/ {DAILY_TARGET}</span></>}
          sub={today.failed ? `${today.failed} failed attempt${today.failed === 1 ? "" : "s"}` : "Shorts · daily target"}
          chart={<Meter value={today.shipped} max={DAILY_TARGET} label="Shorts made today" tone={today.shipped >= DAILY_TARGET ? "good" : "warning"} />} />
      </div>

      {/* the next upload, and the generation switch */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Card title="Next upload" icon={Rocket} accent="lime" className="hero-glow lg:col-span-8" action={<More href="/queue">Queue</More>}>
          {data.nextUpload ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <span className="text-[12.5px] font-medium text-ink2">{data.uploadsPaused ? "On hold while uploads are paused" : "Goes live in"}</span>
                <div className="mt-2.5">{data.uploadsPaused ? <span className="text-3xl font-semibold tracking-tight text-muted">Paused</span> : <Countdown iso={data.nextUpload.publishAt} />}</div>
                <VideoLink id={data.nextUpload.videoId} className="mt-5 block text-[17px] font-semibold leading-snug tracking-[-0.01em]">{data.nextUpload.title}</VideoLink>
                <div className="mt-1 text-[13px] text-muted">{fmtDateTime(data.nextUpload.publishAt)} IST · {fmtRelative(data.nextUpload.publishAt)}</div>
              </div>
              <Thumb src={data.nextUpload.thumbnailUrl} alt="" className="w-[112px] self-center rounded-xl shadow-lift md:w-[124px]" />
            </div>
          ) : <Empty icon={Rocket} title="Nothing scheduled">{data.backlog ? "The next publish run picks the top of the queue." : "The queue is empty."}</Empty>}
        </Card>

        <Card title="Generation" icon={Bot} accent="grape" className="lg:col-span-4"
          action={g.mode === "paused"
            ? <Button size="sm" tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ generationPaused: false }, "Generation resumed")}>Resume</Button>
            : <Button size="sm" icon={Pause} disabled={patch.isPending} onClick={() => set({ generationPaused: true }, "Generation paused")}>Pause</Button>}>
          <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink2">{g.reason}</p>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ring bg-line text-[13px]">
            <div className="bg-surface p-3"><dt className="text-[11.5px] text-muted">Template runs today</dt><dd className="mt-1 font-semibold tabular-nums">{g.templateRunsToday} / {g.maxTemplateRunsPerDay}</dd></div>
            <div className="bg-surface p-3"><dt className="text-[11.5px] text-muted">Templates</dt><dd className="mt-1 font-semibold tabular-nums">{g.templates} / {g.maxTemplates}</dd></div>
            <div className="col-span-2 bg-surface p-3"><dt className="text-[11.5px] text-muted">Last run</dt><dd className="mt-1 font-medium">{g.lastRunAt ? `${fmtDateTime(g.lastRunAt)} · ${fmtRelative(g.lastRunAt)}` : "—"}</dd></div>
          </dl>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Card title="Daily output" description={`Shorts shipped per day, last 14 days · target ${DAILY_TARGET}`} className="lg:col-span-8"
          action={<span className="text-right"><span data-testid="output-total" className="block text-[15px] font-semibold tabular-nums">{shipped14} Shorts</span><span className="text-xs text-muted">target met {metDays}/14 days</span></span>}>
          {runs.isLoading ? <div className="skeleton h-10" /> : (
            <Tracker height={40} items={days.map((d) => ({
              key: d.day, tone: d.tone,
              tip: `${fmtDayKey(d.day)}${d.isToday ? " (today)" : ""}: ${d.shipped} shipped${d.failed ? `, ${d.failed} failed` : ""}`,
            }))} />
          )}
          <div className="mt-2 flex justify-between text-[11.5px] text-muted"><span>{fmtDayKey(days[0].day)}</span><span>Today</span></div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-ink2">
            {([["bg-good", "Target met"], ["bg-warning", "Below target"], ["bg-critical", "Only failures"], ["bg-surface-3", "No runs"]] as const).map(([cls, l]) => (
              <span key={l} className="flex items-center gap-1.5"><span aria-hidden className={`size-2.5 rounded-[3px] ${cls}`} />{l}</span>
            ))}
          </div>
        </Card>

        <Card title="Pipeline" description="Every video by where it is now" className="lg:col-span-4">
          <CategoryBar parts={[
            { key: "progress", label: "In progress", value: inProgress, className: "bg-muted" },
            { key: "queued", label: "Queued", value: c.queued ?? 0, className: "bg-violet", href: "/videos?status=queued" },
            { key: "scheduled", label: "Scheduled", value: c.scheduled ?? 0, className: "bg-series", href: "/videos?status=scheduled" },
            { key: "published", label: "Published", value: c.published ?? 0, className: "bg-good", href: "/videos?status=published" },
            { key: "failed", label: "Failed", value: c.failed ?? 0, className: "bg-critical", href: "/videos?status=failed" },
          ]} />
        </Card>
      </div>

      {/* last night's agents */}
      <Card title="Agents last night" icon={Sparkles} accent="lime" className="mt-5" description={lastDay ? "What each agent did on its latest run" : "The self-improving agents report here after their first night."}
        action={<More href="/agents">All agents</More>}>
        {byAgent.size > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {AGENTS.map((k) => {
              const a = byAgent.get(k);
              return (
                <li key={k} data-testid={`last-night-${k}`} className={`flex flex-col rounded-xl border p-3.5 ${a ? "border-ring bg-surface-2" : "border-dashed border-ring"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[13.5px] font-medium">
                      <IconTile icon={Bot} accent={a ? AGENT_ACCENT[k] ?? "lime" : "surface"} size="sm" />
                      {k[0].toUpperCase() + k.slice(1)}
                    </span>
                    {a ? <Badge tone={decidedTone[a.decision]}>{decided[a.decision]}</Badge> : <span className="text-xs text-muted">no report</span>}
                  </div>
                  {a && <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-ink2">{a.summary}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* latest published, and failures */}
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <Card title="Latest published" icon={Upload} accent="sky" className="xl:col-span-8" action={<More href="/videos?status=published">All published</More>}>
          {data.recent.length === 0 ? <Empty icon={Upload} title="Nothing published yet">Published videos and their views show up here.</Empty> : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.recent.slice(0, 4).map((v) => (
                <li key={v.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-ring bg-surface-2 transition-shadow hover:shadow-lift">
                  <div className="relative">
                    <img src={v.thumbnailUrl} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#0a0d13]/75 px-2 py-0.5 text-[11.5px] font-medium text-white backdrop-blur">
                      <Eye aria-hidden className="size-3" />{fmtCompact(v.totals?.views ?? 0)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <VideoLink id={v.id} className="line-clamp-2 text-[13px] font-medium leading-snug after:absolute after:inset-0">{v.title}</VideoLink>
                    <span className="mt-1 text-[11.5px] text-muted">{v.upload ? fmtRelative(v.upload.publishAt) : ""}</span>
                  </div>
                  <ArrowUpRight aria-hidden className="absolute right-2 top-2 size-4 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent failures" icon={CircleX} accent="red" flush className="xl:col-span-4" action={<More href="/videos?status=failed">All failed</More>}>
          {data.recentFailures.length === 0 ? <Empty icon={CircleX} title="No failures">Every recent run shipped its video.</Empty> : (
            <ul>
              {data.recentFailures.map((f, i) => (
                <li key={f.videoId + i} className="flex gap-3 border-b border-line px-5 py-3.5 last:border-0">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-critical" />
                  <div className="min-w-0 text-[13px]">
                    <VideoLink id={f.videoId} className="font-medium">{f.title}</VideoLink>
                    <p className="mt-0.5 line-clamp-2 leading-relaxed text-ink2">{f.reason}</p>
                    <p className="mt-1 text-xs text-muted">{fmtRelative(f.at)}</p>
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
