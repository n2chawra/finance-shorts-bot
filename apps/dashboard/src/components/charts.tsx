"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Tip } from "./ui";

export type Point = { label: string; value: number; estimated?: boolean };

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

const PAD = { top: 12, right: 8, bottom: 26, left: 44 };

function ChartTooltip({ x, y, width, label, value, detail }: { x: number; y: number; width: number; label: string; value: string; detail?: React.ReactNode }) {
  const left = Math.min(Math.max(x, 64), width - 64);
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border-2 border-edge bg-ink px-2.5 py-1.5 text-xs text-plane shadow-[3px_3px_0_0_var(--lime)]"
      style={{ left, top: Math.max(y - 12, 36) }}>
      <div className="nb-label !text-[10px] text-lime">{label}</div>
      <div className="mt-0.5 font-display text-base tabular-nums">{value}</div>
      {detail}
    </div>
  );
}

function Axes({ w, h, ticks, y, fmt }: { w: number; h: number; ticks: number[]; y: (v: number) => number; fmt: (n: number) => string }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1.5} strokeDasharray={t === 0 ? undefined : "2 5"} />
          <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={10.5} fontWeight={700} fill="var(--muted)" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)" }}>{fmt(t)}</text>
        </g>
      ))}
      <line x1={PAD.left} x2={w - PAD.right} y1={h - PAD.bottom} y2={h - PAD.bottom} stroke="var(--axis)" strokeWidth={2.5} />
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={h - PAD.bottom} stroke="var(--axis)" strokeWidth={2.5} />
    </>
  );
}

/** Single-series area over time with a crosshair tooltip. */
export function LineChart({ data, height = 220, fmt, fmtFull = fmt, color = "var(--series)", detail }: {
  data: Point[]; height?: number; fmt: (n: number) => string; fmtFull?: (n: number) => string; color?: string;
  /** more for the tooltip of point i (e.g. the videos published that day) */
  detail?: (i: number) => React.ReactNode;
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
  const est = data.findIndex((d) => d.estimated);
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
            <text key={d.label + i} x={x(i)} y={height - 6} textAnchor={i === data.length - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize={10.5} fontWeight={700} fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>{d.label}</text>
          ))}
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.28} />
            </linearGradient>
          </defs>
          <motion.path key={`a${data.length}`} d={`${line} L${x(data.length - 1)},${height - PAD.bottom} L${x(0)},${height - PAD.bottom} Z`} fill={`url(#${gradId})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }} />
          <motion.path key={`l${data.length}`} d={line} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="miter" strokeLinecap="square"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          {/* days YouTube Analytics hasn't reached yet: shaded, the line dashed (estimated from live counts) */}
          {est >= 0 && <>
            <rect x={x(Math.max(0, est - 0.5))} y={PAD.top} width={x(data.length - 1) - x(Math.max(0, est - 0.5))} height={height - PAD.top - PAD.bottom}
              fill="var(--ring)" opacity={0.25} />
            <path d={data.slice(Math.max(0, est - 1)).map((d, j) => `${j ? "L" : "M"}${x(Math.max(0, est - 1) + j)},${y(d.value)}`).join(" ")}
              fill="none" stroke="var(--surface)" strokeWidth={2.5} strokeDasharray="4 4" />
          </>}
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--ink)" strokeWidth={2} strokeDasharray="4 3" />
              <rect x={x(hover) - 6} y={y(data[hover].value) - 6} width={12} height={12} fill="var(--lime)" stroke="var(--edge)" strokeWidth={2.5} />
            </>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && <ChartTooltip x={x(hover)} y={y(data[hover].value)} width={w} label={data[hover].estimated ? `${data[hover].label} (est.)` : data[hover].label} value={fmtFull(data[hover].value)} detail={detail?.(hover)} />}
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
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0.22} />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${height} L0,${height} Z`} fill={`url(#${gradId})`} />
          <motion.path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="miter" strokeLinecap="square"
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
            const path = `M${cx - bw / 2},${base} V${base - h} H${cx + bw / 2} V${base} Z`;
            return (
              <g key={d.label} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={base - PAD.top} fill={hover === i ? "var(--wash)" : "transparent"} />
                <motion.path d={path} fill={i === best ? "var(--lime)" : "var(--sky)"} stroke="var(--edge)" strokeWidth={2} style={{ transformOrigin: `${cx}px ${base}px` }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1, opacity: hover === null || hover === i ? 1 : 0.5 }}
                  transition={{ scaleY: { duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.15 } }} />
                {i === best && hover === null && d.value > 0 && (
                  <text x={cx} y={base - h - 7} textAnchor="middle" fontSize={12} fill="var(--ink)" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)" }}>{fmt(d.value)}</text>
                )}
                <text x={cx} y={height - 6} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>{d.label}</text>
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
    <ul className="flex flex-col gap-1.5">
      {rows.map((r, i) => (
        <li key={r.key} className="relative flex items-center justify-between gap-3 border-2 border-edge bg-surface px-2 py-1.5 text-[13px] font-semibold">
          <motion.span aria-hidden className={`absolute inset-y-0 left-0 border-r-2 border-edge ${i === 0 ? "bg-lime" : "bg-sky"} opacity-70`}
            initial={{ width: 0 }} animate={{ width: `${Math.max((r.value / max) * 100, 1.5)}%` }} transition={{ duration: 0.7, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }} />
          <span className="relative min-w-0 truncate">
            {r.href ? <Link href={r.href} className="hover:underline">{r.label}</Link> : r.label}
            {r.sub && <span className="ml-2 text-xs text-muted">{r.sub}</span>}
          </span>
          <span className="relative shrink-0 font-mono font-bold tabular-nums">{fmt(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export type TrackerTone = "good" | "warning" | "critical" | "empty";
const TRACK: Record<TrackerTone, string> = { good: "bg-mint", warning: "bg-sun", critical: "bg-red", empty: "bg-surface nb-stripes" };

/** A row of day blocks coloured by outcome (Tremor-style tracker). Every block has a tooltip. */
export function Tracker({ items, height = 32 }: { items: { key: string; tone: TrackerTone; tip: React.ReactNode }[]; height?: number }) {
  return (
    <div className="flex w-full gap-1" style={{ height }}>
      {items.map((it, i) => (
        <Tip key={it.key} label={it.tip}>
          <motion.span tabIndex={0} aria-label={typeof it.tip === "string" ? it.tip : undefined}
            className={`h-full flex-1 border-2 border-edge outline-offset-2 transition-transform hover:-translate-y-1 ${TRACK[it.tone]}`}
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
      <div className="nb-stripes flex h-6 w-full overflow-hidden border-2 border-edge bg-surface">
        {shown.map((p, i) => (
          <motion.span key={p.key} className={`h-full border-r-2 border-edge last:border-r-0 ${p.className}`} initial={{ width: 0 }} animate={{ width: `${(p.value / total) * 100}%` }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
        {parts.map((p) => {
          const inner = (
            <>
              <span aria-hidden className={`size-3 border-2 border-edge ${p.className}`} />
              <span className="font-medium text-ink2">{p.label}</span>
              <span className="font-mono font-bold tabular-nums">{p.value}</span>
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
      <summary className="nb-label inline-block cursor-pointer list-none border-2 border-edge bg-surface px-2 py-0.5 text-ink2 hover:bg-lime hover:text-on-accent">
        <span className="group-open:hidden">Show as table</span><span className="hidden group-open:inline">Hide table</span>
      </summary>
      <table className="mt-2 w-full border-2 border-edge text-left text-xs">
        <thead>
          <tr className="border-b-2 border-edge bg-ink text-plane"><th className="px-2 py-1.5 font-bold uppercase">{head[0]}</th><th className="px-2 py-1.5 text-right font-bold uppercase">{head[1]}</th></tr>
        </thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={a + i} className="border-b border-line last:border-0 odd:bg-wash"><td className="px-2 py-1.5">{a}</td><td className="px-2 py-1.5 text-right font-mono tabular-nums">{b}</td></tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
