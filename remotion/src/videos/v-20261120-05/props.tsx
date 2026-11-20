// Shared pieces for "One passport for every UN country?" (device: erase and redraw). The political world map
// on the channel's old paper: every country its own tone and border until an eraser sweeps across and the
// countries melt into one colour; the loop draws them back. Flags, passports, notes and signs stand on
// their real spots with useAt.
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { WorldMap, countries, useAt, type Fill } from "../../flat/map";

export const ONE = "#e3b56f", GOLD = "#f2b134", RED = "#d9483b", NAVY = "#2c3e66";

export const LISBON: [number, number] = [-9.14, 38.72];
export const SINGAPORE: [number, number] = [103.82, 1.35];
export const LONDON: [number, number] = [-0.12, 51.5];
export const TOKYO: [number, number] = [139.7, 35.7];
export const DELHI: [number, number] = [77.2, 28.6];
export const BEIJING: [number, number] = [116.4, 39.9];
export const WASHINGTON: [number, number] = [-77.04, 38.9];

/** Lisbon to Singapore by road, through the stops a truck would take. */
export const ROAD: [number, number][] = [LISBON, [-3.7, 40.4], [2.35, 48.85], [13.4, 52.5], [21, 52.2], [28.97, 41.0], [44.4, 33.3], [51.4, 35.7], [67, 24.9], [DELHI[0], DELHI[1]], [88.4, 22.6], [96.1, 19.7], [100.5, 13.75], [101.7, 3.1], SINGAPORE];

/** Each country's middle longitude (from its outline's box), for the eraser's sweep. */
const MID = new Map<string, number>();
const midLon = (name: string): number => {
  if (MID.size === 0) {
    for (const c of countries("110m")) {
      let lo = 999, hi = -999;
      const walk = (a: unknown): void => {
        if (Array.isArray(a) && typeof a[0] === "number") { lo = Math.min(lo, a[0] as number); hi = Math.max(hi, a[0] as number); return; }
        if (Array.isArray(a)) for (const x of a) walk(x);
      };
      walk((c.geometry as unknown as { coordinates: unknown }).coordinates);
      MID.set(c.properties.name, hi - lo > 300 ? 100 : (lo + hi) / 2);
    }
  }
  return MID.get(name) ?? 0;
};
const NAMES = (): string[] => countries("110m").map((c) => c.properties.name);

/** How far the eraser has merged each country: `sweep` is the eraser's longitude (-190 none .. 200 all). */
export const merged = (sweep: number) => (name: string): number => Math.max(0, Math.min(1, (sweep - midLon(name)) / 25));

/** The world on the old political map; `merge(name)` 0 (its own country) .. 1 (one world, no border). */
export const World: React.FC<{ center: [number, number]; scale: number; merge?: (name: string) => number; extra?: Record<string, Fill>; night?: boolean; children?: React.ReactNode }> = ({ center, scale, merge, extra = {}, children }) => {
  const colors: Record<string, Fill> = {};
  if (merge) {
    for (const n of NAMES()) {
      const k = merge(n);
      if (k > 0) colors[n] = { fill: ONE, k, outline: `rgba(74,50,24,${(1 - k).toFixed(3)})` };
    }
  }
  Object.assign(colors, extra);
  return (
    <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.75} colors={colors} detail="110m">
      {children}
    </WorldMap>
  );
};

/** A pencil eraser sweeping across the frame at x, crumbs behind it. */
export const Eraser: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t / 3) * 14}) rotate(-28)`} opacity={Math.min(1, k * 3)}>
      <rect x={-70} y={-200} width={140} height={300} rx={18} fill="#f2a7b5" stroke={INK} strokeWidth={STROKE} />
      <rect x={-70} y={-200} width={140} height={110} rx={18} fill="#4f7cc4" stroke={INK} strokeWidth={STROKE} />
      <rect x={-70} y={40} width={140} height={60} rx={14} fill={shade("#f2a7b5", -0.15)} stroke={INK} strokeWidth={STROKE} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={-80 - i * 40} cy={150 + ((i * 37 + t * 5) % 60)} r={9 - i} fill="#f2a7b5" stroke={INK} strokeWidth={2} />)}
    </g>
  );

/** A passport, front cover, `name` on it; `color` its cover. */
export const Passport: React.FC<{ x: number; y: number; s: number; color?: string; name?: string; rot?: number; open?: number }> = ({ x, y, s, color = NAVY, name = "PASSPORT", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 100})`}>
    <rect x={-70} y={-96} width={140} height={192} rx={12} fill="#1d1a2b" opacity={0.3} transform="translate(8 10)" />
    <rect x={-70} y={-96} width={140} height={192} rx={12} fill={color} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-6} r={36} fill="none" stroke={GOLD} strokeWidth={6} />
    <path d="M -36 -6 L 36 -6 M 0 -42 Q 22 -6 0 30 Q -22 -6 0 -42" fill="none" stroke={GOLD} strokeWidth={4} />
    {s >= 150 ? <Txt x={0} y={-66} size={name.length > 6 ? 21 : 30} fill={GOLD} deco>{name}</Txt> : null}
  </g>
);

/** A flag on a pole planted at [lon, lat]; `down` 0 (flying) .. 1 (lowered and gone). */
export const PoleFlag: React.FC<{ at: [number, number]; name: string; k: number; down?: number; s?: number; t: number }> = ({ at, name, k, down = 0, s = 1, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0 || down >= 1) return null;
  const pop = Math.min(1, k);
  const h = 150 * s, fw = 96 * s, fh = 64 * s;
  const fy = xy[1] - h + down * (h - fh);
  return (
    <g opacity={Math.min(1, k * 2) * (1 - Math.max(0, down - 0.8) * 5)}>
      <Limb a={[xy[0], xy[1]]} b={[xy[0], xy[1] - h * pop]} w={7 * s} color="#7a5230" sw={3} />
      {pop > 0.9 ? <g transform={`translate(${xy[0]} ${fy}) skewY(${Math.sin(t / 6 + xy[0]) * 4})`}><FlagArt name={name} x={0} y={0} w={fw} h={fh} /><rect x={0} y={0} width={fw} height={fh} fill="none" stroke={INK} strokeWidth={3} /></g> : null}
      <Ball x={xy[0]} y={xy[1] - h * pop} r={7 * s} fill={GOLD} shadow={false} sw={2} />
    </g>
  );
};

/** A sign standing on two posts: a label and a big figure or word. */
export const Sign: React.FC<{ x: number; y: number; w: number; label: string; value: string; k?: number; bg?: string; fg?: string }> = ({ x, y, w, label, value, k = 1, bg = "#fff6dc", fg = INK }) => {
  if (k <= 0) return null;
  const h = w * 0.5, s = 0.88 + 0.12 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} opacity={Math.min(1, k * 2)}>
      {[-0.32, 0.32].map((f) => <Limb key={f} a={[x + f * w, y]} b={[x + f * w, y + h * 0.6]} w={14} color="#7a5230" sw={4} />)}
      <Block x={x - w / 2} y={y - h} w={w} h={h} fill={bg} r={14} sw={STROKE} />
      <Txt x={x} y={y - h * 0.72} size={Math.max(52, h * 0.2)} fill={shade(fg, 0.25)}>{label}</Txt>
      <Txt x={x} y={y - h * 0.32} size={h * 0.4} fill={fg}>{value}</Txt>
    </g>
  );
};

/** A small car seen from above, facing `angle` degrees. */
export const Car: React.FC<{ x: number; y: number; s: number; angle?: number; color?: string }> = ({ x, y, s, angle = 0, color = RED }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s / 100})`}>
    <rect x={-50} y={-26} width={100} height={52} rx={16} fill={color} stroke={INK} strokeWidth={5} />
    <rect x={-14} y={-20} width={36} height={40} rx={8} fill="#bfe3f5" stroke={INK} strokeWidth={4} />
  </g>
);

/** A truck (side view) for the road trip. */
export const Truck: React.FC<{ x: number; y: number; s: number; flip?: boolean }> = ({ x, y, s, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s / 100} ${s / 100})`}>
    <rect x={-60} y={-46} width={80} height={46} rx={4} fill="#f4efe4" stroke={INK} strokeWidth={5} />
    <path d="M 20 -34 L 46 -34 L 60 -16 L 60 0 L 20 0 Z" fill={RED} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Ball x={-36} y={4} r={11} fill={INK} shadow={false} sw={2} />
    <Ball x={40} y={4} r={11} fill={INK} shadow={false} sw={2} />
  </g>
);

/** A question mark that bounces in on `k`. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 200 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t / 8) * 10}) scale(${Math.min(1.15, k)})`}>
      <Txt x={0} y={0} size={size} fill={GOLD} stroke={INK}>?</Txt>
    </g>
  );

/** A comment bubble with a word in it. */
export const Bubble: React.FC<{ x: number; y: number; k: number; text: string }> = ({ x, y, k, text }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k)})`}>
      <path d="M -210 -70 Q -210 -110 -170 -110 L 170 -110 Q 210 -110 210 -70 L 210 30 Q 210 70 170 70 L -60 70 L -110 120 L -100 70 L -170 70 Q -210 70 -210 30 Z" fill="#ffffff" stroke={INK} strokeWidth={6} />
      <Txt x={0} y={-20} size={60} fill={INK}>{text}</Txt>
    </g>
  );

/** A pin with a name beside it (a city on the map), `k` drops it in. */
export const Spot: React.FC<{ at: [number, number]; name: string; k: number; left?: boolean; size?: number; color?: string; hop?: number }> = ({ at, name, k, left = false, size = 48, color = RED, hop = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const y = xy[1] - (1 - Math.min(1, k)) * 80 - hop * 40;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <path d={`M${xy[0]},${y} C${xy[0] - 22},${y - 30} ${xy[0] - 22},${y - 58} ${xy[0]},${y - 58} C${xy[0] + 22},${y - 58} ${xy[0] + 22},${y - 30} ${xy[0]},${y} Z`} fill={color} stroke={INK} strokeWidth={4} />
      <Txt x={xy[0] + (left ? -30 : 30)} y={y - 34} size={size} fill="#ffffff" anchor={left ? "end" : "start"} stroke={INK}>{name}</Txt>
    </g>
  );
};

const props = { ROAD, LISBON, SINGAPORE };
export default props;
