/* eslint-disable @next/next/no-img-element */
"use client";

import { Binoculars, ExternalLink, TrendingDown } from "lucide-react";
import { useState } from "react";

import { Badge, Card, Empty, Meter } from "@/components/ui";
import { fmtCompact, fmtDayKey } from "@/lib/format";
import type { TwinReport, Twins } from "@/lib/growth";

/*
 * The twins study on the Growth page (owner, 2026-11-13): every night Gemini watches the most-watched
 * animated Shorts on our topics, and code compares them with ours. View only.
 */

const SHOWN: { key: string; label: string; kind: "s" | "%" | "n" }[] = [
  { key: "secPerShot", label: "Seconds per picture", kind: "s" },
  { key: "firstFigureSec", label: "First money figure at", kind: "s" },
  { key: "characterShare", label: "Character on screen", kind: "%" },
  { key: "figureShare", label: "Figure on screen", kind: "%" },
  { key: "wordsPerMin", label: "Words a minute", kind: "n" },
];

const fmt = (v: unknown, kind: "s" | "%" | "n") =>
  typeof v !== "number" ? "—" : kind === "%" ? `${Math.round(v * 100)}%` : kind === "s" ? `${Math.round(v * 10) / 10} s` : `${Math.round(v)}`;

function Thumb({ src, title }: { src?: string; title: string }) {
  const [broken, setBroken] = useState(false);
  return !src || broken ? <div aria-hidden className="aspect-video w-full bg-surface-3" /> : (
    <img src={src} alt={title} loading="lazy" onError={() => setBroken(true)} className="aspect-video w-full bg-surface-3 object-cover" />
  );
}

function TwinCard({ t }: { t: TwinReport["twinInfo"][number] }) {
  return (
    <li className="group relative min-w-0 overflow-hidden rounded-xl border border-ring bg-surface-2">
      <Thumb src={t.thumb} title={t.title ?? ""} />
      <div className="p-2.5">
        <a href={`https://www.youtube.com/shorts/${t.youtubeId}`} target="_blank" rel="noreferrer noopener"
          className="line-clamp-2 text-[12.5px] font-medium leading-snug after:absolute after:inset-0 hover:text-brand-text">{t.title ?? t.youtubeId}</a>
        <div className="mt-1 truncate text-[11.5px] text-muted">{t.channel ?? ""}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
          {t.views != null && <span className="font-medium tabular-nums">{fmtCompact(t.views)} views</span>}
          {t.outlier != null && t.outlier >= 2 && <Badge tone="good">{Math.round(t.outlier)}× its channel</Badge>}
        </div>
        {t.artStyle && <div className="mt-1 truncate text-[11px] text-muted">{t.artStyle}</div>}
      </div>
      <ExternalLink aria-hidden className="absolute right-2 top-2 size-3.5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
    </li>
  );
}

function Comparison({ r }: { r: TwinReport }) {
  const gapKeys = new Set(r.gaps.map((g) => g.key));
  const drop = r.atDrops[0];
  return (
    <div className="min-w-0">
      <ul className="grid grid-cols-3 gap-2.5">{r.twinInfo.slice(0, 3).map((t) => <TwinCard key={t.youtubeId} t={t} />)}</ul>
      <div className="mt-4 overflow-hidden rounded-xl border border-ring">
        <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] bg-surface-2 px-3.5 py-2 text-[11.5px] font-medium text-muted">
          <span>Measured by code</span><span className="text-right">Ours</span><span className="text-right">Winners</span>
        </div>
        <ul className="divide-y divide-line">
          {SHOWN.map((m) => {
            const differs = gapKeys.has(m.key);
            return (
              <li key={m.key} className={`grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center px-3.5 py-2 text-[13px] ${differs ? "bg-warning-soft/40" : ""}`}>
                <span className="flex min-w-0 items-center gap-1.5">{differs && <span aria-label="differs" className="size-1.5 shrink-0 rounded-full bg-warning" />}<span className="leading-snug">{m.label}</span></span>
                <span className="text-right tabular-nums">{fmt(r.ours[m.key], m.kind)}</span>
                <span className="text-right font-semibold tabular-nums">{fmt(r.twinsMedian[m.key], m.kind)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {drop && (
        <div className="mt-4 rounded-xl border border-critical/20 bg-critical-soft/60 p-3.5 text-[13px]">
          <div className="flex items-center gap-2 font-semibold"><TrendingDown aria-hidden className="size-4 text-critical-text" />At {drop.at} s we lost {Math.round(drop.drop * 100)}% of viewers</div>
          <p className="mt-1.5 text-ink2"><span className="font-medium text-ink">Ours: </span>{drop.ours}</p>
          <p className="mt-1 font-medium">The winners at the same second:</p>
          <ul className="mt-0.5 list-disc pl-5 text-ink2">{drop.twins.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export function WinnersCard({ twins }: { twins: Twins | null }) {
  const [pick, setPick] = useState(0);
  const cal = twins?.calibration;
  const reports = twins?.gaps ?? [];
  const r = reports[Math.min(pick, reports.length - 1)];
  const patterns = [...(twins?.model?.consistent ?? []).map((g) => ({ ...g, test: true })), ...(twins?.model?.leaning ?? []).map((g) => ({ ...g, test: false }))].slice(0, 5);
  return (
    <Card title="What the winners do" icon={Binoculars} accent="sky" className="mt-5"
      description="Every night Gemini watches the most-watched animated Shorts on our topics, and code compares them with ours. The writer reads them before writing; a pattern that keeps showing up becomes a weekly test. Nothing is copied."
      action={cal ? <Badge tone={cal.passed ? "good" : "warning"} dot>{cal.passed ? `Reads our Shorts correctly · ${cal.passedVideos} of ${cal.videos}` : `Calibrating · ${cal.passedVideos} of ${cal.videos} correct`}</Badge> : undefined}>
      {!twins ? <Empty icon={Binoculars} title="The first study runs tonight">Gemini first checks it reads 5 of our own Shorts correctly, then studies the winners.</Empty> : (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            {r ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2" role="tablist" aria-label="Our Shorts">
                  {reports.slice(0, 4).map((x, i) => (
                    <button key={x.videoId} role="tab" aria-selected={x === r} onClick={() => setPick(i)}
                      className={`max-w-full truncate rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors ${x === r ? "border-brand/40 bg-brand-soft font-medium text-brand-text" : "border-ring text-ink2 hover:bg-surface-3"}`}>
                      {x.title || x.videoId}
                    </button>
                  ))}
                </div>
                <p className="mb-3 text-[12.5px] text-muted">Our Short against the {r.twinInfo.length} most-watched animated Shorts on its topic · {fmtDayKey(r.writtenAt)}</p>
                <Comparison r={r} />
              </>
            ) : <Empty icon={Binoculars} title="No Short compared yet">Each Short is compared two days after it publishes, once its drop points are in.</Empty>}
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <div>
              <h3 className="text-[13.5px] font-semibold">Patterns across our Shorts</h3>
              <p className="mt-0.5 text-[12px] text-muted">{twins.model ? `From ${twins.model.reports} compared Shorts, last 30 days. In 8 or more, and 75% of them, it becomes a test.` : "Starts after the first comparisons."}</p>
              <ul className="mt-3 flex flex-col gap-3">
                {patterns.map((g) => (
                  <li key={`${g.key}-${g.direction}`}>
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="min-w-0 font-medium">{g.label.charAt(0).toUpperCase() + g.label.slice(1)}</span>
                      {g.test ? <Badge tone="brand">Becomes a test</Badge> : <span className="shrink-0 text-[11.5px] text-muted">{g.reports} of {g.of}</span>}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink2">Ours {g.oursMedian} · winners {g.twinsMedian}</div>
                    <div className="mt-1.5"><Meter value={g.share * 100} max={100} label={`${g.label}: share of our Shorts`} tone={g.test ? "brand" : "series"} /></div>
                  </li>
                ))}
                {!patterns.length && <li className="text-[13px] text-muted">No pattern yet.</li>}
              </ul>
            </div>
            <div>
              <h3 className="text-[13.5px] font-semibold">Studied for the next videos</h3>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-ring">
                {twins.briefs.slice(0, 5).map((b) => (
                  <li key={b.topicId} className="flex items-center gap-3 px-3.5 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[13px]">{b.title || b.topicId}</span>
                    <span className="shrink-0 text-[11.5px] text-muted">{b.twinInfo.length} winners</span>
                  </li>
                ))}
                {!twins.briefs.length && <li className="px-3.5 py-3 text-[13px] text-muted">None yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
