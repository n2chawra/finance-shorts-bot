/**
 * The things "Ohtani's deferred deal" is about, drawn for this video only: a baseball player at bat
 * (blue cap and jersey), a baseball, a long contract on a clipboard with a signature line, a steel
 * time safe with a dial and a date strip (money locked away), a ten-page decade calendar, a big
 * cheque, a sponsor billboard on posts, a sneaker, a wristwatch box (sponsor gifts) and a sofa.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a baseball player in a blue cap and jersey, bat on the shoulder, bobbing
  batter: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.015)})`}>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.1} y={-s * 0.36} width={s * 0.08} height={s * 0.36} rx={s * 0.03} fill="#f2f2f2" stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={s * 0.02} y={-s * 0.36} width={s * 0.08} height={s * 0.36} rx={s * 0.03} fill="#f2f2f2" stroke={INK} strokeWidth={line(s) * 0.5} />
      <Shape d={`M${-s * 0.17},${-s * 0.72} L${s * 0.17},${-s * 0.72} L${s * 0.14},${-s * 0.34} L${-s * 0.14},${-s * 0.34} Z`} fill={PALETTE.white} s={s} />
      <rect x={-s * 0.15} y={-s * 0.62} width={s * 0.3} height={s * 0.05} fill={PALETTE.blue} />
      <line x1={s * 0.12} y1={-s * 0.62} x2={s * 0.42} y2={-s * 1.02} stroke={PALETTE.brown} strokeWidth={line(s) * 2.4} strokeLinecap="round" />
      <Ball cx={s * 0.14} cy={-s * 0.62} rx={s * 0.05} fill={PALETTE.skin} s={s} />
      <Ball cx={0} cy={-s * 0.82} rx={s * 0.1} fill={PALETTE.skin} s={s} />
      <Shape d={`M${-s * 0.11},${-s * 0.85} Q0,${-s * 1.0} ${s * 0.11},${-s * 0.85} L${s * 0.2},${-s * 0.84} L${s * 0.2},${-s * 0.82} L${-s * 0.11},${-s * 0.82} Z`} fill={PALETTE.blue} s={s} />
    </g>
  ),
  // a white baseball with red stitches, spinning
  baseball: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      <g transform={`translate(0,${-s * 0.3}) rotate(${t * 60})`}>
        <circle r={s * 0.28} fill="#fff" stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.18},${-s * 0.2} Q${-s * 0.06},0 ${-s * 0.18},${s * 0.2}`} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.03} ${s * 0.02}`} />
        <path d={`M${s * 0.18},${-s * 0.2} Q${s * 0.06},0 ${s * 0.18},${s * 0.2}`} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.03} ${s * 0.02}`} />
      </g>
    </g>
  ),
  // a long contract on a brown clipboard: lines of text and a signature
  contract: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.4) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.3} y={-s * 0.9} w={s * 0.6} h={s * 0.88} fill={PALETTE.brown} s={s} r={s * 0.04} />
      <rect x={-s * 0.25} y={-s * 0.82} width={s * 0.5} height={s * 0.75} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={-s * 0.1} y={-s * 0.95} width={s * 0.2} height={s * 0.08} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[0.72, 0.64, 0.56, 0.48, 0.4, 0.32].map((y) => <rect key={y} x={-s * 0.19} y={-s * y} width={s * 0.38} height={s * 0.025} rx={s * 0.01} fill={PALETTE.grey} />)}
      <path d={`M${-s * 0.17},${-s * 0.16} q${s * 0.05},${-s * 0.08} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.1},0`} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a steel time safe with a dial and a red strip; "open" swings the door
  timesafe: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.4} y={-s * 0.8} w={s * 0.8} h={s * 0.78} fill={shade(PALETTE.grey, -0.15)} s={s} r={s * 0.05} />
      <rect x={-s * 0.33} y={-s * 0.73} width={s * 0.66} height={s * 0.64} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <g transform={`translate(${-s * 0.05},${-s * 0.42}) rotate(${state === "open" ? 0 : t * 40})`}>
        <circle r={s * 0.14} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
        {[0, 90, 180, 270].map((a) => <rect key={a} x={-s * 0.01} y={-s * 0.13} width={s * 0.02} height={s * 0.05} fill="#fff" transform={`rotate(${a})`} />)}
      </g>
      <rect x={s * 0.16} y={-s * 0.5} width={s * 0.08} height={s * 0.16} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.3} y={-s * 0.2} width={s * 0.6} height={s * 0.07} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a wall calendar with ten pages flipping: a decade
  decade: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={-s * 0.3 + i * s * 0.025} y={-s * 0.8 + i * s * 0.025} width={s * 0.6} height={s * 0.74} rx={s * 0.04} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <rect x={-s * 0.3} y={-s * 0.8} width={s * 0.6} height={s * 0.16} rx={s * 0.04} fill={PALETTE.purple} stroke={INK} strokeWidth={line(s) * 0.6} />
      <g transform={`rotate(${((t * 120) % 180) - 90} ${-s * 0.3} ${-s * 0.64})`} opacity={0.8}>
        <rect x={-s * 0.3} y={-s * 0.64} width={s * 0.6} height={s * 0.56} fill="#f4f0ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-s * 0.2 + (i % 3) * s * 0.15} y={-s * 0.5 + Math.floor(i / 3) * s * 0.13} width={s * 0.09} height={s * 0.08} rx={s * 0.015} fill={PALETTE.grey} />)}
    </g>
  ),
  // a big presentation cheque: cream with a green band and a signature
  bigcheque: ({ s, t }) => (
    <g transform={`rotate(${-4 + Math.sin(t * 2) * 2})`}>
      <Shadow w={s * 1.0} s={s} />
      <rect x={-s * 0.55} y={-s * 0.5} width={s * 1.1} height={s * 0.48} rx={s * 0.03} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.55} y={-s * 0.5} width={s * 1.1} height={s * 0.1} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={-s * 0.45} y={-s * 0.32} width={s * 0.5} height={s * 0.03} fill={PALETTE.grey} />
      <rect x={s * 0.15} y={-s * 0.2} width={s * 0.3} height={s * 0.08} rx={s * 0.01} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${-s * 0.45},${-s * 0.1} q${s * 0.06},${-s * 0.08} ${s * 0.12},0 t${s * 0.12},0`} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a sponsor billboard on two posts, lights blinking
  billboard: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <rect x={-s * 0.35} y={-s * 0.5} width={s * 0.05} height={s * 0.5} fill={PALETTE.dark} />
      <rect x={s * 0.3} y={-s * 0.5} width={s * 0.05} height={s * 0.5} fill={PALETTE.dark} />
      <Box x={-s * 0.55} y={-s * 1.0} w={s * 1.1} h={s * 0.52} fill={PALETTE.orange} s={s} r={s * 0.03} />
      <Ball cx={-s * 0.25} cy={-s * 0.74} rx={s * 0.13} fill={PALETTE.yellow} s={s} />
      <rect x={-s * 0.05} y={-s * 0.84} width={s * 0.48} height={s * 0.06} rx={s * 0.02} fill="#fff" />
      <rect x={-s * 0.05} y={-s * 0.72} width={s * 0.34} height={s * 0.06} rx={s * 0.02} fill="#fff" />
      {[-0.4, -0.13, 0.13, 0.4].map((x, i) => <circle key={x} cx={x * s} cy={-s * 1.03} r={s * 0.025} fill={PALETTE.yellow} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 4 + i))} />)}
    </g>
  ),
  // a bright sneaker with a swoosh-free stripe
  sneaker: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.5)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.45},${-s * 0.06} L${-s * 0.42},${-s * 0.32} Q${-s * 0.3},${-s * 0.4} ${-s * 0.15},${-s * 0.34} L${s * 0.05},${-s * 0.22} Q${s * 0.4},${-s * 0.2} ${s * 0.45},${-s * 0.08} L${s * 0.45},${-s * 0.04} Z`} fill={PALETTE.red} s={s} />
      <rect x={-s * 0.46} y={-s * 0.08} width={s * 0.92} height={s * 0.07} rx={s * 0.03} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.3},${-s * 0.14} Q${-s * 0.05},${-s * 0.3} ${s * 0.25},${-s * 0.14}`} fill="none" stroke="#fff" strokeWidth={line(s) * 0.9} />
    </g>
  ),
  // a gift box with a ribbon: a sponsor's present
  giftbox: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 3, 0.02)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.3} y={-s * 0.5} w={s * 0.6} h={s * 0.48} fill={PALETTE.purple} s={s} r={s * 0.03} />
      <rect x={-s * 0.34} y={-s * 0.6} width={s * 0.68} height={s * 0.12} rx={s * 0.02} fill={shade(PALETTE.purple, 0.15)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.05} y={-s * 0.6} width={s * 0.1} height={s * 0.58} fill={PALETTE.gold} />
      <Ball cx={-s * 0.1} cy={-s * 0.66} rx={s * 0.1} ry={s * 0.06} fill={PALETTE.gold} s={s} />
      <Ball cx={s * 0.1} cy={-s * 0.66} rx={s * 0.1} ry={s * 0.06} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // a leather wallet stuffed with notes
  wallet: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.02)})`}>
      <Shadow w={s * 0.8} s={s} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.3 + i * s * 0.05} y={-s * (0.62 - i * 0.03)} width={s * 0.5} height={s * 0.2} rx={s * 0.02} fill="#7fcf8f" stroke={INK} strokeWidth={line(s) * 0.4} transform={`rotate(${-8 + i * 6})`} />)}
      <Box x={-s * 0.4} y={-s * 0.5} w={s * 0.8} h={s * 0.48} fill={PALETTE.brown} s={s} r={s * 0.06} />
      <rect x={s * 0.1} y={-s * 0.36} width={s * 0.3} height={s * 0.18} rx={s * 0.05} fill={shade(PALETTE.brown, -0.2)} stroke={INK} strokeWidth={line(s) * 0.5} />
      <circle cx={s * 0.22} cy={-s * 0.27} r={s * 0.035} fill={PALETTE.gold} />
    </g>
  ),
  // an hourglass with blue sand running
  sandtimer: ({ s, t }) => {
    const f = (t * 0.3) % 1;
    return (
      <g>
        <Shadow w={s * 0.5} s={s} />
        <rect x={-s * 0.22} y={-s * 0.06} width={s * 0.44} height={s * 0.06} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.22} y={-s * 0.86} width={s * 0.44} height={s * 0.06} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />
        <path d={`M${-s * 0.17},${-s * 0.8} L${s * 0.17},${-s * 0.8} L${s * 0.03},${-s * 0.43} L${s * 0.17},${-s * 0.06} L${-s * 0.17},${-s * 0.06} L${-s * 0.03},${-s * 0.43} Z`} fill="#eef6ff" stroke={INK} strokeWidth={line(s)} />
        <Shape d={`M${-s * (0.12 - 0.09 * f)},${-s * (0.66 - 0.18 * f)} L${s * (0.12 - 0.09 * f)},${-s * (0.66 - 0.18 * f)} L0,${-s * 0.46} Z`} fill={PALETTE.blue} s={s * 0.4} />
        <Shape d={`M${-s * 0.15},${-s * 0.08} L${s * 0.15},${-s * 0.08} L0,${-s * (0.1 + 0.18 * f)} Z`} fill={PALETTE.blue} s={s * 0.4} />
      </g>
    );
  },
};

export default props;
