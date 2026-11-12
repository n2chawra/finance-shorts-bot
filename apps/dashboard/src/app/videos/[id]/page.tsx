/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft, Award, ChevronsDown, CircleCheck, CircleX, Download, Eye, Heart, ImageDown, MessageSquare, Minus, Percent, RotateCcw, Sparkles, Trash2, TrendingUp, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Tabs } from "radix-ui";
import { useState } from "react";

import { DataTable, LineChart } from "@/components/charts";
import { ActionMenu, Card, ConfirmButton, buttonClass, Empty, ErrorNote, Loading, type MenuItem, Num, ResultBadge, Stagger, Stat, StatusBadge, tabClass, tabListClass } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtDuration, fmtNum, fmtRelative, titleCase, fileSlug } from "@/lib/format";
import { postingPlan } from "@/lib/posting-plan";
import { useQueue, useSettings, useThumbWinner, useVideo, useVideoAction, useVideos } from "@/lib/queries";
import type { VideoAction, VideoDetail } from "@/lib/schemas";

import { EditDetails, MarkUploaded, YouTubeDetails } from "./publish-tools";
import { EditorBadge, EditorNote, FeedbackPanel, ReasonDialog } from "@/components/feedback";
import { OriginCard } from "@/components/origin";
import { VideoAnalytics } from "@/components/video-analytics";

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

/** A long video's three thumbnails, each rated by Studio (owner, 2026-11-11): the owner picks the cover;
 * without a pick, the one Studio rated best goes up. */
function ThumbPick({ v }: { v: VideoDetail }) {
  const pick = useThumbWinner();
  const toast = useToast();
  const thumbs = v.style.thumbs ?? [];
  const mine = v.style.thumbPick?.file ?? null;
  const studio = thumbs.find((t) => t.picked)?.file ?? thumbs[0]?.file ?? null;
  const goesUp = mine ?? studio;
  const uploaded = v.status === "scheduled" || v.status === "published";
  return (
    <Card title="Pick the thumbnail" accent="sun" description={uploaded
      ? "Already uploaded with the one marked below. To change it now, download another and set it in YouTube Studio → Thumbnail."
      : "Three thumbnails, each modelled on a different pattern among this topic's most viewed videos. Pick the cover; if you don't, the one Studio rated best goes up."}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {thumbs.map((t, i) => {
          const kind = THUMB_KIND[t.file] ?? "thumbnail", up = goesUp === t.file, isMine = mine === t.file;
          return (
            <div key={t.file} className={`flex flex-col gap-1.5 border-2 border-edge p-2 ${up ? "bg-lime/30 shadow-[4px_4px_0_0_var(--hard)]" : "bg-surface"}`}>
              <img src={`/api/media/${v.id}/${kind}`} alt={`Thumbnail ${"ABC"[i]}`} className="aspect-video w-full border-2 border-edge object-cover" />
              <span className="text-[12px] font-bold uppercase text-ink">
                {"ABC"[i]}{t.score != null ? ` · Studio ${t.score}/10` : ""}{t.picked ? " · Studio's pick" : ""}{up ? " · goes up" : ""}
              </span>
              {t.pattern && <span className="text-[11px] text-muted">{t.pattern}</span>}
              {t.why && <span className="text-[11px] text-ink2">{t.why}</span>}
              <a href={`/api/media/${v.id}/${kind}`} download={`${fileSlug(v)}-${kind}.png`} className={buttonClass("ghost")}><ImageDown aria-hidden className="size-4" />Download</a>
              {!uploaded && (
                <button type="button" disabled={pick.isPending} aria-pressed={isMine}
                  onClick={() => pick.mutate({ id: v.id, winner: isMine ? null : t.file }, { onSuccess: () => toast(isMine ? "Your pick cleared: Studio's pick goes up" : `Thumbnail ${"ABC"[i]} will go up`), onError: (e) => toast(e.message, "error") })}
                  className={buttonClass(isMine ? "primary" : "default")}>{isMine ? "Your pick" : "Use this one"}</button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="flex items-baseline justify-between gap-3 border-b-2 border-dashed border-line py-2 text-[13px] last:border-0"><dt className="nb-label !text-[10.5px] text-muted">{k}</dt><dd className="min-w-0 text-right font-semibold">{children}</dd></div>;
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: v, error, isLoading } = useVideo(id);
  const act = useVideoAction();
  const toast = useToast();
  const [tab, setTab] = useState("details");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ask, setAsk] = useState<"pick" | "stale" | null>(null);
  // a queued video's slot, by the queue page's own posting plan
  const queue = useQueue();
  const settings = useSettings();
  const published = useVideos({ status: "published" });
  const scheduled = useVideos({ status: "scheduled" });
  if (isLoading) return <Loading />;
  if (error || !v) return <ErrorNote error={error} />;

  // a video already on YouTube (or scheduled there) is "removed", not deleted: YouTube keeps it until the owner deletes it there
  const onYouTube = v.status === "published" || v.status === "scheduled";
  const run = (action: VideoAction) => {
    act.mutate({ id: v.id, action }, {
      onSuccess: () => { toast(action === "delete" ? (onYouTube ? "Removed" : "Video deleted") : action === "skip" ? "Moved to the end of the queue"
        : action === "unpick" ? "Pick removed" : action === "unstale" ? "Back in the queue" : "Marked for upload"); if (action === "delete") router.push("/videos"); },
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
      v.pickedAt ? { label: "Remove my pick", icon: XCircle, disabled: act.isPending, onSelect: () => run("unpick") }
        : { label: "Pick for the next upload…", icon: Award, disabled: act.isPending, onSelect: () => setAsk("pick") },
      { label: "Upload now", icon: Upload, disabled: act.isPending, onSelect: () => run("upload-now") },
      { label: "Skip to end of queue", icon: ChevronsDown, disabled: act.isPending, onSelect: () => run("skip") },
    ] as MenuItem[] : []),
    ...(v.status === "queued" ? [{ label: "Mark stale…", icon: XCircle, disabled: act.isPending, onSelect: () => setAsk("stale") }] as MenuItem[] : []),
    ...(v.status === "rejected" ? [{ label: "Put back in the queue", icon: RotateCcw, disabled: act.isPending, onSelect: () => run("unstale") }] as MenuItem[] : []),
    "separator", { label: onYouTube ? "Removed from YouTube…" : "Delete…", icon: Trash2, danger: true, onSelect: () => setConfirmDelete(true) },
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
      <Link href="/videos" className="nb-sm nb-press inline-flex h-8 items-center gap-1.5 bg-surface px-2.5 text-[12px] font-bold uppercase tracking-wide"><ArrowLeft aria-hidden strokeWidth={3} className="size-3.5" />All videos</Link>
      <div className="mb-8 mt-5 flex flex-col gap-5 border-b-2 border-edge pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
            <StatusBadge status={v.status} />
            <EditorBadge v={v} />
            {[v.id, titleCase(v.templateId), titleCase(v.topic.category), `${v.durationSec}s`].map((x) => (
              <span key={x} className="border-2 border-edge bg-surface px-1.5 py-px font-mono text-[11px] font-bold uppercase text-ink2">{x}</span>
            ))}
          </div>
          <h1 className="mt-4 max-w-5xl font-display text-[30px] uppercase leading-[0.98] md:text-[48px]">{v.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {v.status !== "failed" && v.fileUrl && <a href={v.fileUrl} download={`${fileSlug(v)}.mp4`} className={buttonClass("default")}><Download aria-hidden className="size-4" />Download video</a>}
          {v.status !== "failed" && <a href={v.thumbnailUrl} download={`${fileSlug(v)}-thumbnail.png`} className={buttonClass("default")}><ImageDown aria-hidden className="size-4" />Download thumbnail</a>}
          {v.status !== "published" && <MarkUploaded v={v} />}
          <EditDetails v={v} />
          {menu.length > 0 && <ActionMenu items={menu} />}
        </div>
      </div>

      {v.status === "queued" && (v.editorNote || v.pickedAt) && (
        <Card className="mb-6" accent="grape" title={v.pickedAt ? "Your pick for the next upload" : `The editor ranks this #${v.editorRank ?? "?"}${v.editorScore !== null ? ` · ${v.editorScore.toFixed(1)}/10` : ""}`} icon={v.pickedAt ? Award : Sparkles}>
          {v.pickedAt && <p className="mb-2 text-[13px]"><span className="font-medium">Why: </span>{v.pickReason ?? "—"}</p>}
          <EditorNote v={v} />
        </Card>
      )}

      {v.failReason && v.status !== "rejected" && (
        <p role="alert" className="nb on-accent mb-6 flex items-start gap-2.5 bg-red p-3.5 text-[14px] font-semibold">
          <CircleX aria-hidden strokeWidth={2.5} className="mt-0.5 size-5 shrink-0" /><span><strong className="font-display uppercase">Failed.</strong> {v.failReason}</span>
        </p>
      )}

      {v.status === "rejected" && (
        <p role="status" className="nb on-accent mb-6 flex items-start gap-2.5 bg-sun p-3.5 text-[14px] font-semibold">
          <XCircle aria-hidden strokeWidth={2.5} className="mt-0.5 size-5 shrink-0" /><span><strong className="font-display uppercase">Stale.</strong> <span>{v.failReason?.replace(/^Stale \(owner\): /, "")} It will never be posted.</span></span>
        </p>
      )}

      <div className={`grid gap-6 ${long ? "lg:grid-cols-[500px_1fr]" : "lg:grid-cols-[320px_1fr]"}`}>
        <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          <div className={`nb mx-auto w-full bg-ink p-2.5 ${long ? "max-w-[500px]" : "max-w-[320px]"}`}>
            <video controls preload="none" poster={v.thumbnailUrl} src={v.fileUrl} className={`w-full border-2 border-plane/30 bg-black ${long ? "aspect-video" : "aspect-[9/16]"}`} />
            <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] font-bold uppercase text-plane"><span className="flex items-center gap-1.5"><span className="size-2 animate-pulse-dot bg-red" />{long ? "Long · 16:9" : "Short · 9:16"}</span><span>{v.durationSec}s</span></div>
          </div>
          <Card title="Publishing" accent="lime">
            <dl>
              <Row k="Created">{fmtDateTime(v.createdAt)}</Row>
              <Row k={v.status === "published" ? "Published" : "Publish at"}>
                {publishAt ? (
                  <span className="block text-right leading-tight">
                    <span className="block tabular-nums">{fmtDateTime(publishAt)} IST{!v.upload && v.queuePosition ? ` · queue #${v.queuePosition}` : ""}</span>
                    {!v.upload && (planned?.state === "due"
                      ? <span className="mt-1 inline-block border-2 border-edge bg-sun px-1 text-[11px] font-bold text-on-accent">Due now: this slot is open</span>
                      : <span className="block text-[11px] text-muted">{fmtRelative(publishAt)}, if the queue order holds</span>)}
                  </span>
                ) : v.queuePosition ? `Queue #${v.queuePosition}` : "—"}
              </Row>
              <Row k="Upload">{v.upload ? `${titleCase(v.upload.state)} · ${v.upload.attempts} attempt${v.upload.attempts === 1 ? "" : "s"}` : "—"}</Row>
              <Row k="YouTube">{v.upload?.youtubeId ? <a className="border-2 border-edge bg-red px-1.5 font-bold text-on-accent" href={long ? `https://youtube.com/watch?v=${v.upload.youtubeId}` : `https://youtube.com/shorts/${v.upload.youtubeId}`} target="_blank" rel="noreferrer">Open ↗</a> : <span className="text-muted">No link yet</span>}</Row>
              <Row k="Style">{titleCase(v.style.palette)} · {titleCase(v.style.genre)}, {v.style.key}, {v.style.bpm} BPM</Row>
              <Row k="Format">{v.format === "long" ? `Long video · ${Math.round(v.durationSec / 60)} min, landscape` : "Short · vertical"}</Row>
              <Row k="Voiceover">{v.style.voice ? `On · ${voiceLabel(v.style.voice)}` : "None"}</Row>
            </dl>
          </Card>
          <OriginCard origin={v.origin} />
          {(v.style.thumbs?.length ?? 0) > 1 && <ThumbPick v={v} />}
        </div>

        <Tabs.Root value={current} onValueChange={setTab} className="min-w-0">
          <Tabs.List aria-label="Video sections" className={tabListClass}>
            {tabs.map((t) => (
              <Tabs.Trigger key={t.value} value={t.value} className={tabClass}>{t.label}</Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="details" className="outline-none"><YouTubeDetails v={v} /></Tabs.Content>

          <Tabs.Content value="performance" className="flex flex-col gap-5 outline-none">
            {v.totals ? (
              <>
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <Stat label="Views" icon={Eye} accent="sky" value={<Num value={v.totals.views} fmt={fmtCompact} />} sub={v.totals.liveAt ? `${fmtNum(v.totals.views)} · live, ${fmtRelative(v.totals.liveAt)}` : fmtNum(v.totals.views)} />
                  <Stat label="Likes" icon={Heart} accent="pink" value={<Num value={v.totals.likes} fmt={fmtCompact} />} sub={v.totals.liveAt ? "live" : "YouTube Analytics"} />
                  <Stat label="Comments" icon={MessageSquare} accent="sun" value={<Num value={v.totals.comments} fmt={fmtCompact} />} sub={v.totals.liveAt ? "live" : "YouTube Analytics"} />
                  <Stat label="Avg viewed" icon={Percent} accent="mint" value={`${v.totals.avgViewPct}%`} sub={`+${fmtNum(v.totals.subsGained)} subscribers · 1–2 days behind`} />
                </div>
                <Card title="Views per day" icon={TrendingUp} description="YouTube Analytics daily numbers, 1–2 days behind">
                  {v.stats.length ? (
                    <>
                      <LineChart data={v.stats.map((s) => ({ label: fmtDayKey(s.day), value: s.views }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} height={220} />
                      <DataTable head={["Day", "Views"]} rows={v.stats.map((s) => [fmtDayKey(s.day), fmtNum(s.views)])} />
                    </>
                  ) : <Empty icon={TrendingUp}>Daily numbers appear once YouTube Analytics has them.</Empty>}
                </Card>
                <VideoAnalytics id={v.id} />
              </>
            ) : <Card><Empty icon={Eye} title="No numbers yet">{v.status === "published" ? "Add the YouTube link to track live views." : "Views show up once the video is published."}</Empty></Card>}
          </Tabs.Content>

          <Tabs.Content value="pipeline" className="flex flex-col gap-5 outline-none">
            <Card title="Checks">
              <ul className="grid gap-3 md:grid-cols-3">
                {v.qaChecks.map((c) => (
                  <li key={c.checker} className={`border-2 border-edge text-[13px] ${c.passed ? "" : "shadow-[3px_3px_0_0_var(--hard)]"}`}>
                    <div className={`flex items-center justify-between gap-2 border-b-2 border-edge px-3 py-2 ${c.passed ? "bg-mint" : "bg-red"} on-accent`}><span className="font-display uppercase">{CHECK_NAMES[c.checker]}</span><ResultBadge ok={c.passed} /></div>
                    <ul className="list-disc px-3 py-2.5 pl-7 font-medium text-ink2">{c.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                  </li>
                ))}
                {v.qaChecks.length === 0 && <li className="text-[13px] font-medium text-muted">No checks recorded.</li>}
              </ul>
            </Card>
            <Card title="Run timeline" action={<span className="nb-label border-2 border-edge bg-surface px-2 py-1">{fmtDuration(total)} total</span>}>
              <ol className="flex flex-col">
                {v.steps.map((s, i) => (
                  <li key={i} className="relative flex items-stretch gap-3 text-[13px]">
                    <span className="flex flex-col items-center">
                      <span className={`grid size-7 shrink-0 place-items-center border-2 border-edge ${s.status === "ok" ? "bg-mint" : s.status === "failed" ? "bg-red" : "bg-surface-2"} text-on-accent`}>
                        {s.status === "ok" ? <CircleCheck aria-label="OK" strokeWidth={2.5} className="size-4" /> : s.status === "failed" ? <CircleX aria-label="Failed" strokeWidth={2.5} className="size-4" /> : <Minus aria-label="Skipped" strokeWidth={2.5} className="size-4" />}
                      </span>
                      {i < v.steps.length - 1 && <span aria-hidden className="w-0.5 flex-1 bg-edge" />}
                    </span>
                    <span className="flex-1 pb-4 pt-1 font-bold">{titleCase(s.agent)}{s.note && <span className="block font-medium text-ink2">{s.note}</span>}</span>
                    <span className="pt-1.5 font-mono text-xs font-bold tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card title="Key frames" description="The contact sheet QA reviewed">
              <img src={v.previewUrl} alt="Contact sheet of key frames" loading="lazy" className="w-full border-2 border-edge" />
            </Card>
          </Tabs.Content>

          <Tabs.Content value="script" className="outline-none">
            <Card>
              {inputs.length === 0 && lines.length === 0 ? <Empty>No script stored.</Empty> : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                  <div>
                    <h3 className="nb-label inline-block border-2 border-edge bg-lime px-2 py-0.5 text-on-accent">Inputs · the code computes every number from these</h3>
                    <dl className="mt-2">{inputs.map(([k, val]) => <Row key={k} k={k}><span className="break-words font-mono text-xs">{val}</span></Row>)}</dl>
                  </div>
                  <div>
                    <h3 className="nb-label inline-block border-2 border-edge bg-pink px-2 py-0.5 text-on-accent">On-screen text, in order</h3>
                    <ol className="mt-2">
                      {lines.map(([k, line]) => (
                        <li key={k} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b-2 border-dashed border-line py-2 text-[13.5px] font-medium last:border-0">
                          <span>{line}</span><span className="font-mono text-[11px] font-bold text-muted">{k}</span>
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

      <div className="mt-8"><FeedbackPanel videoId={v.id} title="Your feedback on this video" /></div>

      <ReasonDialog open={ask !== null} onOpenChange={(o) => !o && setAsk(null)} required={ask === "stale"}
        title={ask === "pick" ? "Pick this for the next upload?" : "Mark this video stale?"}
        description={ask === "pick" ? "It goes out in the next slot, before the editor's ranking. Why this one? The editor and the next videos learn from your choices."
          : "It leaves the queue and will never be posted. Say why: the next videos and the improver learn from it."}
        placeholder={ask === "pick" ? "e.g. Strongest hook; big-money topic people love" : "e.g. Personal-budget topic; the hook gives the answer away"}
        confirmLabel={ask === "pick" ? "Pick it" : "Mark stale"}
        onSubmit={(reason) => { if (ask) act.mutate({ id: v.id, action: ask, reason }, { onSuccess: () => toast(ask === "pick" ? "Picked: it goes out in the next slot" : "Marked stale"), onError: (e) => toast(e.message, "error") }); setAsk(null); }} />

      <ConfirmButton hideTrigger open={confirmDelete} onOpenChange={setConfirmDelete} label={onYouTube ? "Remove" : "Delete"}
        title={onYouTube ? "Removed from YouTube?" : "Delete this video?"} confirmLabel={onYouTube ? "Remove from dashboard" : "Delete video"}
        description={onYouTube
          ? `"${v.title}" leaves the dashboard: its lists, totals and graphs, and the stats jobs stop tracking it. This does not delete it from YouTube: do that in YouTube Studio.`
          : `"${v.title}" will be removed. This cannot be undone.`} onConfirm={() => run("delete")} />
    </Stagger>
  );
}
