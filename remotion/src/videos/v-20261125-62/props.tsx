// Shared pieces for "China or Pakistan? Which neighbour shares India's longest land border?" Device: the borders
// traced one by one, a countdown to the longest. India's official map (flat/india.tsx); neighbours with their flags
// (Neighbour, BorderLine, flat/flags.tsx). Every length comes from params.fig.
import React from "react";
import { Block, INK, STROKE, Txt } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { IndiaMap, frameOf, lerpFrame, type StateFx } from "../../flat/india";

export { lerpFrame };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

const lift = (f: Frame, px: number): Frame => ({ center: [f.center[0], f.center[1] - (px / f.scale) * (180 / Math.PI)], scale: f.scale });
const fit = (names: string[], pad: number, px = 230): Frame => lift(frameOf(names, 1080, 1360, pad), px);

export const F = {
  india: fit(["India"], 70, 200),
  north: fit(["Jammu and Kashmir", "Ladakh", "Punjab", "Rajasthan", "Uttarakhand"], 40, 230),
  bhutan: fit(["Sikkim", "Assam", "Arunachal Pradesh"], 120),
  myanmar: fit(["Manipur", "Mizoram", "Nagaland", "Arunachal Pradesh"], 90),
  nepal: fit(["Uttar Pradesh", "Bihar", "Sikkim", "Uttarakhand"], 60),
  east: fit(["West Bengal", "Assam", "Tripura", "Mizoram", "Meghalaya"], 60),
  bd: fit(["West Bengal", "Tripura", "Meghalaya", "Mizoram"], 110),
} satisfies Record<string, Frame>;

/** Each neighbour: its fill (from its flag), where its tag and flag sign stand, and a point on its border with India. */
export const N: Record<string, { fill: string; tag: LL; border: LL; hi: string }> = {
  China: { fill: "#ee1c25", tag: [84.5, 32.4], border: [80.0, 32.2], hi: "चीन" },
  Pakistan: { fill: "#01411c", tag: [68.4, 28.4], border: [70.3, 27.2], hi: "पाकिस्तान" },
  Bhutan: { fill: "#ff8a1c", tag: [90.4, 27.5], border: [90.6, 26.8], hi: "भूटान" },
  Myanmar: { fill: "#34b233", tag: [95.8, 22.2], border: [94.3, 23.6], hi: "म्यांमार" },
  Nepal: { fill: "#dc143c", tag: [84.0, 28.4], border: [84.2, 27.4], hi: "नेपाल" },
  Bangladesh: { fill: "#006a4e", tag: [90.2, 23.9], border: [89.0, 25.2], hi: "बांग्लादेश" },
  Afghanistan: { fill: "#8a8f98", tag: [66.0, 34.0], border: [74.6, 37.0], hi: "अफ़ग़ानिस्तान" },
};
export const ALL = ["Pakistan", "Afghanistan", "China", "Nepal", "Bhutan", "Bangladesh", "Myanmar"];

/** The map, with the camera at `frame`. */
export const MapView: React.FC<{ frame: Frame; states?: Record<string, StateFx>; dim?: number; children?: React.ReactNode }> = ({ frame, states = {}, dim = 0.5, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet="#f1e6cf">{children}</IndiaMap>
);

/** A flag on a pole planted on the map at (lon, lat), with the country's name on a plate under it; `k` plants it. */
export const FlagSign: React.FC<{ at: LL; name: string; label: string; k: number; t: number; size?: number }> = ({ at, name, label, k, t, size = 1 }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy || k <= 0) return null;
  const fw = 210 * size, fh = 140 * size, pole = 260 * size;
  const x = Math.min(Math.max(xy[0], 40), 1080 - 170 - fw), y = xy[1];
  const rise = (1 - Math.min(1, k)) * pole;
  const wave = Math.sin(t / 7) * 3;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, k * 2)}>
      <ellipse cx={0} cy={4} rx={22 * size} ry={7 * size} fill={INK} opacity={0.35} />
      <rect x={-5 * size} y={-pole + rise} width={10 * size} height={pole - rise} fill="#5b5f66" stroke={INK} strokeWidth={3} />
      <g transform={`translate(${5 * size} ${-pole + rise}) skewY(${wave})`}>
        <rect x={6} y={8} width={fw} height={fh} fill={INK} opacity={0.35} />
        <FlagArt name={name} x={0} y={0} w={fw} h={fh} />
        <rect x={0} y={0} width={fw} height={fh} fill="none" stroke={INK} strokeWidth={4} />
      </g>
      <g transform={`translate(${fw / 2 + 5 * size} ${-pole + rise + fh + 56 * size})`} opacity={Math.min(1, k * 1.5)}>
        <rect x={-label.length * 14 * size - 26} y={-34 * size} width={label.length * 28 * size + 52} height={68 * size} rx={34 * size} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.7} />
        <Txt x={0} y={2} size={46 * size} fill={INK} weight={800}>{label}</Txt>
      </g>
    </g>
  );
};

/** A length tag dropped onto a border: a yellow ruler-like plate with the length. (lon, lat) is the point it marks. */
export const LengthTag: React.FC<{ at: LL; k: number; text: string; dx?: number; dy?: number; glow?: number; big?: boolean }> = ({ at, k, text, dx = 0, dy = -110, glow = 0, big = false }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy || k <= 0) return null;
  const fs = big ? 96 : 60;
  const W = Math.max(260, text.length * fs * 0.56 + 70), H = fs * 1.6;
  const x = Math.min(Math.max(xy[0] + dx, W / 2 + 30), 1080 - 160 - W / 2), y = xy[1] + dy;
  const s = 1 + (1 - Math.min(1, k)) * 0.7;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <line x1={xy[0]} y1={xy[1]} x2={x} y2={y + H / 2} stroke={INK} strokeWidth={5} />
      <circle cx={xy[0]} cy={xy[1]} r={10} fill="#ffd84a" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {glow > 0 ? <rect x={-W / 2 - 16} y={-H / 2 - 16} width={W + 32} height={H + 32} rx={24} fill="#ffd84a" opacity={0.45 * glow} data-probe="skip" /> : null}
        <rect x={-W / 2 + 8} y={-H / 2 + 10} width={W} height={H} rx={18} fill={INK} opacity={0.4} />
        <Block x={-W / 2} y={-H / 2} w={W} h={H} r={18} fill="#ffc43d" sw={STROKE} shadow={false} />
        {Array.from({ length: Math.floor(W / 30) }, (_, i) => <line key={i} x1={-W / 2 + 15 + i * 30} y1={H / 2 - 4} x2={-W / 2 + 15 + i * 30} y2={H / 2 - (i % 2 ? 14 : 24)} stroke={INK} strokeWidth={3} data-probe="skip" />)}
        <Txt x={0} y={-4} size={fs} fill={INK} weight={900}>{text}</Txt>
      </g>
    </g>
  );
};

/** A big red cross stamped at screen (x, y). */
export const Cross: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 110 }) => {
  if (k <= 0) return null;
  const s = 1 + (1 - Math.min(1, k)) * 0.8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-6)`} opacity={Math.min(1, k * 2)} data-probe="skip">
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke={INK} strokeWidth={r * 0.42} strokeLinecap="round" transform="translate(6 8)" opacity={0.35} />
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke="#e8453c" strokeWidth={r * 0.32} strokeLinecap="round" />
    </g>
  );
};

/** A big question mark in a white disc at screen (x, y). */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number; spin?: number }> = ({ x, y, k, r = 90, spin = 0 }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle cx={6} cy={8} r={r} fill={INK} opacity={0.35} />
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** Screen position of a [lon, lat] on the map. */
export const OnMap: React.FC<{ at: LL; children: (x: number, y: number) => React.ReactNode }> = ({ at, children }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy) return null;
  return <>{children(xy[0], xy[1])}</>;
};

/** A comment bubble at screen (x, y), its middle; `k` pops it in. */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; k: number; text: string; size?: number; o?: number }> = ({ x, y, w, h, k, text, size = 60, o = 1 }) => {
  if (k <= 0 || o <= 0) return null;
  const tail = `M ${-w * 0.28} ${h / 2 - 4} L ${-w * 0.36} ${h / 2 + 62} L ${-w * 0.1} ${h / 2 - 4} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * Math.min(1.2, k)})`} opacity={Math.min(1, k * 2) * o}>
      <g transform="translate(8 11)" opacity={0.4}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill={INK} /><path d={tail} fill={INK} /></g>
      <path d={tail} fill="#ffffff" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      <rect x={-w * 0.27} y={h / 2 - 10} width={w * 0.2} height={16} fill="#ffffff" />
      <Txt x={0} y={4} size={size} fill={INK} weight={800}>{text}</Txt>
    </g>
  );
};

/** A thick arrow at screen pixels from (x1, y1) to (x2, y2), drawn on as `k` goes 0 -> 1. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string }> = ({ x1, y1, x2, y2, k, color = "#ffc43d" }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k), ex = x1 + (x2 - x1) * q, ey = y1 + (y2 - y1) * q;
  const a = Math.atan2(y2 - y1, x2 - x1), hl = 46;
  const head = `M ${ex} ${ey} L ${ex - hl * Math.cos(a - 0.5)} ${ey - hl * Math.sin(a - 0.5)} L ${ex - hl * Math.cos(a + 0.5)} ${ey - hl * Math.sin(a + 0.5)} Z`;
  return (
    <g data-probe="skip">
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={14} strokeLinecap="round" />
      <path d={head} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

export default MapView;
