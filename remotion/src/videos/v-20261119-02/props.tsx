// Shared pieces for "Greenland belongs to Denmark. Why?" (device: timeline). The channel's vintage political
// map of the North Atlantic at a few scales; the story's events stand on their real spots: a longship off
// Iceland, a mission ship into Nuuk, ribbons from Copenhagen to the islands the treaty left with Denmark.
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { WorldMap, useAt, useMap, country, type Fill } from "../../flat/map";

export const COPENHAGEN: [number, number] = [12.57, 55.68];
export const NUUK: [number, number] = [-51.7, 64.18];
export const BERGEN: [number, number] = [5.32, 60.39];
export const ICELAND: [number, number] = [-18.6, 64.9];
export const FAROES: [number, number] = [-6.9, 62.0];
export const GL_MID: [number, number] = [-41, 72.5];
export const ERIKSFJORD: [number, number] = [-45.5, 61.15];
export const CANADA_COAST: [number, number] = [-66, 68];

export const RED = "#d9483b", GOLD = "#f2b134", ICE = "#f4f8fb", SWEDE = "#3b6fb8", ICE_BLUE = "#6aa7d8";

const NORDIC = ["Greenland", "Canada", "Iceland", "Faeroe Is.", "Denmark", "Norway", "Sweden", "Finland", "United Kingdom", "Ireland", "Germany", "Netherlands", "Belgium", "France", "Poland", "Estonia", "Latvia", "Lithuania"];

/** The old chart's sea (wave marks drawn in rows) and the ice (wind-blown snow streaks), as fills. */
export const SEA = "url(#v0219sea)", SNOW = "url(#v0219snow)";
const Patterns: React.FC = () => (
  <defs>
    <pattern id="v0219sea" patternUnits="userSpaceOnUse" width={84} height={64}>
      <rect width={84} height={64} fill="#5f9fae" />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#9fcfd6" strokeWidth={6} strokeLinecap="round" />
      <path d="M 48 52 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#9fcfd6" strokeWidth={6} strokeLinecap="round" />
    </pattern>
    <pattern id="v0219snow" patternUnits="userSpaceOnUse" width={90} height={70}>
      <rect width={90} height={70} fill={ICE} />
      <path d="M 8 18 L 46 12 M 50 50 L 86 44" stroke="#bcd6ea" strokeWidth={7} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** The North Atlantic on the channel's old map: a centre and a scale the camera moves; 50m detail for the near views. */
export const Atlantic: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; land?: string; political?: number; near?: boolean; children?: React.ReactNode }> = ({
  center, scale, colors = {}, land, political = 0.55, near = false, children,
}) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={political} land={land}
    detail={near ? "50m" : "110m"} only={near ? NORDIC : undefined} colors={colors} sea={SEA}>
    <Patterns />
    {children}
  </WorldMap>
);

/** A blend of two hex colours. */
export function mixHex(a: string, b: string, k: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const t = Math.max(0, Math.min(1, k));
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

/** A dot and a place name beside it, typed on as `k` goes 0 -> 1. */
export const Spot: React.FC<{ at: [number, number]; name: string; k?: number; size?: number; left?: boolean; color?: string }> = ({ at, name, k = 1, size = 48, left = false, color = GOLD }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.max(1, Math.round(name.length * Math.min(1, k * 1.4)));
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Ball x={xy[0]} y={xy[1]} r={13} fill={color} shadow={false} sw={4} />
      <Txt x={xy[0] + (left ? -24 : 24)} y={xy[1]} size={size} fill="#ffffff" anchor={left ? "end" : "start"} stroke={INK}>{name.slice(0, n)}</Txt>
    </g>
  );
};

/** A flag on a pole planted at [x, y] (screen): Denmark's (red, white cross) or Greenland's (white over red, a disc). */
export const Flag: React.FC<{ x: number; y: number; s: number; k: number; kind: "dk" | "gl"; t: number }> = ({ x, y, s, k, kind, t }) => {
  if (k <= 0) return null;
  const h = 110 * Math.min(1, k);
  const wv = Math.sin(t / 6) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
      <Limb a={[0, 0]} b={[0, -h - 20]} w={7} color="#6b4a2b" sw={3} />
      {k > 0.5 ? (
        <g transform={`translate(0 ${-h - 20})`}>
          {kind === "dk" ? (
            <g>
              <path d={`M 0 0 L 80 ${wv} L 80 ${54 + wv} L 0 54 Z`} fill={RED} stroke={INK} strokeWidth={4} />
              <path d={`M 26 0 L 26 54 M 0 27 L 80 ${27 + wv}`} stroke="#ffffff" strokeWidth={10} />
            </g>
          ) : (
            <g>
              <path d={`M 0 0 L 80 ${wv} L 80 ${27 + wv} L 0 27 Z`} fill="#ffffff" />
              <path d={`M 0 27 L 80 ${27 + wv} L 80 ${54 + wv} L 0 54 Z`} fill={RED} />
              <path d={`M 12 27 A 16 16 0 0 1 44 27 Z`} fill={RED} />
              <path d={`M 12 27 A 16 16 0 0 0 44 27 Z`} fill="#ffffff" />
              <path d={`M 0 0 L 80 ${wv} L 80 ${54 + wv} L 0 54 Z`} fill="none" stroke={INK} strokeWidth={4} />
            </g>
          )}
        </g>
      ) : null}
    </g>
  );
};

/** A wooden sign on two legs with a line of words, standing on the map at [x, y] (its feet). */
export const Sign: React.FC<{ x: number; y: number; w: number; text: string; k?: number; size?: number; bg?: string; fg?: string; sub?: string }> = ({ x, y, w, text, k = 1, size = 64, bg = "#f4e3bd", fg = INK, sub }) => {
  if (k <= 0) return null;
  const h = sub ? size * 2.3 : size * 1.5;
  const rise = (1 - Math.min(1, k)) * 60;
  return (
    <g transform={`translate(0 ${rise})`} opacity={Math.min(1, k * 1.6)}>
      <Limb a={[x - w * 0.3, y]} b={[x - w * 0.3, y - 70]} w={10} color="#7a5230" sw={3} />
      <Limb a={[x + w * 0.3, y]} b={[x + w * 0.3, y - 70]} w={10} color="#7a5230" sw={3} />
      <Block x={x - w / 2} y={y - 70 - h} w={w} h={h} fill={bg} r={10} shadow="bottom" />
      <Txt x={x} y={y - 70 - h + (sub ? size * 0.85 : h / 2)} size={size} fill={fg}>{text}</Txt>
      {sub ? <Txt x={x} y={y - 70 - size * 0.62} size={Math.max(50, size * 0.62)} fill={shade(fg, 0.25)} weight={700}>{sub}</Txt> : null}
    </g>
  );
};

/** A ribbon tying two places, drawn on as `k` goes 0 -> 1; `snap` (0 -> 1) breaks it in the middle and drops the ends. */
export const Ribbon: React.FC<{ from: [number, number]; to: [number, number]; k: number; snap?: number; color?: string; width?: number; bow?: number }> = ({ from, to, k, snap = 0, color = RED, width = 12, bow = 0.25 }) => {
  const at = useAt();
  const a = at(from), b = at(to);
  if (!a || !b || k <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * bow;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const sn = Math.max(0, Math.min(1, snap));
  const len = Math.min(1, k);
  const dash = sn > 0 ? `${0.5 - 0.12 * sn} ${0.24 * sn} ${0.5 - 0.12 * sn} 1` : `${len} 1`;
  return (
    <g opacity={1 - 0.6 * sn} transform={sn > 0 ? `translate(0 ${sn * 30})` : undefined}>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 7} strokeLinecap="round" pathLength={1} strokeDasharray={dash} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={dash} />
    </g>
  );
};

/** A small turf farm hut (the Norse farms), `k` pops it up, `fade` covers it in snow. */
export const Hut: React.FC<{ x: number; y: number; s: number; k: number; fade?: number }> = ({ x, y, s, k, fade = 0 }) => {
  if (k <= 0) return null;
  const sc = (s / 100) * Math.min(1.1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={1 - 0.75 * fade}>
      <rect x={-34} y={-30} width={68} height={30} fill="#9a7a52" stroke={INK} strokeWidth={4} />
      <path d="M -44 -28 Q 0 -70 44 -28 Z" fill={mixHex("#5f8f45", ICE, fade)} stroke={INK} strokeWidth={4} />
      <rect x={-8} y={-18} width={16} height={18} fill="#3a2a1a" />
    </g>
  );
};

/** A ship with a square sail riding a route's tip: `kind` "viking" (striped sail, dragon prow) or "mission" (a cross on the sail). */
export const SailShip: React.FC<{ x: number; y: number; s: number; angle: number; kind: "viking" | "mission"; fill?: number }> = ({ x, y, s, angle, kind, fill = 1 }) => {
  const flip = Math.abs(angle) > 90;
  const tilt = Math.max(-25, Math.min(25, flip ? angle - 180 : angle));
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${(flip ? -1 : 1) * s / 100} ${s / 100})`}>
      <path d="M -60 0 Q 0 30 60 0 L 50 -8 L -50 -8 Z" fill={kind === "viking" ? "#8a5a2e" : "#3a3550"} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {kind === "viking" ? <path d="M 50 -8 Q 72 -30 62 -46 Q 56 -36 52 -30" fill="#8a5a2e" stroke={INK} strokeWidth={4} /> : null}
      <Limb a={[0, -8]} b={[0, -96]} w={6} color="#6b4a2b" sw={2} />
      <g transform={`translate(0 -90) scale(${0.4 + 0.6 * fill} 1)`}>
        <rect x={-36} y={0} width={72} height={68} fill={kind === "viking" ? "#f4efe4" : "#f4efe4"} stroke={INK} strokeWidth={4} />
        {kind === "viking" ? [0, 2, 4].map((i) => <rect key={i} x={-36 + i * 14.4} y={0} width={14.4} height={68} fill={RED} />) : (
          <path d="M 0 10 L 0 58 M -18 26 L 18 26" stroke={RED} strokeWidth={9} />
        )}
        <rect x={-36} y={0} width={72} height={68} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

/** Greenland's own outline at the map's scale, filled (an overlay: the ice), clipped to a circle growing from its middle. */
export const IceSheet: React.FC<{ k: number; inset?: number; color?: string }> = ({ k, inset = 0.86, color = ICE }) => {
  const { path } = useMap();
  const c = country("Greenland", "110m");
  if (!c || k <= 0) return null;
  const d = path(c) ?? "";
  const [[x0, y0], [x1, y1]] = path.bounds(c);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + (y1 - y0) * 0.05;
  const R = Math.hypot(x1 - x0, y1 - y0) * 0.6 * Math.min(1, k);
  return (
    <g>
      <defs><clipPath id="v0219iceclip"><circle cx={cx} cy={cy} r={R} /></clipPath></defs>
      <g clipPath="url(#v0219iceclip)" transform={`translate(${cx} ${cy}) scale(${inset}) translate(${-cx} ${-cy})`}>
        <path d={d} fill={color} stroke={ICE_BLUE} strokeWidth={STROKE} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** A big bouncing question mark. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 220 }) =>
  k <= 0 ? null : <Txt x={x} y={y - Math.abs(Math.sin(t / 5)) * 20} size={size * Math.min(1.15, k)} fill={GOLD} stroke={INK}>?</Txt>;

const props = { COPENHAGEN, NUUK };
export default props;
