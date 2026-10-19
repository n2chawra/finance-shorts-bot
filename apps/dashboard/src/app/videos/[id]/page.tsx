/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft, ChevronsDown, CircleCheck, CircleX, Download, Eye, Heart, ImageDown, MessageSquare, Minus, Percent, Trash2, TrendingUp, Upload } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Tabs } from "radix-ui";
import { useState } from "react";

import { DataTable, LineChart } from "@/components/charts";
import { ActionMenu, Card, ConfirmButton, buttonClass, Empty, ErrorNote, Loading, type MenuItem, Num, ResultBadge, Stagger, Stat, StatusBadge } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtDuration, fmtNum, fmtRelative, titleCase } from "@/lib/format";
import { postingPlan } from "@/lib/posting-plan";
import { useQueue, useSettings, useThumbWinner, useVideo, useVideoAction, useVideos } from "@/lib/queries";
import type { VideoAction, VideoDetail } from "@/lib/schemas";

import { MarkUploaded, YouTubeDetails } from "./publish-tools";

const CHECK_NAMES: Record<string, string> = { number_check: "Number check", fact_review: "Fact review", qa_review: "QA review" };

const VOICE_ACCENTS: Record<string, string> = { a: "American", b: "British", h: "Indian English" };

/** Kokoro voice ids are <accent><gender>_<name>, e.g. "af_bella" → "Bella (American, female)". */
function voiceLabel(voice: string): string {
  const [code = "", name] = voice.split("_");
  if (!name || code.length !== 2) return voice;
  const gender = code[1] === "f" ? "female" : code[1] === "m" ? "male" : null;
  const parts = [VOICE_ACCENTS[code[0]!], gender].filter(Boolean);
  return parts.length ? `${titleCase(name)} (${parts.join(", ")})` : titleCase(name);
}

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

const THUMB_KIND: Record<string, string> = { "thumbnail.png": "thumbnail", "thumbnail-b.png": "thumbnail-b", "thumbnail-c.png": "thumbnail-c" };

/** A long video's three thumbnails for YouTube's Test & Compare, and which one won. */
function ThumbTest({ v }: { v: VideoDetail }) {
  const pick = useThumbWinner();
  const toast = useToast();
  const winner = v.style.thumbTest?.winner ?? null;
  return (
    <Card title="Thumbnail test" description="Upload all three in YouTube Studio → Thumbnail → Test & Compare. When YouTube names a winner, mark it here: the agents learn which angle works.">
      <div className="grid grid-cols-3 gap-2">
        {(v.style.thumbs ?? []).map((t, i) => {
          const kind = THUMB_KIND[t.file] ?? "thumbnail", won = winner === t.file;
          return (
            <div key={t.file} className={`flex flex-col gap-1.5 rounded-lg border p-1.5 ${won ? "border-brand" : "border-ring"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/${v.id}/${kind}`} alt={`Thumbnail ${"ABC"[i]}`} className="aspect-video w-full rounded object-cover" />
              <span className="text-[11px] text-ink2">{"ABC"[i]} · {titleCase(t.angle ?? "—")}</span>
              <a href={`/api/media/${v.id}/${kind}`} download={`${v.id}-${kind}.png`} className={buttonClass("ghost")}><ImageDown aria-hidden className="size-4" />Download</a>
              <button type="button" disabled={pick.isPending} aria-pressed={won}
                onClick={() => pick.mutate({ id: v.id, winner: won ? null : t.file }, { onSuccess: () => toast(won ? "Winner cleared" : `Thumbnail ${"ABC"[i]} marked as the winner`), onError: (e) => toast(e.message, "error") })}
                className={buttonClass(won ? "primary" : "default")}>{won ? "Winner" : "Mark winner"}</button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-[13px] last:border-0"><dt className="text-muted">{k}</dt><dd className="min-w-0 text-right">{children}</dd></div>;
}

const TAB = "relative h-9 px-2.5 text-[13px] text-ink2 transition-colors hover:text-ink data-[state=active]:font-medium data-[state=active]:text-ink";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: v, error, isLoading } = useVideo(id);
  const act = useVideoAction();
  const toast = useToast();
  const [tab, setTab] = useState("details");
  const [confirmDelete, setConfirmDelete] = useState(false);
  // a queued video's slot, by the queue page's own posting plan
  const queue = useQueue();
  const settings = useSettings();
  const published = useVideos({ status: "published" });
  const scheduled = useVideos({ status: "scheduled" });
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
  const long = v.format === "long";
  const planned = v.status === "queued" && queue.data && settings.data
    ? postingPlan(v.format, queue.data, [...(published.data ?? []), ...(scheduled.data ?? [])], settings.data).find((s) => s.video?.id === v.id)
    : undefined;
  const publishAt = v.upload?.publishAt ?? (planned ? new Date(planned.at).toISOString() : null);
  const menu: MenuItem[] = [
    ...(v.status === "queued" ? [
      { label: "Upload now", icon: Upload, disabled: act.isPending, onSelect: () => run("upload-now") },
      { label: "Skip to end of queue", icon: ChevronsDown, disabled: act.isPending, onSelect: () => run("skip") },
    ] as MenuItem[] : []),
    ...(v.status === "queued" || v.status === "failed" ? ["separator", { label: "Delete…", icon: Trash2, danger: true, onSelect: () => setConfirmDelete(true) }] as MenuItem[] : []),
  ];
  while (menu[0] === "separator") menu.shift();
  const tabs = [
    { value: "details", label: "YouTube details", show: v.status !== "failed" },
    { value: "performance", label: "Performance", show: true },
    { value: "pipeline", label: "Checks & run", show: true },
    { value: "script", label: "Script", show: true },
  ].filter((t) => t.show);
  const current = tabs.some((t) => t.value === tab) ? tab : tabs[0].value;

  return (
    <Stagger>
      <Link href="/videos" className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink"><ArrowLeft aria-hidden className="size-3.5" />Videos</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] md:text-2xl">{v.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <StatusBadge status={v.status} />
            <span className="font-mono text-xs">{v.id}</span><span aria-hidden>·</span><span>{titleCase(v.templateId)}</span><span aria-hidden>·</span>
            <span>{titleCase(v.topic.category)}</span><span aria-hidden>·</span><span>{v.durationSec}s</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {v.status !== "failed" && v.fileUrl && <a href={v.fileUrl} download={`${v.id}.mp4`} className={buttonClass("default")}><Download aria-hidden className="size-4" />Download video</a>}
          {v.status !== "failed" && <a href={v.thumbnailUrl} download={`${v.id}-thumbnail.png`} className={buttonClass("default")}><ImageDown aria-hidden className="size-4" />Download thumbnail</a>}
          {(v.status !== "published" || !v.upload?.youtubeId) && <MarkUploaded v={v} />}
          {menu.length > 0 && <ActionMenu items={menu} />}
        </div>
      </div>

      {v.failReason && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-critical/25 bg-critical-soft p-3.5 text-[13px]">
          <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" /><span><strong className="font-medium">Failed.</strong> <span className="text-ink2">{v.failReason}</span></span>
        </p>
      )}

      <div className={`grid gap-4 ${long ? "lg:grid-cols-[480px_1fr]" : "lg:grid-cols-[280px_1fr]"}`}>
        <div className="flex flex-col gap-3 lg:sticky lg:top-16 lg:self-start">
          <video controls preload="none" poster={v.thumbnailUrl} src={v.fileUrl} className={`mx-auto w-full rounded-xl border border-ring bg-black shadow-lift ${long ? "aspect-video max-w-[480px]" : "aspect-[9/16] max-w-[280px]"}`} />
          <Card title="Publishing">
            <dl>
              <Row k="Created">{fmtDateTime(v.createdAt)}</Row>
              <Row k={v.status === "published" ? "Published" : "Publish at"}>
                {publishAt ? (
                  <span className="block text-right leading-tight">
                    <span className="block tabular-nums">{fmtDateTime(publishAt)} IST{!v.upload && v.queuePosition ? ` · queue #${v.queuePosition}` : ""}</span>
                    {!v.upload && <span className="block text-[11px] text-muted">{fmtRelative(publishAt)}, if the queue order holds</span>}
                  </span>
                ) : v.queuePosition ? `Queue #${v.queuePosition}` : "—"}
              </Row>
              <Row k="Upload">{v.upload ? `${titleCase(v.upload.state)} · ${v.upload.attempts} attempt${v.upload.attempts === 1 ? "" : "s"}` : "—"}</Row>
              <Row k="YouTube">{v.upload?.youtubeId ? <a className="font-medium text-brand-text hover:underline" href={long ? `https://youtube.com/watch?v=${v.upload.youtubeId}` : `https://youtube.com/shorts/${v.upload.youtubeId}`} target="_blank" rel="noreferrer">Open ↗</a> : <span className="text-muted">No link yet</span>}</Row>
              <Row k="Style">{titleCase(v.style.palette)} · {titleCase(v.style.genre)}, {v.style.key}, {v.style.bpm} BPM</Row>
              <Row k="Format">{v.format === "long" ? `Long video · ${Math.round(v.durationSec / 60)} min, landscape` : "Short · vertical"}</Row>
              <Row k="Voiceover">{v.style.voice ? `On · ${voiceLabel(v.style.voice)}` : "None"}</Row>
            </dl>
          </Card>
          {(v.style.thumbs?.length ?? 0) > 1 && <ThumbTest v={v} />}
        </div>

        <Tabs.Root value={current} onValueChange={setTab} className="min-w-0">
          <Tabs.List aria-label="Video sections" className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b border-ring">
            {tabs.map((t) => (
              <Tabs.Trigger key={t.value} value={t.value} className={TAB}>
                {t.label}
                {current === t.value && <motion.span layoutId="video-detail-tab" className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-ink" />}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="details" className="outline-none"><YouTubeDetails v={v} /></Tabs.Content>

          <Tabs.Content value="performance" className="flex flex-col gap-3 outline-none">
            {v.totals ? (
              <>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <Stat label="Views" icon={Eye} value={<Num value={v.totals.views} fmt={fmtCompact} />} sub={v.totals.liveAt ? `${fmtNum(v.totals.views)} · live, ${fmtRelative(v.totals.liveAt)}` : fmtNum(v.totals.views)} />
                  <Stat label="Likes" icon={Heart} value={<Num value={v.totals.likes} fmt={fmtCompact} />} sub={v.totals.liveAt ? "live" : "YouTube Analytics"} />
                  <Stat label="Comments" icon={MessageSquare} value={<Num value={v.totals.comments} fmt={fmtCompact} />} sub={v.totals.liveAt ? "live" : "YouTube Analytics"} />
                  <Stat label="Avg viewed" icon={Percent} value={`${v.totals.avgViewPct}%`} sub={`+${fmtNum(v.totals.subsGained)} subscribers · 1–2 days behind`} />
                </div>
                <Card title="Views per day" icon={TrendingUp} description="YouTube Analytics daily numbers, 1–2 days behind">
                  {v.stats.length ? (
                    <>
                      <LineChart data={v.stats.map((s) => ({ label: fmtDayKey(s.day), value: s.views }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} height={220} />
                      <DataTable head={["Day", "Views"]} rows={v.stats.map((s) => [fmtDayKey(s.day), fmtNum(s.views)])} />
                    </>
                  ) : <Empty icon={TrendingUp}>Daily numbers appear once YouTube Analytics has them.</Empty>}
                </Card>
              </>
            ) : <Card><Empty icon={Eye} title="No numbers yet">{v.status === "published" ? "Add the YouTube link to track live views." : "Views show up once the video is published."}</Empty></Card>}
          </Tabs.Content>

          <Tabs.Content value="pipeline" className="flex flex-col gap-3 outline-none">
            <Card title="Checks">
              <ul className="flex flex-col divide-y divide-line">
                {v.qaChecks.map((c) => (
                  <li key={c.checker} className="py-2.5 text-[13px] first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2"><span className="font-medium">{CHECK_NAMES[c.checker]}</span><ResultBadge ok={c.passed} /></div>
                    <ul className="mt-1 list-disc pl-5 text-ink2">{c.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                  </li>
                ))}
                {v.qaChecks.length === 0 && <li className="text-[13px] text-muted">No checks recorded.</li>}
              </ul>
            </Card>
            <Card title="Run timeline" action={<span className="text-xs text-muted">{fmtDuration(total)} total</span>}>
              <ol className="relative ml-2 border-l border-ring">
                {v.steps.map((s, i) => (
                  <li key={i} className="relative flex items-start gap-3 pb-3 pl-5 text-[13px] last:pb-0">
                    <span className="absolute -left-[9px] top-0.5 grid size-[17px] place-items-center rounded-full bg-surface">
                      {s.status === "ok" ? <CircleCheck aria-label="OK" className="size-4 text-good" /> : s.status === "failed" ? <CircleX aria-label="Failed" className="size-4 text-critical" /> : <Minus aria-label="Skipped" className="size-4 text-muted" />}
                    </span>
                    <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="block text-ink2">{s.note}</span>}</span>
                    <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card title="Key frames" description="The contact sheet QA reviewed">
              <img src={v.previewUrl} alt="Contact sheet of key frames" loading="lazy" className="w-full rounded-lg border border-ring" />
            </Card>
          </Tabs.Content>

          <Tabs.Content value="script" className="outline-none">
            <Card>
              {inputs.length === 0 && lines.length === 0 ? <Empty>No script stored.</Empty> : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                  <div>
                    <h3 className="text-xs font-medium text-muted">Inputs (the code computes every number from these)</h3>
                    <dl className="mt-2">{inputs.map(([k, val]) => <Row key={k} k={k}><span className="break-words font-mono text-xs">{val}</span></Row>)}</dl>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-muted">On-screen text, in order</h3>
                    <ol className="mt-2">
                      {lines.map(([k, line]) => (
                        <li key={k} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line py-2 text-[13px] last:border-0">
                          <span>{line}</span><span className="font-mono text-[11px] text-muted">{k}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <ConfirmButton hideTrigger open={confirmDelete} onOpenChange={setConfirmDelete} label="Delete" title="Delete this video?" confirmLabel="Delete video"
        description={`"${v.title}" will be removed. This cannot be undone.`} onConfirm={() => run("delete")} />
    </Stagger>
  );
}
