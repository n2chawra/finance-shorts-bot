/**
 * The things "How airlines really make money" is about, drawn for this video: the jet (which can
 * peel open to show the bank inside), the boarding pass, the cabin seat, the fuel can, the
 * suitcase with its fee tag, the departures board of fares, the cargo crate and the mail sack, the
 * winged miles coin, the press that prints miles, the airline credit card, the shop's card reader,
 * the bank hall, the annual-fee letter, the savings jar, the lounge chair and the shop till.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a passenger jet seen from the side; state "peel": the fuselage skin lifts away and a gold vault shows inside
  jet: ({ s, t, state, k }) => {
    const peel = state === "peel" ? 1 : (k ?? 0);
    const L = s * 1.9, body = s * 0.34;
    return (
      <g transform={`translate(0,${bob(t, s, 1.2, 0.012) - s * 0.1})`}>
        <Shadow w={L * 0.8} s={s} />
        {/* tail fin */}
        <Shape d={`M${-L * 0.42},${-s * 0.42} L${-L * 0.52},${-s * 0.95} L${-L * 0.38},${-s * 0.95} L${-L * 0.2},${-s * 0.46} Z`} fill={PALETTE.red} s={s} />
        {/* the vault that sits inside the body */}
        <g opacity={peel}>
          <rect x={-L * 0.4} y={-s * 0.62} width={L * 0.8} height={body} rx={body * 0.45} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-L * 0.3 + i * L * 0.13} y={-s * 0.56} width={L * 0.09} height={body * 0.62} rx={s * 0.02} fill={shade(PALETTE.gold, -0.2)} stroke={INK} strokeWidth={line(s) * 0.5} />)}
        </g>
        {/* the skin of the body, lifting off when it peels */}
        <g transform={`translate(0,${-peel * s * 0.9}) rotate(${-peel * 8})`} opacity={1 - peel * 0.85}>
          <rect x={-L * 0.45} y={-s * 0.64} width={L * 0.95} height={body} rx={body * 0.48} fill={PALETTE.white} stroke={INK} strokeWidth={line(s)} />
          <path d={`M${L * 0.5},${-s * 0.47} q${s * 0.2},${s * 0.02} ${s * 0.02},${s * 0.17}`} fill={PALETTE.white} stroke={INK} strokeWidth={line(s)} />
          <rect x={-L * 0.45} y={-s * 0.44} width={L * 0.95} height={s * 0.05} fill={PALETTE.blue} />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-L * 0.3 + i * L * 0.075} cy={-s * 0.53} r={s * 0.025} fill={PALETTE.navy} />)}
          <path d={`M${L * 0.36},${-s * 0.58} l${s * 0.1},0 l${s * 0.05},${s * 0.06} l${-s * 0.15},0 Z`} fill={PALETTE.navy} />
        </g>
        {/* the wing */}
        <Shape d={`M${-L * 0.05},${-s * 0.4} L${L * 0.16},${-s * 0.4} L${-L * 0.12},${-s * 0.08} L${-L * 0.24},${-s * 0.08} Z`} fill={shade(PALETTE.grey, 0.2)} s={s} />
        <Box x={-L * 0.12} y={-s * 0.24} w={s * 0.24} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.45} />
        {/* the BANK sign, drawn last on its own plate above the wing so nothing covers it mid-peel */}
        <g opacity={peel}>
          <rect x={-s * 0.32} y={-s * 0.61} width={s * 0.64} height={s * 0.18} rx={s * 0.04} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.6} />
          <Paint x={0} y={-s * 0.466} text="BANK" size={s * 0.14} fill={PALETTE.gold} />
        </g>
      </g>
    );
  },
  // a boarding pass with its stub
  boardingpass: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-6)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s * 0.72} h={s * 0.6} fill={PALETTE.white} s={s} r={0.08} sheen={false} />
      <Box x={s * 0.22} y={-s * 0.62} w={s * 0.28} h={s * 0.6} fill={shade(PALETTE.blue, 0.45)} s={s} r={0.08} sheen={false} />
      <rect x={-s * 0.5} y={-s * 0.62} width={s * 0.72} height={s * 0.14} fill={PALETTE.blue} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={-s * 0.14} y={-s * 0.51} text="BOARDING" size={s * 0.08} fill="#fff" />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.42} y={-s * (0.38 - i * 0.1)} width={s * (0.5 - (i % 2) * 0.14)} height={s * 0.035} rx={s * 0.017} fill={PALETTE.grey} opacity={0.7} />)}
      <Shape d={`M${s * 0.3},${-s * 0.4} l${s * 0.12},${s * 0.06} l${-s * 0.12},${s * 0.06} z`} fill={PALETTE.navy} s={s} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={s * 0.26 + i * s * 0.035} y={-s * 0.18} width={s * 0.018} height={s * 0.1} fill={INK} />)}
    </g>
  ),
  // a cabin seat; state "premium": wider, gold, with a glow
  airseat: ({ s, t, state }) => {
    const prem = state === "premium";
    const c = prem ? PALETTE.gold : PALETTE.blue;
    return (
      <g transform={`translate(0,${bob(t, s, 1.1, 0.008)})`}>
        <Shadow w={s * 0.8} s={s} />
        {prem && <ellipse cx={0} cy={-s * 0.5} rx={s * 0.55} ry={s * 0.55} fill={PALETTE.yellow} opacity={0.25 + 0.1 * Math.sin(t * 4)} />}
        <rect x={-s * 0.05} y={-s * 0.2} width={s * 0.1} height={s * 0.2} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Box x={-s * 0.34} y={-s * 0.95} w={s * 0.5} h={s * 0.62} fill={c} s={s} r={0.25} />
        <Box x={-s * 0.3} y={-s * 1.05} w={s * 0.42} h={s * 0.16} fill={PALETTE.white} s={s} r={0.4} sheen={false} />
        <Box x={-s * 0.4} y={-s * 0.4} w={s * 0.78} h={s * 0.2} fill={shade(c, 0.1)} s={s} r={0.35} />
        <Box x={s * 0.22} y={-s * 0.58} w={s * 0.2} h={s * 0.08} fill={shade(c, -0.15)} s={s} r={0.4} sheen={false} />
      </g>
    );
  },
  // a red jerry can of jet fuel
  fuelcan: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.01)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 0.8} w={s * 0.62} h={s * 0.78} fill={PALETTE.red} s={s} r={0.12} />
      <path d={`M${s * 0.12},${-s * 0.8} l${s * 0.1},${-s * 0.14} l${s * 0.12},0`} fill="none" stroke={INK} strokeWidth={line(s) * 1.6} strokeLinecap="round" />
      <rect x={-s * 0.22} y={-s * 0.92} width={s * 0.24} height={s * 0.1} rx={s * 0.03} fill={shade(PALETTE.red, -0.2)} stroke={INK} strokeWidth={line(s)} />
      <path d={`M${-s * 0.22},${-s * 0.62} L${s * 0.2},${-s * 0.2} M${s * 0.2},${-s * 0.62} L${-s * 0.22},${-s * 0.2}`} stroke={shade(PALETTE.red, -0.25)} strokeWidth={line(s) * 1.4} />
      <Paint x={0} y={-s * 0.34} text="FUEL" size={s * 0.16} fill="#fff" />
    </g>
  ),
  // a wheeled suitcase with a swinging fee tag
  suitcase: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.12},${-s * 0.84} v${-s * 0.18} h${s * 0.24} v${s * 0.18}`} fill="none" stroke={INK} strokeWidth={line(s) * 1.5} />
      <Box x={-s * 0.34} y={-s * 0.86} w={s * 0.68} h={s * 0.78} fill={PALETTE.purple} s={s} r={0.12} />
      {[-0.16, 0, 0.16].map((x) => <rect key={x} x={s * x - s * 0.015} y={-s * 0.8} width={s * 0.03} height={s * 0.66} fill={shade(PALETTE.purple, -0.2)} />)}
      <Ball cx={-s * 0.22} cy={-s * 0.04} rx={s * 0.05} fill={INK} s={s} />
      <Ball cx={s * 0.22} cy={-s * 0.04} rx={s * 0.05} fill={INK} s={s} />
      <g transform={`translate(${s * 0.3},${-s * 0.72}) rotate(${20 + Math.sin(t * 3) * 12})`}>
        <line x1={0} y1={0} x2={0} y2={s * 0.14} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Box x={-s * 0.1} y={s * 0.12} w={s * 0.2} h={s * 0.24} fill={PALETTE.yellow} s={s} r={0.1} sheen={false} />
        <Paint x={0} y={s * 0.29} text="FEE" size={s * 0.08} />
      </g>
    </g>
  ),
  // the departures board: rows of fares; k (0..1) is how many rows are lit (cheap at the bottom, dear at the top)
  fareboard: ({ s, t, k }) => {
    const lit = Math.round((k ?? 1) * 5);
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        <rect x={-s * 0.04} y={-s * 0.2} width={s * 0.08} height={s * 0.2} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Box x={-s * 0.6} y={-s * 1.02} w={s * 1.2} h={s * 0.84} fill={PALETTE.dark} s={s} r={0.06} sheen={false} />
        {Array.from({ length: 5 }, (_, i) => {
          const on = 4 - i < lit;
          const col = [PALETTE.red, PALETTE.orange, PALETTE.yellow, PALETTE.mint, PALETTE.green][i]!;
          return (
            <g key={i}>
              <rect x={-s * 0.52} y={-s * (0.95 - i * 0.15)} width={s * 1.04} height={s * 0.11} rx={s * 0.02} fill={on ? col : "#3a4258"} opacity={on ? 0.9 + 0.1 * Math.sin(t * 5 + i) : 1} />
              <rect x={-s * 0.46} y={-s * (0.92 - i * 0.15)} width={s * 0.4} height={s * 0.05} rx={s * 0.02} fill={INK} opacity={on ? 0.5 : 0.2} />
            </g>
          );
        })}
      </g>
    );
  },
  // a wooden cargo crate with a fragile stencil
  crate: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.4, 0.006)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.44} y={-s * 0.8} w={s * 0.88} h={s * 0.78} fill={PALETTE.tan} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.44} y={-s * 0.8} width={s * 0.88} height={s * 0.78} fill="none" stroke={PALETTE.brown} strokeWidth={line(s) * 2} />
      <path d={`M${-s * 0.4},${-s * 0.76} L${s * 0.4},${-s * 0.06} M${s * 0.4},${-s * 0.76} L${-s * 0.4},${-s * 0.06}`} stroke={PALETTE.brown} strokeWidth={line(s) * 1.6} />
      <rect x={-s * 0.3} y={-s * 0.52} width={s * 0.6} height={s * 0.18} rx={s * 0.03} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.39} text="CARGO" size={s * 0.12} fill={PALETTE.red} />
    </g>
  ),
  // a canvas sack of mail with letters poking out
  mailbag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 2})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.3},${-s * 0.7} q${-s * 0.18},${s * 0.4} ${-s * 0.06},${s * 0.68} h${s * 0.72} q${s * 0.12},${-s * 0.28} ${-s * 0.06},${-s * 0.68} Z`} fill={shade(PALETTE.tan, -0.1)} s={s} />
      {[-0.12, 0.02, 0.14].map((x, i) => <rect key={x} x={s * x - s * 0.08} y={-s * (0.86 - i * 0.03)} width={s * 0.16} height={s * 0.12} rx={s * 0.02} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.6} transform={`rotate(${(i - 1) * 12} ${s * x} ${-s * 0.8})`} />)}
      <rect x={-s * 0.32} y={-s * 0.72} width={s * 0.64} height={s * 0.06} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.28} text="MAIL" size={s * 0.15} fill={PALETTE.navy} />
    </g>
  ),
  // a gold coin with wings: one airline mile
  milescoin: ({ s, t }) => {
    const flap = Math.sin(t * 7) * 10;
    return (
      <g transform={`translate(0,${bob(t, s, 2.2, 0.03) - s * 0.5})`}>
        <g transform={`rotate(${-flap})`}><Shape d={`M${-s * 0.24},${-s * 0.05} q${-s * 0.3},${-s * 0.3} ${-s * 0.5},${-s * 0.1} q${s * 0.16},${s * 0.04} ${s * 0.12},${s * 0.12} q${s * 0.16},${s * 0.02} ${s * 0.38},${s * 0.03} z`} fill={PALETTE.white} s={s} /></g>
        <g transform={`rotate(${flap})`}><Shape d={`M${s * 0.24},${-s * 0.05} q${s * 0.3},${-s * 0.3} ${s * 0.5},${-s * 0.1} q${-s * 0.16},${s * 0.04} ${-s * 0.12},${s * 0.12} q${-s * 0.16},${s * 0.02} ${-s * 0.38},${s * 0.03} z`} fill={PALETTE.white} s={s} /></g>
        <Ball cx={0} cy={0} rx={s * 0.3} fill={PALETTE.gold} s={s} />
        <circle cx={0} cy={0} r={s * 0.22} fill="none" stroke={shade(PALETTE.gold, -0.25)} strokeWidth={line(s)} />
        <Paint x={0} y={s * 0.08} text="M" size={s * 0.24} fill={shade(PALETTE.gold, -0.45)} />
      </g>
    );
  },
  // the press that prints miles: a heavy machine with a coin chute; k (0..1) is how fast it runs
  mintpress: ({ s, t, k }) => {
    const sp = 4 + (k ?? 0.5) * 10;
    const ram = Math.abs(Math.sin(t * sp)) * s * 0.1;
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        <Box x={-s * 0.5} y={-s * 0.3} w={s} h={s * 0.28} fill={PALETTE.navy} s={s} r={0.08} />
        <Box x={-s * 0.42} y={-s * 1.0} w={s * 0.18} h={s * 0.72} fill={PALETTE.grey} s={s} r={0.1} />
        <Box x={s * 0.24} y={-s * 1.0} w={s * 0.18} h={s * 0.72} fill={PALETTE.grey} s={s} r={0.1} />
        <Box x={-s * 0.5} y={-s * 1.12} w={s} h={s * 0.16} fill={PALETTE.navy} s={s} r={0.12} />
        <Box x={-s * 0.2} y={-s * 0.96 + ram} w={s * 0.4} h={s * 0.26} fill={PALETTE.red} s={s} r={0.1} />
        <Paint x={0} y={-s * 1.0} text="MILES" size={s * 0.1} fill="#fff" />
        {[0, 1, 2].map((i) => {
          const d = ((t * sp * 0.12 + i / 3) % 1);
          return <Ball key={i} cx={s * (0.5 + d * 0.3)} cy={-s * 0.2 + d * s * 0.16} rx={s * 0.07} fill={PALETTE.gold} s={s} />;
        })}
      </g>
    );
  },
  // the airline credit card, wings printed on it
  wingcard: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 1.8, 0.02) - s * 0.15}) rotate(${-8 + Math.sin(t * 1.3) * 3})`}>
      <Shadow w={s * 0.9} s={s} />
      {state === "glow" && <ellipse cx={0} cy={-s * 0.3} rx={s * 0.7} ry={s * 0.45} fill={PALETTE.yellow} opacity={0.3} />}
      <Box x={-s * 0.5} y={-s * 0.62} w={s} h={s * 0.62} fill={PALETTE.navy} s={s} r={0.1} />
      <rect x={-s * 0.38} y={-s * 0.44} width={s * 0.18} height={s * 0.13} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Shape d={`M${s * 0.06},${-s * 0.38} q${s * 0.16},${-s * 0.14} ${s * 0.34},${-s * 0.06} q${-s * 0.12},${s * 0.02} ${-s * 0.1},${s * 0.06} q${-s * 0.1},${0} ${-s * 0.24},${0} z`} fill={PALETTE.gold} s={s} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.38 + i * s * 0.2} y={-s * 0.2} width={s * 0.14} height={s * 0.04} rx={s * 0.02} fill="#fff" opacity={0.6} />)}
    </g>
  ),
  // the shop's card reader on its counter; state "paid" shows a green tick on the screen
  cardreader: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.24} y={-s * 0.9} w={s * 0.48} h={s * 0.88} fill={PALETTE.dark} s={s} r={0.14} />
      <rect x={-s * 0.17} y={-s * 0.8} width={s * 0.34} height={s * 0.26} rx={s * 0.03} fill={state === "paid" ? PALETTE.green : PALETTE.mint} opacity={0.85 + 0.15 * Math.sin(t * 6)} />
      {state === "paid" && <path d={`M${-s * 0.08},${-s * 0.67} l${s * 0.06},${s * 0.06} l${s * 0.12},${-s * 0.12}`} fill="none" stroke="#fff" strokeWidth={line(s) * 1.4} strokeLinecap="round" />}
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-s * 0.15 + c * s * 0.11} y={-s * (0.46 - r * 0.11)} width={s * 0.08} height={s * 0.07} rx={s * 0.015} fill={PALETTE.grey} />))}
    </g>
  ),
  // a bank hall: columns, steps and a gold dome; k (0..1) its glow
  bankhall: ({ s, t, k }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      {(k ?? 0) > 0 && <ellipse cx={0} cy={-s * 0.6} rx={s * 0.9} ry={s * 0.7} fill={PALETTE.yellow} opacity={(k ?? 0) * (0.25 + 0.08 * Math.sin(t * 3))} />}
      <Box x={-s * 0.66} y={-s * 0.12} w={s * 1.32} h={s * 0.12} fill={PALETTE.grey} s={s} r={0.1} />
      {[-0.46, -0.16, 0.16, 0.46].map((x) => <Box key={x} x={s * x - s * 0.06} y={-s * 0.66} w={s * 0.12} h={s * 0.54} fill={PALETTE.white} s={s} r={0.2} />)}
      <Box x={-s * 0.62} y={-s * 0.78} w={s * 1.24} h={s * 0.12} fill={PALETTE.cream} s={s} r={0.1} />
      <Shape d={`M${-s * 0.3},${-s * 0.78} q${s * 0.3},${-s * 0.42} ${s * 0.6},0 Z`} fill={PALETTE.gold} s={s} />
      <Paint x={0} y={-s * 0.69} text="BANK" size={s * 0.09} fill={PALETTE.navy} />
    </g>
  ),
  // the annual-fee letter: an envelope with a red FEE seal; state "open" shows the bill sliding out
  feeletter: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(4)`}>
      <Shadow w={s * 0.9} s={s} />
      {state === "open" && (
        <g transform={`translate(0,${-s * 0.3})`}>
          <Box x={-s * 0.32} y={-s * 0.6} w={s * 0.64} h={s * 0.5} fill={PALETTE.white} s={s} r={0.04} sheen={false} />
          {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.24} y={-s * (0.5 - i * 0.1)} width={s * (0.46 - (i % 2) * 0.16)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} />)}
        </g>
      )}
      <Box x={-s * 0.46} y={-s * 0.62} w={s * 0.92} h={s * 0.6} fill={PALETTE.cream} s={s} r={0.06} sheen={false} />
      <path d={`M${-s * 0.46},${-s * 0.62} L0,${-s * 0.28} L${s * 0.46},${-s * 0.62}`} fill="none" stroke={INK} strokeWidth={line(s)} />
      <Ball cx={0} cy={-s * 0.3} rx={s * 0.11} fill={PALETTE.red} s={s} />
      <Paint x={0} y={-s * 0.1} text="ANNUAL FEE" size={s * 0.08} fill={PALETTE.red} />
    </g>
  ),
  // a glass savings jar; k (0..1) how full of coins
  savejar: ({ s, t, k }) => {
    const f = k ?? 0.3;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.3} y={-s * 0.8} width={s * 0.6} height={s * 0.78} rx={s * 0.12} fill="#dff4ff" opacity={0.55} stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.26} y={-s * 0.06 - f * s * 0.66} width={s * 0.52} height={f * s * 0.66} rx={s * 0.08} fill={PALETTE.gold} opacity={0.9} />
        {Array.from({ length: Math.round(f * 6) }, (_, i) => <circle key={i} cx={-s * 0.16 + (i % 3) * s * 0.16} cy={-s * 0.14 - Math.floor(i / 3) * s * 0.14} r={s * 0.05} fill={shade(PALETTE.gold, -0.15)} stroke={INK} strokeWidth={line(s) * 0.4} />)}
        <Box x={-s * 0.24} y={-s * 0.92} w={s * 0.48} h={s * 0.12} fill={PALETTE.green} s={s} r={0.3} />
        <ellipse cx={-s * 0.14} cy={-s * 0.6} rx={s * 0.04} ry={s * 0.14} fill="#fff" opacity={0.5 + 0.2 * Math.sin(t * 2)} />
      </g>
    );
  },
  // an airport lounge armchair with a little table and a drink
  lounge: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.5} y={-s * 0.72} w={s * 0.7} h={s * 0.5} fill={PALETTE.teal} s={s} r={0.3} />
      <Box x={-s * 0.56} y={-s * 0.36} w={s * 0.82} h={s * 0.26} fill={shade(PALETTE.teal, 0.15)} s={s} r={0.35} />
      <Box x={-s * 0.6} y={-s * 0.54} w={s * 0.14} h={s * 0.4} fill={shade(PALETTE.teal, -0.15)} s={s} r={0.4} />
      <Box x={s * 0.14} y={-s * 0.54} w={s * 0.14} h={s * 0.4} fill={shade(PALETTE.teal, -0.15)} s={s} r={0.4} />
      <rect x={s * 0.36} y={-s * 0.4} width={s * 0.28} height={s * 0.05} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.48} y={-s * 0.36} width={s * 0.04} height={s * 0.34} fill={PALETTE.brown} />
      <path d={`M${s * 0.44},${-s * 0.58} l${s * 0.16},0 l${-s * 0.08},${s * 0.12} z M${s * 0.52},${-s * 0.46} v${s * 0.06}`} fill={PALETTE.orange} stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={s * 0.56} cy={-s * 0.6 + bob(t, s, 3, 0.02)} r={s * 0.02} fill={PALETTE.mint} />
    </g>
  ),
  // a shop till with a price display; state "up" lifts a little red arrow over the price
  till: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.5} y={-s * 0.42} w={s} h={s * 0.4} fill={PALETTE.orange} s={s} r={0.08} />
      <Box x={-s * 0.4} y={-s * 0.56} w={s * 0.8} h={s * 0.16} fill={shade(PALETTE.orange, 0.2)} s={s} r={0.1} sheen={false} />
      <Box x={-s * 0.2} y={-s * 0.92} w={s * 0.4} h={s * 0.28} fill={PALETTE.dark} s={s} r={0.08} sheen={false} />
      <rect x={-s * 0.15} y={-s * 0.86} width={s * 0.3} height={s * 0.14} rx={s * 0.02} fill={PALETTE.mint} opacity={0.8} />
      {state === "up" && <Shape d={`M${s * 0.3},${-s * 0.8 - bob(t, s, 4, 0.04)} l${s * 0.1},${-s * 0.14} l${s * 0.1},${s * 0.14} h${-s * 0.06} v${s * 0.12} h${-s * 0.08} v${-s * 0.12} z`} fill={PALETTE.red} s={s} />}
      <rect x={-s * 0.3} y={-s * 0.3} width={s * 0.6} height={s * 0.05} rx={s * 0.02} fill={shade(PALETTE.orange, -0.25)} />
    </g>
  ),
};

export default props;
