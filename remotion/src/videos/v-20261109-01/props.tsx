/**
 * The things "Your bank pays you almost nothing" is about, drawn for this video only: a savings
 * passbook, a marble bank hall with columns and a BANK pediment ("lit" lights its windows), a tiny
 * interest coin, a new hatchback, a signed loan paper, a balance scale ("tilt" drops the borrower's
 * side), a fat money sack with a gap mark, a FOR RENT sign, a bank tower with lit floors, and a
 * piggy bank.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a savings passbook, open, with ruled lines and a stamp
  passbook: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8)}) rotate(-4)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.55} y={-s * 0.78} w={s * 0.55} h={s * 0.74} fill={PALETTE.cream} s={s} r={0.03} />
      <Box x={0} y={-s * 0.78} w={s * 0.55} h={s * 0.74} fill={PALETTE.cream} s={s} r={0.03} />
      <rect x={-s * 0.57} y={-s * 0.8} width={s * 0.06} height={s * 0.78} fill={PALETTE.navy} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={-s * 0.45} x2={-s * 0.08} y1={-s * (0.6 - i * 0.11)} y2={-s * (0.6 - i * 0.11)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />
          <line x1={s * 0.08} x2={s * 0.45} y1={-s * (0.6 - i * 0.11)} y2={-s * (0.6 - i * 0.11)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />
        </g>
      ))}
      <Paint x={-s * 0.27} y={-s * 0.66} text="SAVINGS" size={s * 0.08} fill={PALETTE.navy} />
      <circle cx={s * 0.3} cy={-s * 0.24} r={s * 0.1} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a marble bank hall: steps, four columns, a pediment with BANK, a big door; "lit" lights the windows
  bankhall: ({ s, t, state }) => {
    const lit = state === "lit";
    return (
      <g>
        <Shadow w={s * 1.4} s={s} />
        <Box x={-s * 0.66} y={-s * 0.1} w={s * 1.32} h={s * 0.1} fill={shade(PALETTE.cream, -0.15)} s={s} r={0.02} />
        <Box x={-s * 0.6} y={-s * 0.18} w={s * 1.2} h={s * 0.08} fill={shade(PALETTE.cream, -0.08)} s={s} r={0.02} />
        <Box x={-s * 0.56} y={-s * 0.74} w={s * 1.12} h={s * 0.56} fill={PALETTE.cream} s={s} r={0.01} />
        {[-0.42, -0.16, 0.16, 0.42].map((x) => (
          <g key={x}>
            <rect x={x * s - s * 0.06} y={-s * 0.72} width={s * 0.12} height={s * 0.54} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
            {[0, 1].map((j) => <line key={j} x1={x * s - s * 0.02 + j * s * 0.04} x2={x * s - s * 0.02 + j * s * 0.04} y1={-s * 0.7} y2={-s * 0.2} stroke={PALETTE.grey} strokeWidth={line(s) * 0.25} />)}
          </g>
        ))}
        <rect x={-s * 0.1} y={-s * 0.5} width={s * 0.2} height={s * 0.32} rx={s * 0.02} fill={lit ? PALETTE.yellow : shade(PALETTE.brown, -0.1)} stroke={INK} strokeWidth={line(s) * 0.5}
          opacity={lit ? 0.75 + 0.25 * Math.sin(t * 4) : 1} />
        <Shape d={`M${-s * 0.66},${-s * 0.74} L0,${-s * 1.0} L${s * 0.66},${-s * 0.74} Z`} fill={shade(PALETTE.cream, -0.05)} s={s} />
        <Paint x={0} y={-s * 0.78} text="BANK" size={s * 0.12} fill={PALETTE.navy} />
        <circle cx={0} cy={-s * 0.92} r={s * 0.035} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />
      </g>
    );
  },
  // a small gold interest coin, spinning slowly
  tinycoin: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5 + bob(t, s, 2.4, 0.03)})`}>
      <Ball cx={0} cy={0} rx={s * 0.42 * (0.55 + 0.45 * Math.abs(Math.cos(t * 1.6)))} ry={s * 0.42} fill={PALETTE.gold} s={s} />
      <circle cx={0} cy={0} r={s * 0.26} fill="none" stroke={shade(PALETTE.gold, -0.25)} strokeWidth={line(s) * 0.4} opacity={Math.abs(Math.cos(t * 1.6))} />
    </g>
  ),
  // a shiny new red hatchback with a bow on the roof
  newcar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Shape d={`M${-s * 0.8},${-s * 0.16} L${-s * 0.78},${-s * 0.42} Q${-s * 0.5},${-s * 0.46} ${-s * 0.36},${-s * 0.5} L${-s * 0.18},${-s * 0.78} L${s * 0.42},${-s * 0.78} L${s * 0.66},${-s * 0.46} Q${s * 0.82},${-s * 0.42} ${s * 0.82},${-s * 0.16} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${-s * 0.12},${-s * 0.72} L${s * 0.1},${-s * 0.72} L${s * 0.1},${-s * 0.5} L${-s * 0.28},${-s * 0.5} Z`} fill="#bfe6ff" s={s} />
      <Shape d={`M${s * 0.16},${-s * 0.72} L${s * 0.38},${-s * 0.72} L${s * 0.54},${-s * 0.5} L${s * 0.16},${-s * 0.5} Z`} fill="#bfe6ff" s={s} />
      {[-0.48, 0.5].map((x) => (
        <g key={x}>
          <circle cx={x * s} cy={-s * 0.14} r={s * 0.16} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
          <circle cx={x * s} cy={-s * 0.14} r={s * 0.07} fill={PALETTE.grey} />
        </g>
      ))}
      <rect x={s * 0.7} y={-s * 0.36} width={s * 0.1} height={s * 0.06} fill={PALETTE.yellow} opacity={0.7 + 0.3 * Math.sin(t * 5)} />
      <path d={`M${s * 0.02},${-s * 0.8} q${-s * 0.14},${-s * 0.14} ${-s * 0.16},0 q${s * 0.02},${s * 0.1} ${s * 0.16},0 q${s * 0.14},${-s * 0.14} ${s * 0.16},0 q${-s * 0.02},${s * 0.1} ${-s * 0.16},0`}
        fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a car-loan paper with a percent seal and a signature
  loanpaper: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.5)}) rotate(5)`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.36} y={-s * 0.96} w={s * 0.72} h={s * 0.92} fill="#fff" s={s} r={0.02} />
      <rect x={-s * 0.36} y={-s * 0.96} width={s * 0.72} height={s * 0.16} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={0} y={-s * 0.84} text="LOAN" size={s * 0.11} fill="#fff" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-s * 0.26} x2={s * 0.26} y1={-s * (0.66 - i * 0.1)} y2={-s * (0.66 - i * 0.1)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />)}
      <circle cx={s * 0.16} cy={-s * 0.2} r={s * 0.11} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={s * 0.16} y={-s * 0.16} text="%" size={s * 0.12} fill={INK} />
      <path d={`M${-s * 0.28},${-s * 0.16} q${s * 0.06},${-s * 0.1} ${s * 0.1},0 t${s * 0.1},0`} stroke={PALETTE.blue} strokeWidth={line(s) * 0.5} fill="none" />
    </g>
  ),
  // a brass balance scale: the saver's pan and the borrower's pan; "tilt" drops the borrower's side
  balancescale: ({ s, t, state }) => {
    const a = state === "tilt" ? 14 + Math.sin(t * 3) * 1.5 : Math.sin(t * 1.5) * 2;
    const r = (a * Math.PI) / 180, arm = s * 0.5;
    const lx = -Math.cos(r) * arm, ly = -s * 0.86 - Math.sin(r) * arm, rx = Math.cos(r) * arm, ry = -s * 0.86 + Math.sin(r) * arm;
    const pan = (x: number, y: number, fill: string) => (
      <g>
        <line x1={x} y1={y} x2={x - s * 0.14} y2={y + s * 0.26} stroke={INK} strokeWidth={line(s) * 0.4} />
        <line x1={x} y1={y} x2={x + s * 0.14} y2={y + s * 0.26} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Shape d={`M${x - s * 0.2},${y + s * 0.26} Q${x},${y + s * 0.38} ${x + s * 0.2},${y + s * 0.26} Z`} fill={fill} s={s} />
      </g>
    );
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.24} y={-s * 0.08} w={s * 0.48} h={s * 0.08} fill={PALETTE.gold} s={s} r={0.2} />
        <rect x={-s * 0.03} y={-s * 0.88} width={s * 0.06} height={s * 0.82} fill={shade(PALETTE.gold, -0.1)} stroke={INK} strokeWidth={line(s) * 0.4} />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={shade(PALETTE.gold, -0.15)} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
        <circle cx={0} cy={-s * 0.88} r={s * 0.05} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
        {pan(lx, ly, PALETTE.mint)}
        {pan(rx, ry, PALETTE.red)}
        <circle cx={lx} cy={ly + s * 0.24} r={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />
        {[0, 1, 2].map((i) => <rect key={i} x={rx - s * 0.1} y={ry + s * (0.18 - i * 0.05)} width={s * 0.2} height={s * 0.045} rx={s * 0.01} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3} />)}
      </g>
    );
  },
  // a fat money sack tied with gold rope, a dollar mark on its belly
  gapbag: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.3)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Ball cx={0} cy={-s * 0.36} rx={s * 0.42} ry={s * 0.36} fill={shade(PALETTE.tan, -0.1)} s={s} />
      <Shape d={`M${-s * 0.16},${-s * 0.7} L${-s * 0.24},${-s * 0.92} L${s * 0.24},${-s * 0.92} L${s * 0.16},${-s * 0.7} Z`} fill={shade(PALETTE.tan, -0.15)} s={s} />
      <rect x={-s * 0.2} y={-s * 0.74} width={s * 0.4} height={s * 0.06} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={-s * 0.26} text="$" size={s * 0.34} fill={PALETTE.green} />
    </g>
  ),
  // a swinging FOR RENT sign on a post
  rentsign: ({ s, t }) => {
    const sw = Math.sin(t * 2.2) * 5;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.04} y={-s * 1.0} width={s * 0.08} height={s * 1.0} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
        <rect x={-s * 0.04} y={-s * 1.0} width={s * 0.5} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
        <g transform={`rotate(${sw} ${s * 0.3} ${-s * 0.94})`}>
          <line x1={s * 0.12} y1={-s * 0.94} x2={s * 0.12} y2={-s * 0.82} stroke={INK} strokeWidth={line(s) * 0.3} />
          <line x1={s * 0.44} y1={-s * 0.94} x2={s * 0.44} y2={-s * 0.82} stroke={INK} strokeWidth={line(s) * 0.3} />
          <Box x={-s * 0.02} y={-s * 0.82} w={s * 0.6} h={s * 0.34} fill={PALETTE.red} s={s} r={0.06} />
          <Paint x={s * 0.28} y={-s * 0.68} text="FOR" size={s * 0.1} fill="#fff" />
          <Paint x={s * 0.28} y={-s * 0.55} text="RENT" size={s * 0.1} fill="#fff" />
        </g>
      </g>
    );
  },
  // a glass bank tower: lit floors, a spire and a sign band near the top
  banktower: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.24} y={-s * 1.0} w={s * 0.48} h={s * 1.0} fill={shade(PALETTE.navy, 0.1)} s={s} r={0.01} />
      {Array.from({ length: 12 }, (_, i) => (
        [0, 1, 2, 3].map((j) => (
          <rect key={`${i}-${j}`} x={-s * 0.2 + j * s * 0.1} y={-s * 0.92 + i * s * 0.075} width={s * 0.07} height={s * 0.045}
            fill={(i * 7 + j * 3) % 5 === 0 ? "#3a4772" : PALETTE.yellow} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 0.8 + i + j))} />
        ))
      ))}
      <rect x={-s * 0.02} y={-s * 1.16} width={s * 0.04} height={s * 0.16} fill={PALETTE.grey} />
      <circle cx={0} cy={-s * 1.17} r={s * 0.02} fill={PALETTE.red} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
    </g>
  ),
  // a pink piggy bank with a coin slot
  piggy: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.6)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Ball cx={0} cy={-s * 0.4} rx={s * 0.48} ry={s * 0.34} fill={PALETTE.pink} s={s} />
      <Ball cx={s * 0.44} cy={-s * 0.4} rx={s * 0.1} ry={s * 0.09} fill={shade(PALETTE.pink, -0.1)} s={s} />
      <Shape d={`M${-s * 0.2},${-s * 0.7} L${-s * 0.12},${-s * 0.86} L${-s * 0.02},${-s * 0.72} Z`} fill={shade(PALETTE.pink, -0.1)} s={s} />
      {[-0.28, -0.06, 0.16, 0.32].map((x) => <rect key={x} x={x * s - s * 0.04} y={-s * 0.12} width={s * 0.08} height={s * 0.12} fill={shade(PALETTE.pink, -0.15)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
      <rect x={-s * 0.1} y={-s * 0.76} width={s * 0.2} height={s * 0.03} rx={s * 0.01} fill={INK} />
      <circle cx={s * 0.24} cy={-s * 0.5} r={s * 0.03} fill={INK} />
    </g>
  ),
};

export default props;
