/**
 * The things "Buffett bought Coca-Cola once. He never sold" is about, drawn for this video only:
 * a share certificate, a big red SELL button, a cola factory, a dividend cheque, a rocking chair,
 * the dividend tree that grows its fruit, a cola bottle, a fruit basket and the shareholder letter.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a share certificate with a red ribbon seal; "gold" gilds its border
  stockcert: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-4)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.48} y={-s * 0.82} w={s * 0.96} h={s * 0.66} fill={PALETTE.cream} s={s} r={0.04} sheen={false} />
      <rect x={-s * 0.42} y={-s * 0.76} width={s * 0.84} height={s * 0.54} rx={s * 0.02} fill="none" stroke={state === "gold" ? PALETTE.gold : PALETTE.red} strokeWidth={line(s) * 1.2} />
      <Paint x={0} y={-s * 0.6} text="SHARE" size={s * 0.12} fill={PALETTE.red} />
      {[0, 1].map((i) => <rect key={i} x={-s * 0.28} y={-s * (0.52 - i * 0.08)} width={s * (0.56 - i * 0.16)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <Ball cx={s * 0.3} cy={-s * 0.3} rx={s * 0.08} fill={PALETTE.red} s={s} />
      <path d={`M${s * 0.26},${-s * 0.24} l${-s * 0.04},${s * 0.14} M${s * 0.34},${-s * 0.24} l${s * 0.04},${s * 0.14}`} stroke={PALETTE.red} strokeWidth={line(s) * 1.4} />
    </g>
  ),
  // a big red SELL button on a base; "pressed" pushes it down and blinks
  sellbutton: ({ s, t, state }) => {
    const down = state === "pressed" ? s * 0.05 * (0.5 + 0.5 * Math.sin(t * 6)) : 0;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <Box x={-s * 0.45} y={-s * 0.2} w={s * 0.9} h={s * 0.2} fill={PALETTE.dark} s={s} r={0.2} />
        <ellipse cx={0} cy={-s * 0.2} rx={s * 0.36} ry={s * 0.1} fill={shade(PALETTE.red, -0.4)} stroke={INK} strokeWidth={line(s)} />
        <g transform={`translate(0,${down})`}>
          <path d={`M${-s * 0.34},${-s * 0.22} L${-s * 0.34},${-s * 0.42} A${s * 0.34},${s * 0.12} 0 0 1 ${s * 0.34},${-s * 0.42} L${s * 0.34},${-s * 0.22} Z`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
          <ellipse cx={0} cy={-s * 0.42} rx={s * 0.34} ry={s * 0.12} fill={shade(PALETTE.red, 0.25)} stroke={INK} strokeWidth={line(s)} />
          <Paint x={0} y={-s * 0.38} text="SELL" size={s * 0.13} fill="#fff" />
        </g>
      </g>
    );
  },
  // a cola factory: a red building, a chimney with puffs, bottles on a belt
  colafactory: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={s * 0.25} y={-s * 1.0} w={s * 0.16} h={s * 0.5} fill={PALETTE.grey} s={s} r={0.1} />
      {[0, 1, 2].map((i) => { const f = (t * 0.4 + i / 3) % 1; return <circle key={i} cx={s * 0.33 + f * s * 0.1} cy={-s * 1.05 - f * s * 0.3} r={s * (0.05 + f * 0.06)} fill="#fff" opacity={0.8 - f * 0.7} />; })}
      <Box x={-s * 0.55} y={-s * 0.62} w={s * 1.1} h={s * 0.62} fill={PALETTE.red} s={s} r={0.04} />
      <Shape d={`M${-s * 0.55},${-s * 0.62} l${s * 0.27},${-s * 0.16} l0,${s * 0.16} l${s * 0.27},${-s * 0.16} l0,${s * 0.16} l${s * 0.27},${-s * 0.16} l0,${s * 0.16} Z`} fill={shade(PALETTE.red, -0.2)} s={s} />
      <rect x={-s * 0.5} y={-s * 0.14} width={s * 1.0} height={s * 0.06} fill={PALETTE.dark} />
      {[0, 1, 2, 3].map((i) => { const x = -s * 0.45 + ((t * 0.15 + i / 4) % 1) * s * 0.9; return <rect key={i} x={x} y={-s * 0.3} width={s * 0.07} height={s * 0.16} rx={s * 0.03} fill="#5a2a1a" stroke={INK} strokeWidth={line(s) * 0.5} />; })}
      <Paint x={0} y={-s * 0.4} text="COLA" size={s * 0.13} fill="#fff" />
    </g>
  ),
  // a dividend cheque; "signed" adds a signature and a green tick
  cheque: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.02)}) rotate(3)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.55} y={-s * 0.62} w={s * 1.1} h={s * 0.5} fill="#e9f7ef" s={s} r={0.05} sheen={false} />
      <Paint x={-s * 0.28} y={-s * 0.48} text="DIVIDEND" size={s * 0.08} fill={PALETTE.green} />
      {[0, 1].map((i) => <rect key={i} x={-s * 0.48} y={-s * (0.38 - i * 0.1)} width={s * (0.6 - i * 0.2)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <rect x={s * 0.18} y={-s * 0.44} width={s * 0.3} height={s * 0.1} rx={s * 0.02} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
      {state === "signed" && <>
        <path d={`M${s * 0.15},${-s * 0.2} q${s * 0.05},${-s * 0.07} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.1},0`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" strokeLinecap="round" />
        <path d={`M${-s * 0.46},${-s * 0.2} l${s * 0.05},${s * 0.05} l${s * 0.1},${-s * 0.1}`} stroke={PALETTE.green} strokeWidth={line(s) * 1.4} fill="none" strokeLinecap="round" />
      </>}
    </g>
  ),
  // a rocking chair that rocks: waiting
  rockingchair: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 6})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.4},${-s * 0.02} Q0,${s * 0.08} ${s * 0.4},${-s * 0.02}`} stroke={PALETTE.brown} strokeWidth={line(s) * 2} fill="none" strokeLinecap="round" />
      <rect x={-s * 0.28} y={-s * 0.42} width={s * 0.06} height={s * 0.4} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.2} y={-s * 0.42} width={s * 0.06} height={s * 0.4} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.32} y={-s * 0.48} w={s * 0.62} h={s * 0.1} fill={PALETTE.tan} s={s} r={0.2} />
      <Box x={-s * 0.32} y={-s * 1.0} w={s * 0.1} h={s * 0.56} fill={PALETTE.tan} s={s} r={0.3} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.24} y={-s * (0.92 - i * 0.14)} width={s * 0.04} height={s * 0.1} fill={PALETTE.brown} />)}
    </g>
  ),
  // the dividend tree: k (0..1) is how much fruit it bears
  fruittree: ({ s, t, k = 0.5 }) => {
    const n = Math.max(1, Math.round(2 + 10 * Math.min(1, k)));
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <Shape d={`M${-s * 0.07},0 L${-s * 0.05},${-s * 0.45} L${s * 0.05},${-s * 0.45} L${s * 0.07},0 Z`} fill={PALETTE.brown} s={s} />
        {[[-0.22, -0.62, 0.26], [0.2, -0.64, 0.25], [0, -0.82, 0.3]].map(([x, y, r], i) => <Ball key={i} cx={s * x!} cy={s * y!} rx={s * r!} fill={i === 2 ? PALETTE.green : shade(PALETTE.green, -0.15)} s={s} />)}
        {Array.from({ length: n }, (_, i) => {
          const a = i * 2.4, rr = 0.12 + (i % 3) * 0.1;
          return <circle key={i} cx={Math.cos(a) * s * rr * 1.4} cy={-s * 0.72 + Math.sin(a) * s * rr + Math.sin(t * 2 + i) * s * 0.008} r={s * 0.045} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />;
        })}
      </g>
    );
  },
  // a classic cola bottle, red label (no brand)
  colabottle: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 3})`}>
      <Shadow w={s * 0.4} s={s} />
      <Shape d={`M${-s * 0.06},${-s * 1.0} L${s * 0.06},${-s * 1.0} L${s * 0.07},${-s * 0.8} Q${s * 0.2},${-s * 0.65} ${s * 0.15},${-s * 0.5} Q${s * 0.1},${-s * 0.38} ${s * 0.17},${-s * 0.22} Q${s * 0.2},0 0,0 Q${-s * 0.2},0 ${-s * 0.17},${-s * 0.22} Q${-s * 0.1},${-s * 0.38} ${-s * 0.15},${-s * 0.5} Q${-s * 0.2},${-s * 0.65} ${-s * 0.07},${-s * 0.8} Z`} fill="#5a2a1a" s={s} />
      <rect x={-s * 0.17} y={-s * 0.42} width={s * 0.34} height={s * 0.14} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.07} y={-s * 1.04} width={s * 0.14} height={s * 0.06} rx={s * 0.02} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.1} y={-s * 0.75} width={s * 0.04} height={s * 0.25} rx={s * 0.02} fill="#fff" opacity={0.35} />
    </g>
  ),
  // a wicker basket of red fruit
  fruitbasket: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[-0.22, 0, 0.22, -0.11, 0.11].map((x, i) => <Ball key={i} cx={s * x} cy={-s * (i < 3 ? 0.42 : 0.56) + Math.sin(t * 2 + i) * s * 0.01} rx={s * 0.12} fill={PALETTE.red} s={s} />)}
      <Shape d={`M${-s * 0.45},${-s * 0.42} L${s * 0.45},${-s * 0.42} L${s * 0.34},0 L${-s * 0.34},0 Z`} fill={PALETTE.tan} s={s} />
      {[0, 1, 2].map((i) => <line key={i} x1={-s * 0.42 + i * 0.04 * s} x2={s * 0.42 - i * 0.04 * s} y1={-s * (0.32 - i * 0.1)} y2={-s * (0.32 - i * 0.1)} stroke={shade(PALETTE.tan, -0.35)} strokeWidth={line(s) * 0.7} />)}
    </g>
  ),
  // the shareholder letter: folded pages with a header bar
  berkletter: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8, 0.02)}) rotate(-3)`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.3} y={-s * 0.95} w={s * 0.6} h={s * 0.85} fill={PALETTE.white} s={s} r={0.03} sheen={false} />
      <rect x={-s * 0.3} y={-s * 0.95} width={s * 0.6} height={s * 0.12} fill={PALETTE.navy} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-s * 0.22} y={-s * (0.74 - i * 0.1)} width={s * (0.44 - (i % 3) * 0.08)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
    </g>
  ),
};

export default props;
