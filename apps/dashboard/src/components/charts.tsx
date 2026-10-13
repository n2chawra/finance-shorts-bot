"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

const PAD = { top: 12, right: 12, bottom: 26, left: 44 };

function Tooltip({ x, y, width, label, value }: { x: number; y: number; width: number; label: string; value: string }) {
  const left = Math.min(Math.max(x, 60), width - 60);
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-ring bg-surface px-2.5 py-1.5 text-xs shadow-sm"
      style={{ left, top: Math.max(y - 10, 34) }}>
      <div className="text-ink2">{label}</div>
      <div className="font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}

function Axes({ w, h, ticks, y, fmt }: { w: number; h: number; ticks: number[]; y: (v: number) => number; fmt: (n: number) => string }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--axis)" : "var(--line)"} strokeWidth={1} />
          <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--muted)" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(t)}</text>
        </g>
      ))}
      <line x1={PAD.left} x2={w - PAD.right} y1={h - PAD.bottom} y2={h - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />
    </>
  );
}

/** Single-series line over time with a crosshair tooltip. */
export function LineChart({ data, height = 220, fmt, fmtFull = fmt }: { data: Point[]; height?: number; fmt: (n: number) => string; fmtFull?: (n: number) => string }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1];
  const innerW = Math.max(w - PAD.left - PAD.right, 1);
  const x = (i: number) => PAD.left + (data.length > 1 ? (innerW * i) / (data.length - 1) : innerW / 2);
  const y = (v: number) => PAD.top + (height - PAD.top - PAD.bottom) * (1 - v / top);
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70))));
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
            <text key={d.label} x={x(i)} y={height - 8} textAnchor={i === data.length - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize={11} fill="var(--muted)">{d.label}</text>
          ))}
          <polyline points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")} fill="none" stroke="var(--series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill="var(--series)" stroke="var(--surface)" strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && <Tooltip x={x(hover)} y={y(data[hover].value)} width={w} label={data[hover].label} value={fmtFull(data[hover].value)} />}
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
  const bw = Math.min(44, band - 2);
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
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={base - PAD.top} fill="transparent" />
                <path d={path} fill="var(--series)" opacity={hover === null || hover === i ? 1 : 0.55} />
                {i === best && hover === null && d.value > 0 && (
                  <text x={cx} y={base - h - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ink)" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(d.value)}</text>
                )}
                <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">{d.label}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && w > 0 && <Tooltip x={PAD.left + band * (hover + 0.5)} y={y(data[hover].value)} width={w} label={data[hover].label} value={fmtFull(data[hover].value)} />}
    </div>
  );
}

/** Ranked horizontal bars: label, bar, value. Text stays in ink; the bar carries the magnitude. */
export function BarList({ rows, fmt, scaleMax }: { rows: { key: string; label: string; value: number; sub?: string; href?: string }[]; fmt: (n: number) => string; scaleMax?: number }) {
  const max = Math.max(scaleMax ?? 0, ...rows.map((r) => r.value), 1);   // scaleMax lets two lists share one scale
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            {r.href ? <Link href={r.href} className="truncate hover:underline">{r.label}</Link> : <span className="truncate">{r.label}</span>}
            <span className="shrink-0 font-semibold tabular-nums">{fmt(r.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-r-[4px] bg-wash">
            <div className="h-2 rounded-r-[4px] bg-series" style={{ width: `${Math.max((r.value / max) * 100, 1)}%` }} />
          </div>
          {r.sub && <div className="mt-1 text-xs text-muted">{r.sub}</div>}
        </li>
      ))}
    </ul>
  );
}

/** The same numbers as a table, for readers who prefer or need one. */
export function DataTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-xs text-ink2">View as table</summary>
      <table className="mt-2 w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line text-ink2"><th className="py-1 font-medium">{head[0]}</th><th className="py-1 text-right font-medium">{head[1]}</th></tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-b border-line last:border-0"><td className="py-1">{a}</td><td className="py-1 text-right tabular-nums">{b}</td></tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
