/**
 * The things "What $1 billion looks like in $100 bills" is about, drawn for this video only:
 * one big hundred, a strap of hundreds, a jeans pocket, a briefcase, a shrink-wrapped pallet of
 * cash, the forklift that moves it, the warehouse room it fills, a paycheck, a wall calendar and
 * a year counter wheel.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const NOTE = "#9dc79f", NOTE_INK = "#3c6b44", BAND = "#efe9c8";

// a banded brick of notes seen from the side, the unit every bigger thing is built from
const Brick: React.FC<{ x: number; y: number; w: number; h: number; s: number }> = ({ x, y, w, h, s }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h * 0.12} fill={NOTE} stroke={INK} strokeWidth={line(s) * 0.6} />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={h} fill={BAND} stroke={INK} strokeWidth={line(s) * 0.4} />
    <rect x={x + w * 0.05} y={y + h * 0.45} width={w * 0.9} height={Math.max(1, h * 0.06)} fill={NOTE_INK} opacity={0.35} />
  </g>
);

const props: PropSet = {
  // one big hundred-dollar bill standing on its edge: the portrait oval, the corner seals
  hundred: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(${Math.sin(t * 1.3) * 2})`}>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.95} y={-s * 0.92} w={s * 1.9} h={s * 0.9} fill={NOTE} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.86} y={-s * 0.84} width={s * 1.72} height={s * 0.74} rx={s * 0.04} fill="none" stroke={NOTE_INK} strokeWidth={line(s) * 0.8} />
      <ellipse cx={0} cy={-s * 0.47} rx={s * 0.26} ry={s * 0.3} fill={BAND} stroke={NOTE_INK} strokeWidth={line(s) * 0.8} />
      <Ball cx={0} cy={-s * 0.55} rx={s * 0.1} fill={shade(NOTE_INK, 0.3)} s={s * 0.6} />
      <path d={`M${-s * 0.16},${-s * 0.24} Q0,${-s * 0.42} ${s * 0.16},${-s * 0.24}`} fill={shade(NOTE_INK, 0.3)} />
      <Ball cx={-s * 0.62} cy={-s * 0.47} rx={s * 0.14} fill={PALETTE.gold} s={s * 0.6} />
      <Ball cx={s * 0.62} cy={-s * 0.47} rx={s * 0.14} fill={NOTE_INK} s={s * 0.6} />
      <Paint x={0} y={-s * 0.13} text="USA" size={s * 0.09} fill={NOTE_INK} />
    </g>
  ),
  // a strap of hundreds: a thick brick of notes with a paper band round the middle
  strap: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 1.2} s={s} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-s * 0.6 + (i % 2) * s * 0.01} y={-s * (0.1 + i * 0.07)} width={s * 1.2} height={s * 0.075} rx={s * 0.02} fill={i % 2 ? NOTE : shade(NOTE, -0.08)} stroke={INK} strokeWidth={line(s) * 0.5} />
      ))}
      <Box x={-s * 0.6} y={-s * 0.56} w={s * 1.2} h={s * 0.12} fill={NOTE} s={s} r={0.2} sheen />
      <rect x={-s * 0.12} y={-s * 0.6} width={s * 0.24} height={s * 0.6} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // a jeans pocket, a strap poking out of it
  pocket: ({ s }) => (
    <g>
      <Shape d={`M${-s * 0.45},${-s * 0.95} L${s * 0.45},${-s * 0.95} L${s * 0.42},${-s * 0.25} Q0,${s * 0.05} ${-s * 0.42},${-s * 0.25} Z`} fill={PALETTE.blue} s={s} />
      <path d={`M${-s * 0.38},${-s * 0.88} L${s * 0.38},${-s * 0.88} L${s * 0.36},${-s * 0.3} Q0,${-s * 0.04} ${-s * 0.36},${-s * 0.3} Z`} fill="none" stroke={PALETTE.orange} strokeWidth={line(s) * 0.6} strokeDasharray={`${s * 0.04} ${s * 0.03}`} />
      <path d={`M${-s * 0.45},${-s * 0.75} Q0,${-s * 0.62} ${s * 0.45},${-s * 0.75}`} fill="none" stroke={INK} strokeWidth={line(s)} />
    </g>
  ),
  // a briefcase: state "open" shows the bricks of notes packed inside
  briefcase: ({ s, state, t }) => {
    const open = state === "open";
    return (
      <g transform={`translate(0,${bob(t, s, 1.4, 0.01)})`}>
        <Shadow w={s * 1.3} s={s} />
        <path d={`M${-s * 0.18},${-s * 0.68} v${-s * 0.12} h${s * 0.36} v${s * 0.12}`} fill="none" stroke={INK} strokeWidth={s * 0.06} strokeLinejoin="round" />
        <Box x={-s * 0.65} y={-s * 0.7} w={s * 1.3} h={s * 0.7} fill={PALETTE.brown} s={s} r={0.08} />
        {open ? (
          <g>
            <rect x={-s * 0.57} y={-s * 0.62} width={s * 1.14} height={s * 0.54} rx={s * 0.03} fill={shade(PALETTE.brown, -0.4)} />
            {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
              <Brick key={`${r}${c}`} x={-s * 0.55 + c * s * 0.37} y={-s * 0.6 + r * s * 0.17} w={s * 0.35} h={s * 0.15} s={s} />
            )))}
          </g>
        ) : (
          <g>
            <rect x={-s * 0.65} y={-s * 0.5} width={s * 1.3} height={s * 0.05} fill={shade(PALETTE.brown, -0.3)} />
            <Box x={-s * 0.4} y={-s * 0.56} w={s * 0.14} h={s * 0.1} fill={PALETTE.gold} s={s} r={0.2} sheen={false} />
            <Box x={s * 0.26} y={-s * 0.56} w={s * 0.14} h={s * 0.1} fill={PALETTE.gold} s={s} r={0.2} sheen={false} />
          </g>
        )}
      </g>
    );
  },
  // a pallet: a wooden base with a cube of notes wrapped in shiny film on top
  pallet: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.12} w={s * 1.1} h={s * 0.12} fill={PALETTE.tan} s={s} r={0.05} sheen={false} />
      {[-0.4, 0, 0.4].map((x) => <rect key={x} x={s * x - s * 0.06} y={-s * 0.08} width={s * 0.12} height={s * 0.08} fill={shade(PALETTE.tan, -0.4)} />)}
      {[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2].map((c) => (
        <Brick key={`${r}${c}`} x={-s * 0.5 + c * s * 0.335} y={-s * 0.27 - r * s * 0.145} w={s * 0.33} h={s * 0.14} s={s} />
      )))}
      <rect x={-s * 0.52} y={-s * 1.0} width={s * 1.04} height={s * 0.86} rx={s * 0.03} fill="#dff3ff" opacity={0.18} stroke="#fff" strokeOpacity={0.6} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.4 + ((t * 0.2) % 1) * s * 0.6},${-s * 0.98} l${s * 0.2},${s * 0.82}`} stroke="#fff" strokeWidth={s * 0.04} opacity={0.35} />
    </g>
  ),
  // a forklift: yellow body, mast and forks, a rotating beacon
  forklift: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <rect x={s * 0.32} y={-s * 1.0} width={s * 0.07} height={s * 0.9} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.36} y={-s * 0.14} width={s * 0.38} height={s * 0.05} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.5} y={-s * 0.5} w={s * 0.84} h={s * 0.36} fill={PALETTE.yellow} s={s} r={0.12} />
      <path d={`M${-s * 0.32},${-s * 0.5} L${-s * 0.28},${-s * 0.9} L${s * 0.22},${-s * 0.9} L${s * 0.28},${-s * 0.5}`} fill="none" stroke={INK} strokeWidth={s * 0.04} />
      <Ball cx={-s * 0.3} cy={-s * 0.12} rx={s * 0.13} fill={PALETTE.dark} s={s} />
      <Ball cx={s * 0.18} cy={-s * 0.12} rx={s * 0.13} fill={PALETTE.dark} s={s} />
      <Ball cx={-s * 0.03} cy={-s * 0.95} rx={s * 0.06} fill={Math.sin(t * 10) > 0 ? PALETTE.orange : PALETTE.red} s={s} />
    </g>
  ),
  // the room: a warehouse wall with roller doors and steel shelves
  warehouse: ({ s }) => (
    <g>
      <Box x={-s * 0.9} y={-s * 0.75} w={s * 1.8} h={s * 0.75} fill={PALETTE.grey} s={s} r={0.02} sheen={false} />
      <Shape d={`M${-s * 0.95},${-s * 0.75} L0,${-s * 1.0} L${s * 0.95},${-s * 0.75} Z`} fill={PALETTE.dark} s={s} />
      {[-0.5, 0, 0.5].map((x) => (
        <g key={x}>
          <rect x={s * x - s * 0.18} y={-s * 0.5} width={s * 0.36} height={s * 0.5} fill={shade(PALETTE.grey, -0.25)} stroke={INK} strokeWidth={line(s) * 0.6} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={s * x - s * 0.18} x2={s * x + s * 0.18} y1={-s * (0.42 - i * 0.1)} y2={-s * (0.42 - i * 0.1)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
        </g>
      ))}
    </g>
  ),
  // a paycheck: a long slip with a signature and a green stripe
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.4, 0.02)}) rotate(-5)`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.62} y={-s * 0.6} w={s * 1.24} h={s * 0.52} fill={PALETTE.cream} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.62} y={-s * 0.6} width={s * 1.24} height={s * 0.1} fill={PALETTE.green} />
      <Paint x={-s * 0.25} y={-s * 0.36} text="PAY" size={s * 0.12} fill={PALETTE.green} />
      <rect x={s * 0.05} y={-s * 0.42} width={s * 0.45} height={s * 0.08} rx={s * 0.02} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.5},${-s * 0.17} q${s * 0.07},${-s * 0.08} ${s * 0.14},0 t${s * 0.14},0`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" strokeLinecap="round" />
    </g>
  ),
  // a wall calendar: k (0..1) is how fast its pages are flying off
  calendar: ({ s, t, k = 0 }) => {
    const flip = (t * (1 + k * 10)) % 1;
    return (
      <g>
        <Box x={-s * 0.4} y={-s * 0.92} w={s * 0.8} h={s * 0.86} fill="#fff" s={s} r={0.05} sheen={false} />
        <rect x={-s * 0.4} y={-s * 0.92} width={s * 0.8} height={s * 0.2} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => (
          <rect key={`${r}${c}`} x={-s * 0.33 + c * s * 0.135} y={-s * 0.64 + r * s * 0.13} width={s * 0.1} height={s * 0.09} rx={s * 0.015} fill={PALETTE.grey} opacity={0.4} />
        )))}
        {k > 0 && (
          <g transform={`translate(${flip * s * 0.6},${-s * 0.5 - flip * s * 0.5}) rotate(${flip * 70})`} opacity={1 - flip}>
            <rect x={-s * 0.4} y={-s * 0.4} width={s * 0.8} height={s * 0.8} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
          </g>
        )}
      </g>
    );
  },
  // a counter wheel of years, its drums spinning: k (0..1) is how far it has run
  counter: ({ s, t, k = 0 }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.62} y={-s * 0.62} w={s * 1.24} h={s * 0.56} fill={PALETTE.dark} s={s} r={0.08} />
      {[0, 1, 2, 3, 4].map((i) => {
        const spin = (t * (2 + i * 1.7) * k) % 1;
        return (
          <g key={i}>
            <rect x={-s * 0.54 + i * s * 0.22} y={-s * 0.55} width={s * 0.18} height={s * 0.42} rx={s * 0.03} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
            <rect x={-s * 0.52 + i * s * 0.22} y={-s * 0.55 + spin * s * 0.38} width={s * 0.14} height={s * 0.04} fill={PALETTE.grey} />
          </g>
        );
      })}
    </g>
  ),
};

export default props;
