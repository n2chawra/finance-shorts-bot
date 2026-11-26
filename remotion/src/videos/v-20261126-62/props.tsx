// Shared pieces for "राजस्थान बड़ा है या जर्मनी?" (India Maps; device: the lifted country laid on the state at the same
// scale: Vietnam, then Finland, then Germany over Rajasthan). Every figure comes from params.fig.
import React from "react";
import { Block, INK, STROKE, Txt } from "../../flat/kit";
import { Lift, useAt } from "../../flat/map";
import { IndiaMap, frameOf, lerpFrame, type StateFx } from "../../flat/india";

export { lerpFrame };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

export const RJ = "Rajasthan";
export const SAND = "#e9b36b";
/** Rajasthan's middle, where each country is laid. */
export const AT: LL = [73.85, 26.6];
/** The India map is equirectangular: east-west is stretched by 1 / cos(latitude) there, so a lifted country is too. */
export const SX = 1 / Math.cos((AT[1] * Math.PI) / 180);

const PX_DEG = 180 / Math.PI;
export const upper = (focus: string[], pad = 90, lift = 110): Frame => {
  const f = frameOf(focus, 1080, 1640, pad);
  return { center: [f.center[0], f.center[1] - (lift * PX_DEG) / f.scale], scale: f.scale };
};
export const F = {
  india: upper(["India"], 30),
  rj: upper([RJ], 120),
  nw: upper([RJ, "Gujarat", "Punjab", "Madhya Pradesh", "Haryana"], 60),
  tall: upper([RJ, "Gujarat", "Jammu and Kashmir", "Maharashtra"], 40),
} satisfies Record<string, Frame>;

export const rj = (fx: Partial<StateFx> = {}): Record<string, StateFx> => ({ [RJ]: { fill: SAND, ...fx } });

export const MapView: React.FC<{ frame: Frame; states?: Record<string, StateFx>; dim?: number; sheet?: string; children?: React.ReactNode }> = ({ frame, states, dim = 0.5, sheet, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet={sheet}>{children}</IndiaMap>
);

/** A country laid on Rajasthan at the same scale (k slides it in from home), filled with its flag. */
export const Laid: React.FC<{ name: string; k: number; flagK?: number; fill: string; dx?: number; dy?: number }> = ({ name, k, flagK = 0.85, fill, dx = 0, dy = 0 }) =>
  k <= 0 ? null : <g opacity={Math.min(1, k * 3)}><Lift name={name} to={[AT[0] + dx, AT[1] + dy]} k={k} fill={fill} flag={name} flagK={flagK} sx={SX} /></g>;

export const OnMap: React.FC<{ at: LL; children: (x: number, y: number) => React.ReactNode }> = ({ at, children }) => {
  const xy = useAt()(at);
  return xy ? <>{children(xy[0], xy[1])}</> : null;
};

/** A sign board in screen space (a title over a big value), dropping in with `k`. */
export const Board: React.FC<{ x: number; y: number; k: number; title: string; value: string; bg?: string; fg?: string; w?: number }> = ({
  x, y, k, title, value, bg = "#8a4b1f", fg = "#ffffff", w = 660,
}) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -260;
  const vs = Math.min(88, (w - 70) / Math.max(1, value.length * 0.6));
  return (
    <g transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2 + 10} y={-110 + 12} width={w} height={220} rx={26} fill={INK} opacity={0.4} />
      <Block x={-w / 2} y={-110} w={w} h={220} r={26} fill={bg} sw={STROKE} shadow={false} />
      <rect x={-w / 2 + 18} y={-92} width={w - 36} height={184} rx={16} fill="none" stroke={fg} strokeWidth={5} opacity={0.8} />
      <Txt x={0} y={-42} size={50} fill={fg} weight={700}>{title}</Txt>
      <Txt x={0} y={44} size={vs} fill={fg} weight={900}>{value}</Txt>
    </g>
  );
};

export const Question: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 86 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI)})`} opacity={Math.min(1, k * 2)}>
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** A green tick in a white disc, stamped in with `k`. */
export const Tick: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const s = 1.4 - 0.4 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)} data-probe="skip">
      <circle r={62} fill="#ffffff" stroke={INK} strokeWidth={7} />
      <path d="M -30 2 L -8 26 L 32 -22" fill="none" stroke="#2f9e57" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** A small camel walking (legs swing with `t`). */
export const Camel: React.FC<{ x: number; y: number; t: number; s?: number; dir?: 1 | -1 }> = ({ x, y, t, s = 1, dir = 1 }) => {
  const sw = Math.sin(t / 5) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`} data-probe="skip">
      <ellipse cx={0} cy={6} rx={60} ry={8} fill={INK} opacity={0.25} />
      {[-34, -18, 18, 34].map((lx, i) => <line key={lx} x1={lx} y1={-40} x2={lx + (i % 2 ? sw : -sw)} y2={4} stroke="#8a5a2b" strokeWidth={9} strokeLinecap="round" />)}
      <path d="M -50 -40 Q -48 -76 -20 -78 Q -6 -104 10 -80 Q 30 -76 44 -52 L 60 -86 Q 66 -100 80 -96 L 86 -84 L 70 -80 L 54 -38 Z" fill="#c98b4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={76} cy={-90} r={3} fill={INK} />
    </g>
  );
};

/** A comment bubble with three dots. */
export const Bubble: React.FC<{ x: number; y: number; k: number; bounce?: number }> = ({ x, y, k, bounce = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y - 20 * bounce}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 2)} data-probe="skip">
      <path d="M -150 -90 Q -150 -130 -110 -130 L 110 -130 Q 150 -130 150 -90 L 150 30 Q 150 70 110 70 L -40 70 L -90 120 L -80 70 L -110 70 Q -150 70 -150 30 Z" fill="#ffffff" stroke={INK} strokeWidth={8} />
      {[-60, 0, 60].map((dx) => <circle key={dx} cx={dx} cy={-30} r={18} fill="#e8453c" />)}
    </g>
  );
};
export default MapView;
