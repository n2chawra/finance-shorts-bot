// Shared pieces for "Hormuz shuts for a week. Who runs out first?" (device: countdown). The channel's vintage map
// of the Gulf at a few scales: the strait between Iran and Oman, a barrier across it, tankers stuck behind it,
// the two pipelines that go round it, the routes east to Asia; a DAY counter sign at the top counts the week.
import React from "react";
import { INK, Limb, Txt } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export const HORMUZ: [number, number] = [56.45, 26.5];
export const IRAN_SHORE: [number, number] = [56.6, 27.05];
export const OMAN_TIP: [number, number] = [56.3, 26.15];
export const KUWAIT: [number, number] = [47.9, 29.3];
export const BASRA: [number, number] = [48.6, 30.0];
export const QATAR: [number, number] = [51.3, 25.4];
export const BAHRAIN: [number, number] = [50.55, 26.05];
export const ABQAIQ: [number, number] = [49.67, 25.94];
export const YANBU: [number, number] = [38.06, 24.09];
export const HABSHAN: [number, number] = [53.7, 23.85];
export const FUJAIRAH: [number, number] = [56.33, 25.12];
export const KHARG: [number, number] = [50.32, 29.24];
export const MALACCA: [number, number] = [100.4, 2.9];
export const SHANGHAI: [number, number] = [121.5, 31.2];
export const MUMBAI: [number, number] = [72.8, 19.0];
export const TOKYO: [number, number] = [139.8, 35.6];
export const BUSAN: [number, number] = [129.0, 35.1];

export const RED = "#d9483b", GOLD = "#f2b134", OIL = "#2b2530", SEA_BLUE = "#3f7f96";

export const GULF = ["Kuwait", "Iraq", "Qatar", "Bahrain", "Saudi Arabia", "United Arab Emirates", "Oman", "Iran", "Jordan", "Syria", "Yemen", "Egypt", "Sudan", "Eritrea", "Israel", "Turkey", "Pakistan", "Afghanistan", "Turkmenistan", "Lebanon", "Palestine"];

export const SEA = "url(#v1214sea)";
export const Patterns: React.FC = () => (
  <defs>
    <pattern id="v1214sea" patternUnits="userSpaceOnUse" width={90} height={66}>
      <rect width={90} height={66} fill={SEA_BLUE} />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
      <path d="M 50 54 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** The region on the channel's old map (Mercator); close views draw the Gulf at 50m detail. */
export const Gulf: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; wide?: boolean; children?: React.ReactNode }> = ({ center, scale, colors = {}, wide = false, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.6} colors={colors} sea={SEA}
    detail={wide ? "110m" : "50m"} only={wide ? undefined : GULF}>
    <Patterns />
    {children}
  </WorldMap>
);

/** An oil tanker seen from the side: a long red hull, a white bridge at the stern; `angle` flips it. */
export const Tanker: React.FC<{ x: number; y: number; s: number; angle?: number; t?: number; barrels?: number }> = ({ x, y, s, angle = 0, t = 0, barrels = 0 }) => {
  const flip = Math.abs(angle) > 90;
  return (
    <g transform={`translate(${x} ${y + Math.sin(t / 8 + x / 50) * 3}) scale(${(flip ? -1 : 1) * s / 100} ${s / 100})`}>
      <ellipse cx={0} cy={10} rx={80} ry={9} fill="#d8efe9" opacity={0.45} />
      <path d="M -80 -10 L 76 -10 L 64 12 L -72 12 Z" fill="#b8352b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-76} y={-16} width={150} height={7} fill="#3a3550" stroke={INK} strokeWidth={3} />
      <rect x={-72} y={-46} width={30} height={30} fill="#f4efe4" stroke={INK} strokeWidth={4} />
      <rect x={-64} y={-62} width={8} height={16} fill={INK} />
      {barrels > 0 ? [0, 1, 2, 3].map((i) => (
        <rect key={i} x={-30 + i * 24} y={-16 - 26 * Math.min(1, Math.max(0, barrels * 4 - i))} width={18} height={26 * Math.min(1, Math.max(0, barrels * 4 - i))} rx={4} fill={OIL} stroke={INK} strokeWidth={3} />
      )) : null}
    </g>
  );
};

/** A red-and-white boom across the strait, between two map points, dropping into place as `k` goes 0 -> 1. */
export const Barrier: React.FC<{ k: number; glow?: number }> = ({ k, glow = 0 }) => {
  const at = useAt();
  const a = at(IRAN_SHORE), b = at(OMAN_TIP);
  if (!a || !b || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -160;
  const d = `M ${a[0]} ${a[1] + drop} L ${b[0]} ${b[1] + drop}`;
  return (
    <g opacity={Math.min(1, k * 2)}>
      {glow > 0 ? <path d={d} stroke={RED} strokeWidth={70} opacity={0.35 * glow} strokeLinecap="round" /> : null}
      <path d={d} stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d={d} stroke="#ffffff" strokeWidth={20} strokeLinecap="round" />
      <path d={d} stroke={RED} strokeWidth={20} strokeDasharray="30 30" />
      {[a, b].map((p, i) => <Limb key={i} a={[p[0], p[1] + drop + 20]} b={[p[0], p[1] + drop - 40]} w={14} color="#5c5560" sw={4} />)}
    </g>
  );
};

const WORDS = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE"];
/** The day counter: a sign hung at the top of the frame, its word flipping on each day's line. `flip` 0..1 flips in. */
export const DayBoard: React.FC<{ day: number; flip?: number; y?: number }> = ({ day, flip = 1, y = 300 }) => {
  if (day <= 0) return null;
  const sq = Math.abs(Math.cos(Math.min(1, flip) * Math.PI)) * 0.0 + Math.min(1, 0.2 + 0.8 * flip);
  return (
    <g transform={`translate(540 ${y})`}>
      <path d="M -170 -110 L 0 -170 L 170 -110" fill="none" stroke={INK} strokeWidth={6} />
      <g transform={`scale(1 ${sq})`}>
        <rect x={-260} y={-90} width={520} height={150} rx={22} fill="#1d1a2b" opacity={0.3} transform="translate(8 10)" />
        <rect x={-260} y={-90} width={520} height={150} rx={22} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
        <Txt x={0} y={-15} size={84} fill={RED} stroke={INK}>{`DAY ${WORDS[day] ?? ""}`}</Txt>
      </g>
    </g>
  );
};

/** A dot and a name at [lon, lat]. */
export const Port: React.FC<{ at: [number, number]; name: string; k?: number; size?: number; dx?: number; dy?: number }> = ({ at, name, k = 1, size = 50, dx = 0, dy = -50 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.max(1, Math.round(name.length * Math.min(1, k * 1.4)));
  return (
    <g opacity={Math.min(1, k * 2)}>
      <circle cx={xy[0]} cy={xy[1]} r={14} fill={GOLD} stroke={INK} strokeWidth={4} />
      <Txt x={xy[0] + dx} y={xy[1] + dy} size={size} fill="#ffffff" stroke={INK}>{name.slice(0, n)}</Txt>
    </g>
  );
};

/** A big question mark bouncing at [x, y]. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 200 }) =>
  k <= 0 ? null : <Txt x={x} y={y - Math.abs(Math.sin(t / 5)) * 18} size={size * Math.min(1.15, k)} fill={GOLD} stroke={INK}>?</Txt>;

/** Tankers stuck at their spots ([lon, lat] each), popping in by `k`. */
export const Fleet: React.FC<{ spots: [number, number][]; k: number[]; t: number; s?: number; jolt?: number }> = ({ spots, k, t, s = 70, jolt = 0 }) => {
  const at = useAt();
  return (
    <g>
      {spots.map((p, i) => {
        const xy = at(p);
        if (!xy || (k[i] ?? 0) <= 0) return null;
        return <g key={i} opacity={Math.min(1, (k[i] ?? 0) * 2)}><Tanker x={xy[0] + Math.sin(i * 7) * jolt * 8} y={xy[1]} s={s * Math.min(1, k[i] ?? 0)} angle={i % 2 ? 180 : 0} t={t} /></g>;
      })}
    </g>
  );
};

const props = { HORMUZ };
export default props;
