/**
 * The things "The basketball star who got rich off the court" is about, drawn for this video only:
 * an orange basketball, a gold-and-purple jersey on a hanger, a vault door stacked with gold (the
 * fortune), a paycheck, an owner's deed with a ribbon seal, an insurance office building with an
 * umbrella sign, a lit stadium bowl, a life-insurance policy, a hoop with a net and a trophy.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // an orange basketball with its seams, bouncing a little
  hoopball: ({ s, t }) => {
    const r = s * 0.42, y = -r - Math.abs(Math.sin(t * 3)) * s * 0.06;
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Ball cx={0} cy={y} rx={r} fill={PALETTE.orange} s={s} />
        <g transform={`rotate(${t * 40} 0 ${y})`} stroke={INK} strokeWidth={line(s) * 0.5} fill="none">
          <line x1={-r} y1={y} x2={r} y2={y} />
          <line x1={0} y1={y - r} x2={0} y2={y + r} />
          <path d={`M${-r * 0.7},${y - r * 0.7} Q${-r * 0.2},${y} ${-r * 0.7},${y + r * 0.7}`} />
          <path d={`M${r * 0.7},${y - r * 0.7} Q${r * 0.2},${y} ${r * 0.7},${y + r * 0.7}`} />
        </g>
      </g>
    );
  },
  // a gold jersey with purple trim on a hanger
  jersey: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.4) * 3} 0 ${-s})`}>
      <path d={`M0,${-s * 1.0} q${s * 0.06},${-s * 0.08} 0,${-s * 0.12}`} stroke={PALETTE.grey} strokeWidth={line(s) * 0.6} fill="none" />
      <line x1={-s * 0.3} y1={-s * 0.9} x2={s * 0.3} y2={-s * 0.9} stroke={PALETTE.grey} strokeWidth={line(s) * 0.7} />
      <Shape d={`M${-s * 0.18},${-s * 0.92} Q0,${-s * 0.78} ${s * 0.18},${-s * 0.92} L${s * 0.34},${-s * 0.86} L${s * 0.3},${-s * 0.6} L${s * 0.28},${-s * 0.06}
        L${-s * 0.28},${-s * 0.06} L${-s * 0.3},${-s * 0.6} L${-s * 0.34},${-s * 0.86} Z`} fill={PALETTE.yellow} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.92} Q0,${-s * 0.78} ${s * 0.18},${-s * 0.92}`} stroke={PALETTE.purple} strokeWidth={line(s) * 1.4} fill="none" />
      <rect x={-s * 0.28} y={-s * 0.14} width={s * 0.56} height={s * 0.06} fill={PALETTE.purple} />
      <Paint x={0} y={-s * 0.5} text="MAGIC" size={s * 0.12} fill={PALETTE.purple} />
    </g>
  ),
  // a round vault door swung open on stacked gold bars; k fills it
  fortunevault: ({ s, t, k = 1 }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.92} w={s * 1.1} h={s * 0.9} fill={PALETTE.grey} s={s} r={0.05} />
      <rect x={-s * 0.45} y={-s * 0.82} width={s * 0.9} height={s * 0.7} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
      {Array.from({ length: Math.max(1, Math.round(9 * k)) }, (_, i) => {
        const row = Math.floor(i / 3), col = i % 3;
        return <Shape key={i} d={`M${-s * 0.38 + col * s * 0.26},${-s * 0.14 - row * s * 0.14} l${s * 0.04},${-s * 0.1} h${s * 0.16} l${s * 0.04},${s * 0.1} Z`} fill={PALETTE.gold} s={s} />;
      })}
      <g transform={`translate(${s * 0.62},${-s * 0.48}) scale(0.35,1)`}>
        <circle r={s * 0.42} fill={shade(PALETTE.grey, 0.1)} stroke={INK} strokeWidth={line(s)} />
        <circle r={s * 0.12} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      </g>
      <circle cx={-s * 0.3} cy={-s * 0.95} r={s * 0.03 * (1 + 0.5 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a paycheck with a signature line
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.7)}) rotate(-5)`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.6} y={-s * 0.6} w={s * 1.2} h={s * 0.54} fill="#e8f6ec" s={s} r={0.04} />
      <rect x={-s * 0.6} y={-s * 0.6} width={s * 1.2} height={s * 0.12} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={-s * 0.3} y={-s * 0.5} text="PAY" size={s * 0.08} fill="#fff" />
      {[0, 1].map((i) => <line key={i} x1={-s * 0.5} x2={s * 0.1} y1={-s * (0.34 - i * 0.1)} y2={-s * (0.34 - i * 0.1)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />)}
      <rect x={s * 0.18} y={-s * 0.4} width={s * 0.32} height={s * 0.1} rx={s * 0.02} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${s * 0.14},${-s * 0.16} q${s * 0.06},${-s * 0.08} ${s * 0.12},0 t${s * 0.12},0 t${s * 0.12},0`} stroke={PALETTE.blue} strokeWidth={line(s) * 0.45} fill="none" />
    </g>
  ),
  // an owner's deed: a scroll with OWNER and a red ribbon seal
  ownerdeed: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.3)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.38} y={-s * 0.96} w={s * 0.76} h={s * 0.88} fill={PALETTE.cream} s={s} r={0.03} />
      <Ball cx={0} cy={-s * 0.98} rx={s * 0.42} ry={s * 0.05} fill={shade(PALETTE.tan, -0.05)} s={s} />
      <Ball cx={0} cy={-s * 0.08} rx={s * 0.42} ry={s * 0.05} fill={shade(PALETTE.tan, -0.05)} s={s} />
      <Paint x={0} y={-s * 0.76} text="OWNER" size={s * 0.12} fill={PALETTE.navy} />
      {[0, 1, 2].map((i) => <line key={i} x1={-s * 0.26} x2={s * 0.26} y1={-s * (0.6 - i * 0.09)} y2={-s * (0.6 - i * 0.09)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />)}
      <circle cx={s * 0.14} cy={-s * 0.26} r={s * 0.1} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Shape d={`M${s * 0.08},${-s * 0.18} l${-s * 0.04},${s * 0.14} l${s * 0.06},${-s * 0.04} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${s * 0.2},${-s * 0.18} l${s * 0.04},${s * 0.14} l${-s * 0.06},${-s * 0.04} Z`} fill={PALETTE.red} s={s} />
    </g>
  ),
  // an insurance office building with an umbrella sign on the roof
  insurehq: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.34} y={-s * 0.78} w={s * 0.68} h={s * 0.78} fill={shade(PALETTE.blue, 0.2)} s={s} r={0.02} />
      {Array.from({ length: 5 }, (_, i) => [0, 1, 2].map((j) => (
        <rect key={`${i}-${j}`} x={-s * 0.26 + j * s * 0.18} y={-s * 0.7 + i * s * 0.12} width={s * 0.12} height={s * 0.07} fill={PALETTE.yellow}
          opacity={0.55 + 0.45 * Math.abs(Math.sin(t + i * 2 + j))} />
      )))}
      <rect x={-s * 0.08} y={-s * 0.14} width={s * 0.16} height={s * 0.14} fill={PALETTE.dark} />
      <g transform={`translate(0,${-s * 0.86})`}>
        <Shape d={`M${-s * 0.24},0 Q0,${-s * 0.26} ${s * 0.24},0 Z`} fill={PALETTE.red} s={s} />
        <line x1={0} y1={0} x2={0} y2={s * 0.08} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
    </g>
  ),
  // a stadium bowl with tiers, floodlights and a green pitch
  stadium: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Shape d={`M${-s * 0.7},${-s * 0.1} L${-s * 0.62},${-s * 0.52} Q0,${-s * 0.68} ${s * 0.62},${-s * 0.52} L${s * 0.7},${-s * 0.1} Q0,${s * 0.04} ${-s * 0.7},${-s * 0.1} Z`} fill={PALETTE.grey} s={s} />
      <Ball cx={0} cy={-s * 0.38} rx={s * 0.48} ry={s * 0.1} fill={PALETTE.green} s={s} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-s * (0.6 - i * 0.02)},${-s * (0.2 + i * 0.1)} Q0,${-s * (0.3 + i * 0.1)} ${s * (0.6 - i * 0.02)},${-s * (0.2 + i * 0.1)}`}
        stroke={i % 2 ? PALETTE.purple : PALETTE.yellow} strokeWidth={line(s) * 0.8} fill="none" />)}
      {[-0.66, 0.66].map((x) => (
        <g key={x}>
          <line x1={x * s} y1={-s * 0.5} x2={x * s} y2={-s * 0.92} stroke={PALETTE.dark} strokeWidth={line(s) * 0.7} />
          <rect x={x * s - s * 0.08} y={-s * 1.0} width={s * 0.16} height={s * 0.08} fill="#fff8c8" stroke={INK} strokeWidth={line(s) * 0.4}
            opacity={0.7 + 0.3 * Math.sin(t * 4 + x)} />
        </g>
      ))}
    </g>
  ),
  // a life-insurance policy with a heart seal
  lifepolicy: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.9)}) rotate(4)`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 0.9} w={s * 0.64} h={s * 0.84} fill="#fff" s={s} r={0.03} />
      <rect x={-s * 0.32} y={-s * 0.9} width={s * 0.64} height={s * 0.14} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={-s * 0.8} text="POLICY" size={s * 0.08} fill="#fff" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-s * 0.22} x2={s * 0.22} y1={-s * (0.62 - i * 0.09)} y2={-s * (0.62 - i * 0.09)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />)}
      <path d={`M0,${-s * 0.14} C${-s * 0.16},${-s * 0.24} ${-s * 0.1},${-s * 0.36} 0,${-s * 0.28} C${s * 0.1},${-s * 0.36} ${s * 0.16},${-s * 0.24} 0,${-s * 0.14} Z`}
        fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a basketball hoop: backboard, orange rim and a swaying net
  hoop: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.04} y={-s * 1.0} width={s * 0.08} height={s * 1.0} fill={PALETTE.dark} />
      <Box x={-s * 0.36} y={-s * 1.22} w={s * 0.72} h={s * 0.42} fill="#fff" s={s} r={0.03} />
      <rect x={-s * 0.14} y={-s * 1.08} width={s * 0.28} height={s * 0.2} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.6} />
      <ellipse cx={0} cy={-s * 0.86} rx={s * 0.2} ry={s * 0.04} fill="none" stroke={PALETTE.orange} strokeWidth={line(s) * 0.9} />
      {[-0.16, -0.08, 0, 0.08, 0.16].map((x) => (
        <line key={x} x1={x * s} y1={-s * 0.86} x2={x * s * 0.6 + Math.sin(t * 3 + x * 10) * s * 0.01} y2={-s * 0.68} stroke="#fff" strokeWidth={line(s) * 0.35} />
      ))}
    </g>
  ),
  // a gold trophy cup
  trophy: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.2)})`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.2} y={-s * 0.12} w={s * 0.4} h={s * 0.1} fill={PALETTE.brown} s={s} r={0.1} />
      <rect x={-s * 0.04} y={-s * 0.34} width={s * 0.08} height={s * 0.22} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Shape d={`M${-s * 0.26},${-s * 0.86} L${s * 0.26},${-s * 0.86} Q${s * 0.24},${-s * 0.4} 0,${-s * 0.34} Q${-s * 0.24},${-s * 0.4} ${-s * 0.26},${-s * 0.86} Z`} fill={PALETTE.gold} s={s} />
      <path d={`M${-s * 0.26},${-s * 0.78} q${-s * 0.16},${s * 0.04} ${-s * 0.02},${s * 0.2} M${s * 0.26},${-s * 0.78} q${s * 0.16},${s * 0.04} ${s * 0.02},${s * 0.2}`} stroke={PALETTE.gold} strokeWidth={line(s) * 0.8} fill="none" />
    </g>
  ),
};

export default props;
