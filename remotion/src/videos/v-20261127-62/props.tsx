// Shared pieces for "Sikkim ka apna raja tha? Phir yeh India ka state kaise bana?" (India Maps: how the kingdom of Sikkim
// became an Indian state, 1975). India's official map (flat/india.tsx); Nepal and Bhutan with their flags; the Chogyal and
// the kingdom's old flag as Commons stickers; every figure (year, votes, share) from params.fig.
import React from "react";
import { Ball, Block, INK, STROKE, Txt, shade } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { CoastSurf, IndiaMap, SeaRipples, StateTag, frameOf, lerpFrame, type StateFx } from "../../flat/india";

export { lerpFrame, StateTag };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

export const SIK: LL = [88.45, 27.55];
export const GANGTOK: LL = [88.61, 27.33];
export const GOLD = "#ffc43d";
export const SAFFRON = "#f08a3c";

const DEG = Math.PI / 180;
/** A framing round a point, `wide` degrees across the frame, with the point `lift` px above the middle. */
const around = (c: LL, wide: number, lift = 380): Frame => {
  const scale = 1080 / (wide * DEG);
  return { center: [c[0], c[1] - lift / (scale * DEG)], scale };
};
const up = (f: Frame, px: number): Frame => ({ center: [f.center[0], f.center[1] - px / (f.scale * DEG)], scale: f.scale });

export const F = {
  india: up(frameOf(["India"], 1080, 1420, 50), 250),
  region: around([88.6, 27.4], 11, 330),
  close: around(SIK, 3.2, 360),
  kingClose: around(SIK, 3.2, 110),
  gangtok: around(GANGTOK, 2.4, 300),
  plains: around([88.4, 26.6], 4.4, 260),
} satisfies Record<string, Frame>;

/** The map with sea life; children draw in frame pixels. */
export const MapView: React.FC<{ frame: Frame; states: Record<string, StateFx>; dim?: number; t: number; children?: React.ReactNode }> = ({ frame, states, dim = 0.42, t, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim}>
    <g data-probe="skip"><SeaRipples t={t} gap={56} /><CoastSurf t={t} k={0.8} /></g>
    {children}
  </IndiaMap>
);

/** A golden crown, `s` wide. */
export const Crown: React.FC<{ x: number; y: number; s: number; k: number; dim?: number; tilt?: number }> = ({ x, y, s, k, dim = 0, tilt = 0 }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -200;
  const c = dim > 0 ? shade(GOLD, -0.45 * dim) : GOLD;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${tilt}) scale(${s / 200})`} opacity={Math.min(1, k * 2)}>
      <path d="M -100 40 L -100 -40 L -55 0 L 0 -70 L 55 0 L 100 -40 L 100 40 Z" fill={c} stroke={INK} strokeWidth={STROKE * 1.4} strokeLinejoin="round" />
      <rect x={-100} y={30} width={200} height={34} rx={8} fill={shade(c, -0.15)} stroke={INK} strokeWidth={STROKE * 1.4} />
      <Ball x={0} y={-74} r={14} fill="#e8453c" sw={4} shadow={false} />
      <Ball x={-100} y={-44} r={11} fill="#3d8bd9" sw={4} shadow={false} />
      <Ball x={100} y={-44} r={11} fill="#3d8bd9" sw={4} shadow={false} />
      <Ball x={0} y={47} r={10} fill="#e8453c" sw={3} shadow={false} />
    </g>
  );
};

/** A big stamped question mark. */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 92 }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** A wooden ballot box with a slot; `slip` 0..1 drops a paper slip into it. */
export const BallotBox: React.FC<{ x: number; y: number; s: number; k: number; slip: number; tip?: number }> = ({ x, y, s, k, slip, tip = 0 }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -260;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${tip * 70}) scale(${s / 300})`} opacity={Math.min(1, k * 2)}>
      <Block x={-150} y={-200} w={300} h={200} r={10} fill="#a86a3c" sw={STROKE} />
      <Block x={-160} y={-230} w={320} h={40} r={8} fill="#8a5a34" sw={STROKE} />
      <rect x={-60} y={-218} width={120} height={14} rx={6} fill={INK} />
      {slip > 0 && slip < 1 ? <rect x={-40} y={-330 + slip * 110} width={80} height={100} rx={4} fill="#ffffff" stroke={INK} strokeWidth={4} /> : null}
    </g>
  );
};

/** A small voter: a round head, a body in `shirt`, standing on (x, y), `s` tall; bobs with `t`. */
export const Voter: React.FC<{ x: number; y: number; s: number; shirt: string; t: number; phase: number; k: number }> = ({ x, y, s, shirt, t, phase, k }) => {
  if (k <= 0) return null;
  const b = Math.sin(t / 7 + phase) * s * 0.02;
  return (
    <g transform={`translate(${x} ${y + b}) scale(${Math.min(1, k)})`}>
      <ellipse cx={0} cy={0} rx={s * 0.22} ry={s * 0.05} fill={INK} opacity={0.25} />
      <path d={`M ${-s * 0.18} 0 L ${-s * 0.2} ${-s * 0.55} Q 0 ${-s * 0.68} ${s * 0.2} ${-s * 0.55} L ${s * 0.18} 0 Z`} fill={shirt} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Ball x={0} y={-s * 0.76} r={s * 0.16} fill="#c98a5b" sw={4} shadow={false} />
      <path d={`M ${-s * 0.16} ${-s * 0.8} Q 0 ${-s * 1.0} ${s * 0.16} ${-s * 0.8} Z`} fill="#2b2b33" />
    </g>
  );
};

/** A chalk blackboard on an easel: a title and a big chalked figure (`value` from params). */
export const Board: React.FC<{ x: number; y: number; w: number; h: number; k: number; title: string; rows: { text: string; value: string; color: string; k: number }[] }> = ({ x, y, w, h, k, title, rows }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -220;
  return (
    <g transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, k * 2)}>
      <path d={`M ${-w * 0.3} ${h * 0.5} L ${-w * 0.4} ${h * 0.5 + 160} M ${w * 0.3} ${h * 0.5} L ${w * 0.4} ${h * 0.5 + 160}`} stroke="#7a4e2a" strokeWidth={18} strokeLinecap="round" />
      <Block x={-w / 2 - 16} y={-h / 2 - 16} w={w + 32} h={h + 32} r={14} fill="#8a5a34" sw={STROKE} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#24483a" />
      <Txt x={0} y={-h / 2 + 50} size={48} fill="#f1efe4" weight={800}>{title}</Txt>
      {rows.map((r, i) => (r.k > 0 ? (
        <g key={i} opacity={Math.min(1, r.k * 2)}>
          <Txt x={-w / 2 + 40} y={-h / 2 + 140 + i * 110} size={52} fill={r.color} weight={800} anchor="start">{r.text}</Txt>
          <Txt x={w / 2 - 40} y={-h / 2 + 140 + i * 110} size={72} fill="#ffffff" weight={900} anchor="end">{r.value}</Txt>
        </g>
      ) : null))}
    </g>
  );
};

/** A tray of ballot slips: `n` slips stacked (0..1 of a full tray `full` tall). */
export const Pile: React.FC<{ x: number; y: number; w: number; level: number; full: number; color: string; t: number }> = ({ x, y, w, level, full, color, t }) => {
  const hgt = Math.max(0, level) * full;
  const rows = Math.max(1, Math.floor(hgt / 22));
  return (
    <g transform={`translate(${x} ${y})`}>
      <Block x={-w / 2 - 14} y={-10} w={w + 28} h={40} r={8} fill={color} sw={STROKE} />
      {hgt > 1 ? Array.from({ length: rows }, (_, i) => (
        <rect key={i} x={-w / 2 + ((i * 37) % 23) - 10 + Math.sin(t / 9 + i) * 2} y={-10 - (i + 1) * (hgt / rows)} width={w} height={hgt / rows + 2} rx={3}
          fill={i % 2 ? "#ffffff" : "#ecebe4"} stroke={INK} strokeWidth={2.5} />
      )) : null}
    </g>
  );
};

/** A point on the map in frame pixels. */
export const OnMap: React.FC<{ ll: LL; children: (xy: [number, number]) => React.ReactNode }> = ({ ll, children }) => {
  const at = useAt();
  const xy = at(ll);
  return xy ? <>{children(xy)}</> : null;
};

export default MapView;
