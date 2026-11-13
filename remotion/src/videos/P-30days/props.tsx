/**
 * The things "I ran a faceless channel for 30 days using Claude Code" is about (the owner's personal
 * video, 2026-11-13): the laptop where it was built, the agents, the Short, the play button, the
 * calendar of days, the views chart, the cloud it runs in, the guard, a bug, the clapper (a video
 * made), the gear (automation) and a trophy (the best Short).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow } from "../../studio/draw";

const SCREEN = "#16203a", CODE = ["#7cf0b2", "#ffd34d", "#9ec5ff", "#f2588f"];

const props: PropSet = {
  // an open laptop, code lines scrolling up its screen
  laptop: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.75} y={-s * 1.05} w={s * 1.5} h={s * 0.92} fill={PALETTE.dark} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.68} y={-s * 0.98} width={s * 1.36} height={s * 0.78} rx={s * 0.03} fill={SCREEN} />
      {Array.from({ length: 7 }, (_, i) => {
        const y = ((i * 0.11 + t * 0.12) % 0.77);
        return <rect key={i} x={-s * 0.6 + (i % 3) * s * 0.06} y={-s * 0.22 - y * s} width={s * (0.35 + ((i * 37) % 50) / 100)} height={s * 0.04} rx={s * 0.02} fill={CODE[i % 4]} opacity={0.85} />;
      })}
      <Box x={-s * 0.9} y={-s * 0.13} w={s * 1.8} h={s * 0.13} fill={PALETTE.grey} s={s} r={0.3} sheen />
    </g>
  ),
  // a friendly robot: one of the agents, its eyes blinking, an antenna light pulsing
  robot: ({ s, t, state }) => {
    const blink = Math.sin(t * 2.3) > 0.96 ? 0.15 : 1;
    const c = state === "red" ? PALETTE.red : state === "green" ? PALETTE.green : PALETTE.blue;
    return (
      <g transform={`translate(0,${bob(t, s, 2.2, 0.03)})`}>
        <Shadow w={s * 0.9} s={s} />
        <Box x={-s * 0.35} y={-s * 0.55} w={s * 0.7} h={s * 0.55} fill={c} s={s} r={0.2} />
        <Box x={-s * 0.42} y={-s * 1.08} w={s * 0.84} h={s * 0.5} fill={shade(c, 0.25)} s={s} r={0.25} />
        <ellipse cx={-s * 0.16} cy={-s * 0.84} rx={s * 0.09} ry={s * 0.09 * blink} fill="#fff" />
        <ellipse cx={s * 0.16} cy={-s * 0.84} rx={s * 0.09} ry={s * 0.09 * blink} fill="#fff" />
        <rect x={-s * 0.12} y={-s * 0.7} width={s * 0.24} height={s * 0.04} rx={s * 0.02} fill={INK} />
        <line x1={0} y1={-s * 1.08} x2={0} y2={-s * 1.25} stroke={INK} strokeWidth={line(s)} />
        <Ball cx={0} cy={-s * 1.28} rx={s * 0.06} fill={PALETTE.yellow} s={s * (0.8 + 0.2 * Math.sin(t * 5))} />
      </g>
    );
  },
  // the red play button
  play: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) scale(${1 + Math.sin(t * 3) * 0.03})`}>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.6} y={-s * 0.85} w={s * 1.2} h={s * 0.82} fill={PALETTE.red} s={s} r={0.25} />
      <path d={`M${-s * 0.14},${-s * 0.6} L${s * 0.22},${-s * 0.44} L${-s * 0.14},${-s * 0.28} Z`} fill="#fff" />
    </g>
  ),
  // a phone playing a vertical Short, a progress bar running along the bottom
  phone: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(${Math.sin(t) * 3})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s * 1.15} w={s * 0.64} h={s * 1.12} fill={PALETTE.dark} s={s} r={0.12} />
      <rect x={-s * 0.27} y={-s * 1.08} width={s * 0.54} height={s * 0.98} rx={s * 0.04} fill={PALETTE.purple} />
      <Ball cx={0} cy={-s * 0.66} rx={s * 0.14} fill={PALETTE.gold} s={s * 0.6} />
      <Paint x={0} y={-s * 0.38} text="SHORT" size={s * 0.08} fill="#fff" />
      <rect x={-s * 0.24} y={-s * 0.16} width={s * 0.48} height={s * 0.025} fill="rgba(255,255,255,0.3)" />
      <rect x={-s * 0.24} y={-s * 0.16} width={s * 0.48 * ((t * 0.25) % 1)} height={s * 0.025} fill={PALETTE.red} />
    </g>
  ),
  // a desk calendar, its page flipping
  calendar: ({ s, t }) => {
    const flip = Math.abs(Math.sin(t * 0.9));
    return (
      <g>
        <Shadow w={s} s={s} />
        <Box x={-s * 0.45} y={-s * 0.95} w={s * 0.9} h={s * 0.92} fill={PALETTE.white} s={s} r={0.06} sheen={false} />
        <rect x={-s * 0.45} y={-s * 0.95} width={s * 0.9} height={s * 0.22} rx={s * 0.05} fill={PALETTE.red} />
        {[-0.25, 0.25].map((x) => <rect key={x} x={s * x - s * 0.03} y={-s * 1.02} width={s * 0.06} height={s * 0.14} rx={s * 0.03} fill={INK} />)}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.36 + (i % 4) * s * 0.19} y={-s * 0.62 + Math.floor(i / 4) * s * 0.17} width={s * 0.13} height={s * 0.1} rx={s * 0.02} fill={i < 9 ? PALETTE.green : PALETTE.grey} opacity={0.8} />)}
        <rect x={-s * 0.45} y={-s * 0.73} width={s * 0.9} height={s * 0.7 * flip * 0.15} fill={PALETTE.cream} opacity={0.9} />
      </g>
    );
  },
  // a bar chart growing, the last bar the tallest
  chart: ({ s, t }) => {
    const grow = Math.min(1, (t % 6) / 2.5);
    const hs = [0.25, 0.4, 0.32, 0.55, 0.7, 0.95];
    return (
      <g>
        <Shadow w={s * 1.3} s={s} />
        <Box x={-s * 0.7} y={-s * 1.05} w={s * 1.4} h={s * 1.02} fill={PALETTE.white} s={s} r={0.05} sheen={false} />
        {hs.map((h, i) => <rect key={i} x={-s * 0.58 + i * s * 0.2} y={-s * 0.12 - h * s * 0.8 * grow} width={s * 0.14} height={h * s * 0.8 * grow} rx={s * 0.02} fill={i === hs.length - 1 ? PALETTE.green : PALETTE.blue} />)}
        <line x1={-s * 0.62} y1={-s * 0.12} x2={s * 0.62} y2={-s * 0.12} stroke={INK} strokeWidth={line(s) * 0.7} />
      </g>
    );
  },
  // a cloud with arrows going up and down: it all runs in the cloud
  cloud: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.2, 0.04)})`}>
      <Ball cx={-s * 0.3} cy={-s * 0.6} rx={s * 0.3} fill="#e8f1ff" s={s} />
      <Ball cx={s * 0.05} cy={-s * 0.78} rx={s * 0.38} fill="#f4f8ff" s={s} />
      <Ball cx={s * 0.38} cy={-s * 0.58} rx={s * 0.28} fill="#e8f1ff" s={s} />
      <rect x={-s * 0.55} y={-s * 0.6} width={s * 1.15} height={s * 0.3} rx={s * 0.15} fill="#eef4ff" />
      <path d={`M${-s * 0.1},${-s * 0.2 - ((t * 0.6) % 0.3) * s} l${-s * 0.07},${s * 0.08} m${s * 0.07},${-s * 0.08} l${s * 0.07},${s * 0.08}`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" />
      <path d={`M${s * 0.15},${-s * 0.25 + ((t * 0.6) % 0.3) * s} l${-s * 0.07},${-s * 0.08} m${s * 0.07},${s * 0.08} l${s * 0.07},${-s * 0.08}`} stroke={PALETTE.green} strokeWidth={line(s)} fill="none" />
    </g>
  ),
  // a spinning gear: the automation
  gear: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${(t * 40) % 360})`}>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-s * 0.08} y={-s * 0.5} width={s * 0.16} height={s * 0.2} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} transform={`rotate(${i * 45})`} />)}
      <Ball cx={0} cy={0} rx={s * 0.36} fill={PALETTE.grey} s={s} />
      <circle cx={0} cy={0} r={s * 0.13} fill={PALETTE.dark} />
    </g>
  ),
  // a shield with a tick: the guard that checks every agent's change
  shield: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M0,${-s * 1.05} L${s * 0.42},${-s * 0.88} L${s * 0.36},${-s * 0.35} Q0,${-s * 0.02} 0,${-s * 0.02} Q0,${-s * 0.02} ${-s * 0.36},${-s * 0.35} L${-s * 0.42},${-s * 0.88} Z`}
        fill={state === "red" ? PALETTE.red : PALETTE.teal} stroke={INK} strokeWidth={line(s)} />
      {state === "red"
        ? <path d={`M${-s * 0.14},${-s * 0.72} l${s * 0.28},${s * 0.28} m0,${-s * 0.28} l${-s * 0.28},${s * 0.28}`} stroke="#fff" strokeWidth={line(s) * 1.6} fill="none" />
        : <path d={`M${-s * 0.17},${-s * 0.56} l${s * 0.12},${s * 0.12} l${s * 0.24},${-s * 0.28}`} stroke="#fff" strokeWidth={line(s) * 1.6} fill="none" />}
    </g>
  ),
  // a bug, wiggling its legs
  bug: ({ s, t }) => (
    <g transform={`translate(${Math.sin(t * 3) * s * 0.05},0)`}>
      <Shadow w={s * 0.7} s={s} />
      {[-1, 1].map((d) => [0, 1, 2].map((i) => (
        <line key={`${d}${i}`} x1={0} y1={-s * (0.3 + i * 0.12)} x2={d * s * 0.38} y2={-s * (0.24 + i * 0.14) + Math.sin(t * 8 + i) * s * 0.03} stroke={INK} strokeWidth={line(s) * 0.8} />
      )))}
      <Ball cx={0} cy={-s * 0.38} rx={s * 0.24} ry={s * 0.3} fill={PALETTE.red} s={s} />
      <Ball cx={0} cy={-s * 0.72} rx={s * 0.13} fill={PALETTE.dark} s={s} />
      <line x1={0} y1={-s * 0.6} x2={0} y2={-s * 0.1} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a film clapper snapping shut: a video made
  clapper: ({ s, t }) => {
    const open = Math.max(0, Math.sin(t * 2.4)) * 22;
    return (
      <g>
        <Shadow w={s} s={s} />
        <Box x={-s * 0.5} y={-s * 0.62} w={s} h={s * 0.6} fill={PALETTE.dark} s={s} r={0.04} sheen={false} />
        <g transform={`translate(${-s * 0.5},${-s * 0.62}) rotate(${-open})`}>
          <rect x={0} y={-s * 0.16} width={s} height={s * 0.16} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${s * (0.08 + i * 0.24)},${-s * 0.16} l${s * 0.12},0 l${-s * 0.06},${s * 0.16} l${-s * 0.12},0 Z`} fill={INK} />)}
        </g>
        <Paint x={0} y={-s * 0.28} text="TAKE" size={s * 0.1} fill="#fff" />
      </g>
    );
  },
  // a trophy, shining: the best Shorts
  trophy: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.3} y={-s * 0.16} w={s * 0.6} h={s * 0.16} fill={PALETTE.brown} s={s} r={0.1} />
      <rect x={-s * 0.06} y={-s * 0.42} width={s * 0.12} height={s * 0.28} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M${-s * 0.36},${-s * 1.0} L${s * 0.36},${-s * 1.0} Q${s * 0.34},${-s * 0.4} 0,${-s * 0.42} Q${-s * 0.34},${-s * 0.4} ${-s * 0.36},${-s * 1.0} Z`} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
      <path d={`M${-s * 0.15 + ((t * 0.4) % 1) * s * 0.3},${-s * 0.95} l${s * 0.06},${s * 0.4}`} stroke="#fff" strokeWidth={s * 0.04} opacity={0.6} />
    </g>
  ),
};

export default props;
