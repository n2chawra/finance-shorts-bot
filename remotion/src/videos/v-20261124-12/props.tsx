// Shared pieces for "Why can't the Panama Canal work without rain?" (device: flood or grow, run backwards: the lake
// in the middle of the canal drains away). The channel's vintage map of Panama: the canal from Colon on the
// Caribbean over Gatun Lake to Panama City on the Pacific, rain clouds over the forest, ships on the water.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";
import { FlagArt } from "../../flat/flags";

export type LL = [number, number];

export const LAKE = "#3f86c9", DRY = "#b89a6a", RED = "#d23b30", GOLD = "#f2b134", FOREST = "#3f7a46";
export const COLON: LL = [-79.9, 9.36];
export const BALBOA: LL = [-79.56, 8.93];
export const LAKE_C: LL = [-79.83, 9.16];
export const GATUN_LOCKS: LL = [-79.92, 9.27];
export const PACIFIC_LOCKS: LL = [-79.6, 9.02];
/** the canal, Caribbean (north-west) to Pacific (south-east) */
export const CANAL: LL[] = [[-79.92, 9.42], [-79.92, 9.27], [-79.88, 9.2], [-79.8, 9.14], [-79.72, 9.1], [-79.66, 9.06], [-79.62, 9.03], [-79.58, 8.98], [-79.53, 8.88]];
/** Gatun Lake, simplified */
export const LAKE_SHAPE: LL[] = [[-79.98, 9.2], [-79.94, 9.25], [-79.86, 9.27], [-79.79, 9.24], [-79.72, 9.17], [-79.66, 9.1], [-79.7, 9.06], [-79.78, 9.07], [-79.85, 9.1], [-79.93, 9.12], [-80.0, 9.16]];
/** rivers running into the lake */
export const RIVERS: LL[][] = [[[-79.55, 9.3], [-79.62, 9.25], [-79.7, 9.2], [-79.74, 9.18]], [[-80.1, 9.0], [-80.0, 9.06], [-79.94, 9.1]], [[-79.75, 8.95], [-79.78, 9.02], [-79.8, 9.08]]];
/** the long way round: Colon, down the Atlantic side of South America, round Cape Horn, up to Panama City */
export const DETOUR: LL[] = [[-79.9, 9.5], [-75, 12.2], [-64, 11.5], [-53, 6], [-44, -1.5], [-35, -6], [-38.5, -14], [-41, -22.5], [-48, -27.5], [-55, -35.5], [-62, -41], [-65.5, -47], [-66.5, -54], [-67.3, -56.3], [-71, -55.3], [-75.5, -51], [-75.3, -44], [-73.2, -36], [-71.6, -28], [-70.6, -18], [-77, -12], [-81.5, -4.5], [-80.6, 0], [-79.8, 5], [-79.5, 8.85]];
export const CAPE_HORN: LL = [-67.3, -56.0];

const NEAR = ["Panama", "Colombia", "Costa Rica", "Venezuela", "Ecuador", "Peru", "Brazil", "Bolivia", "Chile", "Argentina", "Paraguay", "Uruguay", "Guyana", "Suriname", "Nicaragua", "Falkland Is."];

/** The old map round Panama; `center` and `scale` are the camera. */
export const PMap: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode; z?: number; trees?: number; brown?: number }> = ({ center, scale, colors = {}, children, z = 1.45, trees = 0, brown = 0 }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale * z} kind="flat" look="vintage" political={0.4} detail="50m" only={NEAR} colors={colors}>
    <Waves />
    {trees > 0 ? <Forest k={trees} brown={brown} /> : null}
    {children}
  </WorldMap>
);

const WR = rng("v1124waves");
const WAVES = Array.from({ length: 90 }, () => [WR() * 1180 - 50, WR() * 2020 - 50, 0.7 + WR() * 0.6, WR() * 6.28] as const);
/** small wave marks across the sea (the land masks them out), so the water reads as water */
const Waves: React.FC = () => {
  const { path } = useMap();
  const t = useCurrentFrame();
  const land = NEAR.map((n) => country(n)).filter((c): c is NonNullable<typeof c> => !!c).map((c) => path(c) ?? "").join(" ");
  return (
    <g>
      <defs>
        <mask id="v1124sea" maskUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
          <rect x={-200} y={-200} width={1480} height={2320} fill="#ffffff" />
          <path d={land} fill="#000000" stroke="#000000" strokeWidth={30} />
        </mask>
      </defs>
      <g mask="url(#v1124sea)">
        {WAVES.map(([x, y, s, ph], i) => {
          const dx = Math.sin(t / 40 + ph) * 8;
          return <path key={i} d={`M${x + dx - 26 * s},${y} q${13 * s},${-12 * s} ${26 * s},0 q${13 * s},${12 * s} ${26 * s},0`} fill="none" stroke="#e6f4f6" strokeWidth={5} strokeLinecap="round" opacity={0.55} />;
        })}
      </g>
    </g>
  );
};

const FR = rng("v1124f");
/** rainforest on the land round the canal (kept off the lake and the canal) */
const FOREST_PTS: LL[] = Array.from({ length: 70 }, () => [-80.25 + FR() * 0.95, 8.98 + FR() * 0.34] as LL).filter(([lon, lat]) => {
  const top = lon < -79.85 ? 9.32 : 9.3 - (lon + 79.85) * 0.25, bottom = lon < -79.7 ? 8.98 : 8.98 + (lon + 79.7) * -0.15;
  const nearLake = Math.hypot((lon - LAKE_C[0]) / 1.4, lat - LAKE_C[1]) < 0.11;
  const nearCanal = CANAL.some(([a, b]) => Math.hypot(a - lon, b - lat) < 0.05);
  return lat < top && lat > bottom && !nearLake && !nearCanal;
});

export const Forest: React.FC<{ k: number; brown?: number }> = ({ k, brown = 0 }) => {
  const at = useAt();
  return <g>{FOREST_PTS.map((p, i) => { const xy = at(p); return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={56} k={Math.min(1, k * 2 - (i % 10) * 0.05)} brown={brown * FOREST_PTS.length > i ? 1 : 0} /> : null; })}</g>;
};

const toPath = (xy: [number, number][]) => xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** Gatun Lake, shrunk towards its middle by `k` (1 full, 0 gone); the dried part as cracked mud (`mud`). */
export const Lake: React.FC<{ k: number; mud?: number; color?: string; glow?: number }> = ({ k, mud = 0, color = LAKE, glow = 0 }) => {
  const at = useAt();
  const xy = LAKE_SHAPE.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const c = at(LAKE_C);
  if (xy.length < 3 || !c) return null;
  const full = toPath(xy) + " Z";
  const kk = Math.max(0.05, k);
  const wet = toPath(xy.map((p) => [c[0] + (p[0] - c[0]) * kk, c[1] + (p[1] - c[1]) * kk])) + " Z";
  return (
    <g>
      {mud > 0 ? (
        <g opacity={Math.min(1, mud)}>
          <path d={full} fill={DRY} stroke={shade(DRY, -0.4)} strokeWidth={4} strokeLinejoin="round" />
          {xy.map((p, i) => <line key={i} x1={c[0] + (p[0] - c[0]) * 0.5} y1={c[1] + (p[1] - c[1]) * 0.5} x2={c[0] + (p[0] - c[0]) * 0.9} y2={c[1] + (p[1] - c[1]) * 0.9} stroke={shade(DRY, -0.45)} strokeWidth={4} />)}
        </g>
      ) : null}
      {glow > 0 ? <Glow x={c[0]} y={c[1]} r={300} color="#9fe3ff" o={0.6 * glow} /> : null}
      <path d={wet} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** The canal as a channel of water from sea to sea, drawn up to `k`; `dry` browns it. */
export const Canal: React.FC<{ k?: number; w?: number; dry?: number; glow?: number }> = ({ k = 1, w: w0 = 26, dry = 0, glow = 0 }) => {
  const w = w0 * 1.3;
  const at = useAt();
  const xy = CANAL.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2 || k <= 0) return null;
  const d = toPath(xy);
  const col = dry > 0.5 ? DRY : LAKE;
  return (
    <g>
      {glow > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={w + 30} opacity={0.6 * glow} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" /> : null}
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 10} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={col} strokeWidth={w} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** A point and heading at fraction `f` along a list of projected points. */
export const along = (xy: [number, number][], f: number): [number, number, number] | null => {
  if (xy.length < 2) return null;
  const segs = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i]![0], p[1] - xy[i]![1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, f)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i]! || i === segs.length - 1) {
      const a = xy[i]!, b = xy[i + 1]!, t = segs[i]! ? Math.min(1, left / segs[i]!) : 0;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI];
    }
    left -= segs[i]!;
  }
  return null;
};

/** A ship riding the canal at fraction `f`; `lift` raises it on the locks (a bigger shadow under it). */
export const CanalShip: React.FC<{ f: number; s?: number; lift?: number; color?: string }> = ({ f, s: s0 = 70, lift = 0, color = RED }) => {
  const s = s0 * 1.3;
  const at = useAt();
  const xy = CANAL.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const pt = along(xy, f);
  if (!pt) return null;
  return <Ship x={pt[0]} y={pt[1] - lift * 30} s={s} rot={pt[2]} color={color} shadow={lift} />;
};

/** A container ship seen from above-ish: hull, stacked boxes, a bridge; `rot` its heading. */
export const Ship: React.FC<{ x: number; y: number; s: number; rot?: number; color?: string; shadow?: number }> = ({ x, y, s, rot = 0, color = RED, shadow = 0 }) => {
  const flip = Math.abs(((rot % 360) + 360) % 360 - 180) < 90;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
      {shadow > 0 ? <ellipse cx={0} cy={s * 0.42 + shadow * 26} rx={s * 0.75} ry={s * 0.12} fill="#000000" opacity={0.25} /> : null}
      <path d={`M${-s * 0.8},${-s * 0.05} L${s * 0.8},${-s * 0.05} L${s * 0.6},${s * 0.3} L${-s * 0.7},${s * 0.3} Z`} fill={color} stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
      {[-0.55, -0.3, -0.05, 0.2].map((dx, i) => <rect key={i} x={s * dx} y={-s * 0.32} width={s * 0.23} height={s * 0.27} fill={["#3a7ad0", GOLD, "#3aa06a", "#e07a3a"][i]!} stroke={INK} strokeWidth={2.5} />)}
      <rect x={s * 0.48} y={-s * 0.45} width={s * 0.2} height={s * 0.4} fill="#f4f4f4" stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/** A rain cloud; `rain` 0..1 how hard it rains (streaks under it), `t` animates the drops. */
export const Cloud: React.FC<{ x: number; y: number; s: number; rain?: number; t: number; k?: number; dark?: boolean }> = ({ x, y, s, rain = 0, t, k = 1, dark }) => {
  if (k <= 0) return null;
  const col = dark ? "#7d8796" : "#eef3f8";
  return (
    <g opacity={Math.min(1, k)} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * Math.min(1, k)})`}>
      {rain > 0 ? Array.from({ length: 9 }, (_, i) => {
        const dx = -s * 0.6 + (i * s * 1.2) / 8, ph = ((t * 6 + i * 23) % 60) / 60;
        return <line key={i} x1={dx} y1={s * 0.25 + ph * s * 0.7} x2={dx - 8} y2={s * 0.25 + ph * s * 0.7 + 26} stroke="#6fb6ff" strokeWidth={6} strokeLinecap="round" opacity={rain * (1 - ph * 0.6)} />;
      }) : null}
      <Ball x={-s * 0.4} y={0} r={s * 0.32} fill={col} shadow={false} />
      <Ball x={s * 0.35} y={s * 0.02} r={s * 0.3} fill={col} shadow={false} />
      <Ball x={0} y={-s * 0.18} r={s * 0.4} fill={col} shadow={false} />
      <Block x={-s * 0.62} y={0} w={s * 1.24} h={s * 0.3} fill={col} r={s * 0.15} shadow={false} />
    </g>
  );
};

/** A blazing sun. */
export const Sun: React.FC<{ x: number; y: number; s: number; k: number; t: number }> = ({ x, y, s, k, t }) => {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)} transform={`translate(${x},${y}) rotate(${t * 0.6}) scale(${Math.min(1, k)})`}>
      <Glow x={0} y={0} r={s * 1.6} color="#ffd35a" o={0.55} />
      {Array.from({ length: 10 }, (_, i) => <Limb key={i} a={[Math.cos(i * 0.628) * s * 0.7, Math.sin(i * 0.628) * s * 0.7]} b={[Math.cos(i * 0.628) * s, Math.sin(i * 0.628) * s]} w={12} color={GOLD} sw={3} />)}
      <Ball x={0} y={0} r={s * 0.55} fill="#ffc43d" />
    </g>
  );
};

/** A rainforest tree; `brown` dries it. */
export const Tree: React.FC<{ x: number; y: number; s: number; k?: number; brown?: number }> = ({ x, y, s, k = 1, brown = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  const col = brown > 0.5 ? "#9a7a3a" : FOREST;
  return (
    <g transform={`translate(${x},${y}) scale(${q}) translate(${-x},${-y})`}>
      <rect x={x - s * 0.06} y={y - s * 0.4} width={s * 0.12} height={s * 0.4} fill="#6b4a2a" stroke={INK} strokeWidth={2} />
      <Ball x={x} y={y - s * 0.6} r={s * 0.32} fill={col} sw={3} />
      <Ball x={x - s * 0.22} y={y - s * 0.45} r={s * 0.2} fill={shade(col, -0.1)} sw={3} />
      <Ball x={x + s * 0.22} y={y - s * 0.45} r={s * 0.2} fill={shade(col, 0.08)} sw={3} />
    </g>
  );
};

/** A question mark in a gold disc. */
export const QMark: React.FC<{ x: number; y: number; size: number; k: number; t: number }> = ({ x, y, size, k, t }) => {
  if (k <= 0) return null;
  const s = Math.min(1.1, k) * (1 + 0.04 * Math.sin(t / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow x={0} y={0} r={size * 0.8} color="#ffe08a" o={0.5} />
      <Ball x={0} y={0} r={size * 0.45} fill={GOLD} />
      <text x={0} y={size * 0.17} fontFamily="Poppins" fontWeight={900} fontSize={size * 0.55} textAnchor="middle" fill={INK}>?</text>
    </g>
  );
};

/** A wooden board on a post with a label and a figure (the figure from the script's params). */
export const Board: React.FC<{ x: number; y: number; label: string; value: string; k: number; w?: number }> = ({ x, y, label, value, k, w = 440 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[0, 0]} b={[0, -120]} w={14} color="#6b4a2a" sw={3} />
      <Block x={-w / 2} y={-270} w={w} h={160} fill="#f4e6c4" r={12} />
      <Txt x={0} y={-218} size={44} fill="#5a3a1a">{label}</Txt>
      <Txt x={0} y={-150} size={64} fill={INK}>{value}</Txt>
    </g>
  );
};

export default PMap;

/** A cargo ship by what it carries: a car carrier (tall white hull, cars on deck), a grain ship (gold heaps),
 * a tanker (red hull, round tanks). */
export const Cargo: React.FC<{ x: number; y: number; s: number; kind: "cars" | "grain" | "fuel"; k?: number }> = ({ x, y, s, kind, k = 1 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  const hull = kind === "fuel" ? "#b8322a" : kind === "cars" ? "#e8e8f0" : "#2f5f8f";
  return (
    <g transform={`translate(${x},${y}) scale(${q})`}>
      <path d={`M${-s * 0.8},${-s * 0.05} L${s * 0.8},${-s * 0.05} L${s * 0.6},${s * 0.3} L${-s * 0.7},${s * 0.3} Z`} fill={hull} stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
      {kind === "cars" ? <g>
        <rect x={-s * 0.7} y={-s * 0.45} width={s * 1.3} height={s * 0.4} fill="#f4f4f8" stroke={INK} strokeWidth={3} />
        {[-0.55, -0.15, 0.25].map((dx, i) => <g key={i}><rect x={s * dx} y={-s * 0.62} width={s * 0.3} height={s * 0.12} rx={s * 0.05} fill={["#d23b30", "#3a7ad0", "#f2b134"][i]!} stroke={INK} strokeWidth={2} /><circle cx={s * (dx + 0.07)} cy={-s * 0.5} r={s * 0.04} fill={INK} /><circle cx={s * (dx + 0.23)} cy={-s * 0.5} r={s * 0.04} fill={INK} /></g>)}
      </g> : null}
      {kind === "grain" ? [-0.45, 0, 0.45].map((dx, i) => <path key={i} d={`M${s * (dx - 0.22)},${-s * 0.05} Q${s * dx},${-s * 0.45} ${s * (dx + 0.22)},${-s * 0.05} Z`} fill="#e9c94a" stroke={INK} strokeWidth={3} />) : null}
      {kind === "fuel" ? [-0.45, -0.05, 0.35].map((dx, i) => <ellipse key={i} cx={s * dx} cy={-s * 0.15} rx={s * 0.16} ry={s * 0.12} fill="#f0f0f0" stroke={INK} strokeWidth={3} />) : null}
    </g>
  );
};

/** Panama's flag planted on the land at [lon, lat]; `k` drops it in. */
export const PanamaFlag: React.FC<{ at: LL; k?: number; s?: number; t: number }> = ({ at: ll, k = 1, s = 150, t }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -200, top = xy[1] - s * 1.6 + drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[xy[0], xy[1] + drop]} b={[xy[0], top]} w={s * 0.07} color="#6b4a2a" sw={3} />
      <g transform={`skewY(${Math.sin(t / 7) * 4})`} style={{ transformOrigin: `${xy[0]}px ${top}px` }}>
        <FlagArt name="Panama" x={xy[0]} y={top} w={s * 0.9} h={s * 0.6} />
        <rect x={xy[0]} y={top} width={s * 0.9} height={s * 0.6} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};
