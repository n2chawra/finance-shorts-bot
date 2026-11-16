"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Gauge, Info } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Card, IconTile, Num, Tip, type Tone } from "@/components/ui";
import { type Band, type MetricDef, METRICS, bandOf, summarize } from "@/lib/scorecard";
import type { Scorecard } from "@/lib/scorecard";

/*
 * The daily scorecard's pieces (owner, 2026-11-16): four numbers that decide whether YouTube shows a Short
 * past its first test audience, each against its target, used on /scorecard and on the Overview.
 */

export const BAND_TONE: Record<Band, Tone> = { good: "good", close: "warning", off: "critical" };
export const BAND_LABEL: Record<Band, string> = { good: "On target", close: "Close", off: "Off target" };
export const BAND_PILL: Record<Band, string> = {
  good: "bg-good-soft text-good-text", close: "bg-warning-soft text-warning-text", off: "bg-critical-soft text-critical-text",
};
const BAND_DOT: Record<Band, string> = { good: "bg-good", close: "bg-warning", off: "bg-critical" };
const ease = [0.16, 1, 0.3, 1] as const;

export function BandPill({ band, children }: { band: Band | null; children?: React.ReactNode }) {
  if (!band) return <span className="inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-[11.5px] font-medium text-muted">Waiting</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${BAND_PILL[band]}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${BAND_DOT[band]}`} />{children ?? BAND_LABEL[band]}
    </span>
  );
}

/** A track with the off / close / good zones, the target line and where the value sits. */
export function MetricGauge({ m, value, tall }: { m: MetricDef; value: number | null; tall?: boolean }) {
  const pos = (v: number) => `${Math.max(0, Math.min(100, (v / m.max) * 100))}%`;
  const lo = Math.min(m.good, m.close), hi = Math.max(m.good, m.close);
  const zones: { from: number; to: number; band: Band }[] = m.higherIsBetter
    ? [{ from: 0, to: lo, band: "off" }, { from: lo, to: hi, band: "close" }, { from: hi, to: m.max, band: "good" }]
    : [{ from: 0, to: lo, band: "good" }, { from: lo, to: hi, band: "close" }, { from: hi, to: m.max, band: "off" }];
  const band = bandOf(m, value);
  return (
    <div className={`relative ${tall ? "h-7" : "h-5"}`} role="img" aria-label={`${m.label}: ${value == null ? "no data yet" : m.format(value)}, target ${m.target}`}>
      <div className={`absolute inset-x-0 top-1/2 flex -translate-y-1/2 overflow-hidden rounded-full ${tall ? "h-2.5" : "h-2"}`}>
        {zones.map((z) => (
          <span key={z.band} className={`h-full ${z.band === "good" ? "bg-good/25" : z.band === "close" ? "bg-warning/25" : "bg-critical/20"}`}
            style={{ width: `${((z.to - z.from) / m.max) * 100}%` }} />
        ))}
      </div>
      <span aria-hidden className="absolute top-0 h-full w-0.5 -translate-x-1/2 rounded-full bg-ink/70" style={{ left: pos(m.good) }} />
      {m.stretch && <span aria-hidden className="absolute top-1 h-[calc(100%-8px)] w-px -translate-x-1/2 border-l border-dashed border-ink2/50" style={{ left: pos(m.stretch.at) }} />}
      {value != null && (
        <motion.span aria-hidden className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" initial={{ left: "0%" }} animate={{ left: pos(value) }} transition={{ duration: 0.9, ease }}>
          <span className={`block rounded-full border-[3px] border-surface shadow-lift ${tall ? "size-[18px]" : "size-3.5"} ${band ? BAND_DOT[band] : "bg-muted"}`} />
        </motion.span>
      )}
    </div>
  );
}

/** "+6 pts" against the Shorts before the reset, green when it moved the right way. */
export function PointsDelta({ m, now, before, label = "vs before" }: { m: MetricDef; now: number | null; before: number | null; label?: string }) {
  if (now == null || before == null) return null;
  const pts = Math.round((now - before) * 100);
  const better = m.higherIsBetter ? pts > 0 : pts < 0;
  const tone = pts === 0 ? "text-muted" : better ? "text-good-text" : "text-critical-text";
  const Icon = pts >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[12px] font-medium tabular-nums ${tone}`}>
      <Icon aria-hidden className="size-3.5" />{pts > 0 ? "+" : ""}{pts} pts{label && <span className="font-normal text-muted">&nbsp;{label}</span>}
    </span>
  );
}

/** Each Short's value as a small square, oldest to newest, coloured by its band. */
function Trail({ m, trail }: { m: MetricDef; trail: { id: string; v: number | null }[] }) {
  const shown = trail.slice(-24);
  return (
    <div className="flex items-end gap-[3px]" aria-hidden>
      {shown.map((t) => {
        const band = bandOf(m, t.v);
        const h = t.v == null ? 6 : 6 + Math.max(0, Math.min(1, t.v / m.max)) * 18;
        return <span key={t.id} title={`${t.id}: ${t.v == null ? "no data yet" : m.format(t.v)}`}
          className={`w-[7px] shrink-0 rounded-[2px] ${band ? BAND_DOT[band] : "border border-dashed border-ring-strong"} ${band ? "opacity-85" : ""}`} style={{ height: h }} />;
      })}
    </div>
  );
}

/** One of the four numbers: its median, its band, the gauge, its target and how it moved. */
export function MetricTile({ m, value, before, trail, n }: { m: MetricDef; value: number | null; before: number | null; trail: { id: string; v: number | null }[]; n: number }) {
  const band = bandOf(m, value);
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      className={`panel relative flex min-w-0 flex-col overflow-hidden bg-surface p-5 ${band === "off" ? "ring-1 ring-inset ring-critical/25" : ""}`}>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${band ? BAND_DOT[band] : "bg-surface-3"}`} />
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 text-[13px] font-medium leading-tight text-ink2">
          <span>{m.label}</span>
          <Tip label={<span className="block max-w-[260px]"><b>{m.what}.</b><br />When it is red: {m.fix.charAt(0).toLowerCase() + m.fix.slice(1)}.</span>}>
            <button type="button" aria-label={`What ${m.label} means`} className="grid size-5 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-3 hover:text-ink"><Info aria-hidden className="size-3.5" /></button>
          </Tip>
        </span>
        <span className="shrink-0 whitespace-nowrap"><BandPill band={band} /></span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[34px] font-semibold leading-none tracking-[-0.03em]">
          {value == null ? <span className="text-muted">—</span> : <Num value={value} fmt={m.format} />}
        </span>
        <span className="text-[12.5px] text-muted">median of {n} Short{n === 1 ? "" : "s"}</span>
      </div>
      <div className="mt-4"><MetricGauge m={m} value={value} tall /></div>
      <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-muted">
        <span>Target <span className="font-medium text-ink2">{m.target}</span></span>
        {m.stretch && <span>{m.stretch.label}</span>}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3.5">
        <PointsDelta m={m} now={value} before={before} label="vs before" />
        <Trail m={m} trail={trail} />
      </div>
    </motion.div>
  );
}

/** The scorecard in one card for the Overview: the verdict and the four numbers, compact. */
export function ScorecardStrip({ data }: { data: Scorecard }) {
  const s = summarize(data.shorts, data.resetDay, 7);
  const v = s.verdict;
  return (
    <Card title="Daily scorecard" icon={Gauge} accent="sky" className="mt-5"
      description={<>Is it working? Shorts of the last 7 days against what YouTube needs to show them to more people. <span className={v.tone === "good" ? "text-good-text" : v.tone === "critical" ? "text-critical-text" : v.tone === "warning" ? "text-warning-text" : ""}>{v.line}</span></>}
      action={
        <Link href="/scorecard" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink2 hover:bg-surface-3 hover:text-ink">
          Open scorecard <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      }>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map((m) => {
          const value = s.now.medians[m.key];
          const band = bandOf(m, value);
          return (
            <Link key={m.key} href="/scorecard" className="hover-raise group rounded-xl border border-ring bg-surface-2 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-ink2">{m.label}</span>
                <span aria-hidden className={`size-2 shrink-0 rounded-full ${band ? BAND_DOT[band] : "bg-ring-strong"}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value == null ? <span className="text-muted">—</span> : m.format(value)}</span>
                <PointsDelta m={m} now={value} before={s.before.medians[m.key]} label="" />
              </div>
              <div className="mt-2.5"><MetricGauge m={m} value={value} /></div>
              <div className="mt-1 text-[11px] text-muted">Target {m.target}</div>
            </Link>
          );
        })}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink2">
        <span className="flex items-center gap-2"><IconTile icon={ArrowUpRight} accent={s.pastCeiling ? "mint" : "surface"} size="sm" />
          <span><b className="tabular-nums">{s.pastCeiling}</b> of {s.recent.length} Shorts past the 1.2K ceiling this week</span></span>
        <span className="text-muted">{s.measured} of {s.recent.length} have YouTube&apos;s numbers yet (about two days after upload)</span>
      </div>
    </Card>
  );
}

