/**
 * The things "The $10 gym that wants you to stay home" is about, drawn for this video only: a
 * budget gym's shop front (a lit GYM sign, glass doors, a dumbbell over the door), a membership
 * card, a dumbbell, a treadmill with a moving belt, a money safe that fills (k 0..1), a turnstile
 * whose arms spin, a pair of sneakers ("dusty" greys them under cobwebs), a January calendar page,
 * a living-room couch and a kettlebell.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a budget gym's shop front: brick, a lit GYM sign, glass doors with a dumbbell decal; "open" slides the doors apart
  gymfront: ({ s, t, state }) => {
    const open = state === "open" ? 1 : 0;
    return (
      <g>
        <Shadow w={s * 1.3} s={s} />
        <Box x={-s * 0.6} y={-s * 0.82} w={s * 1.2} h={s * 0.82} fill={shade(PALETTE.navy, 0.15)} s={s} r={0.02} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={-s * 0.6} x2={s * 0.6} y1={-s * (0.1 + i * 0.12)} y2={-s * (0.1 + i * 0.12)} stroke={shade(PALETTE.navy, -0.2)} strokeWidth={line(s) * 0.3} />
        ))}
        <Box x={-s * 0.5} y={-s * 0.98} w={s * 1.0} h={s * 0.22} fill={PALETTE.yellow} s={s} r={0.08} />
        <rect x={-s * 0.5} y={-s * 0.98} width={s * 1.0} height={s * 0.22} rx={s * 0.02} fill="#fff" opacity={0.18 + 0.12 * Math.sin(t * 6)} />
        <Paint x={0} y={-s * 0.82} text="GYM" size={s * 0.16} fill={INK} />
        <rect x={-s * 0.38} y={-s * 0.62} width={s * 0.76} height={s * 0.62} fill="#7fc8ff" stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.38 - open * s * 0.3} y={-s * 0.62} width={s * 0.38} height={s * 0.62} fill="#a8dcff" opacity={0.85} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={0 + open * s * 0.3} y={-s * 0.62} width={s * 0.38} height={s * 0.62} fill="#a8dcff" opacity={0.85} stroke={INK} strokeWidth={line(s) * 0.5} />
        <g transform={`translate(0,${-s * 0.42})`}>
          <rect x={-s * 0.14} y={-s * 0.015} width={s * 0.28} height={s * 0.03} fill={INK} />
          <rect x={-s * 0.18} y={-s * 0.07} width={s * 0.05} height={s * 0.14} rx={s * 0.01} fill={INK} />
          <rect x={s * 0.13} y={-s * 0.07} width={s * 0.05} height={s * 0.14} rx={s * 0.01} fill={INK} />
        </g>
        <path d={`M${-s * 0.32},${-s * 0.58} l${s * 0.12},0 l${-s * 0.1},${s * 0.18}`} stroke="#fff" strokeWidth={line(s) * 0.6} fill="none" opacity={0.7} />
      </g>
    );
  },
  // a membership card with a stripe, a chip and a little barbell
  membercard: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.1)}) rotate(-6)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.5} y={-s * 0.66} w={s * 1.0} h={s * 0.62} fill={PALETTE.purple} s={s} r={0.06} />
      <rect x={-s * 0.5} y={-s * 0.56} width={s * 1.0} height={s * 0.1} fill={PALETTE.yellow} />
      <rect x={-s * 0.4} y={-s * 0.38} width={s * 0.16} height={s * 0.12} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={s * 0.12} y={-s * 0.28} text="MEMBER" size={s * 0.1} fill="#fff" />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.4 + i * s * 0.14} y={-s * 0.18} width={s * 0.1} height={s * 0.04} rx={s * 0.01} fill={shade(PALETTE.purple, 0.35)} />)}
    </g>
  ),
  // a chrome dumbbell with black plates
  dumbbell: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.4)})`}>
      <Shadow w={s * 1.0} s={s} />
      <rect x={-s * 0.4} y={-s * 0.3} width={s * 0.8} height={s * 0.08} rx={s * 0.03} fill="#c8cfdb" stroke={INK} strokeWidth={line(s) * 0.5} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <Box x={d * s * 0.3 - s * 0.08} y={-s * 0.5} w={s * 0.16} h={s * 0.48} fill={PALETTE.dark} s={s} r={0.15} />
          <Box x={d * s * 0.44 - s * 0.05} y={-s * 0.42} w={s * 0.1} h={s * 0.32} fill={shade(PALETTE.dark, 0.2)} s={s} r={0.2} />
        </g>
      ))}
    </g>
  ),
  // a treadmill: a deck with a belt that moves, an upright and a lit console
  treadmill: ({ s, t, state }) => {
    const off = state === "off";
    const belt = off ? 0 : (t * s * 0.4) % (s * 0.1);
    return (
      <g>
        <Shadow w={s * 1.2} s={s} />
        <Box x={-s * 0.6} y={-s * 0.16} w={s * 1.1} h={s * 0.14} fill={PALETTE.dark} s={s} r={0.2} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <line key={i} x1={-s * 0.55 + i * s * 0.1 + belt} x2={-s * 0.55 + i * s * 0.1 + belt} y1={-s * 0.15} y2={-s * 0.05} stroke={shade(PALETTE.dark, 0.3)} strokeWidth={line(s) * 0.4} />
        ))}
        <Shape d={`M${s * 0.38},${-s * 0.14} L${s * 0.46},${-s * 0.8} L${s * 0.54},${-s * 0.8} L${s * 0.48},${-s * 0.14} Z`} fill={PALETTE.grey} s={s} />
        <Box x={s * 0.26} y={-s * 0.92} w={s * 0.36} h={s * 0.16} fill={PALETTE.dark} s={s} r={0.15} />
        <rect x={s * 0.3} y={-s * 0.88} width={s * 0.28} height={s * 0.08} rx={s * 0.01} fill={off ? "#3a4258" : PALETTE.mint} opacity={off ? 1 : 0.7 + 0.3 * Math.sin(t * 5)} />
        <line x1={s * 0.1} x2={s * 0.44} y1={-s * 0.62} y2={-s * 0.66} stroke={PALETTE.grey} strokeWidth={line(s)} strokeLinecap="round" />
      </g>
    );
  },
  // a money safe with a dial; k 0..1 fills it with notes behind the open door
  moneysafe: ({ s, t, k = 0.3 }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.4} y={-s * 0.8} w={s * 0.8} h={s * 0.78} fill={PALETTE.grey} s={s} r={0.04} />
      <rect x={-s * 0.32} y={-s * 0.72} width={s * 0.64} height={s * 0.62} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
      {Array.from({ length: Math.max(1, Math.round(1 + 5 * k)) }, (_, i) => (
        <rect key={i} x={-s * 0.28} y={-s * (0.2 + i * 0.09)} width={s * 0.56} height={s * 0.08} rx={s * 0.01} fill={i % 2 ? "#8fd19e" : "#6cbf84"} stroke={INK} strokeWidth={line(s) * 0.3} />
      ))}
      <g transform={`translate(${-s * 0.32},${-s * 0.72}) skewY(-8)`}>
        <rect x={-s * 0.2} y={0} width={s * 0.2} height={s * 0.62} fill={shade(PALETTE.grey, -0.1)} stroke={INK} strokeWidth={line(s) * 0.5} />
        <circle cx={-s * 0.1} cy={s * 0.3} r={s * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
        <line x1={-s * 0.1} y1={s * 0.3} x2={-s * 0.1 + Math.cos(t * 2) * s * 0.05} y2={s * 0.3 + Math.sin(t * 2) * s * 0.05} stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
      <circle cx={s * 0.2} cy={-s * 0.9} r={s * 0.03 * (1 + 0.5 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a turnstile: a post with a green light and three arms that turn
  turnstile: ({ s, t, state }) => {
    const spin = state === "spin" ? t * 240 : 0;
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.16} y={-s * 0.7} w={s * 0.32} h={s * 0.7} fill={PALETTE.grey} s={s} r={0.08} />
        <circle cx={0} cy={-s * 0.62} r={s * 0.04} fill={state === "spin" ? PALETTE.green : PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.3} />
        <g transform={`translate(${s * 0.16},${-s * 0.42}) rotate(${spin})`}>
          {[0, 120, 240].map((a) => (
            <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * s * 0.36} y2={Math.sin((a * Math.PI) / 180) * s * 0.14}
              stroke="#c8cfdb" strokeWidth={line(s) * 1.4} strokeLinecap="round" />
          ))}
          <circle r={s * 0.05} fill={PALETTE.dark} />
        </g>
      </g>
    );
  },
  // a pair of running shoes; "dusty" greys them and strings a cobweb between them
  sneakers: ({ s, t, state }) => {
    const dusty = state === "dusty";
    const c = dusty ? "#8d93a3" : PALETTE.red;
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * s * 0.26},0)`}>
            <Shape d={`M${-s * 0.24},0 L${-s * 0.22},${-s * 0.24} Q${-s * 0.12},${-s * 0.34} ${0},${-s * 0.26} L${s * 0.1},${-s * 0.14} Q${s * 0.26},${-s * 0.12} ${s * 0.26},0 Z`} fill={c} s={s} />
            <rect x={-s * 0.24} y={-s * 0.05} width={s * 0.5} height={s * 0.05} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
            {[0, 1, 2].map((i) => <line key={i} x1={-s * 0.14 + i * s * 0.05} y1={-s * 0.24 + i * s * 0.03} x2={-s * 0.08 + i * s * 0.05} y2={-s * 0.26 + i * s * 0.03} stroke="#fff" strokeWidth={line(s) * 0.4} />)}
          </g>
        ))}
        {dusty && <path d={`M${-s * 0.4},${-s * 0.3} Q0,${-s * (0.18 + 0.02 * Math.sin(t * 2))} ${s * 0.4},${-s * 0.3} M${-s * 0.2},${-s * 0.26} L0,${-s * 0.42} L${s * 0.2},${-s * 0.26}`}
          stroke="#e8ecf4" strokeWidth={line(s) * 0.35} fill="none" opacity={0.8} />}
      </g>
    );
  },
  // a wall calendar torn to January: a red header, rings, a grid of days, one circled
  janpage: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.34} y={-s * 0.9} w={s * 0.68} h={s * 0.86} fill="#fff" s={s} r={0.03} />
      <rect x={-s * 0.34} y={-s * 0.9} width={s * 0.68} height={s * 0.2} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={0} y={-s * 0.76} text="JAN" size={s * 0.13} fill="#fff" />
      {[-0.2, 0, 0.2].map((x) => <circle key={x} cx={x * s} cy={-s * 0.92} r={s * 0.03} fill={PALETTE.dark} />)}
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={-s * 0.28 + (i % 5) * s * 0.115} y={-s * 0.62 + Math.floor(i / 5) * s * 0.13} width={s * 0.08} height={s * 0.08} rx={s * 0.01} fill={PALETTE.cream} stroke={PALETTE.grey} strokeWidth={line(s) * 0.2} />
      ))}
      <circle cx={-s * 0.24} cy={-s * 0.58} r={s * 0.07} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a cosy living-room couch with a cushion and a remote
  couch: ({ s }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.62} y={-s * 0.62} w={s * 1.24} h={s * 0.34} fill={shade(PALETTE.teal, -0.1)} s={s} r={0.12} />
      <Box x={-s * 0.6} y={-s * 0.34} w={s * 1.2} h={s * 0.24} fill={PALETTE.teal} s={s} r={0.12} />
      <Box x={-s * 0.72} y={-s * 0.48} w={s * 0.16} h={s * 0.4} fill={shade(PALETTE.teal, -0.2)} s={s} r={0.3} />
      <Box x={s * 0.56} y={-s * 0.48} w={s * 0.16} h={s * 0.4} fill={shade(PALETTE.teal, -0.2)} s={s} r={0.3} />
      <Box x={-s * 0.46} y={-s * 0.56} w={s * 0.3} h={s * 0.22} fill={PALETTE.yellow} s={s} r={0.2} />
      <rect x={s * 0.2} y={-s * 0.38} width={s * 0.18} height={s * 0.05} rx={s * 0.02} fill={PALETTE.dark} transform={`rotate(-12 ${s * 0.29} ${-s * 0.36})`} />
      {[-0.5, 0.5].map((x) => <rect key={x} x={x * s - s * 0.03} y={-s * 0.1} width={s * 0.06} height={s * 0.1} fill={PALETTE.brown} />)}
    </g>
  ),
  // a heavy kettlebell
  kettlebell: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.1)})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.5} Q${-s * 0.2},${-s * 0.86} 0,${-s * 0.86} Q${s * 0.2},${-s * 0.86} ${s * 0.18},${-s * 0.5}`} stroke={PALETTE.dark} strokeWidth={line(s) * 2.2} fill="none" />
      <Ball cx={0} cy={-s * 0.3} rx={s * 0.32} ry={s * 0.29} fill={PALETTE.dark} s={s} />
      <Paint x={0} y={-s * 0.24} text="KG" size={s * 0.12} fill={PALETTE.yellow} />
    </g>
  ),
};

export default props;
