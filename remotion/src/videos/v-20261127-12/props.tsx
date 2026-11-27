// Shared pieces for "What if you could drive from Russia to Alaska?" (device: zoom from space). The channel's vintage
// map centred on the Bering Strait (the map's central meridian moved across the date line, `lon0`, so Russia and
// Alaska sit side by side): the tip of Russia, the two Diomede islands (drawn simplified), a bridge hopping between
// them, and a road across the world from London to New York.
import React from "react";
import { Ball, Block, Glow, INK, Limb, Txt, shade } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { MapLabel, WorldMap, useAt, type Fill } from "../../flat/map";

export type LL = [number, number];

export const RED = "#d9452f", GOLD = "#f2b134", ROAD = "#3a3330", STEEL = "#c9cdd4";
export const LON0 = -169;

export const DEZHNEV: LL = [-169.66, 66.06];
export const PRINCE: LL = [-168.1, 65.62];
export const BIG: LL = [-169.08, 65.78];
export const LITTLE: LL = [-168.92, 65.765];
export const DATE_LON = -168.985;

/** the bridge: Russia's cape, over Big Diomede, a hop to Little Diomede, on to Alaska's cape */
export const BRIDGE: LL[] = [DEZHNEV, [-169.15, 65.79], [-169.01, 65.778], [-168.955, 65.766], [-168.885, 65.764], PRINCE];
/** where each span ends, as a share of the bridge's length (stops 1, 3 and 5) */
export const STRAIT: { center: LL; scale: number } = { center: [-168.9, 65.84], scale: 20000 };
export const HOOK_VIEW: { center: LL; scale: number } = { center: [-169.0, 65.86], scale: 21000 };
export const ISLES: { center: LL; scale: number } = { center: [-169.0, 65.775], scale: 80000 };

/** The strait on the old map; `center` and `scale` are the camera. */
export const BMap: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode; lon0?: number; only?: string[] }> = ({ center, scale, colors = {}, children, lon0 = LON0, only }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} lon0={lon0} kind="flat" look="vintage" political={0.35} detail={scale > 1500 ? "50m" : "110m"}
    only={only ?? ["Russia", "United States of America", "Canada"]} colors={colors}>
    {children}
  </WorldMap>
);

const segs = (pts: LL[]) => pts.slice(1).map((p, i) => {
  const a = pts[i]!;
  const c = Math.cos(((a[1] + p[1]) / 2) * (Math.PI / 180));
  return Math.hypot((p[0] - a[0]) * c, p[1] - a[1]);
});
/** [lon, lat] at fraction k of a line's length, with the stops up to there (longitudes unwrapped by the caller). */
export const along = (pts: LL[], k: number): { at: LL; upTo: LL[] } => {
  const s = segs(pts);
  const total = s.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, k)) * total;
  const out: LL[] = [pts[0]!];
  for (let i = 0; i < s.length; i++) {
    const L = s[i]!;
    const a = pts[i]!, b = pts[i + 1]!;
    if (d <= L || i === s.length - 1) {
      const q = L > 0 ? Math.min(1, d / L) : 0;
      const at: LL = [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
      out.push(at);
      return { at, upTo: out };
    }
    out.push(b);
    d -= L;
  }
  return { at: pts[pts.length - 1]!, upTo: out };
};
/** the share of a line's length at stop i */
export const fracAt = (pts: LL[], i: number): number => {
  const s = segs(pts);
  const total = s.reduce((a, b) => a + b, 0);
  return s.slice(0, i).reduce((a, b) => a + b, 0) / total;
};

const dOf = (xy: [number, number][]) => xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** A road line drawn to `k`: ink casing, tarmac, a yellow centre dash; `dashed` for a planned one. */
export const Road: React.FC<{ pts: LL[]; k?: number; w?: number; flash?: number; dashed?: boolean; color?: string; o?: number }> = ({ pts, k = 1, w = 12, flash = 0, dashed, color = ROAD, o = 1 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const xy = along(pts, k).upTo.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2) return null;
  const d = dOf(xy);
  const dash = dashed ? `${w * 1.8} ${w * 1.3}` : undefined;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#fff4d0" strokeOpacity={0.2 + 0.6 * flash} strokeWidth={w * 3.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      <path d={d} fill="none" stroke={flash > 0.05 ? shade(GOLD, -0.35 + 0.35 * flash) : color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      {!dashed ? <path d={d} fill="none" stroke="#f6d35a" strokeWidth={Math.max(2, w * 0.22)} strokeDasharray={`${w * 0.9} ${w * 1.1}`} /> : null}
    </g>
  );
};

/** The bridge built to `k` (0..1 of its length): a deck on piers; `glow` lights it. */
export const Bridge: React.FC<{ k: number; glow?: number; w?: number }> = ({ k, glow = 0, w = 16 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const xy = along(BRIDGE, k).upTo.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2) return null;
  const d = dOf(xy);
  // piers every so often along the drawn part
  const piers: [number, number][] = [];
  for (let q = 0.04; q < k; q += 0.07) { const p = at(along(BRIDGE, q).at); if (p) piers.push(p); }
  return (
    <g>
      {piers.map((p, i) => <rect key={i} x={p[0] - w * 0.3} y={p[1]} width={w * 0.6} height={w * 1.6} fill="#7d828c" stroke={INK} strokeWidth={2} />)}
      <path d={d} fill="none" stroke="#fff3b0" strokeOpacity={0.15 + 0.7 * glow} strokeWidth={w * 3.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={STEEL} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={RED} strokeWidth={w * 0.25} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The two Diomede islands, simplified: rocky ovals with surf rings; `k` raises them out of the sea. */
export const Diomedes: React.FC<{ k?: number; t: number }> = ({ k = 1, t }) => {
  const at = useAt();
  if (k <= 0) return null;
  const isl = (c: LL, rx: number, ry: number, key: string) => {
    const a = at(c), e = at([c[0] + rx, c[1]]), n = at([c[0], c[1] + ry]);
    if (!a || !e || !n) return null;
    const RX = Math.max(8, Math.abs(e[0] - a[0])) * Math.min(1, k), RY = Math.max(6, Math.abs(n[1] - a[1])) * Math.min(1, k);
    const surf = (Math.sin(t / 10) + 1) / 2;
    return (
      <g key={key}>
        <ellipse cx={a[0]} cy={a[1]} rx={RX + 10 + 8 * surf} ry={RY + 10 + 8 * surf} fill="none" stroke="#e6f6f2" strokeWidth={5} opacity={0.7 - 0.4 * surf} />
        <ellipse cx={a[0] + 5} cy={a[1] + 7} rx={RX} ry={RY} fill="#3d5a63" opacity={0.35} />
        <ellipse cx={a[0]} cy={a[1]} rx={RX} ry={RY} fill="#b59a6a" stroke="#4a3218" strokeWidth={4} />
        <ellipse cx={a[0] - RX * 0.15} cy={a[1] - RY * 0.2} rx={RX * 0.55} ry={RY * 0.5} fill="#9a8058" />
      </g>
    );
  };
  return (
    <g>
      {isl(BIG, 0.07, 0.04, "big")}
      {isl(LITTLE, 0.035, 0.02, "little")}
    </g>
  );
};

/** A small red car, side on, facing right (`flip` faces left). */
export const Car: React.FC<{ x: number; y: number; s: number; bump?: number; flip?: boolean; color?: string }> = ({ x, y, s, bump = 0, flip, color = "#e8453c" }) => (
  <g transform={`translate(${x},${y - Math.abs(bump) * s * 0.05}) scale(${flip ? -1 : 1},1)`}>
    <ellipse cx={0} cy={s * 0.02} rx={s * 0.6} ry={s * 0.07} fill="#000" opacity={0.25} />
    <Block x={-s * 0.58} y={-s * 0.36} w={s * 1.16} h={s * 0.26} fill={color} r={s * 0.08} sw={3} />
    <path d={`M${-s * 0.32},${-s * 0.36} L${-s * 0.2},${-s * 0.62} L${s * 0.26},${-s * 0.62} L${s * 0.42},${-s * 0.36} Z`} fill={shade(color, -0.1)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M${-s * 0.22},${-s * 0.38} L${-s * 0.14},${-s * 0.56} L${s * 0.02},${-s * 0.56} L${s * 0.02},${-s * 0.38} Z`} fill="#bfe3f2" stroke={INK} strokeWidth={2} />
    <path d={`M${s * 0.07},${-s * 0.38} L${s * 0.07},${-s * 0.56} L${s * 0.22},${-s * 0.56} L${s * 0.34},${-s * 0.38} Z`} fill="#bfe3f2" stroke={INK} strokeWidth={2} />
    <circle cx={s * 0.55} cy={-s * 0.26} r={s * 0.05} fill="#fff3a8" stroke={INK} strokeWidth={2} />
    {[-0.34, 0.34].map((dx, i) => (
      <g key={i}>
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.13} fill="#2a2a2a" stroke={INK} strokeWidth={3} />
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.05} fill="#bbb" />
      </g>
    ))}
  </g>
);

/** A flag on a pole planted at [lon, lat]; `k` raises it. */
export const Planted: React.FC<{ at: LL; name: string; k: number; s?: number; dx?: number }> = ({ at: ll, name, k, s = 150, dx = 0 }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  const q = Math.min(1, k);
  const x = xy[0] + dx, y = xy[1];
  const w = s, h = s / 1.5;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - (h + 90) * q]} w={8} color="#6b4a2a" sw={3} />
      <g transform={`translate(0,${(1 - q) * 80})`}>
        <FlagArt name={name} x={x} y={y - h - 90} w={w} h={h} />
        <rect x={x} y={y - h - 90} width={w} height={h} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

/** A sign on a post at (x, y) with a title and an optional value; `k` drops it in. */
export const Board: React.FC<{ x: number; y: number; w: number; title: string; value?: string; k?: number; tone?: string }> = ({ x, y, w, title, value, k = 1, tone = "#f4e6c4" }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -90;
  const h = value ? 180 : 120;
  return (
    <g transform={`translate(0,${drop})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 110]} w={14} color="#6b4a2a" sw={3} />
      <Block x={x - w / 2} y={y - 110 - h} w={w} h={h} fill={tone} r={14} />
      <Txt x={x} y={y - 110 - h + 58} size={50} fill="#5a3a1a">{title}</Txt>
      {value ? <Txt x={x} y={y - 110 - h + 136} size={62} fill={INK}>{value}</Txt> : null}
    </g>
  );
};

/** A green road sign with an arrow pointing right and a place name; `lit` brightens the arrow. */
export const RoadSign: React.FC<{ x: number; y: number; text: string; k: number; lit?: number }> = ({ x, y, text, k, lit = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(0,${(1 - q) * 100})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 150]} w={14} color="#8a8f96" sw={3} />
      <path d={`M${x - 190},${y - 270} h330 l70,60 l-70,60 h-330 Z`} fill="#1f7a4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M${x - 178},${y - 258} h314 l56,48 l-56,48 h-314 Z`} fill="none" stroke="#f4f4f0" strokeWidth={4} />
      {lit > 0 ? <Glow x={x + 140} y={y - 210} r={80} color="#fff3b0" o={0.6 * lit} /> : null}
      <Txt x={x - 15} y={y - 208} size={46} fill="#f4f4f0">{text}</Txt>
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
      <Txt x={0} y={size * 0.04} size={size * 0.55} fill={INK}>?</Txt>
    </g>
  );
};

/** Wave strokes at sea points (life in the water). */
export const Waves: React.FC<{ pts: LL[]; t: number; o?: number; s?: number }> = ({ pts, t, o = 0.7, s = 1 }) => {
  const at = useAt();
  return (
    <g>
      {pts.map((pt, i) => {
        const xy = at(pt);
        if (!xy || xy[0] < -100 || xy[0] > 1180 || xy[1] < -100 || xy[1] > 2020) return null;
        const ph = Math.sin(t / 14 + i * 1.7) * 10;
        return <path key={i} d={`M${xy[0] - 36 * s + ph},${xy[1]} q${18 * s},${-14 * s} ${36 * s},0 q${18 * s},${-14 * s} ${36 * s},0`} fill="none" stroke="#e6f2f0" strokeWidth={6} strokeLinecap="round" opacity={o} />;
      })}
    </g>
  );
};
export const SEA_STRAIT: LL[] = [[-169.3, 65.45], [-168.6, 65.3], [-169.0, 66.25], [-168.4, 66.1], [-169.5, 66.45], [-168.2, 65.95], [-168.75, 66.5], [-169.45, 65.2], [-168.55, 65.55], [-169.25, 66.05]];

/** the open water of the strait, roughly, so floes stay off the land */
const SEA_POLY: LL[] = [[-169.5, 66.7], [-169.55, 66.15], [-169.85, 65.9], [-170.25, 65.55], [-170.35, 64.9], [-168.0, 64.9], [-168.2, 65.5], [-167.95, 65.75], [-167.3, 66.0], [-166.9, 66.7]];
const insidePoly = (pt: LL, poly: LL[]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const FLOE_PTS: LL[] = [];
for (let i = 0; i < 120; i++) {
  const r1 = Math.abs(Math.sin(12.9898 + i * 78.233) * 43758.5453) % 1, r2 = Math.abs(Math.sin(39.3468 + i * 11.135) * 24634.6345) % 1;
  const pt: LL = [-170.4 + r1 * 3.5, 64.9 + r2 * 1.8];
  const nearIsle = Math.hypot((pt[0] - BIG[0]) * 0.42, pt[1] - BIG[1]) < 0.06 || Math.hypot((pt[0] - LITTLE[0]) * 0.42, pt[1] - LITTLE[1]) < 0.04;
  if (insidePoly(pt, SEA_POLY) && !nearIsle) FLOE_PTS.push(pt);
}
// a closer scatter round the two islands for the close-ups
for (let i = 0; i < 70; i++) {
  const r1 = Math.abs(Math.sin(5.1 + i * 17.23) * 9758.5453) % 1, r2 = Math.abs(Math.sin(8.7 + i * 23.71) * 6634.6345) % 1;
  const pt: LL = [-169.3 + r1 * 0.6, 65.68 + r2 * 0.2];
  const nearIsle = Math.hypot((pt[0] - BIG[0]) * 0.42, pt[1] - BIG[1]) < 0.055 || Math.hypot((pt[0] - LITTLE[0]) * 0.42, pt[1] - LITTLE[1]) < 0.035;
  if (!nearIsle) FLOE_PTS.push(pt);
}
/** Drifting sea-ice floes on the open strait, so the water is never an empty sheet; `size` in pixels. */
export const Floes: React.FC<{ t: number; size?: number; o?: number }> = ({ t, size = 40, o = 0.9 }) => {
  const at = useAt();
  return (
    <g opacity={o}>
      {FLOE_PTS.map((ll, i) => {
        const xy = at([ll[0] + Math.sin(t / 90 + i) * 0.004, ll[1]]);
        if (!xy || xy[0] < -80 || xy[0] > 1160 || xy[1] < -80 || xy[1] > 1320) return null;
        const s = size * (0.6 + ((i * 37) % 10) / 10);
        return (
          <g key={i} transform={`translate(${xy[0]},${xy[1] + Math.sin(t / 20 + i) * 3}) rotate(${(i * 47) % 360})`}>
            <path d={`M${-s},0 L${-s * 0.5},${-s * 0.55} L${s * 0.6},${-s * 0.45} L${s},${s * 0.1} L${s * 0.3},${s * 0.5} L${-s * 0.7},${s * 0.4} Z`} fill="#f2f8fa" stroke="#9cc3cf" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

/** RUSSIA and ALASKA written on the two coasts. */
export const SideNames: React.FC<{ k?: number; size?: number }> = ({ k = 1, size = 60 }) => {
  const at = useAt();
  const put = (ll: LL, text: string) => {
    const xy = at(ll);
    if (!xy) return null;
    const half = text.length * size * 0.36 + 10;
    const x = Math.max(half + 30, Math.min(930 - half, xy[0])), y = Math.max(300, Math.min(1250, xy[1]));
    return <Txt x={x} y={y} size={size} fill="#ffffff" stroke={INK}>{text}</Txt>;
  };
  return (
    <g opacity={k}>
      {put([-170.2, 65.62], "RUSSIA")}
      {put([-167.55, 65.42], "ALASKA")}
    </g>
  );
};

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const mixLL = (a: LL, b: LL, k: number): LL => [mix(a[0], b[0], k), mix(a[1], b[1], k)];
export const between = (a: { center: LL; scale: number }, b: { center: LL; scale: number }, k: number) => ({
  center: mixLL(a.center, b.center, k),
  scale: Math.exp(mix(Math.log(a.scale), Math.log(b.scale), k)),
});

export default BMap;
