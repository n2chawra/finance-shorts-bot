// Turn: "Then fuel prices jumped, trouble in the Middle East closed skies, and that cut it in half."
// A fuel depot under a storm-red sky: the sky turns red over the tanks on "Then", the giant price gauge on the tank
// lights up on "fuel", its needle slams into the red on "jumped", a barrier with a CLOSED sign drops across a flight
// path in the sky on "closed" and the planes turn back, and last year's receipt tears in half on "half".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Jet, Receipt } from "./props";

type Params = { fig?: { last?: string } };

const Depot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const last = (p.beat.params as Params).fig?.last ?? "";
  const then = m.at("then", 2), fuel = m.at("fuel", 10), jumped = m.at("jumped", 22), closed = m.at("closed", 48), half = m.at("half", m.end - 22);
  const red = m.lerp([then, then + 14], [0, 1]);
  const lit = m.lerp([fuel, fuel + 8], [0, 1]);
  const needle = m.lerp([jumped - 2, jumped + 8], [-60, 70], (x) => 1 - Math.pow(1 - x, 3)) + (m.t > jumped ? m.wave(6, 3) : 0);
  const bar = m.pop(closed, 9);
  const turn = m.lerp([closed + 4, closed + 30], [0, 1]);
  const tear = m.lerp([half, half + 16], [0, 1]);
  const shake = m.pulse(jumped, 6) * 10 + m.pulse(half, 6) * 8;
  const zoom = m.t < jumped ? 1.0 : m.t < half ? m.lerp([jumped, jumped + 12], [1.0, 1.1]) : m.lerp([half, half + 10], [1.1, 1.26]);
  const cy = m.t < jumped ? 900 : m.t < half ? m.lerp([jumped, jumped + 12], [900, 760]) : m.lerp([half, half + 10], [760, 600]);
  const cx = m.t < half ? 540 : m.lerp([half, half + 10], [540, 330]);
  return (
    <Stage p={p} bg="#3a1d2a" vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(100, 4) + Math.sin(m.t * 2) * shake} cy={cy}>
        <defs>
          <linearGradient id="depot-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b2350" /><stop offset="1" stopColor="#6f5a8a" /></linearGradient>
          <linearGradient id="depot-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a0f1e" /><stop offset="1" stopColor="#d9442b" /></linearGradient>
        </defs>
        <rect x={-400} y={-400} width={1880} height={1700} fill="url(#depot-sky)" />
        <rect x={-400} y={-400} width={1880} height={1700} fill="url(#depot-red)" opacity={red} />
        {/* the flight path across the sky, the barrier, the planes turning back */}
        <path d="M -300 260 Q 540 120 1380 260" fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="20 16" opacity={0.6} />
        {[0, 1].map((i) => {
          const x = -150 + i * 260 + m.t * 2.2 * (1 - turn) + (turn > 0 ? -turn * 120 : 0);
          return <Jet key={i} x={x} y={230 + i * 50 + turn * 40} w={200} flip={turn > 0.5} windows={false} tilt={turn > 0 && turn < 1 ? -20 * Math.sin(turn * Math.PI) : 0} />;
        })}
        {bar > 0 ? (
          <g transform={`translate(0 ${(1 - bar) * -300})`}>
            <Limb a={[720, 80]} b={[720, 420]} w={18} color="#f4f1e8" />
            <Block x={560} y={170} w={320} h={110} r={14} fill="#c8102e" />
            <Txt x={720} y={225} size={64} fill="#ffffff">CLOSED</Txt>
            {[0, 1, 2, 3].map((i) => <rect key={i} x={560 + i * 80} y={300} width={40} height={30} fill={i % 2 ? "#ffffff" : "#c8102e"} stroke={INK} strokeWidth={4} />)}
          </g>
        ) : null}
        {/* the ground and the tanks */}
        <rect x={-400} y={1150} width={1880} height={1300} fill="#3b3540" />
        {[[-120, 0.8], [880, 0.75]].map(([x, s], i) => (
          <g key={i} transform={`translate(${x} 1150) scale(${s})`}>
            <Block x={-180} y={-480} w={360} h={480} r={20} fill="#d6dbe4" />
            <path d="M -180 -480 Q 0 -560 180 -480 Z" fill="#c3c9d4" stroke={INK} strokeWidth={6} />
          </g>
        ))}
        <Block x={260} y={560} w={560} h={600} r={30} fill="#e4e8ef" />
        <path d="M 260 560 Q 540 470 820 560 Z" fill="#d0d6e0" stroke={INK} strokeWidth={6} />
        <Txt x={540} y={640} size={60} fill="#c8102e">JET FUEL</Txt>
        {/* the price gauge */}
        <Glow x={540} y={880} r={260} color="#ff7a4d" o={0.5 * lit} />
        <circle cx={540} cy={900} r={190} fill="#1d1a2b" stroke={INK} strokeWidth={8} />
        <path d="M 395 900 A 145 145 0 0 1 685 900" fill="none" stroke="#7dff9e" strokeWidth={26} opacity={0.4 + 0.6 * lit} strokeDasharray="150 400" />
        <path d="M 395 900 A 145 145 0 0 1 685 900" fill="none" stroke="#ff3b3b" strokeWidth={26} opacity={0.4 + 0.6 * lit} strokeDasharray="0 300 160 200" />
        <g transform={`rotate(${needle} 540 900)`}>
          <Limb a={[540, 900]} b={[540, 760]} w={12} color="#ffd36b" />
        </g>
        <circle cx={540} cy={900} r={24} fill="#ffd36b" stroke={INK} strokeWidth={5} />
        <Txt x={540} y={1010} size={48} fill="#ffffff">PRICE</Txt>
        {/* last year's receipt, torn on "half" */}
        <Receipt x={230} y={380} w={280} k={1} label="PER FLYER" value={last} tear={tear} />
      </View>
    </Stage>
  );
};

export default Depot;
