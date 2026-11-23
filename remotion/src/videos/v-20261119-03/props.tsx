// Shared pieces for "The Sahara used to be green. Why?" (device: flood or grow). The channel's vintage map of
// Africa: the Sahara's countries in sand, green washing over them from the south as the rains come; the
// animals, herds and rock paintings of the last green Sahara standing on their real spots; the dust plume that
// crosses the Atlantic to the Amazon.
import React from "react";
import { Ball, INK, Limb, STROKE, Txt } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export const SAHARA = ["Mauritania", "Mali", "Niger", "Chad", "Algeria", "Libya", "Egypt", "Sudan", "W. Sahara", "Morocco", "Tunisia"];
export const SAND = "#f3c14b", GREEN = "#5fae45", DUST = "#e0853a", GOLD = "#f2b134", RED = "#d9483b", LAKE = "#3d8fc4";
export const CHAD_LAKE: [number, number] = [17, 15];
export const TASSILI: [number, number] = [8.6, 25.4];
export const AMAZON: [number, number] = [-62, -4];
export const ANTARCTICA: [number, number] = [20, -78];

export const SEA = "url(#v0319sea)";
const Patterns: React.FC = () => (
  <defs>
    <pattern id="v0319sea" patternUnits="userSpaceOnUse" width={84} height={64}>
      <rect width={84} height={64} fill="#5f9fae" />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#9fcfd6" strokeWidth={6} strokeLinecap="round" />
      <path d="M 48 52 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#9fcfd6" strokeWidth={6} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** A blend of two hex colours. */
export function mixHex(a: string, b: string, k: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const t = Math.max(0, Math.min(1, k));
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

/** The Sahara's countries: sand at green = 0, painted green from the south as `green` goes 0 -> 1. */
export function saharaColors(green: number, sand = 1, extra: Record<string, Fill> = {}): Record<string, Fill> {
  const out: Record<string, Fill> = {};
  for (const n of SAHARA) out[n] = green > 0.001
    ? { fill: GREEN, paint: Math.min(1, green), from: [5, 2] }
    : { fill: SAND, k: Math.max(0.001, sand) };
  return { ...out, ...extra };
}

/** Africa and the Atlantic on the channel's old map, Mercator, a centre and a scale the camera moves. */
export const Africa: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.5} detail="110m" colors={colors} sea={SEA}>
    <Patterns />
    {children}
  </WorldMap>
);

/** A green layer over sand: the Sahara's countries painted again on top (used where both must show at once). */
export const Dunes: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  if (k <= 0) return null;
  const spots: [number, number][] = [[-8, 22], [2, 27], [12, 26], [22, 24], [-2, 19], [8, 20], [18, 19], [27, 22], [-12, 20], [14, 31], [5, 31], [25, 28]];
  return (
    <g opacity={k}>
      {spots.map((s, i) => {
        const xy = at(s);
        if (!xy) return null;
        const sh = Math.sin(t / 9 + i) * 4;
        return <path key={i} d={`M ${xy[0] - 46} ${xy[1] + sh} q 23 -26 46 0 q 23 -18 46 0`} fill="none" stroke="#a8742a" strokeWidth={8} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** A label on a little board on two legs, standing at [x, y] (its feet). */
export const Board: React.FC<{ x: number; y: number; w: number; text: string; sub?: string; k?: number; size?: number; bg?: string }> = ({ x, y, w, text, sub, k = 1, size = 90, bg = "#f4e3bd" }) => {
  if (k <= 0) return null;
  const h = sub ? size * 2.2 : size * 1.5;
  const rise = (1 - Math.min(1, k)) * 60;
  return (
    <g transform={`translate(0 ${rise})`} opacity={Math.min(1, k * 1.6)}>
      <Limb a={[x - w * 0.3, y]} b={[x - w * 0.3, y - 70]} w={10} color="#7a5230" sw={3} />
      <Limb a={[x + w * 0.3, y]} b={[x + w * 0.3, y - 70]} w={10} color="#7a5230" sw={3} />
      <rect x={x - w / 2 + 8} y={y - 70 - h + 10} width={w} height={h} rx={10} fill="#00000033" />
      <rect x={x - w / 2} y={y - 70 - h} width={w} height={h} rx={10} fill={bg} stroke={INK} strokeWidth={STROKE} />
      <Txt x={x} y={y - 70 - h + (sub ? size * 0.82 : h / 2)} size={size} fill={INK}>{text}</Txt>
      {sub ? <Txt x={x} y={y - 70 - size * 0.6} size={Math.max(50, size * 0.56)} fill="#4a3a2a" weight={700}>{sub}</Txt> : null}
    </g>
  );
};

// ------------------------------------------------------------------ animals and people (facing right, feet at 0,0)

export const Hippo: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
    {[-30, -10, 14, 32].map((lx) => <rect key={lx} x={lx} y={-24} width={14} height={24} fill="#7d7f99" stroke={INK} strokeWidth={4} />)}
    <ellipse cx={0} cy={-40} rx={52} ry={30} fill="#9496b0" stroke={INK} strokeWidth={4} />
    <ellipse cx={52} cy={-38} rx={26} ry={22} fill="#9496b0" stroke={INK} strokeWidth={4} />
    <circle cx={50} cy={-58} r={5} fill={INK} /><circle cx={44} cy={-64} r={6} fill="#9496b0" stroke={INK} strokeWidth={3} />
  </g>
);

export const Croc: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
    <path d="M -70 -6 Q -40 -26 10 -22 L 70 -16 L 72 -6 L 10 -2 Q -40 4 -70 -6 Z" fill="#4f8a3c" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[-40, -20, 0, 20].map((bx) => <path key={bx} d={`M ${bx} -22 l 6 -9 l 6 9`} fill="#3c6e2d" stroke={INK} strokeWidth={3} />)}
    <circle cx={26} cy={-24} r={5} fill="#f4efe4" stroke={INK} strokeWidth={2} />
  </g>
);

export const Giraffe: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
    {[-22, -8, 12, 24].map((lx) => <rect key={lx} x={lx} y={-60} width={8} height={60} fill="#e8b74f" stroke={INK} strokeWidth={3} />)}
    <ellipse cx={0} cy={-68} rx={36} ry={20} fill="#e8b74f" stroke={INK} strokeWidth={4} />
    <path d="M 22 -78 L 40 -150 L 54 -146 L 38 -72 Z" fill="#e8b74f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={56} cy={-152} rx={18} ry={10} fill="#e8b74f" stroke={INK} strokeWidth={4} />
    {[[-10, -70], [10, -64], [36, -110], [44, -130]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5} fill="#a8692b" />)}
  </g>
);

export const Camel: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`} opacity={Math.min(1, k)}>
    {[-26, -12, 14, 26].map((lx) => <rect key={lx} x={lx} y={-50} width={8} height={50} fill="#c9a06a" stroke={INK} strokeWidth={3} />)}
    <path d="M -36 -48 Q -30 -96 -6 -72 Q 10 -100 30 -52 Z" fill="#c9a06a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 28 -56 Q 50 -70 46 -96 L 62 -96 Q 66 -60 36 -46 Z" fill="#c9a06a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const Cow: React.FC<{ x: number; y: number; s: number; k?: number; paint?: boolean }> = ({ x, y, s, k = 1, paint = false }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
    {[-26, -12, 12, 24].map((lx) => <rect key={lx} x={lx} y={-30} width={8} height={30} fill={paint ? "#f4efe4" : "#5a3a28"} stroke={paint ? "none" : INK} strokeWidth={3} />)}
    <ellipse cx={0} cy={-40} rx={36} ry={18} fill={paint ? "#f4efe4" : "#f4efe4"} stroke={paint ? "#f4efe4" : INK} strokeWidth={paint ? 0 : 4} />
    {!paint ? <ellipse cx={-10} cy={-44} rx={10} ry={7} fill="#5a3a28" /> : null}
    <ellipse cx={40} cy={-46} rx={14} ry={11} fill={paint ? "#f4efe4" : "#5a3a28"} stroke={paint ? "none" : INK} strokeWidth={3} />
    <path d="M 34 -56 Q 30 -74 20 -72 M 46 -56 Q 52 -74 62 -72" fill="none" stroke={paint ? "#f4efe4" : "#f4efe4"} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const Herder: React.FC<{ x: number; y: number; s: number; k?: number; step: number }> = ({ x, y, s, k = 1, step }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
    <Limb a={[0, -40]} b={[-10 + step * 8, 0]} w={7} color="#3a2a1a" sw={2} />
    <Limb a={[0, -40]} b={[10 - step * 8, 0]} w={7} color="#3a2a1a" sw={2} />
    <Limb a={[0, -40]} b={[0, -78]} w={18} color="#c4442c" sw={3} />
    <Limb a={[6, -70]} b={[30, -44]} w={6} color="#8a5a2e" sw={2} />
    <Limb a={[30, -100]} b={[30, -10]} w={5} color="#7a5230" sw={2} />
    <Ball x={0} y={-90} r={12} fill="#a8693f" shadow={false} sw={3} />
  </g>
);

/** A place pin label written on. */
export const Name: React.FC<{ at: [number, number]; text: string; k: number; size?: number }> = ({ at, text, k, size = 56 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.max(1, Math.round(text.length * Math.min(1, k)));
  return <Txt x={xy[0]} y={xy[1]} size={size} fill="#ffffff" stroke={INK}>{text.slice(0, n)}<tspan opacity={0}>{text.slice(n)}</tspan></Txt>;
};

const props = { SAHARA };
export default props;
