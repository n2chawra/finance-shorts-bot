"use client";

import { AlertOctagon, ArrowRight, ArrowUpRight, Bot, CircleX, Clapperboard, Eye, Heart, Layers, Pause, Play, Rocket, Sparkles, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryBar, Sparkline, Tracker, type TrackerTone } from "@/components/charts";
import { type Accent, ACCENT, Badge, Button, Card, Delta, Empty, ErrorNote, Loading, Meter, Num, PageHeader, Stagger, Stat, Thumb, type Tone, VideoLink } from "@/components/ui";
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

/** Each agent's colour on the "last night" board. */
const AGENT_FILL: Record<string, Accent> = {
  auditor: "sky", research: "grape", improver: "lime", dashboard: "pink", scout: "sun", studio: "tang", monthly: "mint", reviewer: "sky",
};

/** "02:14:09" until `iso`, ticking every second, each pair in its own block. */
function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = Math.max(0, Math.floor((Date.parse(iso) - now) / 1000));
  if (s === 0) return <span className="font-display text-5xl uppercase">Due now</span>;
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts: [string, string][] = [
    ...(s >= 86400 ? [[String(Math.floor(s / 86400)), "days"] as [string, string]] : []),
    [pad(Math.floor((s % 86400) / 3600)), "hrs"], [pad(Math.floor((s % 3600) / 60)), "min"], [pad(s % 60), "sec"],
  ];
  return (
    <span className="flex items-end gap-2 md:gap-3">
      {parts.map(([v, unit], i) => (
        <span key={unit} className="flex items-end gap-2 md:gap-3">
          {i > 0 && <span aria-hidden className="pb-6 font-display text-3xl text-[#0b0b0b]/40 md:pb-8 md:text-5xl">:</span>}
          <span className="flex flex-col items-center">
            <span className="block min-w-[2ch] border-2 border-[#0b0b0b] bg-[#0b0b0b] px-2 py-1 text-center font-mono text-[40px] font-extrabold leading-none tabular-nums text-lime md:px-3 md:text-[68px]">{v}</span>
            <span className="nb-label mt-1.5 !text-[10px]">{unit}</span>
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
  <Link href={href} className="nb-sm nb-press flex h-8 items-center gap-1 bg-surface px-2.5 text-[11.5px] font-bold uppercase tracking-wide text-ink">{children}<ArrowRight aria-hidden strokeWidth={3} className="size-3.5" /></Link>
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

  return (
    <Stagger>
      <PageHeader title="Overview" sub={<>{greeting()}. {new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }).format(new Date())}. Here&apos;s the channel today.</>}>
        <Badge tone={data.uploadsPaused ? "warning" : "good"} dot>{data.uploadsPaused ? "Uploads paused" : "Uploads on"}</Badge>
        <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
      </PageHeader>

      {critical.length > 0 && (
        <Link href="/notifications" className="nb nb-press on-accent mb-5 flex flex-wrap items-center justify-between gap-3 bg-red px-4 py-3.5">
          <span className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center border-2 border-edge bg-surface text-ink"><AlertOctagon aria-hidden strokeWidth={2.5} className="size-5" /></span>
            <span><strong className="font-display text-[17px] uppercase">{critical.length === 1 ? critical[0].title : `${critical.length} problems need you`}</strong>
              <span className="block text-[13px] font-semibold">The automation can&apos;t fix this by itself.</span></span>
          </span>
          <span className="flex shrink-0 items-center gap-1 border-2 border-edge bg-surface px-3 py-1.5 text-[12px] font-bold uppercase text-ink">How to fix <ArrowRight aria-hidden strokeWidth={3} className="size-3.5" /></span>
        </Link>
      )}

      {data.uploadsPaused && (
        <div role="status" className="nb on-accent mb-5 flex flex-wrap items-center justify-between gap-3 bg-sun px-4 py-3.5">
          <p className="flex items-center gap-3 text-[14px] font-semibold"><Pause aria-hidden strokeWidth={2.5} className="size-5 shrink-0" />
            <span><strong className="font-display uppercase">Uploads are paused.</strong> The bot publishes nothing until you resume. Mark manual uploads from each video&apos;s page.</span></p>
          <Button tone="default" icon={Play} disabled={patch.isPending} onClick={() => set({ uploadsPaused: false }, "Uploads resumed")}>Resume uploads</Button>
        </div>
      )}

      {/* hero: the next upload, and the generation switch */}
      <div className="grid gap-5 lg:grid-cols-12">
        <section className="nb on-accent relative overflow-hidden bg-lime lg:col-span-8">
          <div className="flex items-center justify-between border-b-2 border-edge px-4 py-2.5 md:px-6">
            <h2 className="flex items-center gap-2 font-display text-[15px] uppercase"><Rocket aria-hidden strokeWidth={2.5} className="size-4" />Next upload</h2>
            <More href="/queue">Queue</More>
          </div>
          {data.nextUpload ? (
            <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center md:p-6">
              <div className="flex-1">
                <span className="nb-label">{data.uploadsPaused ? "On hold" : "Going live in"}</span>
                <div className="mt-3">{data.uploadsPaused ? <span className="font-display text-5xl uppercase">Paused</span> : <Countdown iso={data.nextUpload.publishAt} />}</div>
                <VideoLink id={data.nextUpload.videoId} className="mt-5 block font-display text-[20px] uppercase leading-tight md:text-[24px]">{data.nextUpload.title}</VideoLink>
                <div className="mt-2 font-mono text-[12px] font-bold uppercase tracking-wide">{fmtDateTime(data.nextUpload.publishAt)} IST · {fmtRelative(data.nextUpload.publishAt)}</div>
              </div>
              <Thumb src={data.nextUpload.thumbnailUrl} alt="" className="w-[120px] rotate-3 self-center sm:w-[136px] md:w-[150px]" />
            </div>
          ) : <div className="p-4"><Empty icon={Rocket} title="Nothing scheduled">{data.backlog ? "The next publish run picks the top of the queue." : "The queue is empty."}</Empty></div>}
        </section>

        <Card title="Generation" icon={Bot} accent="pink" className="lg:col-span-4"
          action={g.mode === "paused"
            ? <Button size="sm" tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ generationPaused: false }, "Generation resumed")}>Resume</Button>
            : <Button size="sm" icon={Pause} disabled={patch.isPending} onClick={() => set({ generationPaused: true }, "Generation paused")}>Pause</Button>}>
          <Badge tone={MODES[g.mode].tone} dot>{MODES[g.mode].label}</Badge>
          <p className="mt-3 text-[14px] font-medium leading-snug text-ink2">{g.reason}</p>
          <dl className="mt-4 grid grid-cols-2 border-2 border-edge text-[13px]">
            <div className="border-b-2 border-r-2 border-edge p-2.5"><dt className="nb-label !text-[10px] text-muted">Template runs</dt><dd className="mt-1 font-display text-xl tabular-nums">{g.templateRunsToday}/{g.maxTemplateRunsPerDay}</dd></div>
            <div className="border-b-2 border-edge p-2.5"><dt className="nb-label !text-[10px] text-muted">Templates</dt><dd className="mt-1 font-display text-xl tabular-nums">{g.templates}/{g.maxTemplates}</dd></div>
            <div className="col-span-2 p-2.5"><dt className="nb-label !text-[10px] text-muted">Last run</dt><dd className="mt-1 font-semibold">{g.lastRunAt ? `${fmtDateTime(g.lastRunAt)} · ${fmtRelative(g.lastRunAt)}` : "—"}</dd></div>
          </dl>
        </Card>
      </div>

      {/* the numbers */}
      <div data-testid="overview-stats" className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        <Stat label="Views" icon={Eye} href="/analytics" accent="sky" value={<Num value={data.allTime.views} fmt={fmtCompact} />}
          delta={<Delta value={views.delta} />} sub={`+${fmtNum(data.last7.views)} in 7 days${data.allTime.liveAt ? ` · live, ${fmtRelative(data.allTime.liveAt)}` : ""}`} chart={<Sparkline values={views.spark} color="#0b0b0b" />} />
        <Stat label="Subs · 7 days" icon={UserPlus} href="/analytics" accent="mint" value={<Num value={data.last7.subsGained} fmt={(n) => `+${fmtNum(n)}`} />}
          delta={<Delta value={subs.delta} />} sub={statsLine} chart={<Sparkline values={subs.spark} color="#0b0b0b" />} />
        <Stat label="Likes" icon={Heart} href="/analytics" accent="pink" value={<Num value={data.allTime.likes} fmt={fmtCompact} />}
          delta={<Delta value={likes.delta} />}
          sub={`${fmtNum(data.allTime.comments)} comments · ${fmtLoved(data.allTime)}`}
          chart={<Sparkline values={likes.spark} color="#0b0b0b" />} />
        <Stat label="Backlog" icon={Layers} href="/queue" value={<><Num value={data.backlog} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-xl text-muted">/{data.backlogCap}</span></>}
          sub={`≈ ${Math.floor(data.backlog / (settings.data?.uploadTimes.length ?? 1))} days of uploads`} chart={<Meter value={data.backlog} max={data.backlogCap} label="Backlog" />} />
        <Stat label="Made today" icon={Clapperboard} href="/runs" value={<><Num value={today.shipped} fmt={(n) => String(Math.round(n))} /><span className="ml-1 text-xl text-muted">/{DAILY_TARGET}</span></>}
          sub={today.failed ? `${today.failed} failed attempt${today.failed === 1 ? "" : "s"}` : "Shorts · daily target"}
          chart={<Meter value={today.shipped} max={DAILY_TARGET} label="Shorts made today" tone={today.shipped >= DAILY_TARGET ? "good" : "brand"} />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Card title="Daily output" description={`Shorts shipped per day, last 14 days · target ${DAILY_TARGET}`} className="lg:col-span-8"
          action={<span className="border-2 border-edge bg-surface px-2.5 py-1 text-right"><span data-testid="output-total" className="block font-display text-[15px] tabular-nums">{shipped14} Shorts</span><span className="nb-label !text-[9.5px] text-muted">target met {metDays}/14 days</span></span>}>
          {runs.isLoading ? <div className="skeleton h-12" /> : (
            <Tracker height={48} items={days.map((d) => ({
              key: d.day, tone: d.tone,
              tip: `${fmtDayKey(d.day)}${d.isToday ? " (today)" : ""}: ${d.shipped} shipped${d.failed ? `, ${d.failed} failed` : ""}`,
            }))} />
          )}
          <div className="mt-2 flex justify-between font-mono text-[11px] font-bold uppercase text-muted"><span>{fmtDayKey(days[0].day)}</span><span>Today</span></div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] font-semibold text-ink2">
            {([["bg-mint", "Target met"], ["bg-sun", "Below target"], ["bg-red", "Only failures"], ["bg-surface nb-stripes", "No runs"]] as const).map(([cls, l]) => (
              <span key={l} className="flex items-center gap-1.5"><span aria-hidden className={`size-3 border-2 border-edge ${cls}`} />{l}</span>
            ))}
          </div>
        </Card>

        <Card title="Pipeline" description="Every video by where it is now" accent="sun" className="lg:col-span-4">
          <CategoryBar parts={[
            { key: "progress", label: "In progress", value: inProgress, className: "bg-surface-2" },
            { key: "queued", label: "Queued", value: c.queued ?? 0, className: "bg-grape", href: "/videos?status=queued" },
            { key: "scheduled", label: "Scheduled", value: c.scheduled ?? 0, className: "bg-sky", href: "/videos?status=scheduled" },
            { key: "published", label: "Published", value: c.published ?? 0, className: "bg-mint", href: "/videos?status=published" },
            { key: "failed", label: "Failed", value: c.failed ?? 0, className: "bg-red", href: "/videos?status=failed" },
          ]} />
        </Card>
      </div>

      {/* last night's agents, as a board of tiles */}
      <Card title="Agents last night" icon={Sparkles} className="mt-5" description={lastDay ? undefined : "The self-improving agents report here after their first night."}
        action={<More href="/agents">Details</More>}>
        {byAgent.size > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AGENTS.map((k) => {
              const a = byAgent.get(k);
              return (
                <li key={k} data-testid={`last-night-${k}`} className={`flex flex-col border-2 border-edge ${a ? "shadow-[3px_3px_0_0_var(--hard)]" : "border-dashed nb-stripes"}`}>
                  <div className={`flex items-center justify-between gap-2 border-b-2 border-edge px-3 py-2 ${a ? ACCENT[AGENT_FILL[k] ?? "lime"] : "border-dashed"}`}>
                    <span className="font-display text-[14px] uppercase">{k[0].toUpperCase() + k.slice(1)}</span>
                    <span className={`nb-label !text-[9.5px] ${a?.decision === "blocked" ? "border-2 border-edge bg-red px-1" : ""}`}>{a ? decided[a.decision] : "no report"}</span>
                  </div>
                  {a && <p className="line-clamp-4 bg-surface p-3 text-[13px] font-medium leading-snug text-ink2">{a.summary}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* latest published as a film strip, failures as a log */}
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <Card title="Latest published" icon={Upload} className="xl:col-span-8" action={<More href="/analytics">Analytics</More>}>
          {data.recent.length === 0 ? <Empty icon={Upload} title="Nothing published yet">Published videos and their views show up here.</Empty> : (
            <ul className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
              {data.recent.map((v, i) => (
                <li key={v.id} className="nb flex w-[180px] shrink-0 flex-col bg-surface">
                  <div className="relative border-b-2 border-edge bg-surface-2 p-3">
                    <Thumb src={v.thumbnailUrl} alt="" className="mx-auto w-[96px]" />
                    <span className="nb-label absolute left-0 top-0 border-b-2 border-r-2 border-edge bg-ink px-1.5 py-0.5 text-plane">#{i + 1}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <VideoLink id={v.id} className="line-clamp-2 text-[13px] font-bold leading-snug">{v.title}</VideoLink>
                    <span className="mt-1 font-mono text-[10.5px] font-bold uppercase text-muted">{v.upload ? fmtRelative(v.upload.publishAt) : ""}</span>
                    <span className="mt-auto flex items-baseline gap-1 pt-3"><span className="font-display text-2xl tabular-nums">{fmtCompact(v.totals?.views ?? 0)}</span><span className="nb-label !text-[9.5px] text-muted">views</span></span>
                  </div>
                </li>
              ))}
              <li className="flex shrink-0">
                <Link href="/videos?status=published" className="nb nb-press grid w-[120px] place-items-center bg-sun p-3 text-center on-accent">
                  <span><ArrowUpRight aria-hidden strokeWidth={3} className="mx-auto size-7" /><span className="mt-2 block font-display text-sm uppercase">All published</span></span>
                </Link>
              </li>
            </ul>
          )}
        </Card>

        <Card title="Recent failures" icon={CircleX} accent={data.recentFailures.length ? "red" : undefined} flush className="xl:col-span-4" action={<More href="/runs">Runs</More>}>
          {data.recentFailures.length === 0 ? <div className="p-4"><Empty icon={CircleX} title="No failures">Every recent run shipped its video.</Empty></div> : (
            <ol>
              {data.recentFailures.map((f, i) => (
                <li key={f.videoId + i} className="flex gap-3 border-b-2 border-edge px-4 py-3 last:border-0">
                  <span aria-hidden className="grid size-7 shrink-0 place-items-center border-2 border-edge bg-red font-mono text-[12px] font-bold text-on-accent">{i + 1}</span>
                  <div className="min-w-0 text-[13px]">
                    <VideoLink id={f.videoId} className="font-bold">{f.title}</VideoLink>
                    <p className="mt-0.5 line-clamp-2 font-medium text-ink2">{f.reason}</p>
                    <p className="mt-1 font-mono text-[10.5px] font-bold uppercase text-muted">{fmtRelative(f.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </Stagger>
  );
}
