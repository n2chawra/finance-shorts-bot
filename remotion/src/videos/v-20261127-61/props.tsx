// Shared pieces for "Keralam aur Arunachal ka pakshi ek kyun?" (India Maps: every state's official bird, the map filling
// state by state; the Indian roller on three states, the great hornbill on both ends of India). India's official map from
// the India layer (flat/india.tsx). Bird names are words from the topic's sourced items (Wikipedia's list of Indian state
// birds, Nov 2026); the only figure (the count of states) comes from params.fig.
import React from "react";
import { Ball, Block, INK, STROKE, Txt, rng, shade } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { CoastSurf, IndiaMap, SeaRipples, StateTag, frameOf, lerpFrame, stateColours, type StateFx } from "../../flat/india";

export { lerpFrame, StateTag };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

/** Each named state's bird in spoken Hindi, from the topic's items (one source for the list). */
export const BIRD: Record<string, string> = {
  Punjab: "बाज़", "Himachal Pradesh": "जुजुराना", Uttarakhand: "मोनाल", "Uttar Pradesh": "सारस",
  Rajasthan: "गोडावण", Gujarat: "फ्लेमिंगो", "Madhya Pradesh": "दूधराज", Maharashtra: "हरियल",
  Bihar: "गौरैया", Jharkhand: "कोयल", "West Bengal": "किलकिला",
  Karnataka: "नीलकंठ", Telangana: "नीलकंठ", Odisha: "नीलकंठ",
  Kerala: "धनेश", "Arunachal Pradesh": "धनेश",
};

export const NORTH = ["Punjab", "Himachal Pradesh", "Uttarakhand", "Uttar Pradesh"];
export const WEST = ["Rajasthan", "Gujarat", "Madhya Pradesh", "Maharashtra"];
export const EAST = ["Bihar", "Jharkhand", "West Bengal"];
export const ROLLER = ["Karnataka", "Telangana", "Odisha"];
export const ENDS = ["Kerala", "Arunachal Pradesh"];

export const BLUE = "#3d8bd9";
export const GREEN = "#2f9e5a";
const TONES = ["#ffc43d", "#e8453c", "#f08a3c", "#b467c9", "#e66aa0", "#c98a4b", "#2fb5a5"];
export const COLOUR: Record<string, string> = {
  ...stateColours(TONES, undefined, 3),
  ...Object.fromEntries(ROLLER.map((s) => [s, BLUE])),
  ...Object.fromEntries(ENDS.map((s) => [s, GREEN])),
};

/** A framing moved up by `px` on screen, so the map sits above a Short's captions band. */
const up = (f: Frame, px: number): Frame => ({ center: [f.center[0], f.center[1] - px / (f.scale * Math.PI / 180)], scale: f.scale });
const fit = (names: string[], pad: number, h = 1300, lift = 300): Frame => up(frameOf(names, 1080, h, pad), lift);

export const F = {
  india: fit(["India"], 50, 1420, 250),
  mid: up({ ...frameOf(["India"], 1080, 1420, 50), scale: frameOf(["India"], 1080, 1420, 50).scale * 1.22 }, 250),
  north: fit(NORTH, 90),
  west: fit(WEST, 80),
  east: fit(EAST, 110),
  south: fit(["Karnataka", "Telangana", "Odisha", "Kerala", "Tamil Nadu"], 80),
  roller: fit(ROLLER, 70),
  ghats: fit(["Kerala", "Karnataka", "Goa"], 90),
} satisfies Record<string, Frame>;

export type BeatId = "hook" | "promise" | "north" | "west" | "east" | "turn" | "payoff" | "forests" | "loop";
/** The states painted before a beat starts. */
export const doneBefore = (b: BeatId): string[] => {
  const order: BeatId[] = ["north", "west", "east", "turn", "payoff"];
  const groups: Record<string, string[]> = { north: NORTH, west: WEST, east: EAST, turn: ROLLER, payoff: ENDS };
  const i = order.indexOf(b);
  if (b === "forests" || b === "loop") return [...NORTH, ...WEST, ...EAST, ...ROLLER, ...ENDS];
  return i <= 0 ? [] : order.slice(0, i).flatMap((g) => groups[g]!);
};
export const painted = (names: string[]): Record<string, StateFx> => Object.fromEntries(names.map((n) => [n, { fill: COLOUR[n]! }]));

/** The map with the camera at `frame`; children draw in frame pixels (useAt for places). */
export const MapView: React.FC<{ frame: Frame; states: Record<string, StateFx>; dim?: number; t?: number; children?: React.ReactNode }> = ({ frame, states, dim = 0.45, t = 0, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim}>
    <g data-probe="skip"><SeaRipples t={t} gap={56} /><CoastSurf t={t} k={0.8} /></g>
    {children}
  </IndiaMap>
);

/** A bird drawn flat (a silhouette with a wing that flaps): `s` its length, `flap` the wing phase, `c` its colour. */
export const BirdShape: React.FC<{ x: number; y: number; s: number; flap: number; c?: string; rot?: number; casque?: boolean }> = ({ x, y, s, flap, c = INK, rot = 0, casque }) => {
  const w = Math.sin(flap) * 0.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 100})`}>
      <path d={`M -10 0 L ${-45} ${-55 * (0.4 + w)} L 15 -6 Z`} fill={shade(c, 0.2)} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={38} ry={14} fill={c} stroke={INK} strokeWidth={4} />
      <circle cx={36} cy={-8} r={12} fill={c} stroke={INK} strokeWidth={4} />
      <path d={`M 46 -10 L ${casque ? 82 : 64} ${casque ? -2 : -6} L 46 -2 Z`} fill="#ffc43d" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {casque ? <path d="M 40 -20 Q 60 -30 74 -10 L 50 -14 Z" fill="#ffc43d" stroke={INK} strokeWidth={3} /> : null}
      <path d="M -36 0 L -62 -10 L -62 10 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M -4 2 L ${-30} ${50 * (0.4 - w)} L 18 4 Z`} fill={shade(c, -0.1)} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={40} cy={-11} r={3} fill="#ffffff" />
    </g>
  );
};

/** A dotted arc between two places on the map, drawn on as `k` goes 0 -> 1; `bow` bends it (px). Returns the point at `at`. */
export const arcPoint = (a: [number, number], b: [number, number], bow: number, q: number): [number, number] => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const cx = mx + (dy / len) * bow, cy = my - (dx / len) * bow;
  const u = 1 - q;
  return [u * u * a[0] + 2 * u * q * cx + q * q * b[0], u * u * a[1] + 2 * u * q * cy + q * q * b[1]];
};
export const Arc: React.FC<{ a: LL; b: LL; k: number; bow?: number; color?: string; solid?: boolean; children?: (xy: [number, number]) => React.ReactNode; ride?: number; dots?: boolean }> = ({ a, b, k, bow = 160, color = "#ffffff", solid, children, ride, dots: showDots = true }) => {
  const at = useAt();
  const pa = at(a), pb = at(b);
  if (!pa || !pb || k <= 0) return null;
  const n = 46;
  const dots = Array.from({ length: Math.floor(n * Math.min(1, k)) + 1 }, (_, i) => arcPoint(pa, pb, bow, i / n));
  return (
    <g>
      {!showDots ? null : solid ? (
        <polyline points={dots.map((d) => d.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" opacity={0.95} />
      ) : dots.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r={8} fill={color} stroke={INK} strokeWidth={3} />)}
      {children && ride !== undefined ? children(arcPoint(pa, pb, bow, Math.max(0, Math.min(1, ride)))) : null}
    </g>
  );
};

/** A tree drawn flat: trunk and two canopy balls; `k` grows it out of the ground. */
export const Tree: React.FC<{ x: number; y: number; s: number; k: number; tone?: string }> = ({ x, y, s, k, tone = "#1f7a45" }) => {
  if (k <= 0) return null;
  const g = Math.min(1, k) * (k < 1 ? 1 + 0.15 * Math.sin(k * Math.PI) : 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${g})`}>
      <rect x={-s * 0.07} y={-s * 0.5} width={s * 0.14} height={s * 0.5} fill="#7a4e2a" stroke={INK} strokeWidth={3} />
      <Ball x={0} y={-s * 0.62} r={s * 0.32} fill={tone} sw={4} shadow={false} />
      <Ball x={-s * 0.18} y={-s * 0.82} r={s * 0.22} fill={shade(tone, 0.15)} sw={4} shadow={false} />
    </g>
  );
};

/** Trees scattered along a line of [lon, lat] points, each growing in turn as `k` goes 0 -> 1. */
export const Forest: React.FC<{ line: LL[]; k: number; n: number; seed: string; s?: number; spread?: number }> = ({ line, k, n, seed, s = 70, spread = 0.7 }) => {
  const at = useAt();
  const r = rng(seed);
  const spots = Array.from({ length: n }, (_, i) => {
    const q = i / Math.max(1, n - 1) * (line.length - 1);
    const j = Math.min(line.length - 2, Math.floor(q)), f = q - j;
    const a = line[j]!, b = line[j + 1]!;
    return [a[0] + (b[0] - a[0]) * f + (r() - 0.5) * spread, a[1] + (b[1] - a[1]) * f + (r() - 0.5) * spread] as LL;
  });
  return (
    <g>
      {spots.map((ll, i) => {
        const xy = at(ll);
        const ki = Math.max(0, Math.min(1.2, k * n - i * 0.6) / 1.2);
        return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={s} k={ki} /> : null;
      }).sort(() => 0)}
    </g>
  );
};

/** A wooden signboard on two posts standing in the sea: a big figure and a label under it. */
export const Signboard: React.FC<{ x: number; y: number; k: number; value: string; label: string; badge: number; t: number }> = ({ x, y, k, value, label, badge, t }) => {
  if (k <= 0) return null;
  const rise = (1 - Math.min(1, k)) * 240;
  return (
    <g transform={`translate(${x} ${y + rise})`} opacity={Math.min(1, k * 2)}>
      <Block x={-120} y={-30} w={24} h={300} fill="#8a5a34" sw={4} shadow={false} />
      <Block x={96} y={-30} w={24} h={300} fill="#8a5a34" sw={4} shadow={false} />
      <Block x={-200} y={-300} w={400} h={290} r={18} fill="#b97a45" sw={STROKE} />
      <rect x={-184} y={-284} width={368} height={258} rx={12} fill="none" stroke="#7a4e2a" strokeWidth={5} />
      <Txt x={-40} y={-190} size={120} fill="#ffffff" weight={900} stroke={INK}>{value}</Txt>
      <Txt x={0} y={-80} size={56} fill="#ffffff" weight={800} stroke={INK}>{label}</Txt>
      {badge > 0 ? (
        <g transform={`translate(110 -200) scale(${Math.min(1, badge) * (badge < 1 ? 1.2 : 1)})`}>
          <circle r={62} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
          <BirdShape x={-6} y={4} s={95} flap={t / 4} c={GREEN} />
        </g>
      ) : null}
    </g>
  );
};

/** A big stamped question mark. */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 92 }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** Each state's middle-ish spot for a bird tag (lon, lat), where the centroid would put a tag off a small state. */
export const SPOT: Record<string, LL> = {
  Kerala: [76.3, 10.2], "Arunachal Pradesh": [94.3, 28.0], Karnataka: [75.8, 14.6], Telangana: [79.0, 17.9], Odisha: [84.4, 20.5],
};

export default MapView;
