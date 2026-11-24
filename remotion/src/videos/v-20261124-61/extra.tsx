// Extra pieces for the Odd, Turn, Payoff and Loop beats (props.tsx is shared and stays as it is): a plate that flips
// its letters, a car with letters brushed on by hand, movement flags, small people, a wall calendar and a comment bubble.
import React, { useId } from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Car, F, Plate, lerpFrame, type Frame, type LL } from "./props";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mixHex = (a: string, b: string, k: number): string => {
  const q = clamp01(k);
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i]! - v) * q).toString(16).padStart(2, "0")).join("")}`;
};

/** Where a state's plate stands ([lon, lat], near its middle). */
export const TEL_C: LL = [79.05, 17.79];
export const PLACE: Record<string, LL> = { Uttarakhand: [79.2, 30.17], Chhattisgarh: [82.04, 21.26], Ladakh: [76.8, 34.94] };

/** All of India, a touch smaller and nudged left so the north-east stays clear of the right-hand buttons. */
export const WIDE: Frame = { center: [F.india.center[0] + 2, F.india.center[1]], scale: F.india.scale * 0.9 };
/** The hook's first framing (the loop ends here). */
export const HOOK_START: Frame = lerpFrame(F.telWide, F.tel, 0.35);

/** A number plate that flips over (squashes flat, changes its letters, opens again) as `flip` goes 0 -> 1;
 * `stamp` lands it from big; `wob` tilts it in degrees. */
export const FlipPlate: React.FC<{ at: LL; from: string; to: string; flip?: number; k?: number; stamp?: boolean; size?: number; wob?: number; glow?: number; dy?: number }> = ({
  at, from, to, flip = 0, k = 1, stamp = false, size = 1, wob = 0, glow = 0, dy = 0,
}) => {
  const toXY = useAt();
  const xy = toXY(at);
  if (!xy || !isFinite(xy[0]) || k <= 0) return null;
  const f = clamp01(flip);
  const sy = Math.max(0.06, Math.abs(Math.cos(f * Math.PI)));
  const x = xy[0], y = xy[1] + dy;
  const s = stamp ? 1 + (1 - Math.min(1, k)) * 0.9 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob}) scale(${s} ${s * sy}) translate(${-x} ${-y})`} opacity={stamp ? Math.min(1, k * 2) : 1}>
      <Plate at={at} text={f < 0.5 ? from : to} k={stamp ? 1 : k} size={size} dy={dy} glow={glow} />
    </g>
  );
};

/** A car with letters brushed onto its door by hand (the movement years): `brush` 0 -> 1 paints them left to right. */
export const PaintedCar: React.FC<{ x: number; y: number; s?: number; color?: string; t?: number; brush: number; text: string }> = ({
  x, y, s = 280, color = "#3d8bd9", t = 0, brush, text,
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const b = clamp01(brush);
  const fs = s * 0.17, w = s * 0.5;
  const bx = -w / 2 + w * b;
  return (
    <g>
      <Car x={x} y={y} s={s} color={color} t={t} />
      {b > 0 ? (
        <g transform={`translate(${x} ${y - s * 0.19})`}>
          <defs><clipPath id={`br${id}`}><rect x={-w / 2} y={-fs} width={w * b} height={fs * 2} /></clipPath></defs>
          <g clipPath={`url(#br${id})`}>
            <Txt x={0} y={0} size={fs} fill="#ffffff" weight={900} stroke={INK} rotate={-4}>{text}</Txt>
          </g>
          {b < 1 ? (
            <g>
              <Limb a={[bx, -fs * 0.1]} b={[bx + fs * 0.5, -fs * 1.4]} w={9} color="#a0713f" sw={3} />
              <Ball x={bx} y={-fs * 0.05} r={8} fill="#ffffff" sw={3} shadow={false} />
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

/** A plain cloth flag on a pole (no symbol on it), waving; `k` raises it. (x, y) is the foot of the pole. */
export const Flag: React.FC<{ x: number; y: number; h?: number; color: string; t: number; k?: number; phase?: number }> = ({ x, y, h = 150, color, t, k = 1, phase = 0 }) => {
  if (k <= 0) return null;
  const top = y - h * Math.min(1, k);
  const a = Math.sin(t / 5 + phase) * 9, b = Math.sin(t / 5 + phase + 1.5) * 13;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={16} ry={5} fill={INK} opacity={0.3} />
      <path d={`M ${x} ${top} C ${x + 30} ${top - 8 + a} ${x + 62} ${top + 12 + a} ${x + 94} ${top + 28 + b} C ${x + 62} ${top + 40 + a} ${x + 30} ${top + 56 - a} ${x} ${top + 62} Z`}
        fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x} ${top + 20} C ${x + 28} ${top + 16 + a} ${x + 55} ${top + 26 + a} ${x + 80} ${top + 30 + b}`} fill="none" stroke={shade(color, -0.2)} strokeWidth={4} />
      <Limb a={[x, y]} b={[x, top - 6]} w={7} color="#8a6a44" sw={3} />
      <Ball x={x} y={top - 8} r={7} fill="#ffd84a" sw={3} shadow={false} />
    </g>
  );
};

/** A small person standing (a head and a body), breathing; `k` pops them up from the ground. (x, y) is their feet. */
export const Person: React.FC<{ x: number; y: number; s?: number; shirt: string; skin?: string; t: number; k?: number; phase?: number; arm?: boolean }> = ({
  x, y, s = 60, shirt, skin = "#c98a5a", t, k = 1, phase = 0, arm = false,
}) => {
  if (k <= 0) return null;
  const sc = Math.min(1.15, k);
  const bob = Math.sin(t / 9 + phase) * s * 0.03;
  const wave = Math.sin(t / 4 + phase) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      <ellipse cx={x} cy={y + 2} rx={s * 0.3} ry={s * 0.08} fill={INK} opacity={0.3} />
      <Block x={x - s * 0.2} y={y - s * 0.42} w={s * 0.4} h={s * 0.42} r={s * 0.06} fill="#3b3550" sw={3} shadow={false} />
      <Block x={x - s * 0.27} y={y - s * 0.98 + bob} w={s * 0.54} h={s * 0.6} r={s * 0.18} fill={shirt} sw={3} shadow={false} />
      {arm ? <Limb a={[x + s * 0.2, y - s * 0.85 + bob]} b={[x + s * 0.42, y - s * 1.3 + bob + wave * 0.3]} w={s * 0.1} color={skin} sw={3} /> : null}
      <Ball x={x} y={y - s * 1.2 + bob} r={s * 0.24} fill={skin} sw={3} shadow={false} />
      <path d={`M ${x - s * 0.24} ${y - s * 1.24 + bob} Q ${x} ${y - s * 1.55 + bob} ${x + s * 0.24} ${y - s * 1.24 + bob}`} fill="#2b2233" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A wall calendar that drops onto the map: a red top with a label, the year big under it. (x, y): its top middle. */
export const Calendar: React.FC<{ x: number; y: number; k: number; year: string; label: string; t: number }> = ({ x, y, k, year, label, t }) => {
  if (k <= 0) return null;
  const W = 400, H = 330;
  const drop = (1 - Math.min(1, k)) * -420;
  const rot = Math.sin(t / 11) * 1.6;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${rot})`} opacity={Math.min(1, k * 2)}>
      <rect x={-W / 2 + 10} y={12} width={W} height={H} rx={26} fill={INK} opacity={0.4} />
      <Block x={-W / 2} y={0} w={W} h={H} r={26} fill="#ffffff" sw={STROKE} shadow="bottom" depth={0.08} />
      <Block x={-W / 2} y={0} w={W} h={92} r={26} fill="#e8453c" sw={STROKE} shadow={false} />
      <rect x={-W / 2 + STROKE / 2} y={60} width={W - STROKE} height={30} fill="#e8453c" />
      <line x1={-W / 2} y1={92} x2={W / 2} y2={92} stroke={INK} strokeWidth={STROKE} />
      <Ball x={-110} y={4} r={14} fill="#d7d9de" sw={4} shadow={false} />
      <Ball x={110} y={4} r={14} fill="#d7d9de" sw={4} shadow={false} />
      <Txt x={0} y={50} size={52} fill="#ffffff" weight={800}>{label}</Txt>
      <Txt x={0} y={212} size={128} fill={INK} weight={900}>{year}</Txt>
    </g>
  );
};

/** A comment bubble (rounded, with a tail down-left) that pops in with `k` (a spring, may overshoot). (x, y): its middle. */
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

export default FlipPlate;
