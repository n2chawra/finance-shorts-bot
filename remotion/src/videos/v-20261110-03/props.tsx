/**
 * The things "split one fortune with everyone" is about, drawn for this video only: a mountain of
 * cash bundles with gold coins, a crowd of little people, the Earth turning, a big kitchen knife,
 * one small banknote, a dinner plate with a burger and fries ("emptyplate": crumbs only), a worker
 * in a hard hat with a lunchbox, an hourglass with sand running, and a salary slip.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const plate = (s: number, full: boolean) => (
  <g>
    <Shadow w={s * 1.2} s={s} />
    <ellipse cx={0} cy={-s * 0.12} rx={s * 0.6} ry={s * 0.16} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
    <ellipse cx={0} cy={-s * 0.13} rx={s * 0.42} ry={s * 0.1} fill="#eef1f6" />
    {full ? (
      <g>
        <Shape d={`M${-s * 0.3},${-s * 0.22} Q0,${-s * 0.58} ${s * 0.3},${-s * 0.22} Z`} fill={PALETTE.orange} s={s} />
        <rect x={-s * 0.32} y={-s * 0.24} width={s * 0.64} height={s * 0.06} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.3} />
        <rect x={-s * 0.3} y={-s * 0.2} width={s * 0.6} height={s * 0.07} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.3} />
        {[0.34, 0.4, 0.46].map((x, i) => <rect key={x} x={x * s} y={-s * (0.42 - i * 0.03)} width={s * 0.04} height={s * 0.24} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.25} transform={`rotate(${-10 + i * 10} ${x * s} ${-s * 0.2})`} />)}
      </g>
    ) : (
      [-0.2, 0.05, 0.22].map((x) => <circle key={x} cx={x * s} cy={-s * 0.14} r={s * 0.02} fill={PALETTE.brown} />)
    )}
  </g>
);

const props: PropSet = {
  // a mountain of green cash bundles with gold coins on top, glinting
  moneymountain: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      {([[-0.6, 0], [-0.3, 0], [0, 0], [0.3, 0], [0.6, 0], [-0.45, 1], [-0.15, 1], [0.15, 1], [0.45, 1], [-0.3, 2], [0, 2], [0.3, 2], [-0.15, 3], [0.15, 3], [0, 4]] as [number, number][]).map(([x, r], i) => (
        <g key={i}>
          <rect x={x * s - s * 0.15} y={-s * (0.14 + r * 0.14)} width={s * 0.3} height={s * 0.14} rx={s * 0.015} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.4} />
          <rect x={x * s - s * 0.03} y={-s * (0.14 + r * 0.14)} width={s * 0.06} height={s * 0.14} fill={PALETTE.cream} />
        </g>
      ))}
      {[-0.08, 0.06].map((x, i) => <Ball key={x} cx={x * s} cy={-s * (0.78 + i * 0.04)} rx={s * 0.07} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.12} cy={-s * 0.5} r={s * 0.03} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 5)} />
    </g>
  ),
  // a crowd of little people in different colours, bobbing
  crowd: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      {[-0.5, -0.25, 0, 0.25, 0.5, -0.38, -0.12, 0.12, 0.38].map((x, i) => {
        const back = i >= 5, y = back ? -s * 0.28 : 0, c = [PALETTE.red, PALETTE.blue, PALETTE.green, PALETTE.purple, PALETTE.orange, PALETTE.teal, PALETTE.pink, PALETTE.navy, PALETTE.gold][i]!;
        const b = Math.sin(t * 3 + i) * s * 0.015;
        return (
          <g key={i} transform={`translate(${x * s},${y + b})`} opacity={back ? 0.85 : 1}>
            <rect x={-s * 0.08} y={-s * 0.32} width={s * 0.16} height={s * 0.3} rx={s * 0.06} fill={c} stroke={INK} strokeWidth={line(s) * 0.4} />
            <circle cx={0} cy={-s * 0.42} r={s * 0.08} fill={PALETTE.skin} stroke={INK} strokeWidth={line(s) * 0.4} />
          </g>
        );
      })}
    </g>
  ),
  // the Earth: blue ocean, green land drifting round, a white glint
  globe: ({ s, t }) => {
    const r = s * 0.48, sh = ((t * 0.08) % 1) * r * 2;
    return (
      <g transform={`translate(0,${bob(t, s, 1.2)})`}>
        <Shadow w={s * 0.9} s={s} />
        <defs><clipPath id="globe-clip"><circle cx={0} cy={-r - s * 0.04} r={r} /></clipPath></defs>
        <circle cx={0} cy={-r - s * 0.04} r={r} fill={PALETTE.blue} stroke={INK} strokeWidth={line(s) * 0.7} />
        <g clipPath="url(#globe-clip)">
          {[-1, 0, 1].map((k) => (
            <g key={k} transform={`translate(${sh + k * r * 2 - r},0)`}>
              <Shape d={`M${-r * 0.2},${-r * 1.6} q${r * 0.5},${-r * 0.1} ${r * 0.6},${r * 0.3} q${-r * 0.1},${r * 0.4} ${-r * 0.4},${r * 0.5} q${-r * 0.3},${-r * 0.2} ${-r * 0.2},${-r * 0.8} Z`} fill={PALETTE.green} s={s} />
              <Shape d={`M${r * 0.5},${-r * 0.8} q${r * 0.3},${r * 0.1} ${r * 0.25},${r * 0.45} q${-r * 0.2},${r * 0.2} ${-r * 0.35},${-r * 0.05} Z`} fill={PALETTE.green} s={s} />
            </g>
          ))}
        </g>
        <circle cx={-r * 0.35} cy={-r * 1.4} r={r * 0.12} fill="#fff" opacity={0.6} />
      </g>
    );
  },
  // a big chef's knife, blade gleaming
  knife: ({ s, t }) => (
    <g transform={`rotate(-30)`}>
      <Shape d={`M${-s * 0.1},${-s * 0.2} L${s * 0.1},${-s * 0.2} L${s * 0.08},${-s * 0.95} Q0,${-s * 1.0} ${-s * 0.1},${-s * 0.9} Z`} fill="#dfe6ef" s={s} />
      <line x1={-s * 0.02} y1={-s * 0.3} x2={-s * 0.02} y2={-s * 0.85} stroke="#fff" strokeWidth={line(s) * 0.6} opacity={0.5 + 0.5 * Math.sin(t * 4)} />
      <rect x={-s * 0.07} y={-s * 0.2} width={s * 0.14} height={s * 0.26} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // one small banknote, fluttering
  tinynote: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.4 + bob(t, s, 2.6, 0.04)}) rotate(${Math.sin(t * 3) * 8})`}>
      <rect x={-s * 0.5} y={-s * 0.25} width={s * 1.0} height={s * 0.5} rx={s * 0.05} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={0} cy={0} r={s * 0.15} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={s * 0.06} text="$" size={s * 0.2} fill={PALETTE.green} />
    </g>
  ),
  // a dinner plate with a burger and fries
  dinnerplate: ({ s }) => plate(s, true),
  // the same plate, eaten: crumbs only
  emptyplate: ({ s }) => plate(s, false),
  // a worker in a hard hat and overalls holding a lunchbox
  worker: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.1} y={-s * 0.32} width={s * 0.08} height={s * 0.32} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={s * 0.02} y={-s * 0.32} width={s * 0.08} height={s * 0.32} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Box x={-s * 0.16} y={-s * 0.66} w={s * 0.32} h={s * 0.36} fill={PALETTE.blue} s={s} r={0.1} />
      <rect x={-s * 0.1} y={-s * 0.56} width={s * 0.2} height={s * 0.16} fill={shade(PALETTE.blue, -0.15)} />
      <circle cx={0} cy={-s * 0.78} r={s * 0.11} fill={PALETTE.skin} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Shape d={`M${-s * 0.14},${-s * 0.82} Q0,${-s * 1.0} ${s * 0.14},${-s * 0.82} Z`} fill={PALETTE.yellow} s={s} />
      <g transform={`rotate(${Math.sin(t * 2) * 6} ${s * 0.2} ${-s * 0.5})`}>
        <Box x={s * 0.16} y={-s * 0.36} w={s * 0.2} h={s * 0.14} fill={PALETTE.red} s={s} r={0.15} />
      </g>
    </g>
  ),
  // an hourglass, sand running from top to bottom over and over
  hourglass: ({ s, t }) => {
    const q = (t * 0.2) % 1;
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <rect x={-s * 0.3} y={-s * 0.06} width={s * 0.6} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
        <rect x={-s * 0.3} y={-s * 1.0} width={s * 0.6} height={s * 0.06} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Shape d={`M${-s * 0.24},${-s * 0.94} L${s * 0.24},${-s * 0.94} L${s * 0.04},${-s * 0.53} L${s * 0.24},${-s * 0.06} L${-s * 0.24},${-s * 0.06} L${-s * 0.04},${-s * 0.53} Z`} fill="#eaf4ff" s={s} opacity={0.9} />
        <Shape d={`M${-s * 0.2 * (1 - q)},${-s * (0.6 + 0.3 * (1 - q))} L${s * 0.2 * (1 - q)},${-s * (0.6 + 0.3 * (1 - q))} L0,${-s * 0.55} Z`} fill={PALETTE.gold} s={s} />
        <line x1={0} y1={-s * 0.55} x2={0} y2={-s * 0.1} stroke={PALETTE.gold} strokeWidth={line(s) * 0.5} />
        <Shape d={`M${-s * 0.22},${-s * 0.07} L${s * 0.22},${-s * 0.07} L0,${-s * (0.07 + 0.3 * q)} Z`} fill={PALETTE.gold} s={s} />
      </g>
    );
  },
  // a salary slip with a figure box and lines
  salaryslip: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.5)}) rotate(-4)`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.36} y={-s * 0.96} w={s * 0.72} h={s * 0.92} fill="#fff" s={s} r={0.03} />
      <rect x={-s * 0.36} y={-s * 0.96} width={s * 0.72} height={s * 0.14} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={-s * 0.86} text="SALARY" size={s * 0.09} fill="#fff" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-s * 0.26} x2={s * 0.26} y1={-s * (0.66 - i * 0.1)} y2={-s * (0.66 - i * 0.1)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.35} />)}
      <rect x={-s * 0.26} y={-s * 0.28} width={s * 0.52} height={s * 0.14} fill={PALETTE.mint} stroke={INK} strokeWidth={line(s) * 0.3} />
    </g>
  ),
};

export default props;
