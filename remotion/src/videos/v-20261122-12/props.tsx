// Shared pieces for "Antarctica melts. Which countries vanish first?" (device: zoom from space). The channel's old
// map seen from space on a starry sky: Antarctica's white ice cap, the meltwater rings, low countries drowned
// under a sheet of new sea, the coral islands that vanish, and a sea gauge for the payoff.
import React from "react";
import { INK, Limb, Txt, rng, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";

export const SEA_BLUE = "#3f7f96", NEW_SEA = "#2f6f8f", ICE = "#f4f8fb", GOLD = "#f2b134", RED = "#d9483b", SPACE = "#0b1230";

export const SEA = "url(#v1222sea)";
export const SeaPattern: React.FC = () => (
  <defs>
    <pattern id="v1222sea" patternUnits="userSpaceOnUse" width={90} height={66}>
      <rect width={90} height={66} fill={SEA_BLUE} />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
      <path d="M 50 54 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** Stars behind the map: space. */
export const Stars: React.FC<{ t: number }> = ({ t }) => {
  const r = rng("v1222stars");
  return (
    <g>
      {Array.from({ length: 90 }, (_, i) => {
        const x = r() * 1080, y = r() * 1920, s = 1.5 + r() * 3;
        return <circle key={i} cx={x} cy={y} r={s} fill="#ffffff" opacity={0.35 + 0.35 * Math.abs(Math.sin(t / 20 + i))} />;
      })}
    </g>
  );
};

/** The world on the channel's old map (Natural Earth projection), centred on a point at a scale. */
export const World: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; only?: string[]; fine?: boolean; flat?: boolean; children?: React.ReactNode }> = ({ center, scale, colors = {}, only, fine = false, flat = false, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind={flat ? "flat" : "world"} look="vintage" political={0.55} sea={SEA} colors={colors}
    detail={fine ? "50m" : "110m"} only={only}>
    <SeaPattern />
    {children}
  </WorldMap>
);

/** A country under the new sea: its outline filled with water at `k`, waves running over it. */
export const Drown: React.FC<{ name: string; k: number; t: number }> = ({ name, k, t }) => {
  const { path } = useMap();
  const c = country(name);
  if (!c || k <= 0) return null;
  const d = path(c) ?? undefined;
  return (
    <g opacity={Math.min(1, k)}>
      <path d={d} fill={NEW_SEA} opacity={0.85} />
      <path d={d} fill="none" stroke="#9fd3e0" strokeWidth={5} strokeDasharray="22 18" strokeDashoffset={-t * 1.5} />
    </g>
  );
};

/** A shape drawn from [lon, lat] points (Florida's peninsula), filled with `fill`. */
export const Shape: React.FC<{ pts: [number, number][]; fill: string; k?: number; stroke?: string; sw?: number }> = ({ pts, fill, k = 1, stroke = INK, sw = 5 }) => {
  const at = useAt();
  const xy = pts.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 3 || k <= 0) return null;
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" opacity={Math.min(1, k)} />;
};

export const FLORIDA: [number, number][] = [[-87.6, 30.95], [-85.0, 31.0], [-82.2, 30.6], [-81.45, 30.7], [-81.3, 29.9], [-80.6, 28.6], [-80.05, 26.9], [-80.1, 25.4], [-80.8, 25.15], [-81.2, 25.3], [-81.8, 26.2], [-82.7, 27.4], [-82.75, 28.9], [-83.6, 29.9], [-84.4, 30.0], [-85.4, 29.7], [-86.4, 30.4], [-87.6, 30.3]];
export const FLORIDA_NORTH: [number, number][] = [[-87.6, 30.95], [-85.0, 31.0], [-82.2, 30.6], [-82.0, 30.25], [-84.5, 30.45], [-87.6, 30.7]];

/** A little island with a palm tree at [lon, lat]; `sink` 0 -> 1 puts it under the sea. */
export const Isle: React.FC<{ at: [number, number]; s?: number; sink?: number; house?: boolean; t: number }> = ({ at, s = 1, sink = 0, house = false, t }) => {
  const xy = useAt()(at);
  if (!xy) return null;
  const [x, y] = xy;
  const under = Math.max(0, Math.min(1, sink));
  return (
    <g opacity={1 - 0.85 * under} transform={`translate(${x} ${y + 30 * under * s}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={38} ry={14} fill="#e9d9a6" stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={6} rx={46} ry={18} fill="none" stroke="#9fe0d6" strokeWidth={4} opacity={0.8} />
      <Limb a={[-6, 4]} b={[-2 + Math.sin(t / 20) * 2, -40]} w={6} color="#8a5a2e" sw={3} />
      <path d={`M ${-2} -40 q -24 -6 -34 8 M -2 -40 q 22 -8 32 6 M -2 -40 q -6 -20 -22 -24 M -2 -40 q 8 -20 24 -20`} stroke="#3f8f4a" strokeWidth={8} fill="none" strokeLinecap="round" />
      {house ? <g><rect x={10} y={-16} width={22} height={18} fill="#f4efe4" stroke={INK} strokeWidth={3} /><path d="M 7 -16 L 21 -28 L 35 -16 Z" fill={RED} stroke={INK} strokeWidth={3} /></g> : null}
    </g>
  );
};

/** Rings of ripples left on the sea where something sank. */
export const Ripples: React.FC<{ at: [number, number]; k: number; t: number }> = ({ at, k, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k)}>{[0, 1, 2].map((i) => {
    const f = ((t / 40) + i / 3) % 1;
    return <circle key={i} cx={xy[0]} cy={xy[1]} r={10 + 60 * f} fill="none" stroke="#cfeef4" strokeWidth={4} opacity={1 - f} />;
  })}</g>;
};

/** A big gold question mark bouncing in. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 220 }) =>
  k <= 0 ? null : <Txt x={x} y={y - (1 - Math.min(1, k)) * 300 - Math.abs(Math.sin(t / 6)) * 14} size={size} fill={GOLD} stroke={INK}>?</Txt>;

/** A wooden sign on a post planted on the map. */
export const Sign: React.FC<{ x: number; y: number; label: string; value?: string; k: number; w?: number }> = ({ x, y, label, value, k, w = 520 }) => {
  if (k <= 0) return null;
  const s = Math.min(1, k);
  const h = value ? 190 : 110;
  return (
    <g transform={`translate(${x} ${y + (1 - s) * -200})`}>
      <Limb a={[0, h - 120]} b={[0, h + 40]} w={16} color="#7a5230" />
      <rect x={-w / 2 + 10} y={-108} width={w} height={h} rx={18} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-120} width={w} height={h} rx={18} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
      <Txt x={0} y={value ? -78 : -66} size={value ? 46 : 56} fill="#4a3218">{label}</Txt>
      {value ? <Txt x={0} y={4} size={96} fill={RED} stroke={INK}>{value}</Txt> : null}
    </g>
  );
};

/** Water arrows running out from a point. */
export const Arrow: React.FC<{ from: [number, number]; to: [number, number]; k: number; color?: string }> = ({ from, to, k, color = "#9fd3e0" }) => {
  if (k <= 0) return null;
  const x = from[0] + (to[0] - from[0]) * Math.min(1, k), y = from[1] + (to[1] - from[1]) * Math.min(1, k);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${x + Math.cos(a) * 30} ${y + Math.sin(a) * 30} L ${x + Math.cos(a + 2.4) * 34} ${y + Math.sin(a + 2.4) * 34} L ${x + Math.cos(a - 2.4) * 34} ${y + Math.sin(a - 2.4) * 34} Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

export const iceColor = (melt: number) => shade(ICE, -0.25 * Math.max(0, Math.min(1, melt)));

const props = { SEA_BLUE, ICE };
export default props;
