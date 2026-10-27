/**
 * The things "A billionaire's payday: one dollar" is about, drawn for this video only: the salary
 * cheque, the tax collector's sack, a share certificate, the rising share chart, the company
 * tower, an hourglass for the years, the padlock of shares never sold, a yacht, a gold crown and
 * a big single dollar bill.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a long salary cheque with a signature line and a gold seal, flapping slightly
  cheque: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.35 + bob(t, s, 2, 0.02)}) rotate(${-5 + Math.sin(t * 1.7) * 2})`}>
      <Box x={-s * 0.7} y={-s * 0.32} w={s * 1.4} h={s * 0.64} fill="#e9f6ec" s={s} r={0.06} />
      <rect x={-s * 0.7} y={-s * 0.32} width={s * 1.4} height={s * 0.12} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s)} />
      <Paint x={-s * 0.32} y={-s * 0.02} text="SALARY" size={s * 0.13} />
      <line x1={-s * 0.55} y1={s * 0.18} x2={s * 0.2} y2={s * 0.18} stroke={PALETTE.grey} strokeWidth={line(s)} />
      <path d={`M${-s * 0.5},${s * 0.15} q${s * 0.08},${-s * 0.1} ${s * 0.14},0 t${s * 0.14},0 t${s * 0.14},0`} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.8} />
      <Ball cx={s * 0.48} cy={s * 0.06} rx={s * 0.13} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // the tax collector's sack, bulging; k (0..1) is how full it is
  taxbag: ({ s, t, k = 0.4 }) => {
    const w = s * (0.45 + 0.25 * k);
    return (
      <g transform={`rotate(${Math.sin(t * 2.4) * 3})`}>
        <Shadow w={w * 1.6} s={s} />
        <Shape d={`M${-w},0 Q${-w * 1.2},${-s * 0.55} ${-s * 0.12},${-s * 0.8} L${s * 0.12},${-s * 0.8} Q${w * 1.2},${-s * 0.55} ${w},0 Z`} fill={PALETTE.grey} s={s} />
        <rect x={-s * 0.16} y={-s * 0.86} width={s * 0.32} height={s * 0.08} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Paint x={0} y={-s * 0.3} text="TAX" size={s * 0.2} fill={PALETTE.red} />
      </g>
    );
  },
  // a share certificate: ornate border, a seal and a ribbon
  certificate: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.3)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.42} y={-s} w={s * 0.84} h={s} fill={PALETTE.cream} s={s} r={0.03} />
      <rect x={-s * 0.36} y={-s * 0.94} width={s * 0.72} height={s * 0.88} fill="none" stroke={PALETTE.gold} strokeWidth={line(s) * 1.2} strokeDasharray={`${s * 0.05} ${s * 0.02}`} />
      <Paint x={0} y={-s * 0.74} text="SHARES" size={s * 0.13} fill={PALETTE.navy} />
      {[0.55, 0.47, 0.39].map((y) => <line key={y} x1={-s * 0.24} y1={-s * y} x2={s * 0.24} y2={-s * y} stroke={PALETTE.grey} strokeWidth={line(s) * 0.7} />)}
      <Ball cx={s * 0.16} cy={-s * 0.2} rx={s * 0.1} fill={PALETTE.red} s={s} />
      <Shape d={`M${s * 0.1},${-s * 0.12} l${-s * 0.04},${s * 0.16} l${s * 0.06},${-s * 0.04} l${s * 0.04},${s * 0.05} l${s * 0.02},${-s * 0.17} Z`} fill={PALETTE.red} s={s * 0.5} />
    </g>
  ),
  // a share chart on an easel: k (0..1) is how far the green line has climbed
  chart: ({ s, t, k = 0.5 }) => {
    const n = 8, pts = Array.from({ length: n }, (_, i) => {
      const f = i / (n - 1);
      return [-s * 0.38 + f * s * 0.76, -s * 0.25 - Math.pow(f, 1.5) * s * 0.55 * k - Math.sin(i * 1.7 + t) * s * 0.02] as const;
    });
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <line x1={-s * 0.3} y1={0} x2={-s * 0.2} y2={-s * 0.2} stroke={PALETTE.brown} strokeWidth={line(s) * 1.5} />
        <line x1={s * 0.3} y1={0} x2={s * 0.2} y2={-s * 0.2} stroke={PALETTE.brown} strokeWidth={line(s) * 1.5} />
        <Box x={-s * 0.45} y={-s * 0.95} w={s * 0.9} h={s * 0.78} fill="#fff" s={s} r={0.04} />
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 2} strokeLinejoin="round" />
        <circle cx={pts[n - 1]![0]} cy={pts[n - 1]![1]} r={s * 0.04} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
    );
  },
  // the company tower: a glass skyscraper with a blinking roof light
  tower: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      <Box x={-s * 0.2} y={-s} w={s * 0.4} h={s} fill={PALETTE.navy} s={s} r={0.02} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-s * 0.15} y={-s * 0.94 + i * s * 0.09} width={s * 0.3} height={s * 0.05} fill={(i + Math.floor(t * 2)) % 4 ? "#7fb2ff" : PALETTE.yellow} opacity={0.85} />)}
      <line x1={0} y1={-s} x2={0} y2={-s * 1.12} stroke={INK} strokeWidth={line(s)} />
      <circle cx={0} cy={-s * 1.13} r={s * 0.025} fill={Math.floor(t * 2) % 2 ? PALETTE.red : "#5a1010"} />
    </g>
  ),
  // an hourglass, its sand running and the glass turning slowly
  hourglass: ({ s, t }) => {
    const f = (t * 0.25) % 1;
    return (
      <g transform={`translate(0,${-s * 0.5}) rotate(${Math.sin(t * 0.8) * 6})`}>
        <rect x={-s * 0.3} y={-s * 0.5} width={s * 0.6} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.3} y={s * 0.44} width={s * 0.6} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Shape d={`M${-s * 0.24},${-s * 0.44} L${s * 0.24},${-s * 0.44} L${s * 0.03},0 L${s * 0.24},${s * 0.44} L${-s * 0.24},${s * 0.44} L${-s * 0.03},0 Z`} fill="#dff1ff" s={s} opacity={0.9} />
        <path d={`M${-s * 0.2 * (1 - f)},${-s * 0.4 + s * 0.3 * f} L${s * 0.2 * (1 - f)},${-s * 0.4 + s * 0.3 * f} L0,${-s * 0.04} Z`} fill={PALETTE.gold} />
        <path d={`M${-s * 0.2 * f},${s * 0.42} L${s * 0.2 * f},${s * 0.42} L0,${s * 0.42 - s * 0.3 * f} Z`} fill={PALETTE.gold} />
        <line x1={0} y1={0} x2={0} y2={s * 0.4} stroke={PALETTE.gold} strokeWidth={line(s) * 0.5} />
      </g>
    );
  },
  // a gold padlock: the shares stay locked, never sold; state "open" lifts the shackle
  padlock: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.5} L${-s * 0.18},${-s * (state === "open" ? 0.85 : 0.72)} A${s * 0.18},${s * 0.18} 0 0 1 ${s * 0.18},${-s * (state === "open" ? 0.85 : 0.72)} L${s * 0.18},${-s * 0.5}`} fill="none" stroke={PALETTE.grey} strokeWidth={s * 0.07} />
      <Box x={-s * 0.3} y={-s * 0.55} w={s * 0.6} h={s * 0.55} fill={PALETTE.gold} s={s} r={0.12} />
      <circle cx={0} cy={-s * 0.32} r={s * 0.06} fill={INK} />
      <rect x={-s * 0.02} y={-s * 0.3} width={s * 0.04} height={s * 0.14} fill={INK} />
    </g>
  ),
  // a white yacht bobbing on a strip of sea
  yacht: ({ s, t }) => (
    <g transform={`translate(0,${Math.sin(t * 1.5) * s * 0.02}) rotate(${Math.sin(t * 1.2) * 2})`}>
      <path d={`M${-s * 0.9},${-s * 0.02} q${s * 0.15},${-s * 0.06} ${s * 0.3},0 t${s * 0.3},0 t${s * 0.3},0 t${s * 0.3},0 t${s * 0.3},0 t${s * 0.3},0`} fill="none" stroke="#7fc3ff" strokeWidth={line(s)} />
      <Shape d={`M${-s * 0.75},${-s * 0.3} L${s * 0.8},${-s * 0.3} L${s * 0.55},${-s * 0.04} L${-s * 0.6},${-s * 0.04} Z`} fill="#fff" s={s} />
      <Shape d={`M${-s * 0.45},${-s * 0.3} L${-s * 0.35},${-s * 0.5} L${s * 0.35},${-s * 0.5} L${s * 0.5},${-s * 0.3} Z`} fill="#f4f7fb" s={s} />
      <Shape d={`M${-s * 0.2},${-s * 0.5} L${-s * 0.12},${-s * 0.66} L${s * 0.2},${-s * 0.66} L${s * 0.28},${-s * 0.5} Z`} fill="#e6ecf4" s={s} />
      {[-0.25, -0.05, 0.15].map((x) => <rect key={x} x={s * x} y={-s * 0.45} width={s * 0.12} height={s * 0.07} rx={s * 0.02} fill={PALETTE.navy} />)}
    </g>
  ),
  // a gold crown with jewels, glinting
  crown: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.03)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.42},0 L${-s * 0.48},${-s * 0.6} L${-s * 0.22},${-s * 0.35} L0,${-s * 0.75} L${s * 0.22},${-s * 0.35} L${s * 0.48},${-s * 0.6} L${s * 0.42},0 Z`} fill={PALETTE.gold} s={s} />
      {[-0.22, 0, 0.22].map((x, i) => <circle key={x} cx={s * x} cy={-s * 0.16} r={s * 0.06} fill={[PALETTE.red, PALETTE.blue, PALETTE.green][i]} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <circle cx={s * 0.3} cy={-s * 0.55} r={s * 0.03 * (1 + Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // one big dollar bill, a little crumpled, swaying as it floats
  dollar: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.3 + bob(t, s, 1.8, 0.04)}) rotate(${-8 + Math.sin(t * 1.6) * 6})`}>
      <Box x={-s * 0.6} y={-s * 0.27} w={s * 1.2} h={s * 0.54} fill={shade(PALETTE.green, 0.35)} s={s} r={0.04} sheen={false} />
      <rect x={-s * 0.52} y={-s * 0.2} width={s * 1.04} height={s * 0.4} fill="none" stroke={shade(PALETTE.green, -0.3)} strokeWidth={line(s) * 0.6} />
      <ellipse cx={0} cy={0} rx={s * 0.14} ry={s * 0.17} fill={shade(PALETTE.green, 0.1)} stroke={shade(PALETTE.green, -0.3)} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={s * 0.07} text="$" size={s * 0.2} fill={shade(PALETTE.green, -0.4)} />
    </g>
  ),
};

export default props;
