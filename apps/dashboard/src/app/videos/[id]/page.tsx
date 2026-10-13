/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { DataTable, LineChart } from "@/components/charts";
import { Button, Card, Empty, ErrorNote, Loading, ResultBadge, StatusBadge, Tile } from "@/components/ui";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtDuration, fmtNum, titleCase } from "@/lib/format";
import { useVideo, useVideoAction } from "@/lib/queries";
import type { VideoAction } from "@/lib/schemas";

const CHECK_NAMES: Record<string, string> = { number_check: "Number check", fact_review: "Fact review", qa_review: "QA review" };

/** Split a script into its numeric/setup inputs and its on-screen text lines. */
function scriptParts(script: unknown): { inputs: [string, string][]; lines: [string, string][] } {
  if (!script || typeof script !== "object") return { inputs: [], lines: [] };
  const { text, template: _t, ...rest } = script as Record<string, unknown>;
  void _t;
  const show = (v: unknown) => (typeof v === "object" ? JSON.stringify(v) : String(v));
  return {
    inputs: Object.entries(rest).map(([k, v]) => [titleCase(k), show(v)]),
    lines: text && typeof text === "object" ? Object.entries(text as Record<string, unknown>).map(([k, v]) => [k, String(v)]) : [],
  };
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: v, error, isLoading } = useVideo(id);
  const act = useVideoAction();
  if (isLoading) return <Loading />;
  if (error || !v) return <ErrorNote error={error} />;

  const run = (action: VideoAction) => {
    if (action === "delete" && !window.confirm(`Delete "${v.title}"? This cannot be undone.`)) return;
    act.mutate({ id: v.id, action }, { onSuccess: () => { if (action === "delete") router.push("/videos"); } });
  };
  const { inputs, lines } = scriptParts(v.script);
  const total = v.steps.reduce((a, s) => a + s.durationSec, 0);

  return (
    <>
      <Link href="/videos" className="text-sm text-ink2 hover:underline">← Videos</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{v.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <StatusBadge status={v.status} />
            <span>{v.id}</span><span>· {titleCase(v.templateId)}</span><span>· {titleCase(v.topic.category)}</span><span>· {v.durationSec}s</span>
          </div>
        </div>
        {(v.status === "queued" || v.status === "failed") && (
          <div className="flex flex-wrap gap-2">
            {v.status === "queued" && <Button tone="primary" disabled={act.isPending} onClick={() => run("upload-now")}>Upload now</Button>}
            {v.status === "queued" && <Button disabled={act.isPending} onClick={() => run("skip")}>Move to end</Button>}
            <Button tone="danger" disabled={act.isPending} onClick={() => run("delete")}>Delete</Button>
          </div>
        )}
      </div>
      {act.error && <div className="mb-4"><ErrorNote error={act.error} /></div>}
      {v.failReason && <p role="alert" className="mb-4 rounded-2xl border border-ring bg-surface p-4 text-sm"><span aria-hidden className="font-bold text-critical">✕ </span><strong>Failed.</strong> {v.failReason}</p>}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-4">
          <video controls preload="none" poster={v.thumbnailUrl} src={v.fileUrl} className="aspect-[9/16] w-full max-w-[260px] rounded-2xl border border-ring bg-black" />
          <Card title="Publishing">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink2">Created</dt><dd>{fmtDateTime(v.createdAt)}</dd>
              <dt className="text-ink2">{v.status === "published" ? "Published" : "Publish at"}</dt><dd>{v.upload ? fmtDateTime(v.upload.publishAt) : v.queuePosition ? `Queue position ${v.queuePosition}` : "—"}</dd>
              <dt className="text-ink2">Upload</dt><dd>{v.upload ? `${titleCase(v.upload.state)}, ${v.upload.attempts} attempt${v.upload.attempts === 1 ? "" : "s"}` : "—"}</dd>
              <dt className="text-ink2">YouTube</dt><dd>{v.upload?.youtubeId ? <a className="underline" href={`https://youtube.com/shorts/${v.upload.youtubeId}`} target="_blank" rel="noreferrer">Open</a> : <span className="text-muted">No link (sample data)</span>}</dd>
            </dl>
          </Card>
          <Card title="Style">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink2">Palette</dt><dd>{titleCase(v.style.palette)}</dd>
              <dt className="text-ink2">Music</dt><dd>{titleCase(v.style.genre)}, {v.style.key}, {v.style.bpm} BPM</dd>
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {v.totals && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Tile label="Views" value={fmtCompact(v.totals.views)} sub={fmtNum(v.totals.views)} />
                <Tile label="Likes" value={fmtCompact(v.totals.likes)} />
                <Tile label="Subscribers" value={`+${fmtNum(v.totals.subsGained)}`} />
                <Tile label="Avg viewed" value={`${v.totals.avgViewPct}%`} />
              </div>
              <Card title="Views per day">
                <LineChart data={v.stats.map((s) => ({ label: fmtDayKey(s.day), value: s.views }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} height={200} />
                <DataTable head={["Day", "Views"]} rows={v.stats.map((s) => [fmtDayKey(s.day), fmtNum(s.views)])} />
              </Card>
            </>
          )}

          <Card title="Checks">
            <ul className="flex flex-col gap-3">
              {v.qaChecks.map((c) => (
                <li key={c.checker} className="text-sm">
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{CHECK_NAMES[c.checker]}</span><ResultBadge ok={c.passed} /></div>
                  <ul className="mt-1 list-disc pl-5 text-ink2">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Run timeline" action={<span className="text-xs text-muted">{fmtDuration(total)} total</span>}>
            <ol className="flex flex-col">
              {v.steps.map((s) => (
                <li key={s.agent} className="flex items-center gap-3 border-b border-line py-2 text-sm last:border-0">
                  <span aria-hidden className={`w-4 text-center font-bold ${s.status === "ok" ? "text-good" : s.status === "failed" ? "text-critical" : "text-muted"}`}>{s.status === "ok" ? "✓" : s.status === "failed" ? "✕" : "–"}</span>
                  <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="text-ink2"> · {s.note}</span>}</span>
                  <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Key frames">
            <img src={v.previewUrl} alt="Contact sheet of key frames" loading="lazy" className="w-full rounded-lg border border-ring" />
          </Card>

          <Card title="Script">
            {inputs.length === 0 && lines.length === 0 ? <Empty>No script stored.</Empty> : (
              <>
                <h3 className="text-xs font-medium text-ink2">Inputs</h3>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  {inputs.map(([k, val]) => (<div key={k} className="contents"><dt className="text-ink2">{k}</dt><dd className="break-words font-mono text-xs leading-5">{val}</dd></div>))}
                </dl>
                <h3 className="mt-4 text-xs font-medium text-ink2">On-screen text, in order</h3>
                <ol className="mt-1 flex flex-col">
                  {lines.map(([k, line]) => (
                    <li key={k} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line py-1.5 text-sm last:border-0">
                      <span>{line}</span><span className="font-mono text-xs text-muted">{k}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Card>

          <Card title="Title, description, tags">
            <p className="text-sm">{v.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{v.tags.map((t) => <span key={t} className="rounded-full bg-wash px-2 py-0.5 text-xs text-ink2">#{t}</span>)}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
