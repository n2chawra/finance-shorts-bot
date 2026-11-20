/**
 * A thick stylised stock line (playbook gap #2), drawn BEHIND the product: rises green, falls red (red means a
 * loss and nothing else), a white edge, an arrowhead at the end. A shape, not data: no axis, no figures.
 *   "crash"  up, then a long fall (P1: the craze that died)
 *   "v"      a fall, then the climb back (P1 for a comeback)
 *   "spike"  flat, a sudden spike, a crash (a viral craze)
 * `points` (shares of `box`, y down) replaces the preset, e.g. from a maths series. `crashKey()` gives the
 * shape's turning point in frame shares, so the product can sit at the bottom of the V or the top of the spike.
 */
import React from "react";
import { rng } from "../../flat/kit";

export type CrashShape = "crash" | "v" | "spike";
type Pt = [number, number];
type Box = [number, number, number, number];   // x0, y0, x1, y1 as shares of the frame

const PRESETS: Record<CrashShape, { pts: Pt[]; key: number }> = {
  crash: { pts: [[0, 0.78], [0.18, 0.6], [0.34, 0.38], [0.48, 0.08], [0.6, 0.3], [0.78, 0.66], [1, 0.96]], key: 3 },
  v: { pts: [[0, 0.06], [0.16, 0.3], [0.32, 0.62], [0.48, 0.95], [0.64, 0.62], [0.82, 0.32], [1, 0.04]], key: 3 },
  spike: { pts: [[0, 0.86], [0.28, 0.8], [0.44, 0.7], [0.56, 0.04], [0.68, 0.55], [0.84, 0.82], [1, 0.95]], key: 3 },
};

const toFrame = (p: Pt, b: Box, w: number, h: number): Pt => [(b[0] + p[0] * (b[2] - b[0])) * w, (b[1] + p[1] * (b[3] - b[1])) * h];

/** The turning point (bottom of the V, top of the crash/spike) in frame shares. */
export function crashKey(shape: CrashShape, box: Box): Pt {
  const pr = PRESETS[shape];
  const p = pr.pts[pr.key]!;
  return [box[0] + p[0] * (box[2] - box[0]), box[1] + p[1] * (box[3] - box[1])];
}

/** Stock-chart jitter between the anchor points, seeded, always moving the same way as its segment. */
function jag(pts: Pt[], seed: string): Pt[] {
  const r = rng(`line-${seed}`);
  const out: Pt[] = [pts[0]!];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const n = 3;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const wob = (r() - 0.5) * 0.09 * Math.abs(b[1] - a[1] + 0.05);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + wob]);
    }
    out.push(b);
  }
  return out;
}

export const CrashLine: React.FC<{
  shape?: CrashShape; points?: Pt[]; box?: Box;
  width?: number;           // the line, px (default 4.2% of the frame height)
  rise?: string; fall?: string;
  arrow?: boolean;
  seed?: string;
  w: number; h: number;
}> = ({ shape = "crash", points, box = [0.04, 0.08, 0.96, 0.9], width, rise = "#2fc463", fall = "#e5483b", arrow = true, seed = "line", w, h }) => {
  const lw = width ?? h * 0.042;
  const pts = jag(points ?? PRESETS[shape].pts, seed).map((p) => toFrame(p, box, w, h));
  const segs = pts.slice(1).map((b, i) => ({ a: pts[i]!, b, up: b[1] < pts[i]![1] }));
  const last = segs[segs.length - 1]!;
  // the arrowhead along the last segment, its tip past the end
  const ang = Math.atan2(last.b[1] - last.a[1], last.b[0] - last.a[0]);
  const hl = lw * 2.4;
  const tip: Pt = [last.b[0] + Math.cos(ang) * hl * 0.6, last.b[1] + Math.sin(ang) * hl * 0.6];
  const wing = (s: number): Pt => [tip[0] + Math.cos(ang + Math.PI + s * 0.62) * hl * 1.25, tip[1] + Math.sin(ang + Math.PI + s * 0.62) * hl * 1.25];
  const head = [tip, wing(1), wing(-1)].map((p) => p.join(",")).join(" ");
  const d = `M ${pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L ")}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: `drop-shadow(0 ${lw * 0.25}px ${lw * 0.4}px rgba(0,0,0,0.35))` }}>
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={lw * 1.55} strokeLinejoin="round" strokeLinecap="round" />
      {arrow ? <polygon points={head} fill="#ffffff" stroke="#ffffff" strokeWidth={lw * 0.55} strokeLinejoin="round" /> : null}
      {segs.map((s, i) => (
        <line key={i} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={s.up ? rise : fall} strokeWidth={lw} strokeLinecap="round" />
      ))}
      {arrow ? <polygon points={head} fill={last.up ? rise : fall} /> : null}
    </svg>
  );
};
