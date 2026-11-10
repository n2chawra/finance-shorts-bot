/**
 * The things "a year's pay against Ronaldo's year" is about, drawn for this video only: a football
 * star in a white kit with a gold star on the chest, a football, a big pile of gold-banded cash with a
 * glinting trophy on top, a tear-off day page, a striped deckchair (a rest day), a stopwatch with a
 * sweeping hand, a bed with a sleeper under the blanket and Zs, a salary slip, an hourglass of coins,
 * a breakfast plate (toast and a fried egg with a mug) and an alarm clock at dawn.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a football star from behind-ish: white kit, gold star on the chest, arms up, bobbing
  footballer: ({ s, t }) => {
    const b = bob(t, s, 2.2, 0.02);
    return (
      <g transform={`translate(0,${b})`}>
        <Shadow w={s * 0.6} s={s} />
        <rect x={-s * 0.1} y={-s * 0.36} width={s * 0.08} height={s * 0.36} rx={s * 0.03} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={s * 0.02} y={-s * 0.36} width={s * 0.08} height={s * 0.36} rx={s * 0.03} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.13} y={-s * 0.06} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill={INK} />
        <rect x={s * 0.01} y={-s * 0.06} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill={INK} />
        <Shape d={`M${-s * 0.17},${-s * 0.72} L${s * 0.17},${-s * 0.72} L${s * 0.14},${-s * 0.34} L${-s * 0.14},${-s * 0.34} Z`} fill={PALETTE.white} s={s} />
        <Shape d={`M${-s * 0.17},${-s * 0.7} L${-s * 0.32},${-s * 0.95} L${-s * 0.25},${-s * 0.99} L${-s * 0.1},${-s * 0.74} Z`} fill={PALETTE.white} s={s} />
        <Shape d={`M${s * 0.17},${-s * 0.7} L${s * 0.32},${-s * 0.95} L${s * 0.25},${-s * 0.99} L${s * 0.1},${-s * 0.74} Z`} fill={PALETTE.white} s={s} />
        <Ball cx={-s * 0.29} cy={-s * 1.0} rx={s * 0.04} fill={PALETTE.skin} s={s} />
        <Ball cx={s * 0.29} cy={-s * 1.0} rx={s * 0.04} fill={PALETTE.skin} s={s} />
        <Shape d={`M0,${-s * 0.64} L${s * 0.03},${-s * 0.58} L${s * 0.09},${-s * 0.58} L${s * 0.045},${-s * 0.54} L${s * 0.06},${-s * 0.48} L0,${-s * 0.52} L${-s * 0.06},${-s * 0.48} L${-s * 0.045},${-s * 0.54} L${-s * 0.09},${-s * 0.58} L${-s * 0.03},${-s * 0.58} Z`} fill={PALETTE.gold} s={s * 0.5} />
        <Ball cx={0} cy={-s * 0.82} rx={s * 0.1} fill={PALETTE.skin} s={s} />
        <Shape d={`M${-s * 0.1},${-s * 0.85} Q0,${-s * 0.99} ${s * 0.1},${-s * 0.85} Q0,${-s * 0.9} ${-s * 0.1},${-s * 0.85} Z`} fill={PALETTE.dark} s={s} />
      </g>
    );
  },
  // a classic black-and-white football, spinning slowly
  football: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <g transform={`translate(0,${-s * 0.3}) rotate(${t * 40})`}>
        <circle r={s * 0.3} fill="#fff" stroke={INK} strokeWidth={line(s)} />
        <Shape d={`M0,${-s * 0.1} L${s * 0.095},${-s * 0.03} L${s * 0.06},${s * 0.08} L${-s * 0.06},${s * 0.08} L${-s * 0.095},${-s * 0.03} Z`} fill={INK} s={s * 0.3} />
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1={0} y1={-s * 0.1} x2={0} y2={-s * 0.2} stroke={INK} strokeWidth={line(s) * 0.6} />
            <path d={`M${-s * 0.07},${-s * 0.25} L0,${-s * 0.2} L${s * 0.07},${-s * 0.25} L${s * 0.05},${-s * 0.3} L${-s * 0.05},${-s * 0.3} Z`} fill={INK} />
          </g>
        ))}
      </g>
    </g>
  ),
  // a big pile of gold-banded cash bricks with a trophy glinting on top
  cashpile: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.5} s={s} />
      {([[-0.5, 0], [-0.17, 0], [0.17, 0], [0.5, 0], [-0.33, 1], [0, 1], [0.33, 1], [-0.17, 2], [0.17, 2]] as [number, number][]).map(([x, r], i) => (
        <g key={i}>
          <rect x={x * s - s * 0.16} y={-s * (0.13 + r * 0.13)} width={s * 0.32} height={s * 0.13} rx={s * 0.015} fill="#7fcf8f" stroke={INK} strokeWidth={line(s) * 0.4} />
          <rect x={x * s - s * 0.035} y={-s * (0.13 + r * 0.13)} width={s * 0.07} height={s * 0.13} fill={PALETTE.gold} />
        </g>
      ))}
      <g transform={`translate(0,${-s * 0.39})`}>
        <rect x={-s * 0.1} y={-s * 0.06} width={s * 0.2} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
        <rect x={-s * 0.03} y={-s * 0.16} width={s * 0.06} height={s * 0.1} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Shape d={`M${-s * 0.14},${-s * 0.4} L${s * 0.14},${-s * 0.4} Q${s * 0.12},${-s * 0.16} 0,${-s * 0.16} Q${-s * 0.12},${-s * 0.16} ${-s * 0.14},${-s * 0.4} Z`} fill={PALETTE.gold} s={s} />
        <circle cx={s * 0.05} cy={-s * 0.32} r={s * 0.025} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 5)} />
      </g>
    </g>
  ),
  // a tear-off calendar page for one day, a red top band and a sun drawn in the middle
  daypage: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <rect x={-s * 0.3} y={-s * 0.8} width={s * 0.6} height={s * 0.78} rx={s * 0.04} fill="#fff" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.3} y={-s * 0.8} width={s * 0.6} height={s * 0.18} rx={s * 0.04} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
      {[-0.18, 0, 0.18].map((x) => <circle key={x} cx={x * s} cy={-s * 0.8} r={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <g transform={`translate(0,${-s * 0.36}) rotate(${t * 30})`}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x={-s * 0.015} y={-s * 0.2} width={s * 0.03} height={s * 0.06} fill={PALETTE.orange} transform={`rotate(${a})`} />)}
      </g>
      <circle cx={0} cy={-s * 0.36} r={s * 0.1} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a striped deckchair: a day off
  deckchair: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <line x1={-s * 0.3} y1={0} x2={s * 0.15} y2={-s * 0.6} stroke={PALETTE.brown} strokeWidth={line(s) * 1.4} />
      <line x1={s * 0.3} y1={0} x2={-s * 0.1} y2={-s * 0.35} stroke={PALETTE.brown} strokeWidth={line(s) * 1.4} />
      <Shape d={`M${-s * 0.25},${-s * 0.28} L${s * 0.12},${-s * 0.62} L${s * 0.28},${-s * 0.5} L${-s * 0.05},${-s * 0.14} Z`} fill={PALETTE.blue} s={s} />
      <Shape d={`M${-s * 0.15},${-s * 0.37} L${s * 0.2},${-s * 0.56} L${s * 0.24},${-s * 0.53} L${-s * 0.1},${-s * 0.3} Z`} fill={PALETTE.white} s={s * 0.5} />
    </g>
  ),
  // a big stopwatch, the hand sweeping round
  stopwatch: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <rect x={-s * 0.06} y={-s * 0.88} width={s * 0.12} height={s * 0.08} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.2} y={-s * 0.8} width={s * 0.08} height={s * 0.06} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} transform={`rotate(40 ${s * 0.24} ${-s * 0.77})`} />
      <circle cx={0} cy={-s * 0.42} r={s * 0.38} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
      <circle cx={0} cy={-s * 0.42} r={s * 0.3} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.01} y={-s * 0.7} width={s * 0.02} height={s * 0.05} fill={INK} transform={`rotate(${i * 30} 0 ${-s * 0.42})`} />)}
      <line x1={0} y1={-s * 0.42} x2={0} y2={-s * 0.67} stroke={PALETTE.red} strokeWidth={line(s)} strokeLinecap="round" transform={`rotate(${t * 180} 0 ${-s * 0.42})`} />
      <circle cx={0} cy={-s * 0.42} r={s * 0.03} fill={INK} />
    </g>
  ),
  // a bed, someone asleep under a blue blanket, Zs floating up
  bed: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <rect x={-s * 0.62} y={-s * 0.5} width={s * 0.08} height={s * 0.5} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.54} y={-s * 0.32} width={s * 0.08} height={s * 0.32} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.56} y={-s * 0.24} w={s * 1.12} h={s * 0.14} fill={PALETTE.tan} s={s} r={s * 0.02} />
      <Box x={-s * 0.52} y={-s * 0.34} w={s * 0.24} h={s * 0.1} fill="#fff" s={s} r={s * 0.04} />
      <Ball cx={-s * 0.36} cy={-s * 0.4} rx={s * 0.09} fill={PALETTE.skin} s={s} />
      <Shape d={`M${-s * 0.26},${-s * 0.24} Q${-s * 0.2},${-s * 0.42} ${s * 0.1},${-s * 0.38} Q${s * 0.45},${-s * 0.36} ${s * 0.52},${-s * 0.24} Z`} fill={PALETTE.blue} s={s} />
      {[0, 1, 2].map((i) => {
        const f = ((t * 0.6 + i / 3) % 1);
        return <text key={i} x={-s * 0.3 + f * s * 0.25} y={-s * 0.55 - f * s * 0.35} fontSize={s * (0.1 + 0.05 * f)} fontWeight={900} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.3} opacity={1 - f}>Z</text>;
      })}
    </g>
  ),
  // a salary slip: a paper with a blue header band and a few lines, a coin clip
  payslip: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <rect x={-s * 0.3} y={-s * 0.82} width={s * 0.6} height={s * 0.8} rx={s * 0.03} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.3} y={-s * 0.82} width={s * 0.6} height={s * 0.14} rx={s * 0.03} fill={PALETTE.blue} stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0.55, 0.45, 0.35, 0.25].map((y, i) => <rect key={y} x={-s * 0.22} y={-s * y} width={s * (i === 3 ? 0.26 : 0.44)} height={s * 0.035} rx={s * 0.015} fill={i === 3 ? PALETTE.green : PALETTE.grey} />)}
      <Ball cx={s * 0.18} cy={-s * 0.14} rx={s * 0.07} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // an hourglass whose sand is gold coins trickling down
  coinglass: ({ s, t }) => {
    const f = (t * 0.25) % 1;
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <rect x={-s * 0.26} y={-s * 0.06} width={s * 0.52} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.26} y={-s * 0.9} width={s * 0.52} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M${-s * 0.2},${-s * 0.84} L${s * 0.2},${-s * 0.84} L${s * 0.03},${-s * 0.46} L${s * 0.2},${-s * 0.06} L${-s * 0.2},${-s * 0.06} L${-s * 0.03},${-s * 0.46} Z`} fill="#e8f4ff" stroke={INK} strokeWidth={line(s)} />
        <Shape d={`M${-s * (0.14 - 0.1 * f)},${-s * (0.7 - 0.2 * f)} L${s * (0.14 - 0.1 * f)},${-s * (0.7 - 0.2 * f)} L0,${-s * 0.48} Z`} fill={PALETTE.gold} s={s * 0.5} />
        <Shape d={`M${-s * 0.18},${-s * 0.08} L${s * 0.18},${-s * 0.08} L0,${-s * (0.12 + 0.2 * f)} Z`} fill={PALETTE.gold} s={s * 0.5} />
        {[0, 1, 2].map((i) => <circle key={i} cx={0} cy={-s * (0.44 - ((t * 1.5 + i / 3) % 1) * 0.3)} r={s * 0.018} fill={PALETTE.gold} />)}
      </g>
    );
  },
  // breakfast: a plate with toast and a fried egg, a steaming mug
  breakfast: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <ellipse cx={-s * 0.1} cy={-s * 0.08} rx={s * 0.45} ry={s * 0.12} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.4} y={-s * 0.3} w={s * 0.24} h={s * 0.2} fill={PALETTE.tan} s={s} r={s * 0.05} />
      <ellipse cx={s * 0.05} cy={-s * 0.13} rx={s * 0.16} ry={s * 0.06} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.05} cy={-s * 0.15} r={s * 0.05} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Box x={s * 0.32} y={-s * 0.36} w={s * 0.18} h={s * 0.3} fill={PALETTE.red} s={s} r={s * 0.03} />
      <path d={`M${s * 0.5},${-s * 0.3} q${s * 0.08},0 ${s * 0.08},${s * 0.08} q0,${s * 0.08} ${-s * 0.08},${s * 0.08}`} fill="none" stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1].map((i) => <path key={i} d={`M${s * (0.37 + i * 0.07)},${-s * 0.42} q${s * 0.03},${-s * 0.05} 0,${-s * 0.1} q${-s * 0.03},${-s * 0.05} 0,${-s * 0.1}`} fill="none" stroke="#fff" strokeWidth={line(s) * 0.5} opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />)}
    </g>
  ),
  // an alarm clock with two bells, shaking a little
  alarmclock: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 30) * 2} 0 ${-s * 0.4})`}>
      <Shadow w={s * 0.6} s={s} />
      <Ball cx={-s * 0.2} cy={-s * 0.7} rx={s * 0.1} fill={PALETTE.gold} s={s} />
      <Ball cx={s * 0.2} cy={-s * 0.7} rx={s * 0.1} fill={PALETTE.gold} s={s} />
      <circle cx={0} cy={-s * 0.4} r={s * 0.3} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s)} />
      <circle cx={0} cy={-s * 0.4} r={s * 0.23} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <line x1={0} y1={-s * 0.4} x2={0} y2={-s * 0.56} stroke={INK} strokeWidth={line(s)} strokeLinecap="round" />
      <line x1={0} y1={-s * 0.4} x2={s * 0.1} y2={-s * 0.4} stroke={INK} strokeWidth={line(s)} strokeLinecap="round" />
      <line x1={-s * 0.18} y1={-s * 0.12} x2={-s * 0.24} y2={0} stroke={INK} strokeWidth={line(s)} />
      <line x1={s * 0.18} y1={-s * 0.12} x2={s * 0.24} y2={0} stroke={INK} strokeWidth={line(s)} />
    </g>
  ),
  // a sack of money with a gold dollar-less coin mark, for the per-day haul
  moneysack: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.32},${-s * 0.05} Q${-s * 0.42},${-s * 0.5} ${-s * 0.12},${-s * 0.62} L${s * 0.12},${-s * 0.62} Q${s * 0.42},${-s * 0.5} ${s * 0.32},${-s * 0.05} Z`} fill={shade(PALETTE.tan, -0.15)} s={s} />
      <rect x={-s * 0.14} y={-s * 0.7} width={s * 0.28} height={s * 0.08} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Ball cx={0} cy={-s * 0.3} rx={s * 0.13} fill={PALETTE.gold} s={s} />
    </g>
  ),
};

export default props;
