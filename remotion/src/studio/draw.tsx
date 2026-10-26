/**
 * The channel's drawing hand (owner, 2026-10-26: "animation should be dynamic to the script, not
 * hardcoded props"). Every video draws its own things in remotion/src/videos/<id>/props.tsx (an
 * egg, a hen, a ballot, a yacht: whatever its story is about), and these helpers make them all look
 * like one channel: the same ink outline, soft shadow, highlight and palette.
 *
 * A prop is a React.FC<PropProps> drawn centred on x = 0 with its base on y = 0, about `s` pixels
 * tall. `k` (0..1) is a fill or progress the story drives (a jar filling, a battery draining),
 * `state` is a word the story sets ("broken", "open", "full"...), `t` is seconds into the beat for
 * idle motion (a flag waving, steam rising). Everything is a pure function of its props.
 */
import React from "react";

export const INK = "#1d2433";
export const PALETTE = {
  red: "#e5484d", orange: "#f08c3a", yellow: "#ffd34d", gold: "#f2b631", green: "#2fb37a", mint: "#7cf0b2",
  teal: "#1fa7a0", blue: "#3d7bf5", navy: "#24315e", purple: "#8a63d2", pink: "#f2588f", brown: "#8a5a2b",
  tan: "#e8c79a", cream: "#fbf3e2", white: "#ffffff", grey: "#9aa3b5", dark: "#2b3245", skin: "#e0a678",
} as const;

export interface PropProps { s: number; t: number; k?: number; state?: string; seed?: string }
export type PropFC = React.FC<PropProps>;
export type PropSet = Record<string, PropFC>;

/** Lighter (amt > 0) or darker (amt < 0) version of a hex colour. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** The outline every shape carries, scaled to the prop's size. */
export const line = (s: number) => Math.max(3, s * 0.028);

/** A soft contact shadow under a prop. */
export const Shadow: React.FC<{ w: number; s: number }> = ({ w, s }) => (
  <ellipse cx={0} cy={s * 0.01} rx={w * 0.55} ry={Math.max(4, s * 0.045)} fill="rgba(0,0,0,0.22)" />
);

/** A rounded box with outline, a lighter top band and a darker bottom: the basic solid body. */
export const Box: React.FC<{ x: number; y: number; w: number; h: number; fill: string; s: number; r?: number; sheen?: boolean }> =
  ({ x, y, w, h, fill, s, r = 0.12, sheen = true }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) * r} fill={fill} stroke={INK} strokeWidth={line(s)} />
      {sheen && <rect x={x + w * 0.08} y={y + h * 0.08} width={w * 0.84} height={Math.max(2, h * 0.14)} rx={h * 0.07} fill="#fff" opacity={0.28} />}
      <rect x={x + line(s) / 2} y={y + h * 0.78} width={w - line(s)} height={h * 0.2 - line(s) / 2} rx={Math.min(w, h) * r * 0.6} fill={shade(fill, -0.18)} opacity={0.55} />
    </g>
  );

/** An outlined ellipse with a highlight. */
export const Ball: React.FC<{ cx: number; cy: number; rx: number; ry?: number; fill: string; s: number }> = ({ cx, cy, rx, ry, fill, s }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fill={fill} stroke={INK} strokeWidth={line(s)} />
    <ellipse cx={cx - rx * 0.32} cy={cy - (ry ?? rx) * 0.38} rx={rx * 0.28} ry={(ry ?? rx) * 0.18} fill="#fff" opacity={0.45} />
  </g>
);

/** Any outlined path in the channel's style. */
export const Shape: React.FC<{ d: string; fill: string; s: number; opacity?: number }> = ({ d, fill, s, opacity = 1 }) => (
  <path d={d} fill={fill} stroke={INK} strokeWidth={line(s)} strokeLinejoin="round" strokeLinecap="round" opacity={opacity} />
);

/** A short word painted on a prop (a shop sign, a label on a jar): never a figure, figures are tags. */
export const Paint: React.FC<{ x: number; y: number; text: string; size: number; fill?: string }> = ({ x, y, text, size, fill = INK }) => (
  <text data-probe="skip" x={x} y={y} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={size} fill={fill}>{text}</text>
);

/** A little life for idle props: a slow bob in pixels. */
export const bob = (t: number, s: number, speed = 1.6, amt = 0.015) => Math.sin(t * speed) * s * amt;
