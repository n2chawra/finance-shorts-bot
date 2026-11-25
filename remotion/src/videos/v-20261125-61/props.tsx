// Shared pieces for "Why were Madhya Pradesh, UP and Bihar cut in the same month?" (November 2000: Chhattisgarh,
// Uttaranchal and Jharkhand). Device: the split line, three times. India's official map from flat/india.tsx; the old
// states are drawn whole with StateUnion and cut with CutLine. Every figure comes from params.fig.
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { IndiaMap, StateUnion, frameOf, lerpFrame, type StateFx } from "../../flat/india";

export { frameOf, lerpFrame };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

export const MP = "Madhya Pradesh", CG = "Chhattisgarh", UP = "Uttar Pradesh", UK = "Uttarakhand", BI = "Bihar", JH = "Jharkhand";
export const PAIRS: [string, string][] = [[MP, CG], [UP, UK], [BI, JH]];

/** Old states (before November 2000) and the new ones. */
export const OLD: Record<string, string> = { [MP]: "#e0a03a", [UP]: "#c9574a", [BI]: "#8f6bb8" };
export const NEW: Record<string, string> = { [CG]: "#5fae6a", [UK]: "#3d8bd9", [JH]: "#f08a3c" };

/** Where things stand on each state ([lon, lat]). */
export const AT: Record<string, LL> = {
  [MP]: [77.6, 23.4], [CG]: [82.1, 21.4], [UP]: [80.6, 26.9], [UK]: [79.2, 30.1], [BI]: [85.7, 25.9], [JH]: [85.4, 23.6],
};

/** A framing nudged so its subject sits `px` higher on screen (clear of the captions' band). */
const lift = (f: Frame, px: number): Frame => ({ center: [f.center[0], f.center[1] - (px / f.scale) * (180 / Math.PI)], scale: f.scale });
const fit = (names: string[], pad: number, px = 230): Frame => lift(frameOf(names, 1080, 1360, pad), px);

export const F = {
  heart: fit([MP, UP, BI], 70, 250),
  india: fit(["India"], 60, 200),
  mp: fit([MP], 90),
  cg: fit([CG], 170),
  up: fit([UP], 90),
  uk: fit([UK], 200),
  bi: fit([BI, JH], 120),
  jh: fit([JH], 170),
} satisfies Record<string, Frame>;

/** The map, with the camera at `frame`; children draw in map coordinates. */
export const MapView: React.FC<{ frame: Frame; states?: Record<string, StateFx>; dim?: number; children?: React.ReactNode }> = ({ frame, states = {}, dim = 0.45, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet="#f1e6cf">{children}</IndiaMap>
);

/** A date pin that drops onto the map: a red top, the day big, the month under it. (lon, lat) is its foot. */
export const DatePin: React.FC<{ at: LL; k: number; day: string; month: string; t: number; dy?: number }> = ({ at, k, day, month, t, dy = -40 }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy || k <= 0) return null;
  const W = 250, H = 230;
  const x = Math.min(Math.max(xy[0], W / 2 + 40), 1080 - 150 - W / 2), y = xy[1] + dy - H;
  const drop = (1 - Math.min(1, k)) * -320, rot = Math.sin(t / 13) * 1.5;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${rot})`} opacity={Math.min(1, k * 2)}>
      <line x1={0} y1={H} x2={xy[0] - x} y2={H - dy} stroke={INK} strokeWidth={5} />
      <Ball x={xy[0] - x} y={H - dy} r={10} fill="#ffffff" sw={4} shadow={false} />
      <rect x={-W / 2 + 8} y={10} width={W} height={H} rx={22} fill={INK} opacity={0.4} />
      <Block x={-W / 2} y={0} w={W} h={H} r={22} fill="#ffffff" sw={STROKE} shadow={false} />
      <Block x={-W / 2} y={0} w={W} h={70} r={22} fill="#e8453c" sw={STROKE} shadow={false} />
      <rect x={-W / 2 + STROKE / 2} y={44} width={W - STROKE} height={24} fill="#e8453c" />
      <line x1={-W / 2} y1={70} x2={W / 2} y2={70} stroke={INK} strokeWidth={STROKE} />
      <Txt x={0} y={150} size={104} fill={INK} weight={900}>{day}</Txt>
      <Txt x={0} y={38} size={46} fill="#ffffff" weight={800}>{month}</Txt>
    </g>
  );
};

/** A torn calendar page (the month only) at screen (x, y), its top middle; `k` drops it in, `flip` 0 -> 1 turns it. */
export const MonthPage: React.FC<{ x: number; y: number; k: number; month: string; t: number; size?: number; flip?: number }> = ({ x, y, k, month, t, size = 1, flip = 1 }) => {
  if (k <= 0) return null;
  const W = 420 * size, H = 300 * size;
  const drop = (1 - Math.min(1, k)) * -500, rot = -3 + Math.sin(t / 12) * 1.8;
  const sy = Math.max(0.08, Math.abs(Math.cos((1 - Math.min(1, flip)) * Math.PI / 2)));
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${rot}) scale(${size > 0 ? 1 : 1} ${sy})`} opacity={Math.min(1, k * 2)}>
      <rect x={-W / 2 + 10} y={12} width={W} height={H} rx={24} fill={INK} opacity={0.4} />
      <Block x={-W / 2} y={0} w={W} h={H} r={24} fill="#fffaf0" sw={STROKE} shadow={false} />
      <Block x={-W / 2} y={0} w={W} h={96 * size} r={24} fill="#e8453c" sw={STROKE} shadow={false} />
      <rect x={-W / 2 + STROKE / 2} y={60 * size} width={W - STROKE} height={34 * size} fill="#e8453c" />
      <line x1={-W / 2} y1={96 * size} x2={W / 2} y2={96 * size} stroke={INK} strokeWidth={STROKE} />
      <Ball x={-W * 0.28} y={4} r={14} fill="#d7d9de" sw={4} shadow={false} />
      <Ball x={W * 0.28} y={4} r={14} fill="#d7d9de" sw={4} shadow={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-W / 2 + 34 * size + i * (W - 68 * size) / 6} y={H - 50 * size} width={(W - 68 * size) / 6 - 10} height={22 * size} rx={6} fill={shade("#e8453c", 0.55)} />)}
      <Txt x={0} y={190 * size} size={96 * size} fill={INK} weight={900}>{month}</Txt>
    </g>
  );
};

/** A round badge stamped on a state: a small line on top, the figure big. */
export const Badge: React.FC<{ at: LL; k: number; top: string; value: string; glow?: number; dy?: number; color?: string }> = ({ at, k, top, value, glow = 0, dy = -10, color = "#ffc43d" }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy || k <= 0) return null;
  const s = 1 + (1 - Math.min(1, k)) * 0.8;
  const x = Math.min(Math.max(xy[0], 200), 1080 - 170 - 120), y = xy[1] + dy;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      {glow > 0 ? <circle r={180} fill="#ffd84a" opacity={0.4 * glow} data-probe="skip" /> : null}
      <circle cx={8} cy={11} r={150} fill={INK} opacity={0.4} />
      <circle r={150} fill={color} stroke={INK} strokeWidth={STROKE} />
      <circle r={124} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="14 10" />
      <Txt x={0} y={-50} size={44} fill={INK} weight={800}>{top}</Txt>
      <Txt x={0} y={52} size={128} fill={INK} weight={900}>{value}</Txt>
    </g>
  );
};

/** A small snow peak on the hills. (x, y) is its foot in screen pixels. */
export const Peak: React.FC<{ x: number; y: number; s: number; k: number }> = ({ x, y, s, k }) => {
  if (k <= 0) return null;
  const h = s * Math.min(1, k);
  return (
    <g>
      <path d={`M ${x - s * 0.6} ${y} L ${x} ${y - h} L ${x + s * 0.6} ${y} Z`} fill="#7d8aa0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x - s * 0.22} ${y - h * 0.63} L ${x} ${y - h} L ${x + s * 0.22} ${y - h * 0.63} L ${x + s * 0.08} ${y - h * 0.55} L ${x - s * 0.06} ${y - h * 0.66} Z`} fill="#ffffff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** A small round tree (the forests of the south). (x, y) is its foot. */
export const Tree: React.FC<{ x: number; y: number; s: number; k: number; t: number }> = ({ x, y, s, k, t }) => {
  if (k <= 0) return null;
  const q = Math.min(1.1, k), sway = Math.sin(t / 10 + x) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${q}) rotate(${sway})`}>
      <rect x={-s * 0.07} y={-s * 0.5} width={s * 0.14} height={s * 0.5} fill="#7a5233" stroke={INK} strokeWidth={3} />
      <Ball x={0} y={-s * 0.72} r={s * 0.36} fill="#2f8f4e" sw={3} shadow={false} />
      <Ball x={-s * 0.18} y={-s * 0.62} r={s * 0.2} fill="#3fa35d" sw={0} shadow={false} />
    </g>
  );
};

/** A small person holding up a placard (the movements for a new state); `k` pops them up, `card` shows a little map
 * on the placard. (x, y) is their feet, in screen pixels. */
export const Marcher: React.FC<{ x: number; y: number; s?: number; shirt: string; t: number; k: number; phase?: number; card: string }> = ({
  x, y, s = 80, shirt, t, k, phase = 0, card,
}) => {
  if (k <= 0) return null;
  const sc = Math.min(1.12, k);
  const bob = Math.sin(t / 5 + phase) * s * 0.06;
  const skin = "#c98a5a";
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      <ellipse cx={x} cy={y + 2} rx={s * 0.32} ry={s * 0.08} fill={INK} opacity={0.3} />
      <Block x={x - s * 0.2} y={y - s * 0.42} w={s * 0.4} h={s * 0.42} r={s * 0.06} fill="#3b3550" sw={3} shadow={false} />
      <Block x={x - s * 0.27} y={y - s * 0.98} w={s * 0.54} h={s * 0.6} r={s * 0.18} fill={shirt} sw={3} shadow={false} />
      <Limb a={[x + s * 0.2, y - s * 0.85]} b={[x + s * 0.3, y - s * 1.55 + bob]} w={s * 0.1} color={skin} sw={3} />
      <Ball x={x} y={y - s * 1.2} r={s * 0.24} fill={skin} sw={3} shadow={false} />
      <path d={`M ${x - s * 0.24} ${y - s * 1.24} Q ${x} ${y - s * 1.55} ${x + s * 0.24} ${y - s * 1.24}`} fill="#2b2233" stroke={INK} strokeWidth={3} />
      <rect x={x + s * 0.27} y={y - s * 2.2 + bob} width={s * 0.06} height={s * 0.7} fill="#7a5233" />
      <rect x={x - s * 0.1} y={y - s * 2.62 + bob} width={s * 0.8} height={s * 0.5} rx={6} fill="#ffffff" stroke={INK} strokeWidth={4} />
      <path d={`M ${x + s * 0.12} ${y - s * 2.3 + bob} l ${s * 0.12} ${-s * 0.18} l ${s * 0.16} ${s * 0.06} l ${s * 0.08} ${s * 0.14} l ${-s * 0.18} ${s * 0.08} Z`} fill={card} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A road welcome board on two posts (green, white border) at screen (x, y) (its foot); `name` writes on, `next`
 * is brushed over it from the left as `brush` goes 0 -> 1. */
export const WelcomeBoard: React.FC<{ x: number; y: number; k: number; name: string; write: number; next: string; brush: number; t: number }> = ({
  x, y, k, name, write, next, brush, t,
}) => {
  if (k <= 0) return null;
  const W = 720, H = 300;
  const up = (1 - Math.min(1, k)) * 360;
  const b = Math.max(0, Math.min(1, brush)), w = Math.max(0, Math.min(1, write));
  const wob = Math.sin(t / 14) * 0.8;
  return (
    <g transform={`translate(${x} ${y + up}) rotate(${wob})`} opacity={Math.min(1, k * 2)}>
      <defs>
        <clipPath id="wb-old"><rect x={-W / 2} y={-H - 330} width={W * w} height={H} /></clipPath>
        <clipPath id="wb-new"><rect x={-W / 2} y={-H - 330} width={W * b} height={H} /></clipPath>
      </defs>
      <Block x={-230} y={-340} w={26} h={340} fill="#8a8f98" sw={4} shadow={false} />
      <Block x={204} y={-340} w={26} h={340} fill="#8a8f98" sw={4} shadow={false} />
      <rect x={-W / 2 + 10} y={-H - 318} width={W} height={H} rx={26} fill={INK} opacity={0.4} />
      <Block x={-W / 2} y={-H - 330} w={W} h={H} r={26} fill="#1f7a45" sw={STROKE} shadow={false} />
      <rect x={-W / 2 + 18} y={-H - 312} width={W - 36} height={H - 36} rx={16} fill="none" stroke="#ffffff" strokeWidth={6} />
      <Txt x={0} y={-H - 330 + 74} size={48} fill="#ffffff" weight={700}>स्वागत है</Txt>
      <g clipPath="url(#wb-old)" opacity={b > 0 ? 1 - b * 0.9 : 1}>
        <Txt x={0} y={-H - 330 + 200} size={112} fill="#ffffff" weight={900}>{name}</Txt>
      </g>
      {b > 0 ? (
        <g clipPath="url(#wb-new)">
          <rect x={-W / 2 + 30} y={-H - 330 + 110} width={W - 60} height={150} rx={20} fill="#1f7a45" />
          <Txt x={0} y={-H - 330 + 200} size={112} fill="#ffd84a" weight={900}>{next}</Txt>
        </g>
      ) : null}
      {b > 0 && b < 1 ? (
        <g transform={`translate(${-W / 2 + W * b} ${-H - 330 + 160}) rotate(25)`}>
          <rect x={-14} y={-10} width={28} height={140} rx={8} fill="#a06a3c" stroke={INK} strokeWidth={4} />
          <rect x={-30} y={-80} width={60} height={76} rx={12} fill="#ffd84a" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

/** A comment bubble (rounded, tail down-left) at screen (x, y), its middle; `k` pops it in. */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; k: number; text: string; size?: number; o?: number }> = ({ x, y, w, h, k, text, size = 60, o = 1 }) => {
  if (k <= 0 || o <= 0) return null;
  const tail = `M ${-w * 0.28} ${h / 2 - 4} L ${-w * 0.36} ${h / 2 + 62} L ${-w * 0.1} ${h / 2 - 4} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * Math.min(1.2, k)})`} opacity={Math.min(1, k * 2) * o}>
      <g transform="translate(8 11)" opacity={0.4}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill={INK} />
        <path d={tail} fill={INK} />
      </g>
      <path d={tail} fill="#ffffff" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      <rect x={-w * 0.27} y={h / 2 - 10} width={w * 0.2} height={16} fill="#ffffff" />
      <Txt x={0} y={4} size={size} fill={INK} weight={800}>{text}</Txt>
    </g>
  );
};

/** A big question mark in a white disc at screen (x, y). */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number; color?: string }> = ({ x, y, k, r = 80, color = "#e8453c" }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle cx={6} cy={8} r={r} fill={INK} opacity={0.35} />
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill={color} weight={900}>?</Txt>
    </g>
  );
};

/** Screen position of a [lon, lat] inside the map (for things drawn in screen pixels). */
export const OnMap: React.FC<{ at: LL; children: (x: number, y: number) => React.ReactNode }> = ({ at, children }) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy) return null;
  return <>{children(xy[0], xy[1])}</>;
};

export default MapView;

/** The old states still whole (drawn as one with the part that will leave). `k`, `lift`, `trace` per old state. */
export const Olds: React.FC<{ fx: Partial<Record<string, { k?: number; lift?: number; trace?: number }>> }> = ({ fx }) => (
  <>{PAIRS.map(([o, n]) => {
    const f = fx[o];
    if (!f) return null;
    return <StateUnion key={o} names={[o, n]} fill={OLD[o]!} k={f.k ?? 1} lift={f.lift ?? 0} trace={f.trace ?? 0} />;
  })}</>
);

/** After a split: the old state in its colour, the new one in its own (lifted a little). */
export const splitFx = (pairs: [string, string][], lift = 0.3): Record<string, StateFx> =>
  Object.fromEntries(pairs.flatMap(([o, n]) => [[o, { fill: OLD[o]! }], [n, { fill: NEW[n]!, lift }]]));
