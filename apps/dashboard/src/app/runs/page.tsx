"use client";

import { Card, ErrorNote, Loading, PageHeader, ResultBadge, Tile, VideoLink } from "@/components/ui";
import { fmtDateTime, fmtDuration, titleCase } from "@/lib/format";
import { useRuns } from "@/lib/queries";

export default function RunsPage() {
  const { data, error, isLoading } = useRuns();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const failed = data.filter((r) => r.status === "failed").length;
  const avg = data.length ? data.reduce((a, r) => a + r.durationSec, 0) / data.length : 0;

  return (
    <>
      <PageHeader title="Runs" sub={`Latest ${data.length} routine runs`} />
      <div className="mb-4 grid grid-cols-3 gap-3 md:gap-4">
        <Tile label="Runs" value={String(data.length)} />
        <Tile label="Failed" value={String(failed)} sub={data.length ? `${Math.round((failed / data.length) * 100)}% of runs` : undefined} />
        <Tile label="Avg duration" value={fmtDuration(avg)} />
      </div>

      <Card className="!p-0">
        <ul>
          {data.map((r) => (
            <li key={r.id} className="border-b border-line last:border-0">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3 hover:bg-wash">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {fmtDateTime(r.startedAt)} · {r.kind === "video" ? "Video" : "Template work"} · {fmtDuration(r.durationSec)}
                    </div>
                    {r.error && <div className="mt-1 text-xs text-ink2">{r.error}</div>}
                  </div>
                  <ResultBadge ok={r.status === "ok"} okLabel="OK" />
                </summary>
                <div className="px-3 pb-3">
                  <ol className="rounded-xl bg-wash px-3">
                    {r.steps.map((s) => (
                      <li key={s.agent} className="flex items-center gap-3 border-b border-line py-1.5 text-sm last:border-0">
                        <span aria-hidden className={`w-4 text-center font-bold ${s.status === "ok" ? "text-good" : s.status === "failed" ? "text-critical" : "text-muted"}`}>{s.status === "ok" ? "✓" : s.status === "failed" ? "✕" : "–"}</span>
                        <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="text-ink2"> · {s.note}</span>}</span>
                        <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-ink2">
                    {r.videoId && <VideoLink id={r.videoId} className="underline">Open video</VideoLink>}
                    {r.sessionUrl ? <a className="underline" href={r.sessionUrl} target="_blank" rel="noreferrer">Open Claude session</a> : <span className="text-muted">No Claude session link (sample data)</span>}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
