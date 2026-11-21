// Guards: "No. Everywhere Musk goes, guards go too. Who pays them?"
// A city street at night outside a hotel: the light flips to night on "No", Musk steps out of a black car on
// "Everywhere", guards in black suits close in around him on "guards", more step out of the cars behind on "too",
// and a question mark lights over the guards on "pays".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Guard } from "./props";
import { Mark } from "./Hook";

const Car: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 -20 L -250 -110 Q -240 -130 -200 -132 L -140 -136 L -80 -210 L 120 -210 L 190 -136 L 250 -125 Q 270 -118 270 -90 L 270 -20 Z" fill="#15161d" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -120 -140 L -70 -195 L 10 -195 L 10 -140 Z" fill="#3a4a6a" />
    <path d="M 30 -140 L 30 -195 L 110 -195 L 160 -140 Z" fill="#3a4a6a" />
    {[-160, 170].map((wx) => <Ball key={wx} x={wx} y={-15} r={45} fill="#2a2a32" />)}
    <rect x={240} y={-110} width={26} height={16} rx={5} fill="#fff1c9" />
  </g>
);

const Guards: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const no = m.at("no", 2), every = m.at("everywhere", 12), guards = m.at("guards", 35), too = m.at("too", 50), pays = m.at("pays", m.end - 16);
  const night = m.lerp([no, no + 8], [0, 1]);
  const out = m.lerp([every, every + 14], [0, 1]);
  const close = m.lerp([guards, guards + 14], [0, 1]);
  const more = m.lerp([too, too + 14], [0, 1]);
  const mark = m.pop(pays, 9);
  const zoom = m.t < guards ? m.lerp([0, guards], [1.12, 1.18]) : m.lerp([guards, guards + 18], [1.18, 0.96]);
  const cy = m.t < guards ? 1000 : m.lerp([guards, guards + 18], [1000, 960]);
  const bg = night > 0.5 ? "#101433" : "#3b2a55";
  return (
    <Stage p={p} bg={bg} vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(120, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill={bg} />
        {/* the hotel front */}
        <Block x={-200} y={180} w={1480} h={1140} fill="#2d2a44" />
        {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={-140 + c * 240} y={230 + r * 130} width={120} height={80} rx={6} fill={(r + c) % 3 ? "#ffd98a" : "#3b3a5c"} opacity={0.75} />
        )))}
        <Block x={390} y={820} w={300} h={500} r={8} fill="#ffe7a3" />
        <Glow x={540} y={1050} r={380} color="#ffd98a" o={0.45} />
        <rect x={340} y={760} width={400} height={60} rx={10} fill="#8a1d2b" stroke={INK} strokeWidth={5} />
        <Txt x={540} y={790} size={46} fill="#ffe7a3" stroke={INK}>HOTEL</Txt>
        <rect x={-700} y={1320} width={2480} height={60} fill="#8b8fa6" stroke={INK} strokeWidth={6} />
        <rect x={-700} y={1380} width={2480} height={1200} fill="#24262f" />
        {/* the black cars at the kerb */}
        <Car x={-120 - (1 - out) * 40} y={1440} s={0.9} />
        <Car x={1180} y={1440} s={0.9} />
        {/* Musk stepping out and walking to the door */}
        <Char x={120 + out * 300} y={1360} s={230} photo="musk" outfit="suit" top="#292a32" pants="#1d1d26" face="neutral" look={[0.6, 0]} />
        {/* guards closing in */}
        {[[-120, 280], [180, 560], [-60, 700]].map(([dx, gx], i) => (
          <g key={i} opacity={Math.min(1, close * 2)}><Guard x={gx! + (1 - close) * (dx! < 0 ? -300 : 300)} y={1370} s={210} m={m} i={i} look={[i === 1 ? -0.5 : 0.5, 0]} /></g>
        ))}
        {[0, 1].map((i) => (more > 0 ? <g key={`m${i}`} opacity={more}><Guard x={i ? 960 : -60} y={1380 - (1 - more) * 40} s={190} m={m} i={i + 2} /></g> : null))}
        <Mark x={540} y={560} k={mark} r={80} color="#ffb020" />
      </View>
    </Stage>
  );
};

export default Guards;
