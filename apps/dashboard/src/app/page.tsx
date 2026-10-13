"use client";

import { ArrowRight, Bot, CircleX, Eye, Layers, Pause, Play, Rocket, Upload, UserPlus, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge, Button, Card, Empty, ErrorNote, Loading, Meter, Num, PageHeader, StatusBadge, Thumb, Tile, type Tone, VideoLink } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDate, fmtDateTime, fmtNum, fmtRelative } from "@/lib/format";
import { useOverview, usePatchSettings } from "@/lib/queries";
import { VIDEO_STATUSES } from "@/lib/schemas";

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
  return <span className="tabular-nums">{s >= 86400 ? `${Math.floor(s / 86400)}d ` : ""}{pad(Math.floor((s % 86400) / 3600))}h {pad(Math.floor((s % 3600) / 60))}m {pad(s % 60)}s</span>;
}

export default function OverviewPage() {
  const { data, error, isLoading } = useOverview();
  const patch = usePatchSettings();
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const g = data.generation;
  const set = (p: { uploadsPaused?: boolean; generationPaused?: boolean }, done: string) =>
    patch.mutate(p, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });

  return (
    <>
      <PageHeader title="Overview" sub={fmtDate(new Date().toISOString())} />

      {data.uploadsPaused && (
        <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ring bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-sm"><Pause aria-hidden className="size-4 text-warning-text" /><span><strong>Uploads are paused.</strong> Nothing will be published until you resume.</span></p>
          <Button tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ uploadsPaused: false }, "Uploads resumed")}>Resume uploads</Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2">
          <div aria-hidden className="brand-gradient pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-15 blur-3xl" />
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Rocket aria-hidden className="size-4 text-brand-text" />Next upload</h2>
            <Link href="/queue" className="flex items-center gap-1 text-xs font-medium text-brand-text hover:underline">Open queue <ArrowRight aria-hidden className="size-3.5" /></Link>
          </div>
          {data.nextUpload ? (
            <div className="flex gap-4">
              <Thumb src={data.nextUpload.thumbnailUrl} alt="" className="w-24 shadow-card md:w-28" />
              <div className="min-w-0">
                <VideoLink id={data.nextUpload.videoId} className="line-clamp-2 text-base font-medium">{data.nextUpload.title}</VideoLink>
                <div className="brand-text-gradient mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {data.uploadsPaused ? "Paused" : <Countdown iso={data.nextUpload.publishAt} />}
                </div>
                <div className="mt-1 text-sm text-ink2">{fmtDateTime(data.nextUpload.publishAt)} IST · {fmtRelative(data.nextUpload.publishAt)}</div>
              </div>
            </div>
          ) : <Empty>Nothing scheduled.</Empty>}
        </Card>

        <Card title="Backlog" icon={Layers}>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight"><Num value={data.backlog} fmt={(n) => String(Math.round(n))} /></span>
            <span className="text-sm text-ink2">of {data.backlogCap} ready</span>
          </div>
          <div className="mt-3"><Meter value={data.backlog} max={data.backlogCap} label="Backlog" /></div>
          <p className="mt-2 text-xs text-muted">About {data.backlog} days of uploads at one a day.</p>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Bot aria-hidden className="size-4 text-brand-text" />Generation
              <Badge tone={MODES[g.mode].tone}>
                <span aria-hidden className={`size-1.5 rounded-full bg-current ${g.mode === "video" ? "animate-pulse-dot" : ""}`} />
                {MODES[g.mode].label}
              </Badge>
            </h2>
            <p className="mt-1.5 text-sm text-ink2">{g.reason}</p>
            <p className="mt-1 text-xs text-muted">
              Template work today: {g.templateRunsToday} of {g.maxTemplateRunsPerDay} · Templates: {g.templates} of {g.maxTemplates}
              {g.lastRunAt ? ` · Last run ${fmtRelative(g.lastRunAt)}` : ""}
            </p>
          </div>
          {g.mode === "paused"
            ? <Button tone="primary" icon={Play} disabled={patch.isPending} onClick={() => set({ generationPaused: false }, "Generation resumed")}>Resume generation</Button>
            : <Button icon={Pause} disabled={patch.isPending} onClick={() => set({ generationPaused: true }, "Generation paused")}>Pause generation</Button>}
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
        <Tile label="Views, last 7 days" icon={Eye} tone="info" value={<Num value={data.last7.views} fmt={fmtCompact} />} sub={`${fmtNum(data.last7.views)} total`} />
        <Tile label="Subscribers gained" icon={UserPlus} tone="good" value={<Num value={data.last7.subsGained} fmt={(n) => `+${fmtNum(n)}`} />} sub="last 7 days" />
        <Tile label="Uploads" icon={Upload} tone="brand" value={<Num value={data.last7.uploads} fmt={(n) => String(Math.round(n))} />} sub="last 7 days" />
      </div>

      <Card title="Pipeline" icon={Workflow} className="mt-4">
        <div className="flex flex-wrap gap-2">
          {VIDEO_STATUSES.filter((s) => data.counts[s]).map((s) => (
            <Link key={s} href={`/videos?status=${s}`} className="flex items-center gap-2.5 rounded-xl border border-ring px-3 py-2 transition-all hover:-translate-y-0.5 hover:bg-wash hover:shadow-card">
              <StatusBadge status={s} />
              <span className="text-lg font-semibold tabular-nums">{data.counts[s]}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Recent failures" icon={CircleX}>
          {data.recentFailures.length === 0 ? <Empty>No failures.</Empty> : (
            <ul className="flex flex-col gap-3">
              {data.recentFailures.map((f) => (
                <li key={f.videoId} className="rounded-xl bg-critical-soft p-3 text-sm">
                  <VideoLink id={f.videoId} className="font-medium">{f.title}</VideoLink>
                  <p className="mt-0.5 text-ink2">{f.reason}</p>
                  <p className="mt-1 text-xs text-muted">{fmtDateTime(f.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Latest published" icon={Upload} action={<Link href="/analytics" className="flex items-center gap-1 text-xs font-medium text-brand-text hover:underline">Analytics <ArrowRight aria-hidden className="size-3.5" /></Link>}>
          <ul className="flex flex-col">
            {data.recent.map((v) => (
              <li key={v.id} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-wash">
                <Thumb src={v.thumbnailUrl} alt="" className="w-9" />
                <div className="min-w-0 flex-1">
                  <VideoLink id={v.id} className="block truncate font-medium">{v.title}</VideoLink>
                  <span className="text-xs text-muted">{v.upload ? fmtDate(v.upload.publishAt) : ""}</span>
                </div>
                <span className="shrink-0 text-right"><span className="font-semibold tabular-nums">{fmtCompact(v.totals?.views ?? 0)}</span><span className="block text-xs text-muted">views</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
