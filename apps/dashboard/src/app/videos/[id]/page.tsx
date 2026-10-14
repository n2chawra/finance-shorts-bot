/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft, ChevronsDown, CircleCheck, CircleX, Download, Eye, FileText, Heart, Images, ListChecks, Minus, Palette, Percent, Send, Trash2, TrendingUp, Upload, UserPlus, Workflow } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { DataTable, LineChart } from "@/components/charts";
import { Button, Card, ConfirmButton, buttonClass, Empty, ErrorNote, Loading, Num, ResultBadge, StatusBadge, Tile } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtDuration, fmtNum, titleCase } from "@/lib/format";
import { useVideo, useVideoAction } from "@/lib/queries";
import type { VideoAction } from "@/lib/schemas";

import { MarkUploaded, YouTubeDetails } from "./publish-tools";

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
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !v) return <ErrorNote error={error} />;

  const run = (action: VideoAction) => {
    act.mutate({ id: v.id, action }, {
      onSuccess: () => { toast(action === "delete" ? "Video deleted" : action === "skip" ? "Moved to the end of the queue" : "Marked for upload"); if (action === "delete") router.push("/videos"); },
      onError: (e) => toast(e.message, "error"),
    });
  };
  const { inputs, lines } = scriptParts(v.script);
  const total = v.steps.reduce((a, s) => a + s.durationSec, 0);

  return (
    <>
      <Link href="/videos" className="inline-flex items-center gap-1 text-sm text-ink2 transition-colors hover:text-brand-text"><ArrowLeft aria-hidden className="size-4" />Videos</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{v.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <StatusBadge status={v.status} />
            <span>{v.id}</span><span>· {titleCase(v.templateId)}</span><span>· {titleCase(v.topic.category)}</span><span>· {v.durationSec}s</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {v.status !== "failed" && v.fileUrl && (
            <a href={v.fileUrl} download={`${v.id}.mp4`} className={buttonClass("default")}><Download aria-hidden className="size-4" />Download</a>
          )}
          {(v.status !== "published" || !v.upload?.youtubeId) && <MarkUploaded v={v} />}
          {v.status === "queued" && <Button icon={Upload} disabled={act.isPending} onClick={() => run("upload-now")}>Upload now</Button>}
          {v.status === "queued" && <Button icon={ChevronsDown} disabled={act.isPending} onClick={() => run("skip")}>Skip to end</Button>}
          {(v.status === "queued" || v.status === "failed") && (
            <ConfirmButton label="Delete" icon={Trash2} disabled={act.isPending} title="Delete this video?" confirmLabel="Delete video" description={`"${v.title}" will be removed. This cannot be undone.`} onConfirm={() => run("delete")} />
          )}
        </div>
      </div>
           {v.failReason && <p role="alert" className="mb-4 flex items-start gap-2 rounded-2xl border border-ring bg-critical-soft p-4 text-sm"><CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" /><span><strong>Failed.</strong> {v.failReason}</span></p>}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-4">
          <video controls preload="none" poster={v.thumbnailUrl} src={v.fileUrl} className="aspect-[9/16] w-full max-w-[260px] rounded-2xl border border-ring bg-black shadow-lift" />
          <Card title="Publishing" icon={Send}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink2">Created</dt><dd>{fmtDateTime(v.createdAt)}</dd>
              <dt className="text-ink2">{v.status === "published" ? "Published" : "Publish at"}</dt><dd>{v.upload ? fmtDateTime(v.upload.publishAt) : v.queuePosition ? `Queue position ${v.queuePosition}` : "—"}</dd>
              <dt className="text-ink2">Upload</dt><dd>{v.upload ? `${titleCase(v.upload.state)}, ${v.upload.attempts} attempt${v.upload.attempts === 1 ? "" : "s"}` : "—"}</dd>
              <dt className="text-ink2">YouTube</dt><dd>{v.upload?.youtubeId ? <a className="underline" href={`https://youtube.com/shorts/${v.upload.youtubeId}`} target="_blank" rel="noreferrer">Open</a> : <span className="text-muted">No link yet</span>}</dd>
            </dl>
          </Card>
          <Card title="Style" icon={Palette}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-ink2">Palette</dt><dd>{titleCase(v.style.palette)}</dd>
              <dt className="text-ink2">Music</dt><dd>{titleCase(v.style.genre)}, {v.style.key}, {v.style.bpm} BPM</dd>
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {v.status !== "failed" && <YouTubeDetails v={v} />}
          {v.totals && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Tile label="Views" icon={Eye} tone="info" value={<Num value={v.totals.views} fmt={fmtCompact} />} sub={fmtNum(v.totals.views)} />
                <Tile label="Likes" icon={Heart} tone="critical" value={<Num value={v.totals.likes} fmt={fmtCompact} />} />
                <Tile label="Subscribers" icon={UserPlus} tone="good" value={<Num value={v.totals.subsGained} fmt={(n) => `+${fmtNum(n)}`} />} />
                <Tile label="Avg viewed" icon={Percent} tone="warning" value={`${v.totals.avgViewPct}%`} />
              </div>
              <Card title="Views per day" icon={TrendingUp}>
                <LineChart data={v.stats.map((s) => ({ label: fmtDayKey(s.day), value: s.views }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} height={200} />
                <DataTable head={["Day", "Views"]} rows={v.stats.map((s) => [fmtDayKey(s.day), fmtNum(s.views)])} />
              </Card>
            </>
          )}

          <Card title="Checks" icon={ListChecks}>
            <ul className="flex flex-col gap-3">
              {v.qaChecks.map((c) => (
                <li key={c.checker} className="text-sm">
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{CHECK_NAMES[c.checker]}</span><ResultBadge ok={c.passed} /></div>
                  <ul className="mt-1 list-disc pl-5 text-ink2">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Run timeline" icon={Workflow} action={<span className="text-xs text-muted">{fmtDuration(total)} total</span>}>
            <ol className="flex flex-col">
              {v.steps.map((s, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-line py-2 text-sm last:border-0">
                  {s.status === "ok" ? <CircleCheck aria-label="OK" className="size-4 text-good" /> : s.status === "failed" ? <CircleX aria-label="Failed" className="size-4 text-critical" /> : <Minus aria-label="Skipped" className="size-4 text-muted" />}
                  <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="text-ink2"> · {s.note}</span>}</span>
                  <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Key frames" icon={Images}>
            <img src={v.previewUrl} alt="Contact sheet of key frames" loading="lazy" className="w-full rounded-lg border border-ring" />
          </Card>

          <Card title="Script" icon={FileText}>
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

        </div>
      </div>
    </>
  );
}
