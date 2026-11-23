// Shared pieces for "Who would settle Tristan da Cunha?" (device: route and race). The channel's vintage map of
// the Atlantic at a few scales; the story's events stand on their real spots: a ruler to Saint Helena, a supply
// ship out of Cape Town, Napoleon carried from Waterloo, a garrison ship, a volcano, and the voyage to England
// and back. The islands are far too small for the country outlines, so they are drawn as marked islands.
import React from "react";
import { Ball, INK, Limb, Txt, shade } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { FlagArt } from "../../flat/flags";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export const TRISTAN: [number, number] = [-12.28, -37.11];
export const HELENA: [number, number] = [-5.71, -15.95];
export const CAPE: [number, number] = [18.42, -33.92];
export const WATERLOO: [number, number] = [4.4, 50.68];
export const ENGLAND: [number, number] = [-1.4, 50.9];
export const PITCAIRN: [number, number] = [-130.1, -25.07];

export const RED = "#d9483b", GOLD = "#f2b134", SEA_BLUE = "#4f93a6", LAVA = "#ff7a2e", GREEN = "#6d9a4c", RED_COAT = "#c8352b";

/** The old chart's sea (wave marks in rows), as a fill. */
export const SEA = "url(#v1213sea)";
export const Patterns: React.FC = () => (
  <defs>
    <pattern id="v1213sea" patternUnits="userSpaceOnUse" width={90} height={66}>
      <rect width={90} height={66} fill={SEA_BLUE} />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#8cc7d0" strokeWidth={6} strokeLinecap="round" />
      <path d="M 50 54 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#8cc7d0" strokeWidth={6} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** The Atlantic on the channel's old map (Mercator), a centre and a scale the camera moves. */
export const Ocean: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; political?: number; children?: React.ReactNode }> = ({
  center, scale, colors = {}, political = 0.6, children,
}) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={political} colors={colors} sea={SEA}>
    <Patterns />
    {children}
  </WorldMap>
);

/** A small volcanic island drawn on the map at [lon, lat]: a round island with rings of surf, a cone, `r` pixels. */
export const Isle: React.FC<{ at: [number, number]; r: number; k?: number; t?: number; name?: string; nameK?: number; size?: number; below?: boolean; glow?: number }> = ({
  at, r, k = 1, t = 0, name, nameK = 1, size = 52, below = false, glow = 0,
}) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const s = Math.min(1.08, k);
  const [x, y] = xy;
  const surf = 1 + 0.06 * Math.sin(t / 9);
  return (
    <g>
      {glow > 0 ? <circle cx={x} cy={y} r={r * 2.4} fill={GOLD} opacity={0.35 * glow} /> : null}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={r * 1.7 * surf} fill="none" stroke="#d8efe9" strokeWidth={Math.max(3, r * 0.12)} opacity={0.45} />
        <circle r={r * 1.35 * surf} fill="none" stroke="#d8efe9" strokeWidth={Math.max(3, r * 0.1)} opacity={0.7} />
        <path d={`M ${-r} ${r * 0.15} Q ${-r * 0.9} ${-r * 0.85} 0 ${-r * 0.95} Q ${r * 1.05} ${-r * 0.8} ${r} ${r * 0.1} Q ${r * 0.7} ${r * 0.95} 0 ${r * 0.95} Q ${-r * 0.85} ${r * 0.9} ${-r} ${r * 0.15} Z`}
          fill={GREEN} stroke={INK} strokeWidth={Math.max(3, r * 0.09)} strokeLinejoin="round" />
        <path d={`M ${-r * 0.55} ${r * 0.25} L ${-r * 0.12} ${-r * 0.5} L ${r * 0.12} ${-r * 0.5} L ${r * 0.55} ${r * 0.25} Z`} fill="#8a6a4a" stroke={INK} strokeWidth={Math.max(2, r * 0.07)} strokeLinejoin="round" />
        <path d={`M ${-r * 0.12} ${-r * 0.5} L ${r * 0.12} ${-r * 0.5} L ${r * 0.05} ${-r * 0.36} L ${-r * 0.05} ${-r * 0.36} Z`} fill="#f4f8fb" />
      </g>
      {name && nameK > 0 ? (
        <Txt x={x} y={below ? y + r * 1.9 + size * 0.7 : y - r * 1.9 - size * 0.4} size={size} fill="#ffffff" stroke={INK}>{name.slice(0, Math.max(1, Math.round(name.length * Math.min(1, nameK))))}</Txt>
      ) : null}
    </g>
  );
};

/** A wooden sign on two legs with a line of words, its feet at [x, y]. */
export const Sign: React.FC<{ x: number; y: number; w: number; text: string; k?: number; size?: number; bg?: string; fg?: string; sub?: string }> = ({ x, y, w, text, k = 1, size = 64, bg = "#f4e3bd", fg = INK, sub }) => {
  if (k <= 0) return null;
  const h = sub ? size * 2.3 : size * 1.5;
  const rise = (1 - Math.min(1, k)) * 60;
  return (
    <g transform={`translate(0 ${rise})`} opacity={Math.min(1, k * 1.6)}>
      <Limb a={[x - w * 0.3, y]} b={[x - w * 0.3, y - 60]} w={10} color="#7a5230" sw={3} />
      <Limb a={[x + w * 0.3, y]} b={[x + w * 0.3, y - 60]} w={10} color="#7a5230" sw={3} />
      <rect x={x - w / 2 + 6} y={y - 60 - h + 8} width={w} height={h} rx={10} fill="#1d1a2b" opacity={0.3} />
      <rect x={x - w / 2} y={y - 60 - h} width={w} height={h} rx={10} fill={bg} stroke={INK} strokeWidth={5} />
      <Txt x={x} y={y - 60 - h + (sub ? size * 0.85 : h / 2)} size={size} fill={fg}>{text}</Txt>
      {sub ? <Txt x={x} y={y - 60 - size * 0.62} size={Math.max(48, size * 0.62)} fill={shade(fg, 0.25)} weight={700}>{sub}</Txt> : null}
    </g>
  );
};

/** A ship seen from the side: `sail` (the 1810s, white sails and a flag) or `steam` (1961, a funnel). `angle` from the route flips it. */
export const Ship: React.FC<{ x: number; y: number; s: number; angle?: number; kind?: "sail" | "steam" | "french"; t?: number; crew?: number }> = ({ x, y, s, angle = 0, kind = "sail", t = 0, crew = 0 }) => {
  const flip = Math.abs(angle) > 90;
  const bob = Math.sin(t / 7) * 4;
  const hull = kind === "steam" ? "#2f3a55" : kind === "french" ? "#3a4f8a" : "#7a4a26";
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${Math.sin(t / 11) * 3}) scale(${(flip ? -1 : 1) * s / 100} ${s / 100})`}>
      <ellipse cx={0} cy={8} rx={70} ry={10} fill="#d8efe9" opacity={0.5} />
      <path d="M -64 -6 L 64 -6 L 50 16 L -52 16 Z" fill={hull} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {kind === "steam" ? (
        <g>
          <rect x={-40} y={-34} width={66} height={28} fill="#f4efe4" stroke={INK} strokeWidth={4} />
          <rect x={4} y={-62} width={18} height={30} fill={RED} stroke={INK} strokeWidth={4} />
          <circle cx={20 + Math.sin(t / 5) * 4} cy={-78 - (t % 20)} r={10} fill="#d9d4cc" opacity={0.7} />
        </g>
      ) : (
        <g>
          <Limb a={[-14, -6]} b={[-14, -96]} w={6} color="#5b3a1c" sw={2} />
          <Limb a={[22, -6]} b={[22, -80]} w={6} color="#5b3a1c" sw={2} />
          <path d="M -46 -88 Q -14 -70 -46 -18 L 14 -18 Q 0 -60 14 -88 Z" fill="#f4efe4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 2 -74 Q 26 -58 6 -22 L 48 -22 Q 40 -54 48 -74 Z" fill="#f4efe4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {kind === "french" ? (
            <g transform="translate(-14 -118)"><rect x={0} y={0} width={14} height={20} fill="#2b4fa0" /><rect x={14} y={0} width={14} height={20} fill="#ffffff" /><rect x={28} y={0} width={14} height={20} fill={RED} /><rect x={0} y={0} width={42} height={20} fill="none" stroke={INK} strokeWidth={3} /></g>
          ) : (
            <g transform="translate(-14 -118)"><FlagArt name="United Kingdom" x={0} y={0} w={42} h={24} /><rect x={0} y={0} width={42} height={24} fill="none" stroke={INK} strokeWidth={3} /></g>
          )}
        </g>
      )}
      {crew > 0 ? [-40, -24, 34].map((cx, i) => (
        <g key={i} opacity={Math.min(1, crew)}>
          <rect x={cx - 6} y={-24} width={12} height={18} fill={kind === "steam" ? ["#3b6fb8", "#e3b56f", "#6d9a4c"][i]! : RED_COAT} stroke={INK} strokeWidth={2.5} />
          <circle cx={cx} cy={-30} r={7} fill="#e8b88a" stroke={INK} strokeWidth={2.5} />
        </g>
      )) : null}
    </g>
  );
};

/** A flag on a pole planted at [x, y] (screen), rising as `k` goes 0 -> 1. */
export const Planted: React.FC<{ x: number; y: number; s: number; k: number; t: number; name?: string }> = ({ x, y, s, k, t, name = "United Kingdom" }) => {
  if (k <= 0) return null;
  const h = 110 * Math.min(1, k);
  const wv = Math.sin(t / 6) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
      <Limb a={[0, 0]} b={[0, -h - 20]} w={7} color="#6b4a2b" sw={3} />
      {k > 0.5 ? (
        <g transform={`translate(0 ${-h - 20}) skewY(${wv})`}>
          <FlagArt name={name} x={0} y={0} w={84} h={52} />
          <rect x={0} y={0} width={84} height={52} fill="none" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

/** Napoleon: his real face (a public-domain painting by Jacques-Louis David) on our cartoon body, never speaking. */
export const Napoleon: React.FC<{ x: number; y: number; s: number; face?: "neutral" | "sad" | "angry" | "worried"; armR?: [number, number]; look?: [number, number] }> = ({ x, y, s, face = "neutral", armR, look }) => (
  <Char x={x} y={y} s={s} photo="napoleon" outfit="suit" top="#2a3a6b" pants="#f1ece0" accent={GOLD} face={face} armR={armR} look={look} />
);

/** A small islander standing on the map at [x, y] (feet). */
export const Folk: React.FC<{ x: number; y: number; s: number; k?: number; coat?: string; t?: number }> = ({ x, y, s, k = 1, coat = "#3b6fb8", t = 0 }) => {
  if (k <= 0) return null;
  const sc = (s / 100) * Math.min(1.1, k);
  return (
    <g transform={`translate(${x} ${y + Math.sin(t / 8 + x) * 2}) scale(${sc})`}>
      <Limb a={[-8, 0]} b={[-6, -34]} w={11} color="#3a3550" sw={3} />
      <Limb a={[8, 0]} b={[6, -34]} w={11} color="#3a3550" sw={3} />
      <rect x={-17} y={-80} width={34} height={50} rx={10} fill={coat} stroke={INK} strokeWidth={4} />
      <Ball x={0} y={-98} r={18} fill="#e8b88a" shadow={false} sw={4} />
      <path d="M -18 -104 Q 0 -126 18 -104 Z" fill="#5a3d2a" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A house with a pitched roof at [x, y] (its base), popping up as `k` goes 0 -> 1; `lit` lights it up. */
export const House: React.FC<{ x: number; y: number; s: number; k: number; roof?: string; lit?: number }> = ({ x, y, s, k, roof = RED, lit = 0 }) => {
  if (k <= 0) return null;
  const sc = (s / 100) * Math.min(1.1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-34} y={-44} width={68} height={44} fill="#f4efe4" stroke={INK} strokeWidth={4} />
      <path d="M -44 -42 L 0 -80 L 44 -42 Z" fill={roof} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-12} y={-34} width={24} height={20} fill={lit > 0 ? "#ffd84a" : "#7d8db8"} stroke={INK} strokeWidth={3} opacity={1} />
      {lit > 0 ? <circle cx={0} cy={-24} r={30} fill="#ffd84a" opacity={0.3 * lit} /> : null}
    </g>
  );
};

/** A big question mark bouncing at [x, y]. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 200 }) =>
  k <= 0 ? null : <Txt x={x} y={y - Math.abs(Math.sin(t / 5)) * 18} size={size * Math.min(1.15, k)} fill={GOLD} stroke={INK}>?</Txt>;

/** A thick ruler line between two places, drawn on as `k` goes 0 -> 1, with tick marks. */
export const Ruler: React.FC<{ from: [number, number]; to: [number, number]; k: number; color?: string }> = ({ from, to, k, color = GOLD }) => {
  const at = useAt();
  const a = at(from), b = at(to);
  if (!a || !b || k <= 0) return null;
  const kk = Math.min(1, k);
  const ex = a[0] + (b[0] - a[0]) * kk, ey = a[1] + (b[1] - a[1]) * kk;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
  const ticks = Math.floor((len * kk) / 60);
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={ex} y2={ey} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={ex} y2={ey} stroke={color} strokeWidth={13} strokeLinecap="round" />
      {Array.from({ length: ticks }).map((_, i) => {
        const f = ((i + 1) * 60) / len;
        const px = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f;
        return <line key={i} x1={px - nx * 16} y1={py - ny * 16} x2={px + nx * 16} y2={py + ny * 16} stroke={INK} strokeWidth={5} />;
      })}
    </g>
  );
};

/** Tristan drawn close (seen from above): the round island, the volcano in the middle, the flat strip on the north-west shore. */
export const BigIsle: React.FC<{ x: number; y: number; r: number; t: number; smoke?: number; erupt?: number; shake?: number }> = ({ x, y, r, t, smoke = 0, erupt = 0, shake = 0 }) => {
  const sx = shake * Math.sin(t * 2.3) * 10;
  return (
    <g transform={`translate(${x + sx} ${y})`}>
      {[1.5, 1.28].map((f, i) => <circle key={f} r={r * f * (1 + 0.03 * Math.sin(t / 10 + i))} fill="none" stroke="#d8efe9" strokeWidth={14 - i * 4} opacity={0.35 + i * 0.25} />)}
      <path d={`M ${-r} ${r * 0.05} Q ${-r * 0.95} ${-r * 0.9} ${-r * 0.05} ${-r} Q ${r * 0.95} ${-r * 0.95} ${r} ${-r * 0.05} Q ${r * 0.98} ${r * 0.92} ${r * 0.05} ${r} Q ${-r * 0.92} ${r * 0.95} ${-r} ${r * 0.05} Z`}
        fill={GREEN} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* the cliffs: a darker ring inside the coast */}
      <path d={`M ${-r * 0.8} ${r * 0.05} Q ${-r * 0.75} ${-r * 0.72} ${-r * 0.04} ${-r * 0.8} Q ${r * 0.75} ${-r * 0.76} ${r * 0.8} ${-r * 0.04} Q ${r * 0.78} ${r * 0.74} ${r * 0.04} ${r * 0.8} Q ${-r * 0.74} ${r * 0.76} ${-r * 0.8} ${r * 0.05} Z`}
        fill="#4f7a3a" stroke={INK} strokeWidth={4} opacity={0.9} />
      {/* the cone, seen from above, its crater */}
      <circle r={r * 0.55} fill="#8a6a4a" stroke={INK} strokeWidth={6} />
      <circle r={r * 0.3} fill="#a6876a" stroke={INK} strokeWidth={5} />
      <circle r={r * 0.12} fill={erupt > 0 ? LAVA : "#f4f8fb"} stroke={INK} strokeWidth={4} />
      {/* the flat strip on the north-west shore where the village stands */}
      <path d={`M ${-r * 0.98} ${-r * 0.2} Q ${-r * 0.8} ${-r * 0.82} ${-r * 0.1} ${-r * 0.98} L ${-r * 0.2} ${-r * 0.72} Q ${-r * 0.66} ${-r * 0.58} ${-r * 0.72} ${-r * 0.1} Z`} fill="#a9c47a" stroke={INK} strokeWidth={4} />
      {smoke > 0 ? [0, 1, 2].map((i) => <circle key={i} cx={Math.sin(t / 9 + i) * 20} cy={-r * 0.2 - i * 60 - (t % 30) * 1.5} r={(30 + i * 16) * smoke} fill="#e8e4dc" opacity={0.7 - i * 0.18} stroke={INK} strokeWidth={3} />) : null}
      {erupt > 0 ? (
        <g>
          <path d={`M ${r * 0.1} ${r * 0.05} Q ${r * 0.35} ${r * 0.3} ${r * 0.25 + r * 0.6 * Math.min(1, erupt)} ${r * 0.55 * Math.min(1, erupt) + r * 0.05}`} fill="none" stroke={LAVA} strokeWidth={26} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={Math.sin(t / 6 + i * 2) * 40 * erupt} cy={-r * 0.3 - i * 90 * erupt} r={(50 + i * 26) * Math.min(1, erupt)} fill={i ? "#5c5560" : "#7a6e72"} stroke={INK} strokeWidth={4} opacity={0.9 - i * 0.12} />)}
        </g>
      ) : null}
    </g>
  );
};

const props = { TRISTAN, HELENA };
export default props;
