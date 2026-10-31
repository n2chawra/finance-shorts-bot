/**
 * The things "Every burger you buy pays McDonald's rent" is about, drawn for this video only:
 * a burger restaurant on its corner, a burger, a meal tray, fries, the kitchen's grill, the
 * franchise owner in an apron, the staff's paper hat, the plot of land under the restaurant,
 * a RENT sign, the property deed, the landlord's key ring and a pair of risk dice.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a burger restaurant on a corner: red roof, yellow arch sign, lit windows; k (0..1) lights the sign
  diner: ({ s, t, k = 1 }) => (
    <g>
      <Shadow w={s * 1.9} s={s} />
      <Box x={-s * 0.85} y={-s * 0.62} w={s * 1.7} h={s * 0.62} fill={PALETTE.cream} s={s} r={0.03} />
      <Shape d={`M${-s * 0.95},${-s * 0.6} L${-s * 0.8},${-s * 0.82} L${s * 0.8},${-s * 0.82} L${s * 0.95},${-s * 0.6} Z`} fill={PALETTE.red} s={s} />
      {[-0.6, -0.3, 0.3, 0.6].map((x) => (
        <rect key={x} x={s * (x - 0.11)} y={-s * 0.5} width={s * 0.22} height={s * 0.24} rx={s * 0.02}
          fill={(Math.floor(t * 2) + Math.round(x * 10)) % 5 ? "#ffe9a8" : "#fff6d6"} stroke={INK} strokeWidth={line(s) * 0.6} />
      ))}
      <rect x={-s * 0.12} y={-s * 0.4} width={s * 0.24} height={s * 0.4} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      {/* the pole sign with a double arch */}
      <rect x={s * 0.98} y={-s * 1.25} width={s * 0.06} height={s * 1.25} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
      <g transform={`translate(${s * 1.01},${-s * 1.32})`}>
        <Box x={-s * 0.24} y={-s * 0.2} w={s * 0.48} h={s * 0.3} fill={PALETTE.red} s={s} r={0.1} />
        <path d={`M${-s * 0.17},${s * 0.06} Q${-s * 0.11},${-s * 0.24} ${-s * 0.04},${s * 0.06} Q${s * 0.02},${-s * 0.24} ${s * 0.08},${s * 0.06}`}
          fill="none" stroke={k > 0.5 ? PALETTE.yellow : shade(PALETTE.yellow, -0.4)} strokeWidth={s * 0.04} strokeLinecap="round" transform={`translate(${s * 0.045},0)`} />
      </g>
    </g>
  ),
  // a big burger: bun, lettuce, cheese, patty, bun; bobs a little
  burger: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.45} y={-s * 0.16} w={s * 0.9} h={s * 0.16} fill={PALETTE.gold} s={s} r={0.5} />
      <Box x={-s * 0.48} y={-s * 0.32} w={s * 0.96} h={s * 0.16} fill={PALETTE.brown} s={s} r={0.5} />
      <Shape d={`M${-s * 0.5},${-s * 0.32} L${s * 0.5},${-s * 0.32} L${s * 0.3},${-s * 0.24} L${s * 0.1},${-s * 0.33} L${-s * 0.1},${-s * 0.24} L${-s * 0.32},${-s * 0.33} Z`} fill={PALETTE.yellow} s={s} />
      <path d={`M${-s * 0.5},${-s * 0.36} q${s * 0.1},${s * 0.08} ${s * 0.2},0 t${s * 0.2},0 t${s * 0.2},0 t${s * 0.2},0 t${s * 0.2},0`} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.06} strokeLinecap="round" />
      <Shape d={`M${-s * 0.46},${-s * 0.38} Q${-s * 0.46},${-s * 0.8} 0,${-s * 0.8} Q${s * 0.46},${-s * 0.8} ${s * 0.46},${-s * 0.38} Z`} fill={PALETTE.gold} s={s} />
      {[[-0.2, -0.6], [0.05, -0.68], [0.22, -0.55], [-0.05, -0.5]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={s * x!} cy={s * y!} rx={s * 0.03} ry={s * 0.015} fill={PALETTE.cream} />)}
    </g>
  ),
  // a meal tray: burger, fries and a drink on a red tray, the paper liner
  tray: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Shape d={`M${-s * 0.65},${-s * 0.04} L${s * 0.65},${-s * 0.04} L${s * 0.58},${-s * 0.14} L${-s * 0.58},${-s * 0.14} Z`} fill={PALETTE.red} s={s} />
      <g transform={`translate(${-s * 0.28},${-s * 0.12}) scale(0.5)`}>{props.burger!({ s, t })}</g>
      <g transform={`translate(${s * 0.08},${-s * 0.12}) scale(0.55)`}>{props.fries!({ s, t })}</g>
      <Box x={s * 0.3} y={-s * 0.62} w={s * 0.22} h={s * 0.48} fill={PALETTE.white} s={s} r={0.1} />
      <rect x={s * 0.3} y={-s * 0.46} width={s * 0.22} height={s * 0.1} fill={PALETTE.red} />
      <line x1={s * 0.44} y1={-s * 0.62} x2={s * 0.5} y2={-s * 0.8} stroke={PALETTE.red} strokeWidth={s * 0.03} strokeLinecap="round" />
    </g>
  ),
  // a red carton of golden fries
  fries: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      {[-0.16, -0.08, 0, 0.08, 0.16].map((x, i) => (
        <rect key={x} x={s * (x - 0.03)} y={-s * (0.85 + 0.05 * Math.sin(i * 2 + t))} width={s * 0.06} height={s * 0.5} rx={s * 0.02}
          fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} transform={`rotate(${(x * 60)},${s * x},${-s * 0.4})`} />
      ))}
      <Shape d={`M${-s * 0.26},${-s * 0.55} L${s * 0.26},${-s * 0.55} L${s * 0.2},0 L${-s * 0.2},0 Z`} fill={PALETTE.red} s={s} />
      <path d={`M${-s * 0.1},${-s * 0.3} Q${-s * 0.05},${-s * 0.42} 0,${-s * 0.3} Q${s * 0.05},${-s * 0.42} ${s * 0.1},${-s * 0.3}`} fill="none" stroke={PALETTE.yellow} strokeWidth={s * 0.03} />
    </g>
  ),
  // the kitchen's grill: a steel counter, patties sizzling, steam rising
  stove: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.6} y={-s * 0.55} w={s * 1.2} h={s * 0.55} fill={PALETTE.grey} s={s} r={0.04} />
      <rect x={-s * 0.56} y={-s * 0.6} width={s * 1.12} height={s * 0.08} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[-0.35, -0.05, 0.25].map((x) => <ellipse key={x} cx={s * (x + 0.05)} cy={-s * 0.64} rx={s * 0.12} ry={s * 0.04} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      {[-0.3, 0, 0.3].map((x, i) => {
        const f = (t * 0.6 + i * 0.33) % 1;
        return <path key={x} d={`M${s * x},${-s * (0.7 + f * 0.4)} q${s * 0.05},${-s * 0.05} 0,${-s * 0.1} q${-s * 0.05},${-s * 0.05} 0,${-s * 0.1}`} fill="none" stroke="#ffffff" strokeWidth={line(s)} opacity={1 - f} />;
      })}
      {[-0.4, 0, 0.4].map((x) => <circle key={x} cx={s * x} cy={-s * 0.28} r={s * 0.05} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.4} />)}
    </g>
  ),
  // the franchise owner: a little shopkeeper in an apron holding a spatula, waving it
  owner: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.2} y={-s * 0.7} w={s * 0.4} h={s * 0.62} fill={PALETTE.blue} s={s} r={0.25} />
      <Box x={-s * 0.15} y={-s * 0.58} w={s * 0.3} h={s * 0.46} fill={PALETTE.white} s={s} r={0.1} />
      <rect x={-s * 0.14} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
      <rect x={s * 0.04} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
      <Ball cx={0} cy={-s * 0.84} rx={s * 0.16} fill={PALETTE.skin} s={s} />
      <circle cx={-s * 0.05} cy={-s * 0.86} r={s * 0.018} fill={INK} />
      <circle cx={s * 0.05} cy={-s * 0.86} r={s * 0.018} fill={INK} />
      <path d={`M${-s * 0.05},${-s * 0.79} q${s * 0.05},${s * 0.04} ${s * 0.1},0`} fill="none" stroke={INK} strokeWidth={line(s) * 0.5} />
      <g transform={`rotate(${-30 + Math.sin(t * 4) * 20},${s * 0.2},${-s * 0.55})`}>
        <line x1={s * 0.2} y1={-s * 0.55} x2={s * 0.45} y2={-s * 0.75} stroke={INK} strokeWidth={s * 0.03} />
        <rect x={s * 0.42} y={-s * 0.86} width={s * 0.12} height={s * 0.1} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
    </g>
  ),
  // the staff's folded paper hat, tilting
  cap: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.03)}) rotate(${Math.sin(t * 1.5) * 6})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.42},${-s * 0.05} L${s * 0.42},${-s * 0.05} L${s * 0.3},${-s * 0.55} L${-s * 0.3},${-s * 0.55} Z`} fill={PALETTE.white} s={s} />
      <rect x={-s * 0.42} y={-s * 0.2} width={s * 0.84} height={s * 0.12} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={0} y={-s * 0.3} text="STAFF" size={s * 0.13} fill={PALETTE.red} />
    </g>
  ),
  // the plot of land under the restaurant: a green lot with a fence and a surveyor's flag;
  // state "owned" plants a gold flag in it
  ground: ({ s, t, state }) => (
    <g>
      <Shape d={`M${-s * 0.9},0 L${s * 0.9},0 L${s * 0.6},${-s * 0.3} L${-s * 0.6},${-s * 0.3} Z`} fill={PALETTE.green} s={s} />
      <path d={`M${-s * 0.7},${-s * 0.06} L${s * 0.7},${-s * 0.06}`} stroke={shade(PALETTE.green, -0.25)} strokeWidth={line(s)} strokeDasharray={`${s * 0.06} ${s * 0.05}`} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = -s * 0.6 + i * s * 0.15;
        return <rect key={i} x={x - s * 0.015} y={-s * 0.42} width={s * 0.03} height={s * 0.13} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.3} />;
      })}
      <line x1={-s * 0.62} y1={-s * 0.37} x2={s * 0.62} y2={-s * 0.37} stroke={PALETTE.tan} strokeWidth={s * 0.02} />
      <line x1={s * 0.2} y1={-s * 0.15} x2={s * 0.2} y2={-s * 0.75} stroke={INK} strokeWidth={s * 0.025} />
      <path d={`M${s * 0.2},${-s * 0.75} L${s * 0.5},${-s * (0.68 + 0.02 * Math.sin(t * 5))} L${s * 0.2},${-s * 0.6} Z`} fill={state === "owned" ? PALETTE.gold : PALETTE.orange} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a RENT sign on a post, swinging
  rentsign: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      <rect x={-s * 0.03} y={-s * 0.95} width={s * 0.06} height={s * 0.95} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <g transform={`rotate(${Math.sin(t * 2.5) * 5},0,${-s * 0.9})`}>
        <Box x={-s * 0.38} y={-s * 0.88} w={s * 0.76} h={s * 0.34} fill={PALETTE.yellow} s={s} r={0.08} />
        <Paint x={0} y={-s * 0.7} text="RENT" size={s * 0.2} fill={PALETTE.red} />
      </g>
    </g>
  ),
  // the property deed: a cream scroll with a red wax seal
  deed: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8, 0.03)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.32} y={-s * 0.9} w={s * 0.64} h={s * 0.82} fill={PALETTE.cream} s={s} r={0.04} />
      <Ball cx={0} cy={-s * 0.08} rx={s * 0.34} ry={s * 0.06} fill={PALETTE.tan} s={s} />
      <Ball cx={0} cy={-s * 0.9} rx={s * 0.34} ry={s * 0.06} fill={PALETTE.tan} s={s} />
      <Paint x={0} y={-s * 0.72} text="DEED" size={s * 0.14} fill={INK} />
      {[0.58, 0.48, 0.38].map((y) => <line key={y} x1={-s * 0.22} y1={-s * y} x2={s * 0.22} y2={-s * y} stroke={PALETTE.grey} strokeWidth={line(s) * 0.6} />)}
      <Ball cx={s * 0.14} cy={-s * 0.24} rx={s * 0.08} fill={PALETTE.red} s={s} />
    </g>
  ),
  // the landlord's key ring: a big gold ring with three keys jingling
  keys: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.6}) rotate(${Math.sin(t * 3) * 10})`}>
      <circle r={s * 0.2} fill="none" stroke={PALETTE.gold} strokeWidth={s * 0.05} />
      {[-0.5, 0, 0.5].map((a, i) => (
        <g key={a} transform={`rotate(${a * 60 + Math.sin(t * 5 + i) * 6}) translate(0,${s * 0.2})`}>
          <rect x={-s * 0.025} y={0} width={s * 0.05} height={s * 0.36} fill={[PALETTE.gold, PALETTE.grey, PALETTE.orange][i]} stroke={INK} strokeWidth={line(s) * 0.4} />
          <rect x={0} y={s * 0.26} width={s * 0.08} height={s * 0.04} fill={[PALETTE.gold, PALETTE.grey, PALETTE.orange][i]} stroke={INK} strokeWidth={line(s) * 0.3} />
          <circle cy={-s * 0.02} r={s * 0.07} fill={[PALETTE.gold, PALETTE.grey, PALETTE.orange][i]} stroke={INK} strokeWidth={line(s) * 0.4} />
        </g>
      ))}
    </g>
  ),
  // two dice for the risk of running a restaurant, tumbling
  dice: ({ s, t }) => {
    const pips = (n: number) => ({ 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] } as Record<number, number[][]>)[n] ?? [[0, 0]];
    const face = [1, 3, 5, 6, 2][Math.floor(t * 2) % 5]!;
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        {[-0.24, 0.24].map((x, i) => (
          <g key={x} transform={`translate(${s * x},${-s * 0.22}) rotate(${Math.sin(t * 2 + i) * 12})`}>
            <Box x={-s * 0.19} y={-s * 0.19} w={s * 0.38} h={s * 0.38} fill={i ? PALETTE.red : PALETTE.white} s={s} r={0.15} />
            {pips(i ? 7 - face : face).map(([px, py]) => <circle key={`${px}${py}`} cx={s * 0.1 * px!} cy={s * 0.1 * py!} r={s * 0.03} fill={i ? PALETTE.white : INK} />)}
          </g>
        ))}
      </g>
    );
  },
};

export default props;
