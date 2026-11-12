"use client";

import { geoEqualEarth, geoPath } from "d3-geo";
import alpha2 from "i18n-iso-countries";
import { motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

import { fmtCompact, fmtNum } from "@/lib/format";
import type { Drop, Slice } from "@/lib/studio-schema";

export const CAT = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)", "var(--c7)", "var(--c8)"];
const EASE = [0.16, 1, 0.3, 1] as const;

function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e!.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full border-2 border-edge bg-surface px-2.5 py-1.5 text-xs shadow-[7px_7px_0_0_var(--hard)]"
      style={{ left: Math.min(Math.max(x, 80), width - 80), top: Math.max(y - 10, 40) }}>
      {children}
    </div>
  );
}

// ---------------- donut + legend ----------------

/** Share of a whole: up to 7 slices plus "Other", the biggest named in the middle. */
export function Donut({ slices, size = 168, unit = "views", fmt = fmtCompact }: { slices: Slice[]; size?: number; unit?: string; fmt?: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = slices.slice(0, 7);
  const rest = slices.slice(7);
  const parts = rest.length ? [...top, { key: "_other", label: "Other", views: rest.reduce((a, s) => a + s.views, 0), share: rest.reduce((a, s) => a + s.share, 0), watchMinutes: 0, avgViewPct: null }] : top;
  const total = parts.reduce((a, p) => a + p.views, 0) || 1;
  const r = size / 2, inner = r * 0.64, gap = 0.012;
  let a0 = -Math.PI / 2;
  const arcs = parts.map((p, i) => {
    const span = (p.views / total) * Math.PI * 2;
    const s = a0 + (parts.length > 1 ? gap : 0), e = a0 + span - (parts.length > 1 ? gap : 0);
    a0 += span;
    const large = e - s > Math.PI ? 1 : 0;
    const pt = (rad: number, a: number) => `${r + rad * Math.cos(a)},${r + rad * Math.sin(a)}`;
    const d = e <= s ? "" : `M${pt(r, s)} A${r},${r} 0 ${large} 1 ${pt(r, e)} L${pt(inner, e)} A${inner},${inner} 0 ${large} 0 ${pt(inner, s)} Z`;
    return { d, color: i === parts.length - 1 && rest.length ? "var(--muted)" : CAT[i]!, p };
  });
  const focus = parts[hover ?? 0];
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label="Share of views" onPointerLeave={() => setHover(null)}>
          {arcs.map((a, i) => (
            <motion.path key={a.p.key} d={a.d} fill={a.color} stroke="var(--edge)" strokeWidth={2.5}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: hover === null || hover === i ? 1 : 0.35, scale: hover === i ? 1.03 : 1 }}
              style={{ transformOrigin: `${r}px ${r}px` }} transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
              onPointerEnter={() => setHover(i)} />
          ))}
        </svg>
        {focus && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="text-[22px] font-semibold tabular-nums leading-none tracking-tight">{Math.round((focus.views / total) * 100)}%</span>
            <span className="mt-1 line-clamp-2 text-[11px] leading-tight text-ink2">{focus.label}</span>
          </div>
        )}
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-1.5 text-[13px]">
        {parts.map((p, i) => (
          <li key={p.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
            className={`flex items-center gap-2  px-1.5 py-1 transition-colors ${hover === i ? "bg-wash" : ""}`}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: arcs[i]!.color }} />
            <span className="min-w-0 flex-1 truncate text-ink">{p.label}</span>
            <span className="tabular-nums text-muted">{fmt(p.views)} {unit === "views" ? "" : unit}</span>
            <span className="w-11 text-right font-semibold tabular-nums">{((p.views / total) * 100).toFixed(p.views / total < 0.1 ? 1 : 0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- funnel ----------------

/** Tapering steps: each bar's width is its value against the first; the step-to-step rate sits between. */
export function Funnel({ steps }: { steps: { label: string; value: number | null; note?: string }[] }) {
  const first = steps.find((s) => s.value)?.value ?? 1;
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const prev = steps[i - 1]?.value;
        const rate = s.value !== null && prev ? s.value / prev : null;
        return (
          <li key={s.label}>
            {i > 0 && (
              <div className="flex items-center gap-2 py-0.5 pl-3 text-[11px] text-muted">
                <svg aria-hidden width="10" height="12" viewBox="0 0 10 12"><path d="M5 0v9M1.5 6L5 9.5 8.5 6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                {rate !== null ? <span className="tabular-nums"><b className="font-semibold text-ink2">{(rate * 100).toFixed(rate < 0.1 ? 1 : 0)}%</b> {s.note ?? ""}</span> : <span>{s.note ?? "not available yet"}</span>}
              </div>
            )}
            <div className="relative h-11 overflow-hidden bg-wash">
              <motion.div className="absolute inset-y-0 left-0 " style={{ background: `linear-gradient(90deg, ${CAT[i % CAT.length]}, color-mix(in oklab, ${CAT[i % CAT.length]} 70%, transparent))` }}
                initial={{ width: 0 }} animate={{ width: s.value === null ? "0%" : `${Math.max((s.value / first) * 100, 1.5)}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }} />
              <div className="relative flex h-full items-center justify-between px-3 text-[13px]">
                <span className="font-semibold text-ink mix-blend-normal">{s.label}</span>
                <span className="font-semibold tabular-nums">{s.value === null ? "—" : fmtNum(s.value)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------- hourly bars (realtime) ----------------

export function HourlyBars({ values, hours, height = 150, compare, bare }: { values: number[]; hours: string[]; height?: number; compare?: number[]; bare?: boolean }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...values, ...(compare ?? []), 1);
  const n = values.length;
  const band = w / Math.max(n, 1);
  const bw = Math.max(2, band - 2);
  const base = bare ? height : height - 18;
  const y = (v: number) => base - (v / max) * (base - (bare ? 2 : 8));
  const gid = `hb${useId().replace(/:/g, "")}`;
  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Views per hour" onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--c1)" /><stop offset="100%" stopColor="var(--c1)" stopOpacity={0.55} />
            </linearGradient>
            <filter id={`${gid}g`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          {!bare && <line x1={0} x2={w} y1={base} y2={base} stroke="var(--axis)" />}
          {values.map((v, i) => {
            const h = Math.max(base - y(v), v > 0 ? 2 : 0);
            const last = i === n - 1;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
                <rect x={i * band} y={0} width={band} height={base} fill={hover === i ? "var(--wash)" : "transparent"} />
                {last && h > 0 && <rect x={i * band + 1} y={base - h} width={bw} height={h} fill="var(--lime)" filter={`url(#${gid}g)`} opacity={0.8} className="animate-pulse-dot" />}
                <motion.rect x={i * band + 1} y={base - h} width={bw} height={h} fill={last ? "var(--lime)" : `url(#${gid})`} stroke="var(--edge)" strokeWidth={1.5}
                  style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1, opacity: hover === null || hover === i ? 1 : 0.55 }}
                  transition={{ duration: 0.5, delay: i * 0.008, ease: EASE }} />
              </g>
            );
          })}
          {compare && compare.length > 1 && (
            <path d={compare.map((v, i) => `${i ? "L" : "M"}${i * band + band / 2},${y(v)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={2} strokeDasharray="4 3" />
          )}
          {!bare && [0, Math.floor(n / 2), n - 1].map((i) => hours[i] && (
            <text key={i} x={i * band + band / 2} y={height - 3} fontSize={10.5} fill="var(--muted)" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
              {i === n - 1 ? "now" : hours[i]}
            </text>
          ))}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tooltip x={hover * band + band / 2} y={y(values[hover] ?? 0)} width={w}>
          <div className="text-muted">{hover === n - 1 ? "This hour" : hours[hover]}</div>
          <div className="mt-0.5 font-semibold tabular-nums text-ink">{fmtNum(values[hover] ?? 0)} views</div>
          {compare?.[hover] !== undefined && <div className="tabular-nums text-muted">typical {fmtNum(compare[hover]!)}</div>}
        </Tooltip>
      )}
    </div>
  );
}

// ---------------- retention over key frames ----------------

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The contact sheet's tile for a moment (renderer/engine/preview.py: 6 columns, 320 px tiles, 12 px gaps,
 * a 44 px time label; one tile every few seconds). */
function useSheet(src: string, format: "short" | "long", duration: number) {
  const [size, setSize] = useState<[number, number] | null>(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSize([img.naturalWidth, img.naturalHeight]);
    img.src = src;
  }, [src]);
  return useMemo(() => {
    if (!size) return null;
    const tileW = 320, gap = 12, label = 44, cols = 6;
    const tileH = Math.floor(format === "long" ? (tileW * 1080) / 1920 : (tileW * 1920) / 1080);
    const rows = Math.round((size[1] - gap) / (tileH + label + gap));
    if (rows < 1 || Math.abs(size[0] - (cols * (tileW + gap) + gap)) > 4) return null;
    const step = [5, 10, 15, 20, 30, 45, 60].find((s) => {
      const n = Math.ceil(duration / s) + (duration % s ? 1 : 0);
      return n <= rows * cols && n > (rows - 1) * cols;
    }) ?? 5;
    const count = Math.min(rows * cols, Math.ceil(duration / step) + 1);
    return { W: size[0], H: size[1], tileW, tileH, gap, label, cols, step, count };
  }, [size, format, duration]);
}

function Frame({ src, sheet, index, width }: { src: string; sheet: NonNullable<ReturnType<typeof useSheet>>; index: number; width: number }) {
  const k = width / sheet.tileW;
  const x = sheet.gap + (index % sheet.cols) * (sheet.tileW + sheet.gap);
  const y = sheet.gap + Math.floor(index / sheet.cols) * (sheet.tileH + sheet.label + sheet.gap) + sheet.label;
  return <div className="rounded-[4px] bg-wash-2" style={{ width, height: sheet.tileH * k, backgroundImage: `url(${src})`, backgroundSize: `${sheet.W * k}px ${sheet.H * k}px`, backgroundPosition: `${-x * k}px ${-y * k}px` }} />;
}

/** Audience retention over the video's own key frames: where people left, and what was on screen and
 * being said then. Typical = the last 10 of its format. Pins mark the steepest drops. */
export function RetentionChart({ curve, typical, drops, duration, previewUrl, format, height = 240 }: {
  curve: [number, number][]; typical: [number, number][]; drops: Drop[]; duration: number; previewUrl?: string; format: "short" | "long"; height?: number;
}) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const [pin, setPin] = useState<number | null>(drops.length ? 0 : null);
  const sheet = useSheet(previewUrl ?? "", format, duration);
  const pad = { l: 38, r: 10, t: 12, b: 22 };
  const ymax = Math.max(1, ...curve.map((p) => p[1]), ...typical.map((p) => p[1]));
  const top = Math.ceil(ymax * 4) / 4;
  const x = (share: number) => pad.l + (w - pad.l - pad.r) * share;
  const y = (v: number) => pad.t + (height - pad.t - pad.b) * (1 - v / top);
  const line = (c: [number, number][]) => c.map(([a, b], i) => `${i ? "L" : "M"}${x(a)},${y(b)}`).join(" ");
  const gid = `rt${useId().replace(/:/g, "")}`;
  const ticks = Array.from({ length: Math.round(top / 0.25) + 1 }, (_, i) => i * 0.25).filter((t) => t <= top);
  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - rect.left - pad.l) / (w - pad.l - pad.r)));
    setHover(s);
  };
  const near = (s: number) => curve.reduce((best, p) => (Math.abs(p[0] - s) < Math.abs(best[0] - s) ? p : best), curve[0] ?? [0, 0]);
  const nFrames = sheet ? Math.min(sheet.count, Math.max(2, Math.floor((w - pad.l - pad.r) / (format === "long" ? 92 : 46)))) : 0;
  const strip = sheet ? Array.from({ length: nFrames }, (_, i) => {
    const t = (i / (nFrames - 1)) * duration;
    return { t, index: Math.min(sheet.count - 1, Math.round(t / sheet.step)) };
  }) : [];
  const frameW = strip.length ? (w - pad.l - pad.r) / strip.length - 3 : 0;
  const active = pin !== null ? drops[pin] : null;
  return (
    <div>
      <div ref={ref} className="relative w-full select-none" style={{ height }}>
        {w > 0 && curve.length > 0 && (
          <svg width={w} height={height} role="img" aria-label="Audience retention" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--c1)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--c1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t ? "3 3" : undefined} />
                <text x={pad.l - 6} y={y(t)} fontSize={10.5} textAnchor="end" dominantBaseline="middle" fill="var(--muted)">{Math.round(t * 100)}%</text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((s) => <text key={s} x={x(s)} y={height - 5} fontSize={10.5} fill="var(--muted)" textAnchor={s === 0 ? "start" : s === 1 ? "end" : "middle"}>{mmss(s * duration)}</text>)}
            <motion.path d={`${line(curve)} L${x(curve.at(-1)![0])},${y(0)} L${x(curve[0]![0])},${y(0)} Z`} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
            {typical.length > 0 && <path d={line(typical)} fill="none" stroke="var(--ink)" strokeWidth={2} strokeDasharray="5 4" />}
            <motion.path d={line(curve)} fill="none" stroke="var(--c1)" strokeWidth={2.25} strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
            {drops.map((d, i) => {
              const s = d.at / duration;
              return (
                <g key={i} className="cursor-pointer" onClick={() => setPin(i)}>
                  <line x1={x(s)} x2={x(s)} y1={y(d.from)} y2={y(0)} stroke="var(--critical)" strokeDasharray="2 3" opacity={0.5} />
                  <motion.circle cx={x(s)} cy={y((d.from + d.to) / 2)} r={pin === i ? 11 : 9} fill="var(--red)" stroke="var(--edge)" strokeWidth={2.5}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + i * 0.12, type: "spring", stiffness: 400, damping: 18 }}
                    style={{ transformOrigin: `${x(s)}px ${y((d.from + d.to) / 2)}px` }} />
                  <text x={x(s)} y={y((d.from + d.to) / 2)} fontSize={11} fontWeight={700} fill="#fff" textAnchor="middle" dominantBaseline="central" pointerEvents="none">{i + 1}</text>
                </g>
              );
            })}
            {hover !== null && (
              <>
                <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} stroke="var(--ring-strong)" />
                <circle cx={x(near(hover)[0])} cy={y(near(hover)[1])} r={5.5} fill="var(--lime)" stroke="var(--edge)" strokeWidth={2.5} />
              </>
            )}
          </svg>
        )}
        {hover !== null && w > 0 && curve.length > 0 && (
          <Tooltip x={x(hover)} y={y(near(hover)[1])} width={w}>
            <div className="text-muted">{mmss(hover * duration)}</div>
            <div className="mt-0.5 font-semibold tabular-nums text-ink">{Math.round(near(hover)[1] * 100)}% still watching</div>
          </Tooltip>
        )}
      </div>
      {sheet && previewUrl && w > 0 && (
        <div className="mt-1 flex gap-[3px]" style={{ paddingLeft: pad.l, paddingRight: pad.r }}>
          {strip.map((f) => <Frame key={f.t} src={previewUrl} sheet={sheet} index={f.index} width={frameW} />)}
        </div>
      )}
      {drops.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {drops.map((d, i) => (
            <button key={i} type="button" onClick={() => setPin(i)}
              className={` border p-3 text-left transition-colors ${pin === i ? "border-critical/40 bg-critical-soft" : "border-edge hover:border-edge-strong"}`}>
              <div className="flex items-center gap-2 text-xs">
                <span className="grid size-6 place-items-center border-2 border-edge bg-red font-display text-[11px] text-on-accent">{i + 1}</span>
                <span className="font-semibold tabular-nums text-critical-text">−{Math.round(d.drop * 100)}%</span>
                <span className="tabular-nums text-muted">at {mmss(d.at)} · {d.beat}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] text-ink">“{d.near || d.line}”</p>
            </button>
          ))}
        </div>
      )}
      {active && <p className="mt-2 text-xs text-muted">Whole line: <span className="text-ink2">“{active.line}”</span></p>}
    </div>
  );
}

// ---------------- world map ----------------

const topo = world as unknown as Topology;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL = (feature(topo, topo.objects.countries as any) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, { name: string }>).features;
const COUNTRIES: GeoJSON.Feature<GeoJSON.Geometry, { name: string }>[] = ALL.filter((f) => f.properties.name !== "Antarctica");

/** Views by country, shaded light → dark in one hue; hover for the numbers. */
export function WorldMap({ slices }: { slices: Slice[] }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const h = Math.min(Math.round(w * 0.47), 380);
  const byNumeric = useMemo(() => new Map(slices.map((s) => [String(alpha2.alpha2ToNumeric(s.key) ?? "").padStart(3, "0"), s])), [slices]);
  const max = Math.max(...slices.map((s) => s.views), 1);
  const path = useMemo(() => (w ? geoPath(geoEqualEarth().fitSize([w, h], { type: "FeatureCollection", features: COUNTRIES })) : null), [w, h]);
  const s = hover ? slices.find((x) => x.key === hover.code) : null;
  return (
    <div ref={ref} className="relative w-full" style={{ height: h || 200 }} onPointerLeave={() => setHover(null)}>
      {path && (
        <svg width={w} height={h} role="img" aria-label="Views by country">
          {COUNTRIES.map((f, i) => {
            const slice = byNumeric.get(String(f.id).padStart(3, "0"));
            const k = slice ? Math.sqrt(slice.views / max) : 0;
            return (
              <motion.path key={`${f.id}${i}`} d={path(f) ?? ""} stroke="var(--surface)" strokeWidth={0.5}
                fill={slice ? `color-mix(in oklab, var(--c1) ${Math.round(18 + k * 82)}%, var(--surface-2))` : "var(--wash-2)"}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: slice ? 0.2 + (1 - k) * 0.4 : 0 }}
                className={slice ? "cursor-pointer hover:brightness-110" : ""}
                onPointerMove={(e) => slice && setHover({ code: slice.key, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />
            );
          })}
        </svg>
      )}
      {hover && s && (
        <Tooltip x={hover.x} y={hover.y} width={w}>
          <div className="flex items-center gap-1.5 font-semibold text-ink"><CountryChip code={s.key} />{s.label}</div>
          <div className="mt-0.5 tabular-nums text-ink2">{fmtNum(s.views)} views · {(s.share * 100).toFixed(1)}%</div>
          {s.avgViewPct !== null && <div className="tabular-nums text-muted">{s.avgViewPct.toFixed(0)}% viewed</div>}
        </Tooltip>
      )}
    </div>
  );
}

// ---------------- age × gender ----------------

/** Men to the left, women to the right of a shared age axis, % of viewers. */
export function MirrorBars({ slices }: { slices: Slice[] }) {
  const ages = [...new Set(slices.map((s) => s.key.split("|")[0]!))].sort();
  const pct = (age: string, g: string) => (slices.find((s) => s.key === `${age}|${g}`)?.share ?? 0) * 100;
  const max = Math.max(...slices.map((s) => s.share * 100), 1);
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-semibold text-muted"><span className="flex items-center gap-1.5"><i className="size-2 rounded-[2px] bg-[var(--c1)]" />Men</span><span className="flex items-center gap-1.5">Women<i className="size-2 rounded-[2px] bg-[var(--c5)]" /></span></div>
      <ul className="space-y-1.5">
        {ages.map((age, i) => (
          <li key={age} className="grid grid-cols-[1fr_56px_1fr] items-center gap-2 text-xs">
            {(["male", "female"] as const).map((g) => {
              const v = pct(age, g);
              const bar = (
                <div className={`flex items-center gap-1.5 ${g === "male" ? "flex-row-reverse" : ""}`} key={g}>
                  <motion.div className="h-4 rounded-[4px]" style={{ background: g === "male" ? "var(--c1)" : "var(--c5)" }}
                    initial={{ width: 0 }} animate={{ width: `${(v / max) * 82}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }} />
                  <span className="tabular-nums text-ink2">{v.toFixed(1)}%</span>
                </div>
              );
              return g === "male" ? bar : null;
            })}
            <span className="text-center font-semibold tabular-nums text-ink2">{age.replace("age", "").replace("-", "–")}</span>
            <div className="flex items-center gap-1.5">
              <motion.div className="h-4 rounded-[4px]" style={{ background: "var(--c5)" }}
                initial={{ width: 0 }} animate={{ width: `${(pct(age, "female") / max) * 82}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }} />
              <span className="tabular-nums text-ink2">{pct(age, "female").toFixed(1)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ranked rows with a flag (countries) or a colour chip, a soft bar behind. */
export function RankList({ slices, kind, max = 10, fmt = fmtNum, unit }: { slices: Slice[]; kind?: "country"; max?: number; fmt?: (n: number) => string; unit?: string }) {
  const top = slices.slice(0, max);
  const hi = Math.max(...top.map((s) => s.views), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {top.map((s, i) => (
        <li key={s.key} className="relative flex items-center gap-2 border-2 border-edge bg-surface px-2 py-1.5 text-[13px] font-semibold">
          <motion.span aria-hidden className={`absolute inset-y-0 left-0 border-r-2 border-edge ${i === 0 ? "bg-lime" : "bg-sky/60"}`}
            initial={{ width: 0 }} animate={{ width: `${Math.max((s.views / hi) * 100, 1.5)}%` }} transition={{ duration: 0.7, delay: i * 0.03, ease: EASE }} />
          {kind === "country" && <CountryChip code={s.key} />}
          <span className="relative min-w-0 flex-1 truncate">{s.label}</span>
          {s.avgViewPct !== null && <span className="relative text-xs tabular-nums text-muted">{s.avgViewPct.toFixed(0)}% viewed</span>}
          <span className="relative w-16 text-right font-mono font-bold tabular-nums">{fmt(s.views)}{unit ? ` ${unit}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

/** A country's ISO code as a small chip (flag emoji don't render on Windows). */
export function CountryChip({ code }: { code: string }) {
  return <span className="relative inline-grid h-[18px] w-[26px] shrink-0 place-items-center border-2 border-edge bg-surface text-[10px] font-bold tracking-wide text-ink">{code}</span>;
}
