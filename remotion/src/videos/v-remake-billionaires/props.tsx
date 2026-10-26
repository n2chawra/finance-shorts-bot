/**
 * The things "Why billionaires never sell their stock" is about, drawn for this video only:
 * share certificates, the tax man's bucket, the bank, the loan, the padlock on the shares, the
 * yacht the loan buys, the growth chart, the margin-call alarm, the hourglass, an empty wallet.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a fanned pile of share certificates with a gold seal
  shares: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.9} s={s} />
      {[-1, 0, 1].map((i) => (
        <g key={i} transform={`translate(${i * s * 0.08},${-s * 0.06}) rotate(${i * 7})`}>
          <Box x={-s * 0.42} y={-s * 0.95} w={s * 0.84} h={s * 0.62} fill={i === 0 ? PALETTE.cream : shade(PALETTE.cream, -0.06)} s={s} r={0.05} sheen={false} />
          {i === 0 && <>
            <rect x={-s * 0.36} y={-s * 0.89} width={s * 0.72} height={s * 0.5} rx={s * 0.02} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.8} />
            <Paint x={0} y={-s * 0.74} text="SHARES" size={s * 0.11} fill={PALETTE.green} />
            <rect x={-s * 0.26} y={-s * 0.66} width={s * 0.52} height={s * 0.035} rx={s * 0.017} fill={PALETTE.grey} opacity={0.6} />
            <rect x={-s * 0.26} y={-s * 0.59} width={s * 0.36} height={s * 0.035} rx={s * 0.017} fill={PALETTE.grey} opacity={0.6} />
            <Ball cx={s * 0.24} cy={-s * 0.47} rx={s * 0.08} fill={PALETTE.gold} s={s} />
          </>}
        </g>
      ))}
    </g>
  ),
  // the tax man's bucket: a big open sack with TAX on it that swallows what falls in
  taxman: ({ s, t, state }) => {
    const gulp = state === "full" ? 1.08 : 1 + Math.sin(t * 5) * 0.015;
    return (
      <g transform={`scale(${gulp}) translate(0,0)`}>
        <Shadow w={s * 0.9} s={s} />
        <Shape d={`M${-s * 0.42},${-s * 0.72} Q${-s * 0.5},${-s * 0.05} ${-s * 0.3},0 L${s * 0.3},0 Q${s * 0.5},${-s * 0.05} ${s * 0.42},${-s * 0.72} Z`} fill={PALETTE.red} s={s} />
        <ellipse cx={0} cy={-s * 0.72} rx={s * 0.42} ry={s * 0.1} fill={shade(PALETTE.red, -0.45)} stroke={INK} strokeWidth={line(s)} />
        <Paint x={0} y={-s * 0.28} text="TAX" size={s * 0.24} fill="#fff" />
      </g>
    );
  },
  // a bank: columns, a pediment, steps
  bank: ({ s }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.62} y={-s * 0.12} w={s * 1.24} h={s * 0.12} fill={PALETTE.grey} s={s} r={0.1} />
      {[-0.42, -0.14, 0.14, 0.42].map((x) => <Box key={x} x={s * x - s * 0.07} y={-s * 0.68} w={s * 0.14} h={s * 0.56} fill={PALETTE.white} s={s} r={0.2} />)}
      <Box x={-s * 0.6} y={-s * 0.78} w={s * 1.2} h={s * 0.12} fill={PALETTE.cream} s={s} r={0.1} />
      <Shape d={`M${-s * 0.66},${-s * 0.78} L0,${-s * 1.08} L${s * 0.66},${-s * 0.78} Z`} fill={PALETTE.cream} s={s} />
      <Paint x={0} y={-s * 0.86} text="BANK" size={s * 0.11} />
    </g>
  ),
  // the loan: a contract with a signature line and a red stamp once signed
  loan: ({ s, state, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.02)}) rotate(-6)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.32} y={-s * 0.98} w={s * 0.64} h={s * 0.86} fill={PALETTE.white} s={s} r={0.04} sheen={false} />
      <Paint x={0} y={-s * 0.82} text="LOAN" size={s * 0.13} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.22} y={-s * (0.7 - i * 0.09)} width={s * (0.44 - (i % 2) * 0.12)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.55} />)}
      <path d={`M${-s * 0.2},${-s * 0.24} q${s * 0.06},${-s * 0.08} ${s * 0.12},0 t${s * 0.12},0`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" strokeLinecap="round" />
      {state === "signed" && <g transform={`translate(${s * 0.14},${-s * 0.3}) rotate(-14)`}>
        <rect x={-s * 0.16} y={-s * 0.07} width={s * 0.32} height={s * 0.14} rx={s * 0.03} fill="none" stroke={PALETTE.red} strokeWidth={line(s)} />
        <Paint x={0} y={s * 0.04} text="OK" size={s * 0.1} fill={PALETTE.red} />
      </g>}
    </g>
  ),
  // a padlock: the shares promised to the bank
  padlock: ({ s, state }) => (
    <g>
      <path d={`M${-s * 0.2},${-s * 0.5} v${-s * 0.16} a${s * 0.2},${s * 0.2} 0 0 1 ${s * 0.4},0 v${state === "open" ? -s * 0.1 : s * 0.16}`} fill="none" stroke={INK} strokeWidth={s * 0.09} strokeLinecap="round" />
      <path d={`M${-s * 0.2},${-s * 0.5} v${-s * 0.16} a${s * 0.2},${s * 0.2} 0 0 1 ${s * 0.4},0 v${state === "open" ? -s * 0.1 : s * 0.16}`} fill="none" stroke={PALETTE.grey} strokeWidth={s * 0.05} strokeLinecap="round" />
      <Box x={-s * 0.3} y={-s * 0.52} w={s * 0.6} h={s * 0.48} fill={PALETTE.gold} s={s} r={0.15} />
      <circle cx={0} cy={-s * 0.3} r={s * 0.06} fill={INK} />
      <rect x={-s * 0.02} y={-s * 0.3} width={s * 0.04} height={s * 0.12} fill={INK} />
    </g>
  ),
  // the yacht the borrowed million buys
  yacht: ({ s, t }) => (
    <g transform={`translate(0,${Math.sin(t * 2) * s * 0.02}) rotate(${Math.sin(t * 1.6) * 2})`}>
      <Shape d={`M${-s * 0.7},${-s * 0.22} L${s * 0.78},${-s * 0.22} L${s * 0.5},0 L${-s * 0.55},0 Z`} fill={PALETTE.white} s={s} />
      <rect x={-s * 0.62} y={-s * 0.14} width={s * 1.26} height={s * 0.05} fill={PALETTE.navy} />
      <Box x={-s * 0.36} y={-s * 0.46} w={s * 0.7} h={s * 0.24} fill={PALETTE.white} s={s} r={0.25} />
      {[-0.24, -0.06, 0.12].map((x) => <rect key={x} x={s * x} y={-s * 0.4} width={s * 0.12} height={s * 0.08} rx={s * 0.02} fill={PALETTE.teal} />)}
      <line x1={s * 0.05} y1={-s * 0.46} x2={s * 0.05} y2={-s * 0.95} stroke={INK} strokeWidth={line(s)} />
      <Shape d={`M${s * 0.08},${-s * 0.92} L${s * 0.4},${-s * 0.52} L${s * 0.08},${-s * 0.52} Z`} fill={PALETTE.cream} s={s} />
    </g>
  ),
  // a growth chart on a board: k (0..1) is how far the line has climbed; state "crash" plunges it
  chart: ({ s, k = 1, state }) => {
    const pts = [0.1, 0.18, 0.15, 0.3, 0.38, 0.5, 0.6, 0.72, 0.9];
    const crash = state === "crash";
    const ys = pts.map((y, i) => (crash && i > 5 ? Math.max(0.05, y - (i - 5) * 0.32) : y));
    const n = Math.max(2, Math.round(2 + (pts.length - 2) * Math.min(1, k)));
    const d = ys.slice(0, n).map((y, i) => `${i ? "L" : "M"}${-s * 0.5 + i * (s / (pts.length - 1))},${-s * 0.12 - y * s * 0.75}`).join(" ");
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        <Box x={-s * 0.6} y={-s * 1.0} w={s * 1.2} h={s * 0.96} fill={PALETTE.navy} s={s} r={0.05} sheen={false} />
        {[0.25, 0.5, 0.75].map((y) => <line key={y} x1={-s * 0.52} x2={s * 0.52} y1={-s * 0.12 - y * s * 0.75} y2={-s * 0.12 - y * s * 0.75} stroke="#fff" opacity={0.12} strokeWidth={2} />)}
        <path d={d} fill="none" stroke={crash ? PALETTE.red : PALETTE.mint} strokeWidth={s * 0.05} strokeLinejoin="round" strokeLinecap="round" />
      </g>
    );
  },
  // the margin-call alarm: a red siren that spins its light
  alarm: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.32} y={-s * 0.16} w={s * 0.64} h={s * 0.16} fill={PALETTE.dark} s={s} r={0.2} />
      <Shape d={`M${-s * 0.24},${-s * 0.16} L${-s * 0.24},${-s * 0.5} A${s * 0.24},${s * 0.24} 0 0 1 ${s * 0.24},${-s * 0.5} L${s * 0.24},${-s * 0.16} Z`} fill={PALETTE.red} s={s} />
      {[0, 1].map((i) => {
        const a = t * 9 + i * Math.PI;
        return <path key={i} d={`M0,${-s * 0.5} L${Math.cos(a) * s * 0.9},${-s * 0.5 + Math.sin(a) * s * 0.35} L${Math.cos(a + 0.4) * s * 0.9},${-s * 0.5 + Math.sin(a + 0.4) * s * 0.35} Z`} fill={PALETTE.yellow} opacity={0.35} />;
      })}
    </g>
  ),
  // an hourglass: k is how much sand has fallen
  hourglass: ({ s, k = 0.5, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.2) * 3})`}>
      <Shadow w={s * 0.5} s={s} />
      <rect x={-s * 0.26} y={-s * 0.06} width={s * 0.52} height={s * 0.06} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.26} y={-s * 1.0} width={s * 0.52} height={s * 0.06} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s)} />
      <Shape d={`M${-s * 0.2},${-s * 0.94} L${s * 0.2},${-s * 0.94} L${s * 0.03},${-s * 0.53} L${s * 0.2},${-s * 0.06} L${-s * 0.2},${-s * 0.06} L${-s * 0.03},${-s * 0.53} Z`} fill="#dff3ff" s={s} opacity={0.9} />
      <path d={`M${-s * 0.16 * (1 - k)},${-s * 0.9 + s * 0.3 * k} L${s * 0.16 * (1 - k)},${-s * 0.9 + s * 0.3 * k} L0,${-s * 0.55} Z`} fill={PALETTE.gold} />
      <path d={`M${-s * 0.18},${-s * 0.08} L${s * 0.18},${-s * 0.08} L0,${-s * 0.08 - s * 0.36 * k} Z`} fill={PALETTE.gold} />
    </g>
  ),
  // an empty wallet, turned out
  wallet: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 3) * 4})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.42} y={-s * 0.58} w={s * 0.84} h={s * 0.52} fill={PALETTE.brown} s={s} r={0.12} />
      <Box x={-s * 0.18} y={-s * 0.2} w={s * 0.36} h={s * 0.22} fill={PALETTE.cream} s={s} r={0.2} sheen={false} />
      <circle cx={s * 0.28} cy={-s * 0.36} r={s * 0.05} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // three steps up: the trick's levels, the top one gold
  stairs: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      {[0, 1, 2].map((i) => (
        <Box key={i} x={-s * 0.55 + i * s * 0.37} y={-s * (0.3 + i * 0.3)} w={s * 0.37} h={s * (0.3 + i * 0.3)} fill={i === 2 ? PALETTE.gold : PALETTE.blue} s={s} r={0.06} />
      ))}
      {[0, 1, 2].map((i) => <Paint key={i} x={-s * 0.365 + i * s * 0.37} y={-s * (0.13 + i * 0.3)} text={["I", "II", "III"][i]!} size={s * 0.12} fill="#fff" />)}
      <g transform={`translate(${s * 0.36},${-s * 1.0 + Math.sin(t * 3) * s * 0.03})`}><Ball cx={0} cy={0} rx={s * 0.07} fill={PALETTE.yellow} s={s} /></g>
    </g>
  ),
  // the mansion on the horizon
  mansion: ({ s }) => (
    <g>
      <Box x={-s * 0.6} y={-s * 0.55} w={s * 1.2} h={s * 0.55} fill={PALETTE.cream} s={s} r={0.03} />
      <Shape d={`M${-s * 0.68},${-s * 0.55} L0,${-s * 0.9} L${s * 0.68},${-s * 0.55} Z`} fill={PALETTE.red} s={s} />
      {[-0.4, -0.15, 0.15, 0.4].map((x) => <rect key={x} x={s * x - s * 0.06} y={-s * 0.42} width={s * 0.12} height={s * 0.14} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.6} />)}
      <rect x={-s * 0.08} y={-s * 0.22} width={s * 0.16} height={s * 0.22} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
};

export default props;
