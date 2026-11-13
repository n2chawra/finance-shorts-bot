/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowRight, Check, ExternalLink, FlaskConical, GraduationCap, Link2, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useToast } from "@/components/toast";
import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, SelectField, Stagger, type Tone, fieldClass } from "@/components/ui";
import { fmtDayKey, fmtRelative } from "@/lib/format";
import { useAddStudy, useStudies, useVideos } from "@/lib/queries";
import type { Study } from "@/lib/study";

/*
 * Study (owner, 2026-11-13): paste a YouTube Short or video you like. Gemini watches it and the
 * closest of ours (workers/study.ts); the techniques go to the writer and the biggest look
 * difference joins the weekly loop as a test. Fully automatic.
 */

const STATUS: Record<Study["status"], { label: string; tone: Tone }> = {
  queued: { label: "Waiting", tone: "neutral" },
  watching: { label: "Watching", tone: "info" },
  done: { label: "Learned", tone: "good" },
  failed: { label: "Failed", tone: "critical" },
};

const SHOWN: { key: string; label: string; kind: "s" | "%" | "n" }[] = [
  { key: "secPerShot", label: "Seconds per picture", kind: "s" },
  { key: "firstFigureSec", label: "First money figure at", kind: "s" },
  { key: "characterShare", label: "Character on screen", kind: "%" },
  { key: "figureShare", label: "Figure on screen", kind: "%" },
  { key: "wordsPerMin", label: "Words a minute", kind: "n" },
  { key: "motion", label: "Motion (0–3)", kind: "n" },
];
const fmt = (v: unknown, kind: "s" | "%" | "n") =>
  typeof v !== "number" ? "—" : kind === "%" ? `${Math.round(v * 100)}%` : kind === "s" ? `${Math.round(v * 10) / 10} s` : `${Math.round(v * 10) / 10}`;

function AddForm() {
  const [url, setUrl] = useState(""), [videoId, setVideoId] = useState(""), [note, setNote] = useState("");
  const add = useAddStudy();
  const toast = useToast();
  const { data: videos } = useVideos({ status: "published" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate({ url, videoId: videoId || undefined, note: note || undefined }, {
      onSuccess: () => { setUrl(""); setNote(""); setVideoId(""); toast("Added: Gemini watches it in the next few minutes"); },
      onError: (err) => toast(err.message, "error"),
    });
  };
  return (
    <Card title="Study a video" icon={Link2} accent="lime" description="A YouTube Short or long video whose animation or script you like. The system learns from it and applies it on its own.">
      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-3">
          <label className="text-[12.5px] font-medium text-ink2" htmlFor="study-url">YouTube link</label>
          <input id="study-url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://youtube.com/shorts/…" className={fieldClass} />
          <label className="text-[12.5px] font-medium text-ink2" htmlFor="study-note">What to look at (optional)</label>
          <input id="study-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. the camera moves, how the numbers appear" maxLength={500} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[12.5px] font-medium text-ink2">Compare with</span>
          <SelectField label="Compare with" value={videoId} onChange={setVideoId} all="Our closest video by title (automatic)"
            options={(videos ?? []).slice(0, 60).map((v) => ({ value: v.id, label: v.title }))} />
          <p className="text-[12px] leading-relaxed text-muted">Left on automatic, it compares with the published video of ours whose title shares the most words.</p>
          <div className="mt-auto"><Button type="submit" tone="primary" icon={GraduationCap} disabled={!url.trim() || add.isPending}>{add.isPending ? "Adding…" : "Study it"}</Button></div>
        </div>
      </form>
    </Card>
  );
}

function Report({ s }: { s: Study }) {
  const r = s.report!;
  const gapKeys = new Set(r.gaps.map((g) => g.key));
  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-2">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold"><Sparkles aria-hidden className="size-4 text-brand" />What they do</h3>
        <p className="mt-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px]">
          <span className="font-medium">First frame: </span><span className="text-ink2">{r.theirs.hook.firstFrame}</span>
          {r.theirs.hook.firstLine && <><br /><span className="font-medium">First line: </span><span className="text-ink2">“{r.theirs.hook.firstLine}”</span></>}
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {r.theirs.techniques.map((t, i) => <li key={i} className="flex gap-2 text-[13px] leading-relaxed"><Check aria-hidden className="mt-0.5 size-4 shrink-0 text-good-text" />{t}</li>)}
        </ul>
        {r.theirs.shots.length > 0 && (
          <details className="mt-3 text-[12.5px]">
            <summary className="cursor-pointer text-ink2 hover:text-ink">Their first {Math.min(8, r.theirs.shots.length)} shots</summary>
            <ol className="mt-2 flex flex-col gap-1 text-muted">
              {r.theirs.shots.slice(0, 8).map((x, i) => <li key={i}><span className="tabular-nums text-ink2">{x.start.toFixed(1)}–{x.end.toFixed(1)} s</span> · {x.picture}</li>)}
            </ol>
          </details>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-[13.5px] font-semibold">{r.ours ? "Theirs next to ours" : "Measured"}</h3>
        <div className="mt-2 overflow-hidden rounded-xl border border-ring">
          <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] bg-surface-2 px-3.5 py-2 text-[11.5px] font-medium text-muted"><span>Measured by code</span><span className="text-right">Ours</span><span className="text-right">Theirs</span></div>
          <ul className="divide-y divide-line">
            {SHOWN.map((m) => (
              <li key={m.key} className={`grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center px-3.5 py-2 text-[13px] ${gapKeys.has(m.key) ? "bg-warning-soft/40" : ""}`}>
                <span className="flex min-w-0 items-center gap-1.5 leading-snug">{gapKeys.has(m.key) && <span aria-label="differs" className="size-1.5 shrink-0 rounded-full bg-warning" />}{m.label}</span>
                <span className="text-right tabular-nums">{r.ours ? fmt(r.ours.measures[m.key], m.kind) : "—"}</span>
                <span className="text-right font-semibold tabular-nums">{fmt(r.theirs.measures[m.key], m.kind)}</span>
              </li>
            ))}
          </ul>
        </div>
        <h3 className="mt-4 text-[13.5px] font-semibold">Applied automatically</h3>
        <ul className="mt-2 flex flex-col gap-2 text-[13px]">
          <li className="flex gap-2.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
            <PenLine aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>{r.applied.writer.length ? <>The writer now follows {r.applied.writer.length} technique{r.applied.writer.length === 1 ? "" : "s"} from it in every new script.</> : "Nothing new for the writer."}</span>
          </li>
          <li className="flex gap-2.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
            <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0 text-violet-text" />
            <span>{r.applied.challenger ? <>Queued as a weekly test: <span className="font-medium">{r.applied.challenger.test}</span>. <Link href="/growth" className="whitespace-nowrap font-medium text-brand-text hover:underline">Growth loop <ArrowRight aria-hidden className="inline size-3.5" /></Link></> : "No look difference big enough to test."}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function StudyCard({ s }: { s: Study }) {
  const st = STATUS[s.status];
  return (
    <li className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <a href={s.url} target="_blank" rel="noreferrer noopener" className="relative block w-full shrink-0 overflow-hidden rounded-xl border border-ring bg-surface-3 sm:w-44">
          {!s.youtubeId.startsWith("sample") && <img src={`https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover" />}
          {s.youtubeId.startsWith("sample") && <div className="aspect-video w-full" />}
        </a>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <a href={s.url} target="_blank" rel="noreferrer noopener" className="group min-w-0 text-[15px] font-semibold leading-snug hover:text-brand-text">
              {s.title ?? s.url}<ExternalLink aria-hidden className="ml-1.5 inline size-3.5 text-muted group-hover:text-brand-text" />
            </a>
            <Badge tone={st.tone} dot>{st.label}</Badge>
          </div>
          <div className="mt-1 text-[12.5px] text-muted">{s.channel ? `${s.channel} · ` : ""}added {fmtRelative(s.createdAt)}{s.doneAt ? ` · learned ${fmtDayKey(s.doneAt)}` : ""}</div>
          <div className="mt-2 text-[13px] text-ink2">
            Compared with: {s.videoId ? <Link href={`/videos/${s.videoId}`} className="font-medium text-ink hover:text-brand-text">{s.videoTitle ?? s.videoId}</Link> : <span className="text-muted">no close match among ours, studied on its own</span>}
            {s.matchedBy === "auto" && <span className="text-muted"> (closest title)</span>}
          </div>
          {s.note && <p className="mt-1 text-[13px] text-muted">Your note: {s.note}</p>}
          {s.status === "failed" && s.error && <p className="mt-2 text-[13px] text-critical-text">{s.error}</p>}
          {(s.status === "queued" || s.status === "watching") && <p className="mt-2 text-[13px] text-muted">Gemini watches it in the next few minutes; this updates on its own.</p>}
        </div>
      </div>
      {s.status === "done" && s.report && <Report s={s} />}
    </li>
  );
}

export default function StudyPage() {
  const { data, error, isLoading } = useStudies();
  return (
    <Stagger>
      <PageHeader title="Study" sub="Show the system videos you like. Gemini watches each one and the closest of ours, code measures both, and what works is applied on its own: techniques go into every new script, the biggest look difference becomes a weekly test." />
      <AddForm />
      <div className="mt-5">
        {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0
          ? <Card><Empty icon={GraduationCap} title="Nothing studied yet">Paste the link of a Short or video whose animation or script you like.</Empty></Card>
          : <ul className="flex flex-col gap-4">{data.map((s) => <StudyCard key={s.id} s={s} />)}</ul>}
      </div>
    </Stagger>
  );
}
