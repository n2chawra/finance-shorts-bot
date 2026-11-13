// Shared things for the US debt Short (v-20261114-01): the debt clock, the Treasury front, an envelope, an IOU slip.
import React from "react";
import { Block, Glow, INK, STROKE, Txt, shade } from "../../flat/kit";

/** The giant debt clock: a dark board on legs with a red LED figure and a small label. */
export const DebtClock: React.FC<{ x: number; y: number; w: number; h: number; value: string; label: string; glow?: number; legs?: boolean }> = ({
  x, y, w, h, value, label, glow = 1, legs = true,
}) => (
  <g>
    {legs ? <>
      <Block x={x + w * 0.12} y={y + h} w={26} h={h * 0.9} fill="#3a3f4f" shadow={false} />
      <Block x={x + w * 0.88 - 26} y={y + h} w={26} h={h * 0.9} fill="#3a3f4f" shadow={false} />
    </> : null}
    <Glow x={x + w / 2} y={y + h / 2} r={w * 0.75} color="#ff4d4d" o={0.28 * glow} />
    <Block x={x - 14} y={y - 14} w={w + 28} h={h + 28} r={18} fill="#2a2f3d" />
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#0b0f14" stroke={INK} strokeWidth={4} />
    <Txt x={x + w / 2} y={y + h * 0.24} size={Math.max(44, h * 0.17)} fill="#ff9a9a" weight={700} glow="#ff4d4d">{label}</Txt>
    <Txt x={x + w / 2} y={y + h * 0.64} size={h * 0.42} fill="#ff4d4d" glow="#ff4d4d">{value}</Txt>
  </g>
);

/** A classical stone front: steps, columns, pediment. Base of the steps at y = base. */
export const StoneFront: React.FC<{ x: number; base: number; w: number; tone?: string }> = ({ x, base, w, tone = "#e8e1d4" }) => {
  const colH = w * 0.55, n = 7, gap = w / n;
  const top = base - 120 - colH;
  return (
    <g>
      <polygon points={`${x - 30},${top - 30} ${x + w / 2},${top - 230} ${x + w + 30},${top - 30}`} fill={tone} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <polygon points={`${x + 60},${top - 50} ${x + w / 2},${top - 190} ${x + w - 60},${top - 50}`} fill={shade(tone, -0.12)} />
      <Block x={x - 40} y={top - 34} w={w + 80} h={54} fill={tone} />
      {Array.from({ length: n }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * gap + gap * 0.22} y={top + 20} width={gap * 0.56} height={colH} fill={tone} stroke={INK} strokeWidth={5} />
          <rect x={x + i * gap + gap * 0.56} y={top + 20} width={gap * 0.22} height={colH} fill={shade(tone, -0.14)} />
          {[0.38, 0.5, 0.62].map((f) => <line key={f} x1={x + i * gap + gap * f} y1={top + 40} x2={x + i * gap + gap * f} y2={top + colH} stroke={shade(tone, -0.2)} strokeWidth={3} />)}
        </g>
      ))}
      {[0, 1, 2, 3].map((k) => <Block key={k} x={x - 40 - k * 40} y={base - 120 + k * 30} w={w + 80 + k * 80} h={30} fill={shade(tone, -0.04 * k)} shadow={false} sw={4} />)}
    </g>
  );
};

/** An envelope seen from the front, flap up, `children` drawn on it. */
export const Envelope: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, children }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 8} y={y + 10} width={w} height={h} rx={8} fill="#000" opacity={0.22} />
    <rect x={x} y={y} width={w} height={h} rx={8} fill="#fbf6ea" stroke={INK} strokeWidth={5} />
    <polyline points={`${x},${y} ${x + w / 2},${y + h * 0.48} ${x + w},${y}`} fill="none" stroke={INK} strokeWidth={4} />
    <rect x={x + w - w * 0.2} y={y + h * 0.1} width={w * 0.13} height={h * 0.2} fill="#d8433a" stroke={INK} strokeWidth={3} />
    {children}
  </g>
);

/** An IOU slip: cream paper, "IOU" in ink, a ruled line. */
export const Iou: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.5;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 5} y={y + 6} width={w} height={h} rx={4} fill="#000" opacity={0.2} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#f6efd9" stroke={INK} strokeWidth={4} />
      <Txt x={x + w / 2} y={y + h * 0.42} size={h * 0.42} fill="#2b3a7a" deco>IOU</Txt>
      <line x1={x + w * 0.15} y1={y + h * 0.78} x2={x + w * 0.85} y2={y + h * 0.78} stroke="#9a8f74" strokeWidth={3} />
    </g>
  );
};

// no story props: the shared things above are imported by the beats
const props = {};
export default props;
