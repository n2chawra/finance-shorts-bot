/**
 * The things "Every money trap the middle class falls into" is about, drawn for this video only:
 * the treadmill Rohan runs on (faster with every raise), his payslip, a price tag that climbs, a
 * takeout bag, a shiny new sedan and its keys, the loan's payment book, a jar of safe cash, a pile
 * of notes that melts, a stack of app subscriptions, a tap that drips coins (the fee), a growing
 * jar, a small cottage and a bigger house, a money tree, an alarm clock, a trapdoor and an exit door.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a running machine seen from the side; state "fast" spins the belt quicker and adds speed lines
  treadmill: ({ s, t, state, k }) => {
    const speed = state === "fast" ? 9 : 3 + (k ?? 0) * 6;
    const off = (t * speed * s * 0.08) % (s * 0.16);
    return (
      <g>
        <Shadow w={s * 1.5} s={s} />
        <Box x={-s * 0.75} y={-s * 0.2} w={s * 1.5} h={s * 0.16} fill={PALETTE.dark} s={s} r={0.4} sheen={false} />
        <rect x={-s * 0.7} y={-s * 0.2} width={s * 1.4} height={s * 0.05} fill={shade(PALETTE.dark, 0.25)} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-s * 0.7 + ((i * s * 0.16 + off) % (s * 1.4))} y={-s * 0.2} width={s * 0.03} height={s * 0.05} fill={PALETTE.grey} />
        ))}
        <rect x={s * 0.5} y={-s * 0.95} width={s * 0.06} height={s * 0.78} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.7} />
        <Box x={s * 0.32} y={-s * 1.08} w={s * 0.4} h={s * 0.18} fill={PALETTE.navy} s={s} r={0.2} />
        <rect x={s * 0.37} y={-s * 1.04} width={s * 0.3} height={s * 0.09} rx={s * 0.02} fill={state === "fast" ? PALETTE.red : PALETTE.mint} />
        {state === "fast" && [0, 1, 2].map((i) => (
          <rect key={i} x={-s * 0.95 - i * s * 0.08} y={-s * (0.5 + i * 0.15)} width={s * (0.3 - i * 0.05)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.white} opacity={0.7 - i * 0.15} />
        ))}
      </g>
    );
  },
  // a payslip: header bar, rows, a total line; state "raise" adds a green arrow stamp
  payslip: ({ s, t, state }) => (
    <g transform={`rotate(${-4 + Math.sin(t * 1.5) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.36} y={-s * 1.0} w={s * 0.72} h={s * 0.95} fill={PALETTE.white} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.36} y={-s * 1.0} width={s * 0.72} height={s * 0.16} fill={PALETTE.teal} />
      <Paint x={0} y={-s * 0.88} text="PAY" size={s * 0.1} fill={PALETTE.white} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.28} y={-s * (0.72 - i * 0.12)} width={s * (0.56 - (i % 2) * 0.18)} height={s * 0.05} rx={s * 0.02} fill={PALETTE.grey} opacity={0.5} />)}
      <rect x={-s * 0.28} y={-s * 0.2} width={s * 0.56} height={s * 0.07} rx={s * 0.02} fill={PALETTE.green} opacity={0.85} />
      {state === "raise" && (
        <g transform={`translate(${s * 0.3},${-s * 0.95})`}>
          <Ball cx={0} cy={0} rx={s * 0.16} fill={PALETTE.green} s={s} />
          <path d={`M0,${s * 0.09} L0,${-s * 0.08} M${-s * 0.07},${-s * 0.01} L0,${-s * 0.09} L${s * 0.07},${-s * 0.01}`} stroke={PALETTE.white} strokeWidth={line(s) * 1.6} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  ),
  // a price tag on a string with an up arrow that keeps climbing
  risetag: ({ s, t }) => {
    const lift = Math.sin(t * 2.4) * s * 0.03;
    return (
      <g transform={`translate(0,${lift}) rotate(${10 + Math.sin(t * 1.8) * 5})`}>
        <Shadow w={s * 0.6} s={s} />
        <Shape d={`M${-s * 0.3},${-s * 0.95} L${s * 0.18},${-s * 0.95} L${s * 0.36},${-s * 0.65} L${s * 0.18},${-s * 0.35} L${-s * 0.3},${-s * 0.35} Z`} fill={PALETTE.orange} s={s} />
        <circle cx={s * 0.2} cy={-s * 0.65} r={s * 0.04} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M${-s * 0.08},${-s * 0.45} L${-s * 0.08},${-s * 0.82} M${-s * 0.18},${-s * 0.7} L${-s * 0.08},${-s * 0.84} L${s * 0.02},${-s * 0.7}`} stroke={PALETTE.white} strokeWidth={line(s) * 1.8} fill="none" strokeLinecap="round" />
      </g>
    );
  },
  // a paper takeout bag with handles and steam
  takeout: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.6} s={s} />
      <Shape d={`M${-s * 0.3},${-s * 0.75} L${s * 0.3},${-s * 0.75} L${s * 0.34},0 L${-s * 0.34},0 Z`} fill={PALETTE.tan} s={s} />
      <path d={`M${-s * 0.14},${-s * 0.75} q${s * 0.14},${-s * 0.25} ${s * 0.28},0`} stroke={INK} strokeWidth={line(s)} fill="none" />
      <rect x={-s * 0.2} y={-s * 0.5} width={s * 0.4} height={s * 0.18} rx={s * 0.04} fill={PALETTE.red} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${-s * 0.12 + i * s * 0.12},${-s * 0.95} q${s * 0.05},${-s * 0.08} 0,${-s * 0.16}`} stroke={PALETTE.white}
          strokeWidth={line(s) * 0.9} fill="none" opacity={0.4 + 0.4 * Math.abs(Math.sin(t * 2 + i))} />
      ))}
    </g>
  ),
  // a shiny sedan from the side; state "old" dulls the paint and adds dents
  sedan: ({ s, t, state }) => {
    const old = state === "old";
    const paint = old ? shade(PALETTE.blue, -0.35) : PALETTE.blue;
    const spin = t * 200;
    return (
      <g>
        <Shadow w={s * 1.6} s={s} />
        <Shape d={`M${-s * 0.8},${-s * 0.18} L${-s * 0.78},${-s * 0.4} L${-s * 0.45},${-s * 0.46} L${-s * 0.25},${-s * 0.72} L${s * 0.3},${-s * 0.72} L${s * 0.52},${-s * 0.46} L${s * 0.8},${-s * 0.4} L${s * 0.82},${-s * 0.18} Z`} fill={paint} s={s} />
        <Shape d={`M${-s * 0.2},${-s * 0.66} L${s * 0.02},${-s * 0.66} L${s * 0.02},${-s * 0.48} L${-s * 0.36},${-s * 0.48} Z`} fill="#cfe8ff" s={s} />
        <Shape d={`M${s * 0.08},${-s * 0.66} L${s * 0.27},${-s * 0.66} L${s * 0.42},${-s * 0.48} L${s * 0.08},${-s * 0.48} Z`} fill="#cfe8ff" s={s} />
        {!old && <rect x={-s * 0.6} y={-s * 0.4} width={s * 0.5} height={s * 0.03} rx={s * 0.015} fill={PALETTE.white} opacity={0.6 + 0.3 * Math.sin(t * 3)} />}
        {old && <path d={`M${s * 0.4},${-s * 0.34} l${s * 0.08},${s * 0.06} l${-s * 0.04},${s * 0.06}`} stroke={INK} strokeWidth={line(s)} fill="none" />}
        {[-0.5, 0.5].map((x) => (
          <g key={x} transform={`translate(${x * s},${-s * 0.16}) rotate(${spin})`}>
            <circle r={s * 0.16} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s)} />
            <circle r={s * 0.07} fill={PALETTE.grey} />
            <rect x={-s * 0.01} y={-s * 0.07} width={s * 0.02} height={s * 0.14} fill={INK} />
          </g>
        ))}
      </g>
    );
  },
  // a car key fob on a ring, swinging
  carkeys: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.2) * 14},0,${-s})`}>
      <circle cx={0} cy={-s * 0.9} r={s * 0.12} fill="none" stroke={PALETTE.grey} strokeWidth={line(s) * 1.6} />
      <Box x={-s * 0.17} y={-s * 0.78} w={s * 0.34} h={s * 0.5} fill={PALETTE.dark} s={s} r={0.35} />
      <circle cx={0} cy={-s * 0.62} r={s * 0.06} fill={PALETTE.red} />
      <circle cx={0} cy={-s * 0.45} r={s * 0.05} fill={PALETTE.grey} />
      <rect x={-s * 0.03} y={-s * 0.28} width={s * 0.06} height={s * 0.26} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a loan payment book: coupons that tear off one by one (k 0..1 = share torn)
  paybook: ({ s, t, k }) => {
    const torn = Math.floor((k ?? 0) * 6);
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        {Array.from({ length: 6 }, (_, i) => i >= torn && (
          <g key={i} transform={`translate(${(i - 2.5) * s * 0.02},${-i * s * 0.04})`}>
            <Box x={-s * 0.42} y={-s * 0.62} w={s * 0.84} h={s * 0.5} fill={i % 2 ? PALETTE.cream : PALETTE.white} s={s} r={0.05} sheen={false} />
            <rect x={-s * 0.42} y={-s * 0.62} width={s * 0.14} height={s * 0.5} fill={PALETTE.red} opacity={0.8} />
            <rect x={-s * 0.2} y={-s * 0.5} width={s * 0.5} height={s * 0.05} rx={s * 0.02} fill={PALETTE.grey} opacity={0.5} />
            <rect x={-s * 0.2} y={-s * 0.38} width={s * 0.34} height={s * 0.05} rx={s * 0.02} fill={PALETTE.grey} opacity={0.5} />
          </g>
        ))}
        {torn > 0 && <g transform={`translate(${s * 0.55},${-s * 0.5 + ((t * 0.5) % 1) * s * 0.3}) rotate(${20 + t * 30})`} opacity={0.8}>
          <rect x={-s * 0.2} y={-s * 0.12} width={s * 0.4} height={s * 0.24} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.6} />
        </g>}
      </g>
    );
  },
  // a glass jar of notes, the safe cash; state "faded" washes the notes out
  cashjar: ({ s, t, state }) => {
    const faded = state === "faded";
    return (
      <g transform={`translate(0,${bob(t, s, 1.2)})`}>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.3} y={-s * 0.82} width={s * 0.6} height={s * 0.8} rx={s * 0.1} fill="#e8f6ff" stroke={INK} strokeWidth={line(s)} opacity={0.9} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-s * 0.24} y={-s * (0.18 + i * 0.12)} width={s * 0.48} height={s * 0.1} rx={s * 0.02}
            fill={faded ? shade(PALETTE.green, 0.55) : PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} opacity={faded ? 0.45 : 1} />
        ))}
        <rect x={-s * 0.34} y={-s * 0.92} width={s * 0.68} height={s * 0.12} rx={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
      </g>
    );
  },
  // a pile of notes melting like ice; k 0..1 = how much has melted
  meltcash: ({ s, t, k }) => {
    const m = k ?? 0;
    const hgt = s * 0.6 * (1 - 0.6 * m);
    return (
      <g>
        <ellipse cx={0} cy={-s * 0.02} rx={s * (0.45 + 0.35 * m)} ry={s * 0.06} fill={PALETTE.green} opacity={0.35 + 0.3 * m} />
        <Shape d={`M${-s * 0.35},0 L${-s * 0.3},${-hgt} Q0,${-hgt - s * 0.08} ${s * 0.3},${-hgt} L${s * 0.35},0 Z`} fill={PALETTE.green} s={s} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${(-0.2 + i * 0.2) * s},${-hgt * 0.4} q${s * 0.02},${s * 0.1 + Math.sin(t * 3 + i) * s * 0.02} 0,${s * 0.18}`} stroke={shade(PALETTE.green, -0.2)} strokeWidth={line(s) * 1.4} fill="none" strokeLinecap="round" />
        ))}
        <rect x={-s * 0.18} y={-hgt * 0.75} width={s * 0.36} height={s * 0.08} rx={s * 0.03} fill={PALETTE.white} opacity={0.6} />
      </g>
    );
  },
  // a fanned stack of app tiles: the subscriptions; state "many" fans out more tiles
  appstack: ({ s, t, state }) => {
    const n = state === "many" ? 6 : 3;
    const colors = [PALETTE.red, PALETTE.purple, PALETTE.green, PALETTE.blue, PALETTE.orange, PALETTE.pink];
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        {Array.from({ length: n }, (_, i) => {
          const a = (i - (n - 1) / 2) * 12 + Math.sin(t * 1.5 + i) * 2;
          return (
            <g key={i} transform={`rotate(${a},0,0)`}>
              <Box x={-s * 0.18} y={-s * 0.9} w={s * 0.36} h={s * 0.36} fill={colors[i % colors.length]!} s={s} r={0.25} />
              <circle cx={0} cy={-s * 0.72} r={s * 0.07} fill={PALETTE.white} opacity={0.85} />
            </g>
          );
        })}
      </g>
    );
  },
  // a tap fixed to a pipe, dripping coins; k 0..1 = how fast it drips
  feetap: ({ s, t, k }) => {
    const rate = 1.2 + (k ?? 0.5) * 2;
    return (
      <g>
        <rect x={-s * 0.6} y={-s * 1.0} width={s * 0.5} height={s * 0.14} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s)} />
        <Box x={-s * 0.14} y={-s * 1.06} w={s * 0.3} h={s * 0.26} fill={shade(PALETTE.grey, 0.15)} s={s} r={0.2} />
        <rect x={s * 0.04} y={-s * 0.86} width={s * 0.1} height={s * 0.14} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.8} />
        <rect x={-s * 0.08} y={-s * 1.16} width={s * 0.2} height={s * 0.06} rx={s * 0.03} fill={PALETTE.red} />
        {[0, 1, 2].map((i) => {
          const d = ((t * rate) / 1.5 + i / 3) % 1;
          return <g key={i} transform={`translate(${s * 0.09},${-s * 0.68 + d * s * 0.62})`} opacity={1 - d * 0.5}>
            <ellipse rx={s * 0.07} ry={s * 0.07 * Math.abs(Math.cos(t * 4 + i))+ s * 0.015} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
          </g>;
        })}
        <Shadow w={s * 0.5} s={s} />
      </g>
    );
  },
  // a jar that fills with gold coins; k 0..1 = how full
  growjar: ({ s, t, k }) => {
    const f = Math.max(0.08, k ?? 0.3);
    return (
      <g transform={`translate(0,${bob(t, s, 1.4)})`}>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.32} y={-s * 0.86} width={s * 0.64} height={s * 0.84} rx={s * 0.12} fill="#f3fbff" stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.28} y={-s * 0.06 - s * 0.74 * f} width={s * 0.56} height={s * 0.74 * f} rx={s * 0.08} fill={PALETTE.gold} />
        {Array.from({ length: Math.round(f * 6) }, (_, i) => <ellipse key={i} cx={(-0.15 + (i % 3) * 0.15) * s} cy={-s * 0.1 - i * s * 0.1} rx={s * 0.06} ry={s * 0.02} fill={shade(PALETTE.gold, -0.2)} />)}
        <rect x={-s * 0.36} y={-s * 0.96} width={s * 0.72} height={s * 0.12} rx={s * 0.04} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s)} />
      </g>
    );
  },
  // a small cottage with one window lit
  cottage: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.42} y={-s * 0.6} w={s * 0.84} h={s * 0.6} fill={PALETTE.cream} s={s} r={0.03} />
      <Shape d={`M${-s * 0.52},${-s * 0.58} L0,${-s * 1.0} L${s * 0.52},${-s * 0.58} Z`} fill={PALETTE.red} s={s} />
      <rect x={-s * 0.1} y={-s * 0.32} width={s * 0.2} height={s * 0.32} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.7} />
      <rect x={s * 0.18} y={-s * 0.46} width={s * 0.16} height={s * 0.14} fill={PALETTE.yellow} opacity={0.7 + 0.3 * Math.sin(t * 2)} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a big two-storey house with a garage; state "heavy" puts a chain and weight on its door
  bighouse: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.7} y={-s * 0.9} w={s * 1.0} h={s * 0.9} fill={PALETTE.white} s={s} r={0.02} />
      <Shape d={`M${-s * 0.8},${-s * 0.88} L${-s * 0.2},${-s * 1.3} L${s * 0.4},${-s * 0.88} Z`} fill={PALETTE.navy} s={s} />
      <Box x={s * 0.3} y={-s * 0.5} w={s * 0.45} h={s * 0.5} fill={PALETTE.cream} s={s} r={0.02} />
      <rect x={s * 0.36} y={-s * 0.36} width={s * 0.33} height={s * 0.36} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.7} />
      {[[-0.58, -0.75], [-0.3, -0.75], [-0.58, -0.45]].map(([x, y], i) => (
        <rect key={i} x={x! * s} y={y! * s} width={s * 0.18} height={s * 0.16} fill={PALETTE.yellow} opacity={0.6 + 0.3 * Math.sin(t * 1.6 + i)} stroke={INK} strokeWidth={line(s) * 0.6} />
      ))}
      <rect x={-s * 0.3} y={-s * 0.38} width={s * 0.18} height={s * 0.38} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.7} />
      {state === "heavy" && (
        <g>
          <path d={`M${-s * 0.21},${-s * 0.2} q${s * 0.1},${s * 0.25} ${s * 0.25},${s * 0.18}`} stroke={PALETTE.grey} strokeWidth={line(s) * 2} fill="none" strokeDasharray={`${s * 0.04} ${s * 0.02}`} />
          <Shape d={`M${s * 0.0},${-s * 0.02} L${s * 0.1},${-s * 0.2} L${s * 0.24},${-s * 0.2} L${s * 0.32},${-s * 0.02} Z`} fill={PALETTE.dark} s={s} />
        </g>
      )}
    </g>
  ),
  // a money tree; k 0..1 = how big it has grown (a sapling at 0)
  moneytree: ({ s, t, k }) => {
    const g = 0.35 + 0.65 * (k ?? 0.5);
    const sway = Math.sin(t * 1.3) * 3;
    return (
      <g>
        <Shadow w={s * 0.8 * g} s={s} />
        <g transform={`rotate(${sway},0,0)`}>
          <rect x={-s * 0.05 * g} y={-s * 0.55 * g} width={s * 0.1 * g} height={s * 0.55 * g} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.8} />
          <Ball cx={0} cy={-s * 0.75 * g} rx={s * 0.42 * g} fill={PALETTE.green} s={s} />
          {Array.from({ length: Math.round(2 + g * 6) }, (_, i) => {
            const a = i * 2.4;
            return <rect key={i} x={Math.cos(a) * s * 0.26 * g - s * 0.05} y={-s * 0.75 * g + Math.sin(a) * s * 0.22 * g - s * 0.025} width={s * 0.1} height={s * 0.05} rx={s * 0.01} fill={PALETTE.mint} stroke={INK} strokeWidth={line(s) * 0.4} />;
          })}
        </g>
      </g>
    );
  },
  // an alarm clock that rattles; state "ring" shakes harder
  alarmclock: ({ s, t, state }) => {
    const shake = state === "ring" ? Math.sin(t * 40) * 6 : Math.sin(t * 4) * 1.5;
    return (
      <g transform={`rotate(${shake},0,${-s * 0.4})`}>
        <Shadow w={s * 0.6} s={s} />
        <circle cx={-s * 0.22} cy={-s * 0.82} r={s * 0.1} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
        <circle cx={s * 0.22} cy={-s * 0.82} r={s * 0.1} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
        <Ball cx={0} cy={-s * 0.48} rx={s * 0.34} fill={PALETTE.red} s={s} />
        <circle cx={0} cy={-s * 0.48} r={s * 0.26} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.7} />
        <line x1={0} y1={-s * 0.48} x2={0} y2={-s * 0.66} stroke={INK} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
        <line x1={0} y1={-s * 0.48} x2={Math.cos(t) * s * 0.14} y2={-s * 0.48 + Math.sin(t) * s * 0.14} stroke={PALETTE.red} strokeWidth={line(s)} strokeLinecap="round" />
      </g>
    );
  },
  // a trapdoor in the floor; k 0..1 = how far it has swung open
  trapdoor: ({ s, k }) => {
    const o = k ?? 0;
    return (
      <g>
        <ellipse cx={0} cy={-s * 0.05} rx={s * 0.62} ry={s * 0.14} fill={PALETTE.dark} />
        <ellipse cx={0} cy={-s * 0.05} rx={s * 0.5} ry={s * 0.1} fill="#0b0d14" />
        <g transform={`translate(${-s * 0.5},${-s * 0.05}) rotate(${-o * 75})`}>
          <Box x={0} y={-s * 0.06} w={s * 1.0} h={s * 0.12} fill={PALETTE.brown} s={s} r={0.1} />
          <rect x={s * 0.15} y={-s * 0.06} width={s * 0.04} height={s * 0.12} fill={shade(PALETTE.brown, -0.3)} />
          <rect x={s * 0.6} y={-s * 0.06} width={s * 0.04} height={s * 0.12} fill={shade(PALETTE.brown, -0.3)} />
        </g>
      </g>
    );
  },
  // a green exit door with a lit sign; state "open" swings it open on light
  exitdoor: ({ s, t, state }) => {
    const open = state === "open";
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <rect x={-s * 0.34} y={-s * 1.0} width={s * 0.68} height={s * 1.0} fill={open ? PALETTE.yellow : PALETTE.dark} stroke={INK} strokeWidth={line(s)} opacity={open ? 0.85 + 0.15 * Math.sin(t * 2) : 1} />
        <g transform={`translate(${-s * 0.34},0) scale(${open ? 0.35 : 1},1)`}>
          <Box x={0} y={-s * 1.0} w={s * 0.68} h={s * 1.0} fill={PALETTE.green} s={s} r={0.02} />
          <circle cx={s * 0.56} cy={-s * 0.5} r={s * 0.04} fill={PALETTE.gold} />
        </g>
        <Box x={-s * 0.26} y={-s * 1.22} w={s * 0.52} h={s * 0.16} fill={PALETTE.green} s={s} r={0.2} />
        <Paint x={0} y={-s * 1.105} text="EXIT" size={s * 0.11} fill={PALETTE.white} />
      </g>
    );
  },
};

export default props;
