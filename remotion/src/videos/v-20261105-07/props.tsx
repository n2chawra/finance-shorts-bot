/**
 * The things "Spend a million a day. A billionaire still gets richer" is about, drawn for this
 * video only: a stack of share certificates, a business campus of glass towers, a luxury shopping
 * bag, a sports car, a private jet, a money pile that grows (k 0..1 is its height), a vine of money
 * that climbs (k 0..1), a long shopping receipt, a dollar-sign crown and a cash-filled armoured truck.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a fanned stack of share certificates with gold seals
  sharestack: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.3)})`}>
      <Shadow w={s * 0.9} s={s} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${(i - 1.5) * s * 0.05},${-i * s * 0.12}) rotate(${(i - 1.5) * 4})`}>
          <Box x={-s * 0.42} y={-s * 0.36} w={s * 0.84} h={s * 0.34} fill={PALETTE.cream} s={s} r={0.03} />
          <rect x={-s * 0.37} y={-s * 0.32} width={s * 0.74} height={s * 0.26} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.5} strokeDasharray={`${s * 0.025} ${s * 0.015}`} />
          <circle cx={s * 0.26} cy={-s * 0.19} r={s * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
        </g>
      ))}
      <Paint x={-s * 0.06} y={-s * 0.5} text="SHARES" size={s * 0.09} fill={PALETTE.green} />
    </g>
  ),
  // a business campus: three glass towers with lit windows and a flag
  bizcampus: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      {[[-0.38, 0.6, PALETTE.blue], [0, 0.95, PALETTE.teal], [0.36, 0.72, PALETTE.navy]].map(([x, hh, c], i) => (
        <g key={i}>
          <Box x={(x as number) * s - s * 0.16} y={-(hh as number) * s} w={s * 0.32} h={(hh as number) * s} fill={c as string} s={s} r={0.02} sheen />
          {Array.from({ length: Math.floor((hh as number) * 8) }, (_, j) => (
            <rect key={j} x={(x as number) * s - s * 0.11} y={-(hh as number) * s + s * 0.06 + j * s * 0.11} width={s * 0.22} height={s * 0.05}
              fill={PALETTE.yellow} opacity={0.35 + 0.35 * Math.abs(Math.sin(t * 1.5 + i + j))} />
          ))}
        </g>
      ))}
      <line x1={0} y1={-s * 0.95} x2={0} y2={-s * 1.12} stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M0,${-s * 1.12} l${s * 0.14},${s * 0.04 + Math.sin(t * 4) * s * 0.01} l${-s * 0.14},${s * 0.04}`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.3} />
    </g>
  ),
  // a glossy luxury shopping bag with rope handles and a bow
  shopbag: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(${Math.sin(t * 1.8) * 2})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.16},${-s * 0.62} Q0,${-s * 0.95} ${s * 0.16},${-s * 0.62}`} stroke={PALETTE.gold} strokeWidth={line(s) * 1.2} fill="none" />
      <Shape d={`M${-s * 0.34},${-s * 0.62} L${s * 0.34},${-s * 0.62} L${s * 0.4},0 L${-s * 0.4},0 Z`} fill={PALETTE.pink} s={s} />
      <rect x={-s * 0.37} y={-s * 0.62} width={s * 0.74} height={s * 0.1} fill={shade(PALETTE.pink, -0.15)} />
      <Ball cx={0} cy={-s * 0.42} rx={s * 0.08} ry={s * 0.05} fill={PALETTE.gold} s={s} />
      <Paint x={0} y={-s * 0.2} text="LUXE" size={s * 0.11} fill="#fff" />
    </g>
  ),
  // a low red sports car with spinning wheels
  sportscar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.5} s={s} />
      <Shape d={`M${-s * 0.75},${-s * 0.12} L${-s * 0.7},${-s * 0.3} L${-s * 0.25},${-s * 0.36} L${-s * 0.05},${-s * 0.52} L${s * 0.35},${-s * 0.5} L${s * 0.6},${-s * 0.32} L${s * 0.75},${-s * 0.26} L${s * 0.76},${-s * 0.12} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${-s * 0.02},${-s * 0.46} L${s * 0.32},${-s * 0.45} L${s * 0.48},${-s * 0.33} L${-s * 0.18},${-s * 0.34} Z`} fill="#9fd8ff" s={s} />
      {[-0.45, 0.45].map((x) => (
        <g key={x} transform={`translate(${x * s},${-s * 0.12}) rotate(${t * 400})`}>
          <circle r={s * 0.13} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
          <line x1={-s * 0.08} x2={s * 0.08} y1={0} y2={0} stroke={PALETTE.grey} strokeWidth={line(s) * 0.6} />
        </g>
      ))}
      <rect x={s * 0.66} y={-s * 0.26} width={s * 0.08} height={s * 0.04} fill={PALETTE.yellow} />
    </g>
  ),
  // a white private jet with a gold stripe
  privatejet: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.2, 0.03)}) rotate(-6)`}>
      <Shadow w={s * 1.3} s={s} />
      <Shape d={`M${-s * 0.8},${-s * 0.42} Q${-s * 0.2},${-s * 0.62} ${s * 0.7},${-s * 0.48} Q${s * 0.86},${-s * 0.42} ${s * 0.7},${-s * 0.36} L${-s * 0.7},${-s * 0.32} Z`} fill="#f4f6fb" s={s} />
      <Shape d={`M${-s * 0.1},${-s * 0.4} L${-s * 0.4},${-s * 0.12} L${-s * 0.24},${-s * 0.12} L${s * 0.16},${-s * 0.38} Z`} fill={PALETTE.grey} s={s} />
      <Shape d={`M${-s * 0.66},${-s * 0.44} L${-s * 0.8},${-s * 0.74} L${-s * 0.66},${-s * 0.74} L${-s * 0.5},${-s * 0.46} Z`} fill={PALETTE.gold} s={s} />
      <rect x={-s * 0.6} y={-s * 0.42} width={s * 1.2} height={s * 0.03} fill={PALETTE.gold} />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-s * 0.3 + i * s * 0.18} cy={-s * 0.48} r={s * 0.025} fill="#7fb7ff" />)}
    </g>
  ),
  // a pile of cash bundles; k 0..1 is how tall it stands
  megapile: ({ s, t, k = 0.6 }) => {
    const rows = Math.max(2, Math.round(3 + 7 * k));
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        {Array.from({ length: rows }, (_, i) => {
          const wdt = s * (0.9 - i * 0.05);
          return <Box key={i} x={-wdt / 2 + ((i * 7) % 3 - 1) * s * 0.01} y={-(i + 1) * s * 0.09} w={wdt} h={s * 0.09} fill={i % 2 ? "#8fd19e" : "#6cbf84"} s={s} r={0.08} />;
        })}
        <circle cx={s * 0.2} cy={-rows * s * 0.09 - s * 0.03} r={s * 0.03 * (1 + 0.5 * Math.sin(t * 5))} fill="#fff" />
      </g>
    );
  },
  // a vine with leaves and banknotes; k 0..1 is how far it has climbed
  moneyvine: ({ s, t, k = 0.5 }) => {
    const hh = s * (0.3 + 0.7 * k);
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <Box x={-s * 0.2} y={-s * 0.16} w={s * 0.4} h={s * 0.16} fill={PALETTE.brown} s={s} r={0.1} />
        <path d={`M0,${-s * 0.16} C${s * 0.2},${-hh * 0.4} ${-s * 0.2},${-hh * 0.7} 0,${-hh}`} stroke={PALETTE.green} strokeWidth={line(s) * 1.6} fill="none" />
        {Array.from({ length: Math.max(1, Math.round(5 * k)) }, (_, i) => {
          const y = -s * 0.25 - i * (hh - s * 0.25) / 5, x = (i % 2 ? 1 : -1) * s * 0.14;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${(i % 2 ? 20 : -20) + Math.sin(t * 2 + i) * 6})`}>
              {i % 2 ? <rect x={-s * 0.08} y={-s * 0.04} width={s * 0.16} height={s * 0.08} rx={s * 0.01} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3} />
                : <Ball cx={0} cy={0} rx={s * 0.08} ry={s * 0.045} fill={shade(PALETTE.green, 0.2)} s={s} />}
            </g>
          );
        })}
      </g>
    );
  },
  // a long curling shopping receipt with item lines
  longreceipt: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.4) * 3})`}>
      <Shadow w={s * 0.6} s={s} />
      <Shape d={`M${-s * 0.24},0 L${-s * 0.24},${-s * 0.92} L${s * 0.24},${-s * 0.92} L${s * 0.24},${-s * 0.1} Q${s * 0.32},${-s * 0.02} ${s * 0.2},0 Z`} fill="#fff" s={s} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={-s * 0.18} y={-s * 0.84 + i * s * 0.08} width={s * 0.2} height={s * 0.025} fill={PALETTE.grey} />
          <rect x={s * 0.08} y={-s * 0.84 + i * s * 0.08} width={s * 0.1} height={s * 0.025} fill={PALETTE.dark} />
        </g>
      ))}
    </g>
  ),
  // a gold crown with a dollar sign
  dollarcrown: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.4, 0.03)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.4},0 L${-s * 0.44},${-s * 0.5} L${-s * 0.2},${-s * 0.3} L0,${-s * 0.62} L${s * 0.2},${-s * 0.3} L${s * 0.44},${-s * 0.5} L${s * 0.4},0 Z`} fill={PALETTE.gold} s={s} />
      {[-0.44, 0, 0.44].map((x, i) => <circle key={x} cx={x * s} cy={-s * (i === 1 ? 0.66 : 0.54)} r={s * 0.05} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.3} />)}
      <Paint x={0} y={-s * 0.1} text="$" size={s * 0.22} fill={INK} />
    </g>
  ),
  // an armoured cash truck, back doors open on bundles of notes
  cashtruck: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.5} s={s} />
      <Box x={-s * 0.75} y={-s * 0.6} w={s * 1.0} h={s * 0.48} fill={PALETTE.grey} s={s} r={0.04} />
      <Box x={s * 0.25} y={-s * 0.46} w={s * 0.42} h={s * 0.34} fill={shade(PALETTE.grey, -0.15)} s={s} r={0.08} />
      <rect x={s * 0.32} y={-s * 0.42} width={s * 0.22} height={s * 0.12} fill="#9fd8ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.7} y={-s * (0.24 + i * 0.1)} width={s * 0.22} height={s * 0.08} rx={s * 0.01} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3} />)}
      <Paint x={-s * 0.2} y={-s * 0.3} text="CASH" size={s * 0.12} fill={INK} />
      {[-0.5, 0.42].map((x) => <circle key={x} cx={x * s} cy={-s * 0.1} r={s * 0.11} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <circle cx={s * 0.62} cy={-s * 0.2} r={s * 0.025} fill={PALETTE.yellow} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
    </g>
  ),
};

export default props;
