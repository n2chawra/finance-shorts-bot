// Shared pieces for "UP, Maharashtra ya Assam: sabse zyada padosi kiske?": rings of neighbours lighting round three
// states, Uttar Pradesh's the biggest. Device: the ring, a neighbour counter climbing as UP's neighbours light. India's
// official map (flat/india.tsx); the counter counts the lit states in code and lands on params.fig.
import React from "react";
import { Block, INK, STROKE, Txt } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { IndiaMap, frameOf, lerpFrame, type StateFx } from "../../flat/india";

export { lerpFrame };
export type LL = [number, number];
export type Frame = { center: LL; scale: number };

const lift = (f: Frame, px: number): Frame => ({ center: [f.center[0], f.center[1] - (px / f.scale) * (180 / Math.PI)], scale: f.scale });
export const fit = (names: string[], pad: number, px = 200): Frame => lift(frameOf(names, 1080, 1360, pad), px);

export const F = {
  india: fit(["India"], 60, 200),
  three: { center: [84.4, 21.6] as LL, scale: fit(["India"], 60, 0).scale * 1.45 },
  mid: fit(["Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Bihar"], 40, 210),
  maha: fit(["Maharashtra", "Gujarat", "Karnataka", "Chhattisgarh", "Goa"], 50, 210),
  mahaSouth: fit(["Maharashtra", "Karnataka", "Goa", "Telangana"], 60, 210),
  assam: fit(["Assam", "Arunachal Pradesh", "Mizoram", "Tripura", "West Bengal"], 50, 210),
  ne: fit(["Assam", "Mizoram", "Manipur", "Tripura", "Nagaland"], 70, 210),
  north: fit(["Uttar Pradesh", "Rajasthan", "Bihar", "Madhya Pradesh", "Himachal Pradesh"], 40, 220),
  up: fit(["Uttar Pradesh"], 120, 220),
  upWest: fit(["Uttar Pradesh", "Haryana", "Delhi", "Uttarakhand"], 90, 220),
  upEast: fit(["Uttar Pradesh", "Bihar", "Jharkhand", "Chhattisgarh"], 60, 220),
  nepal: fit(["Uttar Pradesh", "Uttarakhand", "Bihar", "Sikkim"], 60, 230),
} satisfies Record<string, Frame>;

export const GOLD = "#ffc43d";
export const UP = "#f2a33a";
export const MH = "#e86a8c";
export const AS = "#5fb3d9";
/** Neighbour tones (forest palette): alternated so no two touching neighbours share one. */
export const TONES = ["#5fb36b", "#8fc77a", "#3f9a6e", "#b9d77e", "#2f7d5b"];

/** A state's middle on the map, for link lines and tags. */
export const MID: Record<string, LL> = {
  "Uttar Pradesh": [80.9, 26.9], Uttarakhand: [79.2, 30.1], "Himachal Pradesh": [77.2, 31.9], Haryana: [76.1, 29.1], Delhi: [77.1, 28.65],
  Rajasthan: [73.8, 26.6], "Madhya Pradesh": [78.3, 23.5], Chhattisgarh: [82.0, 21.6], Jharkhand: [85.3, 23.6], Bihar: [85.6, 25.7],
  Maharashtra: [76.0, 19.4], Gujarat: [71.5, 22.7], Goa: [74.0, 15.35], Karnataka: [75.7, 14.8], Telangana: [79.0, 17.9],
  Assam: [92.8, 26.2], "Arunachal Pradesh": [94.5, 28.0], Nagaland: [94.4, 26.1], Manipur: [93.9, 24.7], Mizoram: [92.8, 23.3],
  Tripura: [91.7, 23.8], Meghalaya: [91.3, 25.5], "West Bengal": [87.9, 23.4], Nepal: [84.0, 28.3],
};

export const MapView: React.FC<{ frame: Frame; states?: Record<string, StateFx>; dim?: number; children?: React.ReactNode }> = ({ frame, states = {}, dim = 0.45, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet="#f1e6cf">{children}</IndiaMap>
);

/** A bright link line from one state's middle to another's, drawn on with `k`. */
export const Link: React.FC<{ from: LL; to: LL; k: number; color?: string }> = ({ from, to, k, color = "#ffffff" }) => {
  const at = useAt();
  const a = at(from), b = at(to);
  if (!a || !b || k <= 0) return null;
  const q = Math.min(1, k);
  const x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q;
  return (
    <g data-probe="skip">
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={INK} strokeWidth={13} strokeLinecap="round" opacity={0.5} />
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray="18 10" />
      <circle cx={x} cy={y} r={12} fill={color} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A ring pulse round (lon, lat). */
export const Ring: React.FC<{ at: LL; k: number; r?: number; color?: string }> = ({ at, k, r = 120, color = "#ffd84a" }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0 || k >= 1) return null;
  return <circle cx={xy[0]} cy={xy[1]} r={r * (0.4 + k)} fill="none" stroke={color} strokeWidth={10 * (1 - k)} opacity={1 - k} data-probe="skip" />;
};

/** The neighbour counter: a wooden board at the top with a label and the count. */
export const Counter: React.FC<{ x: number; y: number; value: string; label: string; k: number; bump?: number }> = ({ x, y, value, label, k, bump = 0 }) => {
  if (k <= 0) return null;
  const W = 520, H = 230;
  const s = (0.7 + 0.3 * Math.min(1, k)) * (1 + 0.08 * bump);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <rect x={-W / 2 + 8} y={-H / 2 + 10} width={W} height={H} rx={26} fill={INK} opacity={0.4} />
      <Block x={-W / 2} y={-H / 2} w={W} h={H} r={26} fill="#fff7e0" sw={STROKE} shadow={false} />
      <Txt x={0} y={-H / 2 + 52} size={46} fill={INK} weight={800}>{label}</Txt>
      <Txt x={0} y={42} size={112} fill="#c2410c" weight={900}>{value}</Txt>
    </g>
  );
};

/** A big question mark in a white disc at (x, y). */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 90 }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle cx={6} cy={8} r={r} fill={INK} opacity={0.35} />
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** Screen point of (lon, lat) for children. */
export const OnMap: React.FC<{ ll: LL; children: (x: number, y: number) => React.ReactNode }> = ({ ll, children }) => {
  const xy = useAt()(ll);
  if (!xy) return null;
  return <>{children(xy[0], xy[1])}</>;
};

/** A comment bubble at (x, y). */
export const Bubble: React.FC<{ x: number; y: number; k: number; text: string }> = ({ x, y, k, text }) => {
  if (k <= 0) return null;
  const s = 0.5 + 0.5 * Math.min(1, k);
  const W = Math.max(260, text.length * 30 + 80), H = 110;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <path d={`M ${-W / 2 + 40} ${H / 2} L ${-W / 2 + 30} ${H / 2 + 46} L ${-W / 2 + 90} ${H / 2} Z`} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.7} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={30} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.7} />
      <Txt x={0} y={4} size={54} fill={INK} weight={800}>{text}</Txt>
    </g>
  );
};

const props = { F, MID };
export default props;
