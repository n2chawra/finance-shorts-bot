"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Tip } from "./ui";

export type Point = { label: string; value: number };

function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Round ticks from 0 to just above max (at most ~4 intervals). */
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const mag = 10 ** Math.floor(Math.log10(max));
  const step = [0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => max / s <= 4) ?? mag * 10;
  const out: number[] = [];
  for (let v = 0; v < max + step - 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

const PAD = { top: 10, right: 8, bottom: 24, left: 40 };

function ChartTooltip({ x, y, width, label, value }: { x: number; y: number; width: number; label: string; value: string }) {
  const left = Math.min(Math.max(x, 64), width - 64);
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-ring bg-surface px-2.5 py-1.5 text-xs shadow-lift"
      style={{ left, top: Math.max(y - 10, 36) }}>
      <div className="text-muted">{label}</div>
      <div className="mt-0.5 font-medium tabular-nums text-ink">{value}</div>
    </div>
  );
}

function Axes({ w, h, ticks, y, fmt }: { w: number; h: number; ticks: number[]; y: (v: number) => number; fmt: (n: number) => string }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} strokeDasharray={t === 0 ? undefined : "3 3"} />
          <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--muted)" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(t)}</text>
        </g>
      ))}
      <line x1={PAD.left} x2={w - PAD.right} y1={h - PAD.bottom} y2={h - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />
    </>
  );
}

/** Single-series area over time with a crosshair tooltip. */
export function LineChart({ data, height = 220, fmt, fmtFull = fmt, color = "var(--series)" }: {
  data: Point[]; height?: number; fmt: (n: number) => string; fmtFull?: (n: number) => string; color?: string;
}) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1];
  const innerW = Math.max(w - PAD.left - PAD.right, 1);
  const x = (i: number) => PAD.left + (data.length > 1 ? (innerW * i) / (data.length - 1) : innerW / 2);
  const y = (v: number) => PAD.top + (height - PAD.top - PAD.bottom) * (1 - v / top);
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 64))));
  const gradId = `area${useId().replace(/:/g, "")}`;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left - PAD.left) / innerW) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };
  return (
    <div ref={ref} className="relative w-full touch-pan-y select-none" style={{ height }}>
      {w > 0 && data.length > 0 && (
        <svg width={w} height={height} role="img" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
          <Axes w={w} h={height} ticks={ticks} y={y} fmt={fmt} />
          {data.map((d, i) => (i % every === 0 || i === data.length - 1) && (i === data.length - 1 || data.length - 1 - i >= every * 0.6) && (
            <text key={d.label + i} x={x(i)} y={height - 6} textAnchor={i === data.length - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize={11} fill="var(--muted)">{d.label}</text>
          ))}
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path key={`a${data.length}`} d={`${line} L${x(data.length - 1)},${height - PAD.bottom} L${x(0)},${height - PAD.bottom} Z`} fill={`url(#${gradId})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }} />
          <motion.path key={`l${data.length}`} d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--ring-strong)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={4.5} fill={color} stroke="var(--surface)" strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && <ChartTooltip x={x(hover)} y={y(data[hover].value)} width={w} label={data[hover].label} value={fmtFull(data[hover].value)} />}
    </div>
  );
}
export const AreaChart = LineChart;

/** Tiny trend line for a KPI card: no axes, no labels. */
export function Sparkline({ values, height = 36, color = "var(--series)" }: { values: number[]; height?: number; color?: string }) {
  const [ref, w] = useWidth();
  const gradId = `spark${useId().replace(/:/g, "")}`;
  const max = Math.max(...values, 1);
  const x = (i: number) => (values.length > 1 ? (w * i) / (values.length - 1) : w / 2);
  const y = (v: number) => 2 + (height - 4) * (1 - v / max);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <div ref={ref} aria-hidden className="w-full" style={{ height }}>
      {w > 0 && values.length > 1 && (
        <svg width={w} height={height}>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${height} L0,${height} Z`} fill={`url(#${gradId})`} />
          <motion.path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
        </svg>
      )}
    </div>
  );
}

/** Vertical bars for a handful of categories. The tallest bar is labelled; the rest are on hover. */
export function BarChart({ data, height = 220, fmt, fmtFull = fmt }: { data: Point[]; height?: number; fmt: (n: number) => string; fmtFull?: (n: number) => string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const innerW = Math.max(w - PAD.left - PAD.right, 1);
  const band = innerW / Math.max(data.length, 1);
  const bw = Math.min(40, band - 6);
  const base = height - PAD.bottom;
  const y = (v: number) => PAD.top + (base - PAD.top) * (1 - v / top);
  const best = data.findIndex((d) => d.value === max);
  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" onPointerLeave={() => setHover(null)}>
          <Axes w={w} h={height} ticks={ticks} y={y} fmt={fmt} />
          {data.map((d, i) => {
            const cx = PAD.left + band * (i + 0.5);
            const h = Math.max(base - y(d.value), d.value > 0 ? 2 : 0);
            const r = Math.min(4, h, bw / 2);
            const path = `M${cx - bw / 2},${base} V${base - h + r} Q${cx - bw / 2},${base - h} ${cx - bw / 2 + r},${base - h} H${cx + bw / 2 - r} Q${cx + bw / 2},${base - h} ${cx + bw / 2},${base - h + r} V${base} Z`;
            return (
              <g key={d.label} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={base - PAD.top} fill={hover === i ? "var(--wash)" : "transparent"} />
                <motion.path d={path} fill="var(--series)" style={{ transformOrigin: `${cx}px ${base}px` }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1, opacity: hover === null || hover === i ? 1 : 0.5 }}
                  transition={{ scaleY: { duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.15 } }} />
                {i === best && hover === null && d.value > 0 && (
                  <text x={cx} y={base - h - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ink)" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(d.value)}</text>
                )}
                <text x={cx} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--muted)">{d.label}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && w > 0 && <ChartTooltip x={PAD.left + band * (hover + 0.5)} y={y(data[hover].value)} width={w} label={data[hover].label} value={fmtFull(data[hover].value)} />}
    </div>
  );
}

/** Ranked horizontal bars: label, bar, value. Text stays in ink; the bar carries the magnitude. */
export function BarList({ rows, fmt, scaleMax }: { rows: { key: string; label: string; value: number; sub?: string; href?: string }[]; fmt: (n: number) => string; scaleMax?: number }) {
  const max = Math.max(scaleMax ?? 0, ...rows.map((r) => r.value), 1);   // scaleMax lets two lists share one scale
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((r, i) => (
        <li key={r.key} className="relative flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px]">
          <motion.span aria-hidden className="absolute inset-y-0 left-0 rounded-md bg-series-soft" style={{ background: "var(--series-soft)" }}
            initial={{ width: 0 }} animate={{ width: `${Math.max((r.value / max) * 100, 1.5)}%` }} transition={{ duration: 0.7, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }} />
          <span className="relative min-w-0 truncate">
            {r.href ? <Link href={r.href} className="hover:underline">{r.label}</Link> : r.label}
            {r.sub && <span className="ml-2 text-xs text-muted">{r.sub}</span>}
          </span>
          <span className="relative shrink-0 font-medium tabular-nums">{fmt(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export type TrackerTone = "good" | "warning" | "critical" | "empty";
const TRACK: Record<TrackerTone, string> = { good: "bg-good", warning: "bg-warning", critical: "bg-critical", empty: "bg-wash-2" };

/** A row of day blocks coloured by outcome (Tremor-style tracker). Every block has a tooltip. */
export function Tracker({ items, height = 32 }: { items: { key: string; tone: TrackerTone; tip: React.ReactNode }[]; height?: number }) {
  return (
    <div className="flex w-full gap-[3px]" style={{ height }}>
      {items.map((it, i) => (
        <Tip key={it.key} label={it.tip}>
          <motion.span tabIndex={0} aria-label={typeof it.tip === "string" ? it.tip : undefined}
            className={`h-full flex-1 rounded-[3px] outline-offset-1 transition-opacity hover:opacity-75 ${TRACK[it.tone]}`}
            initial={{ scaleY: 0.2, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.02 }} />
        </Tip>
      ))}
    </div>
  );
}

/** One bar split into parts, with a legend underneath. */
export function CategoryBar({ parts }: { parts: { key: string; label: string; value: number; className: string; href?: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const shown = parts.filter((p) => p.value > 0);
  return (
    <div>
      <div className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full bg-wash-2">
        {shown.map((p, i) => (
          <motion.span key={p.key} className={`h-full ${p.className}`} initial={{ width: 0 }} animate={{ width: `${(p.value / total) * 100}%` }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
        {parts.map((p) => {
          const inner = (
            <>
              <span aria-hidden className={`size-2 rounded-[2px] ${p.className}`} />
              <span className="text-ink2">{p.label}</span>
              <span className="font-medium tabular-nums">{p.value}</span>
            </>
          );
          return <li key={p.key}>{p.href ? <Link href={p.href} className="flex items-center gap-1.5 hover:underline">{inner}</Link> : <span className="flex items-center gap-1.5">{inner}</span>}</li>;
        })}
      </ul>
    </div>
  );
}

/** The same numbers as a table, for readers who prefer or need one. */
export function DataTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <details className="group mt-3 text-sm">
      <summary className="cursor-pointer list-none text-xs text-muted hover:text-ink2">
        <span className="group-open:hidden">Show as table</span><span className="hidden group-open:inline">Hide table</span>
      </summary>
      <table className="mt-2 w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line text-muted"><th className="py-1.5 font-medium">{head[0]}</th><th className="py-1.5 text-right font-medium">{head[1]}</th></tr>
        </thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={a + i} className="border-b border-line last:border-0"><td className="py-1.5">{a}</td><td className="py-1.5 text-right tabular-nums">{b}</td></tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
