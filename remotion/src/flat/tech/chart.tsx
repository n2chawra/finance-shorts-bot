/**
 * A coded line chart (tech channel, kit gap 10): the line draws on between two spoken words, a glowing
 * tip rides it, and the end figure lands on the last point. Replaces chart screenshots.
 *
 * `series` are numbers computed in Python (the script's maths), `endLabel` the figure string from
 * `params.fig`; the chart never computes or prints a figure of its own. Draw inside a `Stage`.
 */
import React from "react";
import { FONT } from "../../design/fonts";
import type { Motion } from "../kit";
import type { Box } from "./cards";
import { Num, TECH, Words, clamp01, numWidth, useUnit } from "./theme";

export const LineChart: React.FC<{
  m: Motion;
  series: number[];
  /** x-axis labels, one per point ("" for none); first, middle and last are drawn when there are many */
  xLabels?: string[];
  /** the figure that lands on the end point, from params.fig */
  endLabel: string;
  /** a short line under it ("per year", "transistors") */
  endSub?: string;
  /** what the line measures, top left of the chart */
  title?: string;
  /** frames: the line starts drawing, reaches the end, the label lands (default: when it reaches the end) */
  from: number; to: number; landAt?: number;
  box?: Box;
}> = ({ m, series, xLabels, endLabel, endSub, title, from, to, landAt, box }) => {
  const { u, vertical, min } = useUnit();
  const b = box ?? (vertical ? { x: 90, y: 560, w: 900, h: 760 } : { x: 200, y: 330, w: 1520, h: 520 });
  const pts = series.length >= 2 ? series : [0, ...series, 0].slice(0, 2);
  const lo = Math.min(0, ...pts), hi = Math.max(...pts) * 1.12 || 1;
  const px = (i: number) => b.x + (i / (pts.length - 1)) * b.w;
  const py = (v: number) => b.y + b.h - ((v - lo) / (hi - lo)) * b.h;
  const xy = pts.map((v, i) => [px(i), py(v)] as [number, number]);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i]![0], p[1] - xy[i]![1]));
  const total = seg.reduce((a, s) => a + s, 0) || 1;
  const k = m.lerp([from, to], [0, 1]);
  // the tip: walk the segments to k of the length
  let left = k * total, tip = xy[0]!;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]! || i === seg.length - 1) {
      const f = seg[i]! ? Math.min(1, left / seg[i]!) : 1;
      tip = [xy[i]![0] + (xy[i + 1]![0] - xy[i]![0]) * f, xy[i]![1] + (xy[i + 1]![1] - xy[i]![1]) * f];
      break;
    }
    left -= seg[i]!;
  }
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${xy[xy.length - 1]![0]} ${b.y + b.h} L${b.x} ${b.y + b.h} Z`;
  const lk = m.pop(landAt ?? to, 12);
  const last = xy[xy.length - 1]!;
  const figSize = vertical ? 132 * u : 120 * u;
  const lw = Math.max(numWidth(endLabel, figSize), endSub ? endSub.length * min * 0.58 : 0) + 60 * u;
  const lh = figSize * 1.1 + (endSub ? min * 1.3 : 0) + 30 * u;
  const lx = Math.min(b.x + b.w - lw, Math.max(b.x, last[0] - lw + 40 * u));
  const ly = Math.max(b.y - lh - 30 * u, last[1] - lh - 70 * u);
  const shown = (xLabels ?? []).map((l, i) => ({ l, i })).filter(({ l, i }) => l && (pts.length <= 6 || i === 0 || i === pts.length - 1 || i === Math.floor((pts.length - 1) / 2)));
  return (
    <g>
      <defs>
        <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TECH.accent} stopOpacity="0.32" />
          <stop offset="1" stopColor={TECH.accent} stopOpacity="0" />
        </linearGradient>
        <clipPath id="chart-drawn"><rect x={b.x - 10} y={b.y - b.h} width={Math.max(0, tip[0] - b.x + 10)} height={b.h * 3} /></clipPath>
        <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10 * u} /></filter>
      </defs>
      {title ? <Words x={b.x} y={b.y - 70 * u} size={Math.max(min, 40 * u)} fill={TECH.muted} weight={600} opacity={clamp01(m.lerp([from - 10, from], [0, 1]))}>{title}</Words> : null}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={b.x} y1={b.y + b.h * f} x2={b.x + b.w} y2={b.y + b.h * f} stroke={f === 1 ? TECH.line : TECH.grid} strokeWidth={(f === 1 ? 3 : 2) * u} />
      ))}
      {shown.map(({ l, i }) => (
        <Words key={i} x={px(i)} y={b.y + b.h + 50 * u} size={min} fill={TECH.muted} weight={600}
          anchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}>{l}</Words>
      ))}
      <path d={area} fill="url(#chart-area)" clipPath="url(#chart-drawn)" />
      <path d={d} fill="none" stroke={TECH.accent} strokeWidth={14 * u} opacity={0.4} filter="url(#chart-glow)" strokeDasharray={total} strokeDashoffset={total * (1 - k)} />
      <path d={d} fill="none" stroke={TECH.accent} strokeWidth={7 * u} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={total} strokeDashoffset={total * (1 - k)} />
      {k > 0 ? (
        <g>
          <line x1={tip[0]} y1={tip[1]} x2={tip[0]} y2={b.y + b.h} stroke={TECH.accent} strokeWidth={2 * u} strokeDasharray={`${8 * u} ${8 * u}`} opacity={0.6} />
          <circle cx={tip[0]} cy={tip[1]} r={26 * u} fill={TECH.accent} opacity={0.25} />
          <circle cx={tip[0]} cy={tip[1]} r={12 * u} fill={TECH.bg} stroke={TECH.accent} strokeWidth={5 * u} />
        </g>
      ) : null}
      {lk > 0 ? (
        <g opacity={clamp01(lk * 1.5)} transform={`translate(${lx + lw / 2} ${ly + lh}) scale(${0.7 + 0.3 * Math.min(1.1, lk)}) translate(${-(lx + lw / 2)} ${-(ly + lh)})`}>
          <rect x={lx} y={ly} width={lw} height={lh} rx={18 * u} fill={TECH.panelHi} stroke={TECH.accent} strokeWidth={4 * u} />
          <polygon points={`${last[0] - 16 * u},${ly + lh - 2} ${last[0] + 16 * u},${ly + lh - 2} ${last[0]},${ly + lh + 22 * u}`}
            fill={TECH.accent} transform={`translate(${Math.min(0, lx + lw - 30 * u - last[0])} 0)`} />
          <Num x={lx + 30 * u} y={ly + 15 * u + figSize * 0.55} size={figSize} fill={TECH.accent} glow={TECH.accent}>{endLabel}</Num>
          {endSub ? <text x={lx + 30 * u} y={ly + lh - 20 * u - min * 0.5} fontFamily={FONT} fontWeight={600} fontSize={min} fill={TECH.muted} dominantBaseline="central">{endSub}</text> : null}
        </g>
      ) : null}
    </g>
  );
};
