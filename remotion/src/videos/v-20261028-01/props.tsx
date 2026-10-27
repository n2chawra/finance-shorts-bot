/**
 * The things "Rohan gets paid $5,000. Watch where it goes" is about, drawn for this video only:
 * the pay envelope, the tax bill that bites it, the rented apartment block, Rohan's car and a gas
 * pump, a grocery bag and a takeout box, a phone playing a stream, a night-out ticket, the small
 * piggy bank that keeps what is left, and the sapling that money grows into.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a fat pay envelope with a green dollar seal; state "open" lifts the flap and shows the notes
  payslip: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(${Math.sin(t * 1.4) * 3})`}>
      <Shadow w={s * 1.1} s={s} />
      {state === "open" && [0, 1, 2].map((i) => (
        <rect key={i} x={-s * 0.4 + i * s * 0.06} y={-s * (0.95 + i * 0.05)} width={s * 0.7} height={s * 0.4} rx={s * 0.03} fill={shade(PALETTE.green, i * 0.12)} stroke={INK} strokeWidth={line(s) * 0.6} />
      ))}
      <Box x={-s * 0.55} y={-s * 0.7} w={s * 1.1} h={s * 0.7} fill={PALETTE.cream} s={s} r={0.06} />
      <Shape d={`M${-s * 0.55},${-s * 0.7} L0,${-s * (state === "open" ? 0.98 : 0.35)} L${s * 0.55},${-s * 0.7}`} fill={shade(PALETTE.cream, -0.08)} s={s} />
      <Ball cx={0} cy={-s * 0.3} rx={s * 0.12} fill={PALETTE.green} s={s} />
      <Paint x={0} y={-s * 0.25} text="$" size={s * 0.15} fill="#fff" />
    </g>
  ),
  // a red tax bill with a bite taken out of its corner; k (0..1) is how big the bite is
  taxbill: ({ s, t, k = 0.5 }) => {
    const r = s * (0.12 + 0.18 * k);
    return (
      <g transform={`rotate(${-6 + Math.sin(t * 2) * 2})`}>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.38} y={-s} w={s * 0.76} h={s} fill="#fff" s={s} r={0.04} />
        <rect x={-s * 0.38} y={-s} width={s * 0.76} height={s * 0.2} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
        <Paint x={0} y={-s * 0.85} text="TAX" size={s * 0.13} fill="#fff" />
        {[0.38, 0.5, 0.62].map((y) => <line key={y} x1={-s * 0.26} y1={-s * y} x2={s * 0.2} y2={-s * y} stroke={PALETTE.grey} strokeWidth={line(s)} />)}
        <circle cx={s * 0.38} cy={-s * 0.05} r={r} fill={shade(PALETTE.red, -0.35)} opacity={0.9} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={s * 0.38 - r * Math.cos(1.6 + i * 0.32)} cy={-s * 0.05 - r * Math.sin(1.6 + i * 0.32)} r={s * 0.04} fill="#fff" />)}
      </g>
    );
  },
  // a tall rented apartment block, lit windows flickering on and off
  apartment: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.32} y={-s} w={s * 0.64} h={s} fill={PALETTE.tan} s={s} r={0.02} />
      {Array.from({ length: 12 }, (_, i) => {
        const cx = -s * 0.2 + (i % 3) * s * 0.16, cy = -s * 0.9 + Math.floor(i / 3) * s * 0.2;
        const on = (Math.floor(t * 1.5) + i * 7) % 5 !== 0;
        return <rect key={i} x={cx - s * 0.05} y={cy} width={s * 0.1} height={s * 0.12} fill={on ? PALETTE.yellow : PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />;
      })}
      <rect x={-s * 0.07} y={-s * 0.14} width={s * 0.14} height={s * 0.14} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a little blue hatchback; its wheels turn and it bounces as it drives
  car: ({ s, t }) => {
    const spin = t * 400;
    return (
      <g transform={`translate(0,${Math.abs(Math.sin(t * 6)) * -s * 0.02})`}>
        <Shadow w={s * 1.5} s={s} />
        <Shape d={`M${-s * 0.75},${-s * 0.15} L${-s * 0.75},${-s * 0.42} Q${-s * 0.7},${-s * 0.5} ${-s * 0.5},${-s * 0.52} L${-s * 0.3},${-s * 0.8} L${s * 0.35},${-s * 0.8} L${s * 0.55},${-s * 0.52} Q${s * 0.75},${-s * 0.5} ${s * 0.75},${-s * 0.35} L${s * 0.75},${-s * 0.15} Z`} fill={PALETTE.blue} s={s} />
        <Shape d={`M${-s * 0.22},${-s * 0.74} L${s * 0.05},${-s * 0.74} L${s * 0.05},${-s * 0.54} L${-s * 0.38},${-s * 0.54} Z`} fill="#cfe8ff" s={s} />
        <Shape d={`M${s * 0.12},${-s * 0.74} L${s * 0.32},${-s * 0.74} L${s * 0.46},${-s * 0.54} L${s * 0.12},${-s * 0.54} Z`} fill="#cfe8ff" s={s} />
        <circle cx={s * 0.7} cy={-s * 0.4} r={s * 0.05} fill={PALETTE.yellow} />
        {[-0.45, 0.45].map((x) => (
          <g key={x} transform={`translate(${s * x},${-s * 0.15}) rotate(${spin})`}>
            <circle r={s * 0.16} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s)} />
            <rect x={-s * 0.02} y={-s * 0.12} width={s * 0.04} height={s * 0.24} fill={PALETTE.grey} />
          </g>
        ))}
      </g>
    );
  },
  // a gas pump, its dial digits rolling (drawn bars, no numbers)
  gaspump: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.28} y={-s} w={s * 0.5} h={s} fill={PALETTE.red} s={s} r={0.08} />
      <rect x={-s * 0.2} y={-s * 0.86} width={s * 0.34} height={s * 0.22} rx={s * 0.03} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.16 + i * s * 0.1} y={-s * 0.82} width={s * 0.06} height={s * (0.06 + 0.08 * Math.abs(Math.sin(t * 5 + i)))} fill={PALETTE.mint} />)}
      <path d={`M${s * 0.22},${-s * 0.6} q${s * 0.2},0 ${s * 0.2},${s * 0.25} l0,${s * 0.2}`} fill="none" stroke={INK} strokeWidth={line(s) * 1.6} />
      <rect x={s * 0.36} y={-s * 0.2} width={s * 0.1} height={s * 0.14} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a paper grocery bag with a baguette, greens and an apple sticking out
  groceries: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.8) * 2})`}>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.1} y={-s * 1.05} width={s * 0.12} height={s * 0.5} rx={s * 0.05} transform={`rotate(14 ${-s * 0.04} ${-s * 0.8})`} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.7} />
      <Shape d={`M${-s * 0.3},${-s * 0.7} q${-s * 0.1},${-s * 0.25} ${s * 0.05},${-s * 0.3} q${s * 0.05},${s * 0.2} 0,${s * 0.3} Z`} fill={PALETTE.green} s={s} />
      <Ball cx={s * 0.18} cy={-s * 0.74} rx={s * 0.1} fill={PALETTE.red} s={s} />
      <Shape d={`M${-s * 0.36},0 L${-s * 0.4},${-s * 0.7} L${s * 0.4},${-s * 0.7} L${s * 0.36},0 Z`} fill={PALETTE.brown} s={s} />
      <rect x={-s * 0.4} y={-s * 0.72} width={s * 0.8} height={s * 0.06} fill={shade(PALETTE.brown, -0.2)} />
    </g>
  ),
  // a takeout box with chopsticks, steam curling up
  takeout: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {[-0.1, 0.1].map((x, i) => <path key={x} d={`M${s * x},${-s * 0.75} q${s * 0.06},${-s * 0.1} 0,${-s * 0.2} q${-s * 0.06},${-s * 0.1} 0,${-s * 0.2}`} fill="none" stroke="#fff" strokeWidth={line(s)} opacity={0.4 + 0.4 * Math.abs(Math.sin(t * 2 + i))} />)}
      <line x1={s * 0.05} y1={-s * 0.6} x2={s * 0.3} y2={-s * 1.0} stroke={PALETTE.tan} strokeWidth={line(s) * 1.4} />
      <line x1={s * 0.12} y1={-s * 0.6} x2={s * 0.4} y2={-s * 0.95} stroke={PALETTE.tan} strokeWidth={line(s) * 1.4} />
      <Shape d={`M${-s * 0.35},${-s * 0.62} L${s * 0.35},${-s * 0.62} L${s * 0.26},0 L${-s * 0.26},0 Z`} fill="#fff" s={s} />
      <Shape d={`M${-s * 0.35},${-s * 0.62} L${-s * 0.2},${-s * 0.78} L${s * 0.2},${-s * 0.78} L${s * 0.35},${-s * 0.62} Z`} fill={shade("#ffffff", -0.1)} s={s} />
      <circle cx={0} cy={-s * 0.32} r={s * 0.09} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a phone playing a stream: a red play button and a progress bar running
  mobile: ({ s, t }) => (
    <g transform={`rotate(${-8 + Math.sin(t * 1.5) * 3})`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.28} y={-s} w={s * 0.56} h={s} fill={PALETTE.dark} s={s} r={0.12} sheen={false} />
      <rect x={-s * 0.23} y={-s * 0.92} width={s * 0.46} height={s * 0.8} rx={s * 0.04} fill={PALETTE.navy} />
      <Shape d={`M${-s * 0.07},${-s * 0.62} L${s * 0.1},${-s * 0.52} L${-s * 0.07},${-s * 0.42} Z`} fill={PALETTE.red} s={s} />
      <rect x={-s * 0.18} y={-s * 0.24} width={s * 0.36} height={s * 0.03} fill={PALETTE.grey} />
      <rect x={-s * 0.18} y={-s * 0.24} width={s * 0.36 * ((t * 0.2) % 1)} height={s * 0.03} fill={PALETTE.red} />
    </g>
  ),
  // a night-out ticket with a punched star, fluttering
  ticket: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.4 + bob(t, s, 2.4, 0.04)}) rotate(${-12 + Math.sin(t * 2.2) * 6})`}>
      <Shape d={`M${-s * 0.5},${-s * 0.22} L${s * 0.5},${-s * 0.22} L${s * 0.5},${-s * 0.06} A${s * 0.06},${s * 0.06} 0 0 0 ${s * 0.5},${s * 0.06} L${s * 0.5},${s * 0.22} L${-s * 0.5},${s * 0.22} L${-s * 0.5},${s * 0.06} A${s * 0.06},${s * 0.06} 0 0 0 ${-s * 0.5},${-s * 0.06} Z`} fill={PALETTE.orange} s={s} />
      <line x1={s * 0.22} y1={-s * 0.2} x2={s * 0.22} y2={s * 0.2} stroke={INK} strokeWidth={line(s) * 0.6} strokeDasharray={`${s * 0.03} ${s * 0.03}`} />
      <Paint x={-s * 0.12} y={s * 0.05} text="FUN" size={s * 0.15} fill="#fff" />
      <Shape d={`M${s * 0.36},${-s * 0.08} l${s * 0.03},${s * 0.06} l${s * 0.06},0 l${-s * 0.05},${s * 0.04} l${s * 0.02},${s * 0.06} l${-s * 0.06},${-s * 0.04} l${-s * 0.06},${s * 0.04} l${s * 0.02},${-s * 0.06} l${-s * 0.05},${-s * 0.04} l${s * 0.06},0 Z`} fill={PALETTE.yellow} s={s * 0.5} />
    </g>
  ),
  // a pink piggy bank; k (0..1) is how full it is (a coin drops in the slot when it changes)
  piggy: ({ s, t, k = 0.3 }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 1.0} s={s} />
      {[-0.28, 0.22].map((x) => <rect key={x} x={s * x} y={-s * 0.2} width={s * 0.12} height={s * 0.2} rx={s * 0.03} fill={shade(PALETTE.pink, -0.15)} stroke={INK} strokeWidth={line(s) * 0.7} />)}
      <Ball cx={0} cy={-s * 0.45} rx={s * 0.48} ry={s * 0.32} fill={PALETTE.pink} s={s} />
      <ellipse cx={s * 0.48} cy={-s * 0.45} rx={s * 0.08} ry={s * 0.1} fill={shade(PALETTE.pink, -0.12)} stroke={INK} strokeWidth={line(s) * 0.7} />
      <circle cx={s * 0.24} cy={-s * 0.55} r={s * 0.035} fill={INK} />
      <Shape d={`M${s * 0.06},${-s * 0.75} l${s * 0.08},${-s * 0.12} l${s * 0.06},${s * 0.12} Z`} fill={PALETTE.pink} s={s} />
      <rect x={-s * 0.12} y={-s * 0.79} width={s * 0.2} height={s * 0.03} rx={s * 0.015} fill={INK} />
      <rect x={-s * 0.3} y={-s * 0.62 + s * 0.3 * (1 - k)} width={s * 0.04} height={s * 0.3 * k} fill={PALETTE.gold} opacity={0.8} />
      <circle cx={-s * 0.02} cy={-s * 0.9 - s * 0.2 * ((t * 0.8) % 1)} r={s * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} opacity={1 - ((t * 0.8) % 1)} />
    </g>
  ),
  // a money sapling in a pot: k (0..1) is how grown it is, from a sprout to a tree full of green notes
  sapling: ({ s, t, k = 0.2 }) => {
    const h = s * (0.25 + 0.65 * k), leaves = Math.round(2 + 10 * k), sway = Math.sin(t * 1.6) * 3 * k;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <Shape d={`M${-s * 0.24},${-s * 0.24} L${s * 0.24},${-s * 0.24} L${s * 0.18},0 L${-s * 0.18},0 Z`} fill={PALETTE.orange} s={s} />
        <g transform={`rotate(${sway} 0 ${-s * 0.24})`}>
          <line x1={0} y1={-s * 0.24} x2={0} y2={-s * 0.24 - h} stroke={PALETTE.brown} strokeWidth={s * (0.03 + 0.04 * k)} strokeLinecap="round" />
          {Array.from({ length: leaves }, (_, i) => {
            const a = i * 2.4, rr = h * 0.18 + (i % 4) * h * 0.08;
            const x = Math.cos(a) * rr, y = -s * 0.24 - h * 0.75 + Math.sin(a) * rr * 0.7;
            return <rect key={i} x={x - s * 0.07} y={y - s * 0.04} width={s * 0.14} height={s * 0.08} rx={s * 0.015} transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} fill={i % 2 ? PALETTE.green : PALETTE.mint} stroke={INK} strokeWidth={line(s) * 0.5} />;
          })}
        </g>
      </g>
    );
  },
};

export default props;
