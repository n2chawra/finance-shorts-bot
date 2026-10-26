/**
 * The things "Every way billionaires avoid paying tax, explained" is about, drawn for this video:
 * Rohan's payslip with a bite taken out, Sharma's tower of share certificates, the tax tin, the
 * briefcase of borrowed cash, the will, the price tag that resets, the family foundation, the gift
 * box, the seesaw of winners and losers, the CEO's throne, the nest egg under its umbrella, the tax
 * cloud, the rulebook and the front door the tax collector knocks on.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a payslip with a bite out of its corner (state "bitten": a big bite)
  payslip: ({ s, t, state }) => {
    const b = state === "bitten" ? 0.22 : 0.12;
    return (
      <g transform={`translate(0,${bob(t, s)}) rotate(-4)`}>
        <Shadow w={s * 0.7} s={s} />
        <Shape d={`M${-s * 0.34},${-s * 1.0} L${s * (0.34 - b)},${-s * 1.0} q${s * b * 0.3},${s * b * 0.6} ${s * b},${s * b} L${s * 0.34},${-s * 0.02} L${-s * 0.34},${-s * 0.02} Z`} fill={PALETTE.white} s={s} />
        <rect x={-s * 0.34} y={-s * 1.0} width={s * 0.18} height={s * 0.98} fill={PALETTE.mint} opacity={0.35} />
        <Paint x={-s * 0.02} y={-s * 0.82} text="PAY" size={s * 0.13} fill={PALETTE.navy} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-s * 0.24} y={-s * (0.68 - i * 0.1)} width={s * (0.46 - (i % 2) * 0.14)} height={s * 0.035} rx={s * 0.017} fill={PALETTE.grey} opacity={0.6} />)}
        <rect x={-s * 0.24} y={-s * 0.16} width={s * 0.48} height={s * 0.06} rx={s * 0.02} fill={PALETTE.red} />
      </g>
    );
  },
  // a tall tower of green share certificates; k (0..1) is how tall it has grown
  certificates: ({ s, t, k }) => {
    const n = 3 + Math.round((k ?? 0.6) * 7);
    return (
      <g transform={`translate(0,${bob(t, s, 1.2, 0.01)})`}>
        <Shadow w={s * 0.8} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${Math.sin(i * 1.7) * s * 0.03},${-i * s * 0.11}) rotate(${Math.sin(i * 2.3) * 3})`}>
            <Box x={-s * 0.36} y={-s * 0.12} w={s * 0.72} h={s * 0.11} fill={i % 2 ? PALETTE.cream : shade(PALETTE.cream, -0.05)} s={s} r={0.1} sheen={false} />
            <rect x={-s * 0.3} y={-s * 0.1} width={s * 0.6} height={s * 0.07} rx={s * 0.01} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.6} />
          </g>
        ))}
        <g transform={`translate(${s * 0.22},${-n * s * 0.11 - s * 0.02})`}><Ball cx={0} cy={0} rx={s * 0.07} fill={PALETTE.gold} s={s} /></g>
      </g>
    );
  },
  // the tax tin: a round collection tin with a slot; state "empty" rattles, "full" overflows
  taxtin: ({ s, t, state }) => {
    const rattle = state === "empty" ? Math.sin(t * 18) * 2 : 0;
    return (
      <g transform={`rotate(${rattle})`}>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.34} y={-s * 0.78} w={s * 0.68} h={s * 0.76} fill={PALETTE.red} s={s} r={0.2} />
        <ellipse cx={0} cy={-s * 0.78} rx={s * 0.34} ry={s * 0.08} fill={shade(PALETTE.red, 0.25)} stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.14} y={-s * 0.8} width={s * 0.28} height={s * 0.04} rx={s * 0.02} fill={INK} />
        <Paint x={0} y={-s * 0.32} text="TAX" size={s * 0.22} fill="#fff" />
        {state === "full" && [0, 1, 2].map((i) => <Ball key={i} cx={(i - 1) * s * 0.16} cy={-s * 0.9 - (i % 2) * s * 0.08} rx={s * 0.08} fill={PALETTE.gold} s={s} />)}
      </g>
    );
  },
  // a briefcase of borrowed cash; state "open" shows the notes
  briefcase: ({ s, state }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <path d={`M${-s * 0.16},${-s * 0.62} v${-s * 0.1} h${s * 0.32} v${s * 0.1}`} fill="none" stroke={INK} strokeWidth={line(s) * 1.6} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s} h={s * 0.6} fill={PALETTE.brown} s={s} r={0.08} />
      <rect x={-s * 0.06} y={-s * 0.42} width={s * 0.12} height={s * 0.1} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      {state === "open" && [0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${(i - 1) * s * 0.28},${-s * 0.7}) rotate(${(i - 1) * 8})`}>
          <rect x={-s * 0.13} y={-s * 0.08} width={s * 0.26} height={s * 0.14} rx={s * 0.02} fill="#8fd18a" stroke={INK} strokeWidth={line(s) * 0.6} />
        </g>
      ))}
    </g>
  ),
  // the will: a scroll with a red wax seal
  will: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.3} y={-s * 0.92} w={s * 0.6} h={s * 0.82} fill={PALETTE.tan} s={s} r={0.04} sheen={false} />
      <Ball cx={0} cy={-s * 0.94} rx={s * 0.34} ry={s * 0.06} fill={shade(PALETTE.tan, -0.15)} s={s} />
      <Ball cx={0} cy={-s * 0.1} rx={s * 0.34} ry={s * 0.06} fill={shade(PALETTE.tan, -0.15)} s={s} />
      <Paint x={0} y={-s * 0.74} text="WILL" size={s * 0.13} fill={PALETTE.brown} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.2} y={-s * (0.62 - i * 0.1)} width={s * (0.4 - (i % 2) * 0.12)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.brown} opacity={0.5} />)}
      <Ball cx={s * 0.14} cy={-s * 0.26} rx={s * 0.09} fill={PALETTE.red} s={s} />
    </g>
  ),
  // the price tag the gain is measured from; state "reset" turns it green and fresh
  pricetag: ({ s, t, state }) => {
    const fresh = state === "reset";
    return (
      <g transform={`rotate(${-12 + Math.sin(t * 2) * 4})`}>
        <path d={`M0,${-s * 1.0} q${s * 0.2},${s * 0.1} 0,${s * 0.22}`} fill="none" stroke={INK} strokeWidth={line(s)} />
        <Shape d={`M${-s * 0.3},${-s * 0.7} L0,${-s * 0.82} L${s * 0.3},${-s * 0.7} L${s * 0.3},${-s * 0.04} L${-s * 0.3},${-s * 0.04} Z`} fill={fresh ? PALETTE.green : PALETTE.yellow} s={s} />
        <circle cx={0} cy={-s * 0.68} r={s * 0.04} fill={INK} />
        <Paint x={0} y={-s * 0.34} text={fresh ? "NEW" : "OLD"} size={s * 0.16} fill={fresh ? "#fff" : INK} />
      </g>
    );
  },
  // the family foundation: a stone hall with columns and a heart on the pediment
  foundation: ({ s }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.64} y={-s * 0.1} w={s * 1.28} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.1} />
      {[-0.44, -0.15, 0.15, 0.44].map((x) => <Box key={x} x={s * x - s * 0.06} y={-s * 0.62} w={s * 0.12} h={s * 0.52} fill={PALETTE.cream} s={s} r={0.2} />)}
      <Box x={-s * 0.6} y={-s * 0.72} w={s * 1.2} h={s * 0.1} fill={PALETTE.tan} s={s} r={0.1} />
      <Shape d={`M${-s * 0.66},${-s * 0.72} L0,${-s * 1.0} L${s * 0.66},${-s * 0.72} Z`} fill={PALETTE.tan} s={s} />
      <path d={`M0,${-s * 0.78} c${-s * 0.1},${-s * 0.08} ${-s * 0.06},${-s * 0.16} 0,${-s * 0.1} c${s * 0.06},${-s * 0.06} ${s * 0.1},${s * 0.02} 0,${s * 0.1} z`} fill={PALETTE.pink} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a gift box with a bow
  giftbox: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.4, 0.02)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.36} y={-s * 0.6} w={s * 0.72} h={s * 0.58} fill={PALETTE.purple} s={s} r={0.06} />
      <Box x={-s * 0.4} y={-s * 0.72} w={s * 0.8} h={s * 0.16} fill={shade(PALETTE.purple, 0.15)} s={s} r={0.08} />
      <rect x={-s * 0.06} y={-s * 0.72} width={s * 0.12} height={s * 0.7} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Shape d={`M0,${-s * 0.72} q${-s * 0.3},${-s * 0.26} ${-s * 0.2},${-s * 0.02} z`} fill={PALETTE.gold} s={s} />
      <Shape d={`M0,${-s * 0.72} q${s * 0.3},${-s * 0.26} ${s * 0.2},${-s * 0.02} z`} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // a seesaw: k (-1..1) tips it; balanced at 0
  seesaw: ({ s, k }) => {
    const tilt = (k ?? 0) * 14;
    return (
      <g>
        <Shadow w={s * 1.2} s={s} />
        <Shape d={`M${-s * 0.16},0 L0,${-s * 0.3} L${s * 0.16},0 Z`} fill={PALETTE.grey} s={s} />
        <g transform={`translate(0,${-s * 0.32}) rotate(${tilt})`}>
          <Box x={-s * 0.75} y={-s * 0.05} w={s * 1.5} h={s * 0.08} fill={PALETTE.brown} s={s} r={0.4} />
          <Box x={-s * 0.72} y={-s * 0.24} w={s * 0.22} h={s * 0.2} fill={PALETTE.green} s={s} r={0.15} />
          <Box x={s * 0.5} y={-s * 0.24} w={s * 0.22} h={s * 0.2} fill={PALETTE.red} s={s} r={0.15} />
        </g>
      </g>
    );
  },
  // a winning stock: a green arrow climbing out of a share card
  winner: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.02)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 0.5} w={s * 0.64} h={s * 0.48} fill={PALETTE.cream} s={s} r={0.06} />
      <Shape d={`M${-s * 0.24},${-s * 0.12} L${-s * 0.04},${-s * 0.34} L${s * 0.06},${-s * 0.24} L${s * 0.24},${-s * 0.6} L${s * 0.14},${-s * 0.62} L${s * 0.32},${-s * 0.82} L${s * 0.38},${-s * 0.56} L${s * 0.3},${-s * 0.6} L${s * 0.1},${-s * 0.16} L${-s * 0.02},${-s * 0.24} L${-s * 0.2},${-s * 0.04} Z`} fill={PALETTE.green} s={s} />
    </g>
  ),
  // a losing stock: a red arrow diving through a share card
  loser: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.02)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 0.62} w={s * 0.64} h={s * 0.48} fill={PALETTE.cream} s={s} r={0.06} />
      <Shape d={`M${-s * 0.26},${-s * 0.78} L${-s * 0.06},${-s * 0.5} L${s * 0.06},${-s * 0.6} L${s * 0.2},${-s * 0.2} L${s * 0.28},${-s * 0.24} L${s * 0.26},${-s * 0.02} L${s * 0.06},${-s * 0.1} L${s * 0.14},${-s * 0.14} L${s * 0.02},${-s * 0.44} L${-s * 0.08},${-s * 0.36} L${-s * 0.32},${-s * 0.7} Z`} fill={PALETTE.red} s={s} />
    </g>
  ),
  // the CEO's throne: a tall office chair in gold and purple
  throne: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.04} y={-s * 0.32} width={s * 0.08} height={s * 0.24} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M${-s * 0.3},${-s * 0.02} L${s * 0.3},${-s * 0.02} M0,${-s * 0.1} L0,${-s * 0.02}`} stroke={INK} strokeWidth={line(s) * 1.4} strokeLinecap="round" />
      <Box x={-s * 0.32} y={-s * 1.02} w={s * 0.64} h={s * 0.66} fill={PALETTE.purple} s={s} r={0.25} />
      <Box x={-s * 0.38} y={-s * 0.44} w={s * 0.76} h={s * 0.14} fill={shade(PALETTE.purple, -0.2)} s={s} r={0.3} />
      <Ball cx={0} cy={-s * 1.06} rx={s * 0.1} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // a nest with a golden egg; k (0..1) grows the egg
  nestegg: ({ s, t, k }) => {
    const e = 0.55 + 0.45 * (k ?? 0.4);
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <g transform={`translate(0,${-s * 0.2})`}>
          <Ball cx={0} cy={-s * 0.32 * e} rx={s * 0.26 * e} ry={s * 0.34 * e} fill={PALETTE.gold} s={s} />
          <ellipse cx={-s * 0.06} cy={-s * 0.44 * e} rx={s * 0.05} ry={s * 0.09} fill="#fff" opacity={0.4 + 0.2 * Math.sin(t * 3)} />
        </g>
        <Shape d={`M${-s * 0.46},${-s * 0.3} Q0,${s * 0.08} ${s * 0.46},${-s * 0.3} Q${s * 0.36},${-s * 0.02} 0,0 Q${-s * 0.36},${-s * 0.02} ${-s * 0.46},${-s * 0.3} Z`} fill={PALETTE.brown} s={s} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-s * 0.4 + i * s * 0.22},${-s * 0.24} q${s * 0.1},${s * 0.08} ${s * 0.2},0`} stroke={shade(PALETTE.brown, 0.3)} strokeWidth={line(s) * 0.7} fill="none" />)}
      </g>
    );
  },
  // an umbrella that shields what is under it
  umbrella: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 3})`}>
      <path d={`M0,${-s * 0.9} L0,${-s * 0.08} q0,${s * 0.08} ${-s * 0.08},${s * 0.08}`} fill="none" stroke={INK} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
      <Shape d={`M${-s * 0.6},${-s * 0.86} Q0,${-s * 1.36} ${s * 0.6},${-s * 0.86} Q${s * 0.45},${-s * 0.94} ${s * 0.3},${-s * 0.86} Q${s * 0.15},${-s * 0.94} 0,${-s * 0.86} Q${-s * 0.15},${-s * 0.94} ${-s * 0.3},${-s * 0.86} Q${-s * 0.45},${-s * 0.94} ${-s * 0.6},${-s * 0.86} Z`} fill={PALETTE.teal} s={s} />
    </g>
  ),
  // a grey cloud raining small red tax drops
  taxcloud: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.6})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = ((t * 1.4 + i * 0.37) % 1) * s * 0.55;
        return <path key={i} d={`M${(i - 2) * s * 0.18},${y} q${-s * 0.03},${s * 0.06} 0,${s * 0.08} q${s * 0.03},${-s * 0.02} 0,${-s * 0.08}`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />;
      })}
      <Ball cx={-s * 0.28} cy={-s * 0.06} rx={s * 0.24} ry={s * 0.18} fill={PALETTE.grey} s={s} />
      <Ball cx={s * 0.26} cy={-s * 0.06} rx={s * 0.26} ry={s * 0.18} fill={PALETTE.grey} s={s} />
      <Ball cx={0} cy={-s * 0.2} rx={s * 0.3} ry={s * 0.24} fill={shade(PALETTE.grey, 0.15)} s={s} />
      <Paint x={0} y={-s * 0.1} text="TAX" size={s * 0.14} fill={PALETTE.red} />
    </g>
  ),
  // the rulebook: a thick tax code with tabs sticking out
  rulebook: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-3)`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.36} y={-s * 0.5} w={s * 0.72} h={s * 0.48} fill={PALETTE.white} s={s} r={0.04} sheen={false} />
      <Box x={-s * 0.4} y={-s * 0.58} w={s * 0.8} h={s * 0.14} fill={PALETTE.navy} s={s} r={0.08} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={s * 0.36} y={-s * (0.44 - i * 0.1)} width={s * 0.08} height={s * 0.06} fill={[PALETTE.red, PALETTE.yellow, PALETTE.green, PALETTE.blue][i]} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Paint x={0} y={-s * 0.22} text="RULES" size={s * 0.13} fill={PALETTE.navy} />
    </g>
  ),
  // a front door with a brass knocker; state "open" swings it
  door: ({ s, state }) => {
    const open = state === "open";
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <Box x={-s * 0.32} y={-s * 1.0} w={s * 0.64} h={s * 0.98} fill={shade(PALETTE.brown, -0.3)} s={s} r={0.04} sheen={false} />
        <g transform={open ? `translate(${-s * 0.28},0) scale(0.25,1)` : undefined}>
          <Box x={-s * 0.28} y={-s * 0.96} w={s * 0.56} h={s * 0.94} fill={PALETTE.red} s={s} r={0.04} />
          <rect x={-s * 0.2} y={-s * 0.86} width={s * 0.4} height={s * 0.3} rx={s * 0.02} fill="none" stroke={shade(PALETTE.red, -0.3)} strokeWidth={line(s)} />
          <rect x={-s * 0.2} y={-s * 0.46} width={s * 0.4} height={s * 0.3} rx={s * 0.02} fill="none" stroke={shade(PALETTE.red, -0.3)} strokeWidth={line(s)} />
          <Ball cx={s * 0.18} cy={-s * 0.5} rx={s * 0.04} fill={PALETTE.gold} s={s} />
        </g>
      </g>
    );
  },
  // a doctor-style tax calculator: big buttons, a paper roll
  calculator: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8, 0.012)})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 0.86} w={s * 0.64} h={s * 0.84} fill={PALETTE.dark} s={s} r={0.08} />
      <rect x={-s * 0.24} y={-s * 0.78} width={s * 0.48} height={s * 0.16} rx={s * 0.02} fill={PALETTE.mint} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={-s * 0.22 + c * s * 0.16} y={-s * 0.54 + r * s * 0.16} width={s * 0.12} height={s * 0.11} rx={s * 0.02}
          fill={r === 2 && c === 2 ? PALETTE.orange : PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
      )))}
    </g>
  ),
};

export default props;
