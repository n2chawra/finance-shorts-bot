/**
 * The things "The rich pay themselves first" is about, drawn for this video only: the pay stub,
 * a fridge (food), a game pad (fun), a plate of leftover coins, a pie slice of the pay that moves
 * out first, a little safe box it lands in, an acorn and the oak it grows into, and the front door
 * with its rent notice.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a pay stub with a perforated edge and a green "PAY" band
  paystub: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(${Math.sin(t * 1.4) * 3})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.38} y={-s * 0.95} w={s * 0.76} h={s * 0.9} fill="#fff" s={s} r={0.04} sheen={false} />
      <rect x={-s * 0.38} y={-s * 0.95} width={s * 0.76} height={s * 0.2} fill={PALETTE.green} stroke={INK} strokeWidth={line(s)} />
      <Paint x={0} y={-s * 0.8} text="PAY" size={s * 0.13} fill="#fff" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-s * 0.28} x2={s * (0.1 + (i % 2) * 0.14)} y1={-s * (0.6 - i * 0.12)} y2={-s * (0.6 - i * 0.12)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.7} />)}
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-s * 0.33 + i * s * 0.095} cy={-s * 0.08} r={s * 0.015} fill={PALETTE.grey} />)}
    </g>
  ),
  // a fridge, its door swinging open to show it nearly empty
  fridge: ({ s, t }) => {
    const open = 10 + Math.abs(Math.sin(t * 1.2)) * 25;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <Box x={-s * 0.3} y={-s} w={s * 0.6} h={s} fill="#e9eef5" s={s} r={0.06} />
        <rect x={-s * 0.24} y={-s * 0.9} width={s * 0.48} height={s * 0.82} fill="#fffbe6" stroke={INK} strokeWidth={line(s) * 0.5} />
        <line x1={-s * 0.24} x2={s * 0.24} y1={-s * 0.5} y2={-s * 0.5} stroke={PALETTE.grey} strokeWidth={line(s) * 0.5} />
        <Ball cx={-s * 0.1} cy={-s * 0.56} rx={s * 0.05} fill={PALETTE.red} s={s} />
        <g transform={`translate(${s * 0.3},0) skewY(${-open * 0.2}) scale(${Math.cos(open * Math.PI / 180)},1)`}>
          <rect x={0} y={-s} width={s * 0.5} height={s} rx={s * 0.04} fill="#dfe6ef" stroke={INK} strokeWidth={line(s)} />
        </g>
      </g>
    );
  },
  // a game pad with blinking buttons
  gamepad: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.5)}) rotate(${Math.sin(t * 2) * 5})`}>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.45},${-s * 0.5} Q${-s * 0.55},${-s * 0.05} ${-s * 0.35},${-s * 0.08} L${s * 0.35},${-s * 0.08} Q${s * 0.55},${-s * 0.05} ${s * 0.45},${-s * 0.5} Z`} fill={PALETTE.dark} s={s} />
      <rect x={-s * 0.32} y={-s * 0.36} width={s * 0.14} height={s * 0.04} fill="#fff" />
      <rect x={-s * 0.27} y={-s * 0.41} width={s * 0.04} height={s * 0.14} fill="#fff" />
      {[[0.22, -0.4, PALETTE.red], [0.3, -0.32, PALETTE.green], [0.14, -0.32, PALETTE.blue]].map(([x, y, c], i) => (
        <circle key={i} cx={s * (x as number)} cy={s * (y as number)} r={s * 0.035} fill={c as string} opacity={0.6 + 0.4 * Math.sin(t * 6 + i)} />
      ))}
    </g>
  ),
  // a plate with a few leftover coins
  leftovers: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <ellipse cx={0} cy={-s * 0.08} rx={s * 0.45} ry={s * 0.1} fill="#fff" stroke={INK} strokeWidth={line(s)} />
      {[-0.12, 0.06, 0.16].map((x, i) => <Ball key={x} cx={s * x} cy={-s * (0.12 + (i === 1 ? 0.04 : 0))} rx={s * 0.08} ry={s * 0.035} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.2} cy={-s * 0.2} r={s * (0.015 + 0.01 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a pie of the paycheck with one slice lifting out first: k is how far the slice has lifted
  payslice: ({ s, t, k = 0 }) => {
    const r = s * 0.4, cy = -s * 0.45, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * 0.2;
    const dx = Math.cos((a0 + a1) / 2) * k * s * 0.25, dy = Math.sin((a0 + a1) / 2) * k * s * 0.25;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <path d={`M0,${cy} L${Math.cos(a1) * r},${cy + Math.sin(a1) * r} A${r},${r} 0 1 1 ${Math.cos(a0) * r},${cy + Math.sin(a0) * r} Z`} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s)} />
        <g transform={`translate(${dx},${dy - Math.abs(Math.sin(t * 3)) * k * s * 0.02})`}>
          <path d={`M0,${cy} L${Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 0 1 ${Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`} fill={PALETTE.green} stroke={INK} strokeWidth={line(s)} />
        </g>
      </g>
    );
  },
  // a small steel safe, dial turning
  safebox: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.4} y={-s * 0.75} w={s * 0.8} h={s * 0.72} fill={PALETTE.grey} s={s} r={0.08} />
      <rect x={-s * 0.3} y={-s * 0.66} width={s * 0.6} height={s * 0.54} rx={s * 0.04} fill={shade(PALETTE.grey, -0.15)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <g transform={`translate(0,${-s * 0.39}) rotate(${t * 60})`}>
        <circle r={s * 0.12} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
        <line x1={0} y1={0} x2={0} y2={-s * 0.1} stroke={INK} strokeWidth={line(s) * 0.6} />
      </g>
      {[-0.3, 0.3].map((x) => <rect key={x} x={s * x - s * 0.04} y={-s * 0.04} width={s * 0.08} height={s * 0.04} fill={INK} />)}
    </g>
  ),
  // an acorn, bobbing
  acorn: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.03)})`}>
      <Shadow w={s * 0.5} s={s} />
      <Ball cx={0} cy={-s * 0.32} rx={s * 0.22} ry={s * 0.28} fill={PALETTE.brown} s={s} />
      <Shape d={`M${-s * 0.26},${-s * 0.5} Q0,${-s * 0.75} ${s * 0.26},${-s * 0.5} Z`} fill={shade(PALETTE.brown, -0.3)} s={s} />
      <rect x={-s * 0.02} y={-s * 0.75} width={s * 0.04} height={s * 0.1} fill={INK} />
    </g>
  ),
  // an oak tree: k (0..1) is how grown it is, with a few notes among the leaves
  oak: ({ s, t, k = 1 }) => {
    const hgt = s * (0.25 + 0.45 * k), crown = s * (0.12 + 0.3 * k);
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <rect x={-s * (0.03 + 0.04 * k)} y={-hgt} width={s * (0.06 + 0.08 * k)} height={hgt} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Ball cx={-crown * 0.5} cy={-hgt} rx={crown * 0.8} fill={shade(PALETTE.green, -0.1)} s={s} />
        <Ball cx={crown * 0.5} cy={-hgt} rx={crown * 0.8} fill={shade(PALETTE.green, -0.05)} s={s} />
        <Ball cx={0} cy={-hgt - crown * 0.5} rx={crown} fill={PALETTE.green} s={s} />
        {Array.from({ length: Math.round(2 + 8 * k) }, (_, i) => {
          const a = i * 2.2 + t * 0.5;
          return <rect key={i} x={Math.cos(a) * crown * 0.7 - s * 0.04} y={-hgt - crown * 0.3 + Math.sin(a) * crown * 0.5} width={s * 0.08} height={s * 0.04} rx={s * 0.01} fill="#9dc79f" stroke={INK} strokeWidth={line(s) * 0.3} />;
        })}
      </g>
    );
  },
  // a front door with a red "RENT DUE" notice taped on, the notice flapping
  frontdoor: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.28} y={-s} w={s * 0.56} h={s} fill={PALETTE.brown} s={s} r={0.03} sheen={false} />
      <circle cx={s * 0.18} cy={-s * 0.48} r={s * 0.03} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <g transform={`rotate(${Math.sin(t * 3) * 4},0,${-s * 0.8})`}>
        <rect x={-s * 0.18} y={-s * 0.8} width={s * 0.36} height={s * 0.22} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
        <Paint x={0} y={-s * 0.66} text="RENT" size={s * 0.09} fill={PALETTE.red} />
      </g>
    </g>
  ),
};

export default props;
