// Shared pieces for "What if the Suez Canal closed for a year?" (device: route and race). The vintage
// political map of the channel, at two scales: the world's sea lanes, and Egypt's canal close up. Routes
// draw themselves with ships riding their tips; the canal is drawn on top of the land as a blue line.
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export const CANAL: [number, number][] = [[32.31, 31.27], [32.32, 30.9], [32.33, 30.6], [32.35, 30.3], [32.56, 29.95]];
export const SHANGHAI: [number, number] = [121.5, 31.2];
export const ROTTERDAM: [number, number] = [4.1, 51.95];
export const CAPE: [number, number] = [18.4, -34.4];
export const PANAMA: [number, number] = [-79.6, 9.1];
export const SUEZ_MID: [number, number] = [32.34, 30.5];

/** Shanghai to Rotterdam through Suez, and the long way round the Cape of Good Hope. */
export const VIA_SUEZ: [number, number][] = [SHANGHAI, [110, 8], [103.8, 1.3], [80.5, 5.8], [55, 13.5], [43.4, 12.6], [38.5, 20], [33.8, 27.5], ...CANAL.slice().reverse(), [20, 34], [-5.6, 35.95], [-9.8, 40], [-5.5, 48.5], ROTTERDAM];
export const VIA_CAPE: [number, number][] = [SHANGHAI, [110, 8], [103.8, 1.3], [80.5, 5.8], [60, -8], [42, -27], [20, -36.5], [8, -25], [-10, -5], [-20, 14], [-16, 30], [-9.8, 40], [-5.5, 48.5], ROTTERDAM];

export const RED = "#d9483b", GOLD = "#f2b134", SEA_LANE = "#fff1c2";

const WORLD_ONLY = undefined;   // the world view draws every country (110m)
const NEAR_EGYPT = ["Egypt", "Israel", "Jordan", "Saudi Arabia", "Sudan", "Libya", "Palestine", "Cyprus", "Syria", "Lebanon", "Turkey", "Greece", "Iraq", "Eritrea", "Chad"];

/** The world, framed on Asia, Africa and Europe: a centre and a scale (pixels per radian) the camera moves. */
export const World: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.6} detail={scale > 2500 ? "50m" : "110m"}
    only={scale > 2500 ? NEAR_EGYPT : WORLD_ONLY} names={scale > 2500 ? ["Saudi Arabia", "Sudan", "Libya", "Jordan"] : false} colors={colors}>
    {children}
  </WorldMap>
);

/** The canal itself, drawn on as `k` goes 0 -> 1 (north to south), wide enough to read at any scale. */
export const Canal: React.FC<{ k: number; width?: number; color?: string }> = ({ k, width = 14, color = "#2f7fb8" }) => {
  const at = useAt();
  const pts = CANAL.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (pts.length < 2 || k <= 0) return null;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 1`} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 1`} />
    </g>
  );
};

/** A container ship, facing right (rotate it along its route): hull, bridge, stacked boxes. `s` is its length. */
export const Ship: React.FC<{ x: number; y: number; s: number; angle?: number; hull?: string }> = ({ x, y, s, angle = 0, hull = "#2c3e66" }) => {
  const flip = Math.abs(angle) > 90;
  return (
    <g transform={`translate(${x} ${y}) rotate(${flip ? angle - 180 : angle}) scale(${(flip ? -1 : 1) * s / 100} ${s / 100})`}>
      <path d="M -50 -6 L 52 -6 L 44 12 L -46 12 Z" fill={hull} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {[-38, -24, -10, 4, 18].map((bx, i) => (
        <g key={bx}>
          <rect x={bx} y={-16} width={13} height={10} fill={["#d9483b", "#f2b134", "#3a9d5d", "#3b7dd8", "#e07a3a"][i]} stroke={INK} strokeWidth={1.5} />
          <rect x={bx} y={-26} width={13} height={10} fill={["#3b7dd8", "#d9483b", "#f2b134", "#e07a3a", "#3a9d5d"][i]} stroke={INK} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={34} y={-28} width={12} height={22} fill="#f4efe4" stroke={INK} strokeWidth={2} />
    </g>
  );
};

/** A ship riding a route's tip (for MapRoute's `mover`). */
export const rider = (s: number, hull?: string) => (x: number, y: number, a: number) => <Ship x={x} y={y - 4} s={s} angle={a} hull={hull} />;

/** A pin label: a dot with a name beside it. */
export const Place: React.FC<{ at: [number, number]; name: string; k?: number; size?: number; left?: boolean }> = ({ at, name, k = 1, size = 44, left = false }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.round(name.length * Math.min(1, k * 1.4));
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Ball x={xy[0]} y={xy[1]} r={12} fill={GOLD} shadow={false} sw={4} />
      <Txt x={xy[0] + (left ? -22 : 22)} y={xy[1]} size={size} fill="#ffffff" anchor={left ? "end" : "start"} stroke={INK}>{name.slice(0, n)}</Txt>
    </g>
  );
};

/** A striped barrier swinging down across the canal (k 0 open .. 1 shut). */
export const Barrier: React.FC<{ x: number; y: number; s: number; k: number }> = ({ x, y, s, k }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Block x={-58} y={-40} w={16} h={56} fill="#2f3445" shadow={false} sw={4} />
    <g transform={`rotate(${-80 * (1 - k)} -50 -32)`}>
      <rect x={-50} y={-40} width={110} height={16} fill="#ffffff" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <rect key={i} x={-38 + i * 34} y={-40} width={17} height={16} fill={RED} />)}
    </g>
  </g>
);

/** A wall calendar tag; `label` is its word (a month name or YEAR). */
export const Calendar: React.FC<{ x: number; y: number; s: number; label: string }> = ({ x, y, s, label }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <rect x={-60} y={-50} width={120} height={110} rx={10} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.8} />
    <rect x={-60} y={-50} width={120} height={32} rx={10} fill={RED} stroke={INK} strokeWidth={STROKE * 0.8} />
    {[-30, 30].map((rx) => <Limb key={rx} a={[rx, -62]} b={[rx, -40]} w={8} color="#9aa0ad" sw={3} />)}
    <Txt x={0} y={15} size={34} fill={INK}>{label}</Txt>
  </g>
);

/** A digger with a spade (the canal being dug), at a spot on the map. */
export const Digger: React.FC<{ x: number; y: number; s: number; swing: number }> = ({ x, y, s, swing }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Limb a={[0, -10]} b={[0, -60]} w={18} color="#f3e1c1" sw={3} />
    <Ball x={0} y={-74} r={15} fill="#c98c5a" shadow={false} sw={3} />
    <path d="M -16 -84 L 16 -84 L 10 -94 L -10 -94 Z" fill="#e8d2a0" stroke={INK} strokeWidth={3} />
    <g transform={`rotate(${-30 + 40 * swing} 0 -40)`}>
      <Limb a={[0, -40]} b={[34, -4]} w={5} color="#7a5230" sw={2} />
      <path d="M 30 -8 L 44 2 L 38 12 L 26 2 Z" fill="#9aa0ad" stroke={INK} strokeWidth={2} />
    </g>
    <ellipse cx={30} cy={8} rx={22} ry={8} fill={shade("#e8d4a2", -0.2)} stroke={INK} strokeWidth={2} />
  </g>
);

const props = { CANAL, VIA_SUEZ, VIA_CAPE };
export default props;
