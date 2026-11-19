/* eslint-disable @next/next/no-img-element */
"use client";

import { AlertTriangle, RefreshCw, Sparkles, ThumbsDown, ThumbsUp, Minus, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Sparkline } from "@/components/charts";
import { type Accent, Delta, IconTile, Num, tabClass } from "@/components/ui";
import { fmtCompact, fmtDate, fmtRelative } from "@/lib/format";
import type { AiChannel, AiVideo } from "@/lib/studio-schema";

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------- tabs ----------------

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; icon: LucideIcon }[] }) {
  return (
    <div role="tablist" aria-label="Analytics sections" className="no-scrollbar scroll-fade-x -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1.5 md:mx-0 md:px-0">
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={on} type="button" onClick={() => onChange(t.value)} data-state={on ? "active" : "inactive"} className={tabClass}>
            <t.icon aria-hidden className={`size-4 ${on ? "text-brand" : ""}`} />{t.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- hero ----------------

/** The old chart-colour accents map onto the flat fills. */
const FILL: Record<string, Accent> = { "var(--c1)": "sky", "var(--c3)": "mint", "var(--c7)": "grape", "var(--c6)": "lime", "var(--c2)": "tang", "var(--c4)": "sun", "var(--c5)": "pink" };

/** Past this, a percentage stops meaning anything (the previous period was near zero): show the absolute change. */
const MAX_PCT = 500;
const PILL = { good: "bg-good-soft text-good-text", critical: "bg-critical-soft text-critical-text", neutral: "bg-surface-3 text-ink2", brand: "bg-brand-soft text-brand-text" } as const;

/**
 * The change badge for a KPI. With `now` and `prev` it decides itself: "New" when the previous
 * period had nothing, the absolute change ("+17.8K") when the percentage would be silly (> +500%
 * or a previous value too small to compare), else the percentage. With only `delta` it caps big
 * rises as "×N".
 */
function KpiDelta({ delta, now, prev, fmt, upIsGood = true }: { delta?: number | null; now?: number | null; prev?: number | null; fmt?: (n: number) => string; upIsGood?: boolean }) {
  const pill = (tone: keyof typeof PILL, text: string, title?: string) => (
    <span title={title} className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums ${PILL[tone]}`}>{text}</span>
  );
  if (now !== undefined && now !== null && prev !== undefined) {
    const diff = now - (prev ?? 0);
    const tone = (d: number): keyof typeof PILL => (d === 0 ? "neutral" : d > 0 === upIsGood ? "good" : "critical");
    const abs = (d: number) => `${d > 0 ? "+" : d < 0 ? "−" : ""}${(fmt ?? fmtCompact)(Math.abs(d))}`;
    if (prev === null || prev <= 0) {
      if (now > 0 && (prev === null || prev === 0)) return pill("brand", "New", "Nothing in the previous period");
      return diff === 0 ? null : pill(tone(diff), abs(diff), `${abs(diff)} against the previous period`);
    }
    const p = (diff / prev) * 100;
    if (p > MAX_PCT || prev < 5) return pill(tone(diff), abs(diff), `${abs(diff)} against the previous period (${fmtCompact(prev)} before)`);
    return <Delta value={p} upIsGood={upIsGood} />;
  }
  if (delta === undefined || delta === null) return null;
  if (delta > MAX_PCT) return pill(upIsGood ? "good" : "critical", `${(1 + delta / 100).toFixed(0)}×`, `+${delta.toFixed(0)}% against the previous period`);
  return <Delta value={delta} upIsGood={upIsGood} />;
}

export function HeroStat({ label, value, fmt, delta, prev, upIsGood = true, spark, sub, live, icon: Icon, accent = "var(--c1)" }: {
  label: string; value: number | null; fmt: (n: number) => string; delta?: number | null;
  /** the previous period's value: lets the badge show "New" or "+17.8K" instead of a silly percentage */
  prev?: number | null;
  upIsGood?: boolean; spark?: number[]; sub?: React.ReactNode; live?: boolean; icon?: LucideIcon; accent?: string;
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.32, ease: EASE }}
      className="panel relative min-w-0 overflow-hidden bg-surface p-5">
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0"><Sparkline values={spark} height={44} color={accent} /></div>
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[13px] font-medium text-ink2">
            {live ? <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-good" /></span>
              : Icon && <IconTile icon={Icon} accent={FILL[accent] ?? "sky"} size="sm" />}
            {label}
          </span>
          {prev !== undefined ? <KpiDelta now={value} prev={prev} fmt={fmt} upIsGood={upIsGood} /> : delta !== undefined && <KpiDelta delta={delta} upIsGood={upIsGood} />}
        </div>
        <div className="mt-3.5 text-[30px] font-semibold leading-none tracking-[-0.03em] md:text-[32px]">
          {value === null ? <span className="text-muted">—</span> : <Num value={value} fmt={fmt} />}
        </div>
        {sub && <div className="mt-2 text-[12.5px] text-muted">{sub}</div>}
        <div className="h-10" />
      </div>
    </motion.div>
  );
}

/** A small number row under the hero: label, value, change. */
export function MiniStat({ label, value, delta, now, prev, fmt, upIsGood = true, hint }: {
  label: string; value: React.ReactNode; delta?: number | null;
  /** the raw value now and in the previous period: the badge then shows "New" or the absolute change when a percentage would be silly */
  now?: number | null; prev?: number | null; fmt?: (n: number) => string;
  upIsGood?: boolean; hint?: string;
}) {
  return (
    <div className="panel min-w-0 bg-surface px-4 py-3.5" title={hint}>
      <div className="truncate text-[12px] text-muted">{label}</div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate text-[18px] font-semibold tabular-nums tracking-tight">{value}</span>
        {prev !== undefined ? <KpiDelta now={now} prev={prev} fmt={fmt} upIsGood={upIsGood} /> : delta !== undefined && <KpiDelta delta={delta} upIsGood={upIsGood} />}
      </div>
    </div>
  );
}

// ---------------- AI ----------------

const VERDICT = {
  hit: { label: "Hit", icon: ThumbsUp, cls: "bg-tint-green" },
  okay: { label: "Okay", icon: Minus, cls: "bg-tint-amber" },
  miss: { label: "Miss", icon: ThumbsDown, cls: "bg-tint-red" },
} as const;

export function VerdictBadge({ verdict, size = "sm" }: { verdict: "hit" | "okay" | "miss"; size?: "sm" | "lg" }) {
  const v = VERDICT[verdict];
  return (
    <span className={`inline-flex items-center gap-1 border border-ring font-semibold text-ink ${v.cls} ${size === "lg" ? "px-3 py-1 text-sm" : "px-1.5 py-px text-[11px]"} rounded-lg`}>
      <v.icon aria-hidden className={size === "lg" ? "size-4" : "size-3"} />{v.label}
    </span>
  );
}

export function AiTag({ at }: { at?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-soft px-2 py-0.5 text-[11px] font-medium text-violet-text">
      <Sparkles aria-hidden className="size-3" />AI analysis{at ? <span className="font-normal opacity-80"> · {fmtRelative(at)}</span> : null}
    </span>
  );
}

type Ev = { text: string; tab: string | null };
function EvidenceList({ items, onJump, tone }: { items: Ev[]; onJump?: (tab: string) => void; tone: "good" | "critical" | "info" }) {
  const dot = tone === "good" ? "bg-tint-green" : tone === "critical" ? "bg-tint-red" : "bg-tint-blue";
  return (
    <ul className="space-y-2">
      {items.map((e, i) => (
        <li key={i} className="flex gap-2 text-[13px] font-medium leading-snug text-ink">
          <span aria-hidden className={`mt-1 size-2.5 shrink-0 border border-ring ${dot} rounded-lg`} />
          <span className="min-w-0">
            {e.text}
            {e.tab && onJump && <button type="button" onClick={() => onJump(e.tab!)} className="ml-1.5 bg-surface px-1.5 text-[11px] font-semibold text-ink hover:bg-tint-brand rounded-md">see chart →</button>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** AI text older than this is flagged stale: the auditor writes nightly, so two days means it missed runs. */
const STALE_MS = 2 * 86_400_000;
const isStale = (at?: string) => !!at && Date.now() - Date.parse(at) > STALE_MS;

function StaleBadge({ at }: { at?: string }) {
  if (!isStale(at)) return null;
  const days = Math.floor((Date.now() - Date.parse(at!)) / 86_400_000);
  return (
    <span title={`Written ${days} days ago; the nightly auditor normally rewrites it every night`} className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-text">
      <AlertTriangle aria-hidden className="size-3" />Stale · {days} d
    </span>
  );
}

/**
 * The analysis is written by the auditor, a nightly Claude Code routine (agents/auditor.md), not a
 * GitHub workflow, so the dashboard cannot start it on demand. The button says so instead of pretending.
 */
export function AiRefresh({ at }: { at?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex flex-col items-end">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-ring bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink hover:bg-tint-brand">
        <RefreshCw aria-hidden className="size-3" />Refresh
      </button>
      {open && (
        <span role="status" className="mt-1.5 max-w-64 rounded-lg border border-ring bg-surface p-2 text-right text-[11.5px] font-medium leading-snug text-ink2 shadow-sm">
          Refreshes tonight at 23:00 IST with the auditor{at ? ` (last written ${fmtRelative(at)})` : ""}. It runs as a nightly routine, so it can&apos;t be started from here.
        </span>
      )}
    </span>
  );
}

/** The auditor's three moves, on their own (the overview lays them out full width under the analysis). */
export function AiDoNext({ ai }: { ai: AiChannel | null }) {
  if (!ai?.recommendations.length) return null;
  return (
    <section className="panel bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2"><h4 className="eyebrow text-ink">Do next</h4><AiTag at={ai.writtenAt} /><StaleBadge at={ai.writtenAt} /></div>
      <ol className="grid gap-3 md:grid-cols-3">
        {ai.recommendations.map((r, i) => (
          <li key={i} className="panel-sm bg-tint-brand p-3">
            <div className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{i + 1}</span><span className="text-[13.5px] font-semibold leading-snug">{r.do}</span></div>
            <p className="mt-1.5 pl-8 text-xs font-medium text-muted">{r.because}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The auditor's channel analysis: headline, what works, what doesn't, audience, three moves (`recs={false}` leaves the moves to AiDoNext). */
export function AiChannelCard({ ai, onJump, compact, recs = true, className = "" }: { ai: AiChannel | null; onJump?: (tab: string) => void; compact?: boolean; recs?: boolean; className?: string }) {
  if (!ai) {
    return (
      <div className={`pattern-empty border border-dashed border-ring p-5 text-sm font-medium text-ink2 ${className}`}>
        <AiTag /> <p className="mt-2">The first AI analysis is written by the nightly auditor once the deep stats have run. It reads every number on this page and the comments, then says what to change.</p>
      </div>
    );
  }
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
      className={`panel relative overflow-hidden bg-surface ${className}`}>
      <div className="hero-glow border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="flex flex-wrap items-center gap-2"><AiTag at={ai.writtenAt} /><StaleBadge at={ai.writtenAt} /></span>
          <AiRefresh at={ai.writtenAt} />
        </div>
        <h3 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-[-0.01em]">{ai.headline}</h3>
      </div>
      <div className="relative p-5">
        <div className={`mt-4 grid gap-5 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          <div><h4 className="eyebrow mb-3 inline-block bg-tint-green px-1.5 text-ink rounded-md">Working</h4><EvidenceList items={ai.working} onJump={onJump} tone="good" /></div>
          <div><h4 className="eyebrow mb-3 inline-block bg-tint-red px-1.5 text-ink rounded-md">Not working</h4><EvidenceList items={ai.notWorking} onJump={onJump} tone="critical" /></div>
          {!compact && <div><h4 className="eyebrow mb-3 inline-block bg-tint-blue px-1.5 text-ink rounded-md">Audience</h4><EvidenceList items={ai.audience} onJump={onJump} tone="info" /></div>}
        </div>
        {recs && ai.recommendations.length > 0 && (
          <div className="mt-6 border-t border-ring pt-5">
            <h4 className="eyebrow mb-3 text-ink">Do next</h4>
            <ol className="grid gap-3 md:grid-cols-3">
              {ai.recommendations.map((r, i) => (
                <li key={i} className="panel-sm bg-tint-brand p-3">
                  <div className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{i + 1}</span><span className="text-[13.5px] font-semibold leading-snug">{r.do}</span></div>
                  <p className="mt-1.5 pl-8 text-xs font-medium text-muted">{r.because}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/** One video's verdict: badge, headline, why (with numbers), what viewers said, what to change. */
export function AiVideoCard({ ai, title, thumbnailUrl, href }: { ai: AiVideo; title?: string; thumbnailUrl?: string; href?: string }) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-16 w-9 shrink-0 border border-ring object-cover rounded-lg" loading="lazy" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><VerdictBadge verdict={ai.verdict} /><AiTag at={ai.writtenAt} /><StaleBadge at={ai.writtenAt} /></div>
          {title && <div className="mt-1 truncate text-xs text-muted">{title}</div>}
          <p className="mt-1.5 text-[14.5px] font-semibold leading-snug">{ai.headline}</p>
        </div>
      </div>
      {ai.why.length > 0 && <div className="mt-3"><EvidenceList items={ai.why} tone={ai.verdict === "miss" ? "critical" : ai.verdict === "hit" ? "good" : "info"} /></div>}
      {ai.viewersSaid.length > 0 && (
        <div className="mt-3 border border-dashed border-ring bg-wash p-2.5 text-xs font-medium text-ink2"><span className="font-semibold text-ink">Viewers said: </span>{ai.viewersSaid.join(" · ")}</div>
      )}
      {ai.next && <p className="mt-3 text-[13px]"><span className="font-semibold text-ink font-semibold">Next time: </span>{ai.next}</p>}
    </>
  );
  const cls = "panel block bg-surface p-4";
  return href ? <Link href={href} className={`${cls} hover-raise`}>{body}</Link> : <div className={cls}>{body}</div>;
}

/** Placeholder while a part of the data hasn't arrived: says when it will. */
export function Waiting({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="pattern-empty flex flex-col items-center justify-center border border-dashed border-ring px-6 py-10 text-center">
      <span className="panel-sm grid size-12 place-items-center bg-tint-amber text-ink"><Icon aria-hidden className="size-5" /></span>
      <p className="mt-3.5 text-[14px] font-semibold">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] font-medium text-ink2">{children}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function StudioSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}

export { fmtDate };
