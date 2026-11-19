/**
 * A chart that draws on: a line (a stock price, revenue over years) or bars (store count, sales by
 * year), the figure counting up on a spoken word and landing on Python's own string.
 *
 * The shape comes from `values` (numbers Python computed or published: "@maths.series" or a fact list),
 * the labels from `labels` (years as numbers, or words), the figure from the beat's params.fig. The
 * chart prints no axis numbers of its own: every figure on screen is a string Python made.
 */
import React, { useId } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { countText } from "../flat/kit";
import { clamp01, DOC, fs, outBack, outCubic, SANS, smooth, unit } from "./theme";

export type ChartMark = { i: number; label: string; at?: number };

export type DocChartProps = {
  kind?: "line" | "bar";
  values: number[];
  labels?: (string | number)[];
  title?: string; sub?: string;
  figure?: string; figLabel?: string;
  hiBar?: number;              // bars: the bar in the accent (the last by default)
  tone?: "rise" | "fall" | "neutral";
  zero?: boolean;              // line: start the scale at zero
  marks?: ChartMark[];         // events on the line ("IPO", "Recall"), each popping in at its frame
  barFigs?: (string | undefined)[];   // bars: each bar's figure, written on its end as it lands (Python's strings)
  icons?: (string | undefined)[];     // bars: a cut-out logo or product under each bar instead of a word (public paths)
  drawAt?: number; drawLen?: number; figAt?: number;
  t: number; end: number; w: number; h: number;
};

export const DocChart: React.FC<DocChartProps> = ({
  kind = "line", values, labels = [], title, sub, figure, figLabel, hiBar, tone = "rise", zero = false, marks = [], barFigs = [], icons = [],
  drawAt = 6, drawLen = 40, figAt, t, end, w, h,
}) => {
  const id = `docchart-${useId().replace(/:/g, "")}`;
  const v = h > w;
  const u = unit(w, h);
  const accent = tone === "fall" ? DOC.red : tone === "rise" ? DOC.gold : "#7fb2ff";
  const x0 = v ? w * 0.1 : w * 0.1, x1 = v ? w * 0.9 : w * 0.86;
  const y0 = v ? h * 0.36 : h * 0.3, y1 = v ? h * 0.66 : h * 0.8;
  const n = Math.max(1, values.length);
  const max = Math.max(...values, 0), min = Math.min(...values);
  const lo = kind === "bar" || zero ? 0 : min - (max - min) * 0.12;
  const hi = max + (max - lo) * 0.12 || 1;
  const Y = (val: number) => y1 - ((val - lo) / (hi - lo)) * (y1 - y0);
  const X = (i: number) => (kind === "bar" ? x0 + ((i + 0.5) / n) * (x1 - x0) : x0 + (n === 1 ? 0.5 : i / (n - 1)) * (x1 - x0));
  const draw = smooth((t - drawAt) / Math.max(1, drawLen));
  const pts = values.map((val, i) => [X(i), Y(val)] as const);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  // the tip of the line at this moment
  const f = draw * (n - 1), i0 = Math.min(n - 2, Math.floor(f)), fr = f - i0;
  const tip: [number, number] = n < 2 ? [pts[0]?.[0] ?? x0, pts[0]?.[1] ?? y1]
    : [pts[i0]![0] + (pts[i0 + 1]![0] - pts[i0]![0]) * fr, pts[i0]![1] + (pts[i0 + 1]![1] - pts[i0]![1]) * fr];
  const hb = hiBar ?? n - 1;
  const endPt: [number, number] = kind === "bar" ? [X(hb), Y(values[hb] ?? 0)] : [pts[n - 1]?.[0] ?? x1, pts[n - 1]?.[1] ?? y0];
  const fk = figAt === undefined ? 0 : outCubic((t - figAt) / 22);
  const zoom = 1 + 0.06 * smooth((t - drawAt) / Math.max(1, end - drawAt));
  const labelSize = fs(w, h, 30);
  const every = Math.max(1, Math.ceil(n / (v ? 5 : 8)));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 55% 45%, ${DOC.bg2}, ${DOC.bg})` }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${(endPt[0] / w) * 100}% ${(endPt[1] / h) * 100}%` }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity={0.38} />
              <stop offset="1" stopColor={accent} stopOpacity={0} />
            </linearGradient>
            <clipPath id={`${id}-reveal`}><rect x={x0 - 20} y={0} width={(tip[0] - x0) + 20} height={h} /></clipPath>
            <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6 * u} /></filter>
          </defs>
          {/* grid: faint rules, no numbers (figures come only from Python) */}
          {[0, 1, 2, 3, 4].map((g) => {
            const y = y0 + (g / 4) * (y1 - y0);
            return <line key={g} x1={x0} x2={x1} y1={y} y2={y} stroke={DOC.line} strokeWidth={g === 4 ? 2 * u : 1.2 * u} strokeDasharray={g === 4 ? undefined : `${4 * u} ${8 * u}`} />;
          })}
          {kind === "line" ? (
            <>
              <path d={`${path} L${x1},${y1} L${x0},${y1} Z`} fill={`url(#${id}-area)`} clipPath={`url(#${id}-reveal)`} />
              <path d={path} fill="none" stroke={accent} strokeWidth={10 * u} opacity={0.5} filter={`url(#${id}-glow)`} clipPath={`url(#${id}-reveal)`} />
              <path d={path} fill="none" stroke={accent} strokeWidth={5 * u} strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${id}-reveal)`} />
              {draw > 0 ? (
                <g>
                  <circle cx={tip[0]} cy={tip[1]} r={(16 + 6 * Math.sin(t / 5)) * u} fill={accent} opacity={0.25} />
                  <circle cx={tip[0]} cy={tip[1]} r={8 * u} fill="#fff" stroke={accent} strokeWidth={4 * u} />
                </g>
              ) : null}
            </>
          ) : (
            values.map((val, i) => {
              const bw = ((x1 - x0) / n) * 0.62;
              const k = outBack((t - drawAt - i * (drawLen / Math.max(1, n))) / 14);
              const top = y1 - (y1 - Y(val)) * Math.max(0, k);
              const on = i === hb;
              return (
                <g key={i}>
                  <rect x={X(i) - bw / 2} y={top} width={bw} height={Math.max(0, y1 - top)} rx={4 * u} fill={on ? accent : "#3a4660"} />
                  <rect x={X(i) - bw / 2} y={top} width={bw} height={Math.min(6 * u, Math.max(0, y1 - top))} rx={3 * u} fill="#ffffff" opacity={on ? 0.45 : 0.12} />
                </g>
              );
            })
          )}
          {/* the end point's ring when the figure lands */}
          {fk > 0 ? <circle cx={endPt[0]} cy={endPt[1]} r={(14 + 40 * fk) * u} fill="none" stroke={accent} strokeWidth={3 * u} opacity={1 - fk} /> : null}
        </svg>
        {/* bars: each bar's own figure on its end, and a logo under it */}
        {kind === "bar" ? values.map((val, i) => {
          const k = outCubic((t - drawAt - i * (drawLen / Math.max(1, n)) - 8) / 12);
          const bf = barFigs[i], ic = icons[i];
          const bw = ((x1 - x0) / n) * 0.62;
          return (
            <React.Fragment key={`bf${i}`}>
              {bf && k > 0 ? <div style={{ position: "absolute", left: X(i) - bw, width: bw * 2, top: Y(val) - fs(w, h, 40) * 1.5, textAlign: "center", fontFamily: SANS, fontWeight: 800,
                fontSize: fs(w, h, 40), color: i === hb ? DOC.text : DOC.muted, opacity: k }}>{bf}</div> : null}
              {ic ? <Img src={staticFile(ic)} style={{ position: "absolute", left: X(i) - bw * 0.5, width: bw, top: y1 + 14 * u, height: 70 * u, objectFit: "contain",
                opacity: clamp01((t - drawAt) / 10), filter: i === hb ? undefined : "grayscale(0.6) brightness(0.85)" }} /> : null}
            </React.Fragment>
          );
        }) : null}
        {/* x labels */}
        {labels.map((lb, i) => (!icons[i] && (i % every === 0 || i === n - 1) ? (
          <div key={i} style={{ position: "absolute", left: X(i) - 100, width: 200, top: y1 + 16 * u, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: labelSize,
            color: i === hb && kind === "bar" ? DOC.text : DOC.muted, opacity: clamp01((draw * (n - 1) - i + 1) * 2) }}>{String(lb)}</div>
        ) : null))}
        {/* events on the line */}
        {marks.map((mk, j) => {
          const p = pts[Math.max(0, Math.min(n - 1, mk.i))];
          if (!p) return null;
          const k = outBack((t - (mk.at ?? drawAt + (mk.i / Math.max(1, n - 1)) * drawLen)) / 14);
          if (k <= 0) return null;
          return (
            <div key={j} style={{ position: "absolute", left: p[0], top: p[1], transform: `translate(-50%, calc(-100% - ${26 * u}px)) scale(${k})`, transformOrigin: "50% 100%" }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: labelSize, color: DOC.bg, background: DOC.text, padding: `${4 * u}px ${14 * u}px`, borderRadius: 6 * u, whiteSpace: "nowrap" }}>{mk.label}</div>
              <div style={{ width: 2 * u, height: 22 * u, background: DOC.text, margin: "0 auto" }} />
            </div>
          );
        })}
        {/* the figure, counting up to Python's string */}
        {/* the figure sits in the free corner (above the end point when it is low, below when it is high),
            with a dashed leader down or up to the end point, so it never covers the line or a mark */}
        {figure && fk > 0 ? (() => {
          const low = endPt[1] > (y0 + y1) / 2;
          const fy = low ? y0 - 10 * u : y1 - (v ? 190 : 170) * u;
          return (
            <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: clamp01(fk * 3) }}>
              <line x1={endPt[0]} y1={endPt[1] + (low ? -14 : 14) * u} x2={endPt[0]} y2={low ? fy + (v ? 170 : 150) * u : fy - 10 * u}
                stroke={accent} strokeWidth={2 * u} strokeDasharray={`${6 * u} ${6 * u}`} opacity={0.8} />
            </svg>
          );
        })() : null}
        {figure && fk > 0 ? (
          <div style={{ position: "absolute", left: endPt[0] + 24 * u, top: endPt[1] > (y0 + y1) / 2 ? y0 - 10 * u : y1 - (v ? 190 : 170) * u, transform: "translateX(-100%)", textAlign: "right",
            opacity: clamp01(fk * 3) }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: fs(w, h, v ? 120 : 104), lineHeight: 1, color: accent, letterSpacing: -2, textShadow: `0 0 ${30 * u}px rgba(0,0,0,0.6)` }}>
              {countText(figure, fk)}
            </div>
            {figLabel ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, 30), color: DOC.muted, marginTop: 6 * u }}>{figLabel}</div> : null}
          </div>
        ) : null}
      </AbsoluteFill>
      {title ? (
        <div style={{ position: "absolute", left: x0, top: v ? h * 0.2 : h * 0.09, right: w * 0.1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fs(w, h, v ? 64 : 54), color: DOC.text, letterSpacing: -0.5, lineHeight: 1.1 }}>{title}</div>
          {sub ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fs(w, h, 30), color: DOC.muted, marginTop: 6 * u }}>{sub}</div> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
