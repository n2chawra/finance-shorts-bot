"use client";

import Link from "next/link";

import { Button, Card, Empty, ErrorNote, Loading, PageHeader, StatusBadge, Thumb, Tile, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDate, fmtDateTime, fmtNum, fmtRelative } from "@/lib/format";
import { useOverview, usePatchSettings } from "@/lib/queries";
import { VIDEO_STATUSES } from "@/lib/schemas";

export default function OverviewPage() {
  const { data, error, isLoading } = useOverview();
  const patch = usePatchSettings();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const fill = Math.min(100, (data.backlog / data.backlogCap) * 100);

  return (
    <>
      <PageHeader title="Overview" sub={fmtDate(new Date().toISOString())} />

      {data.uploadsPaused && (
        <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ring bg-surface p-4">
          <p className="text-sm"><span aria-hidden className="font-bold text-warning">❚❚ </span><strong>Uploads are paused.</strong> Nothing will be published until you resume.</p>
          <Button tone="primary" disabled={patch.isPending} onClick={() => patch.mutate({ uploadsPaused: false })}>Resume uploads</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Next upload" action={<Link href="/queue" className="text-xs text-ink2 hover:underline">Open queue</Link>}>
          {data.nextUpload ? (
            <div className="flex gap-3">
              <Thumb src={data.nextUpload.thumbnailUrl} alt="" className="w-20" />
              <div className="min-w-0">
                <VideoLink id={data.nextUpload.videoId} className="line-clamp-2 font-medium">{data.nextUpload.title}</VideoLink>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{fmtDateTime(data.nextUpload.publishAt)}</div>
                <div className="text-xs text-muted">{data.uploadsPaused ? "Paused" : fmtRelative(data.nextUpload.publishAt)} · IST</div>
              </div>
            </div>
          ) : <Empty>Nothing scheduled.</Empty>}
        </Card>

        <Card title="Backlog">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">{data.backlog}</span>
            <span className="text-sm text-ink2">of {data.backlogCap} ready videos</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-wash" role="meter" aria-valuemin={0} aria-valuemax={data.backlogCap} aria-valuenow={data.backlog} aria-label="Backlog">
            <div className="h-2 rounded-full bg-series" style={{ width: `${fill}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            About {data.backlog} days of uploads at one a day. {data.backlog >= data.backlogCap ? "Cap reached: routines switch to template work." : "Generation keeps going until the cap."}
          </p>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
        <Tile label="Views, last 7 days" value={fmtCompact(data.last7.views)} sub={`${fmtNum(data.last7.views)} total`} />
        <Tile label="Subscribers gained" value={`+${fmtNum(data.last7.subsGained)}`} sub="last 7 days" />
        <Tile label="Uploads" value={String(data.last7.uploads)} sub="last 7 days" />
      </div>

      <Card title="Pipeline" className="mt-4">
        <div className="flex flex-wrap gap-2">
          {VIDEO_STATUSES.filter((s) => data.counts[s]).map((s) => (
            <Link key={s} href={`/videos?status=${s}`} className="flex items-center gap-2 rounded-xl border border-ring px-3 py-2 hover:bg-wash">
              <StatusBadge status={s} />
              <span className="text-lg font-semibold tabular-nums">{data.counts[s]}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Recent failures">
          {data.recentFailures.length === 0 ? <Empty>No failures.</Empty> : (
            <ul className="flex flex-col gap-3">
              {data.recentFailures.map((f) => (
                <li key={f.videoId} className="text-sm">
                  <VideoLink id={f.videoId} className="font-medium">{f.title}</VideoLink>
                  <p className="mt-0.5 text-ink2">{f.reason}</p>
                  <p className="mt-0.5 text-xs text-muted">{fmtDateTime(f.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Latest published" action={<Link href="/analytics" className="text-xs text-ink2 hover:underline">Analytics</Link>}>
          <ul className="flex flex-col gap-3">
            {data.recent.map((v) => (
              <li key={v.id} className="flex items-center gap-3 text-sm">
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
