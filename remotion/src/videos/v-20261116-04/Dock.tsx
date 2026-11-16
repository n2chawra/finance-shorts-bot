// Promise: "Yet those computers bring in just {sales_pct} of its sales." A loading dock at dusk: parcel
// trucks roll in a long line, a forklift sets one small server crate in front of them, and a red tag
// stamps the cloud's share of sales onto the crate.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Limb, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Rack } from "./props";

type Params = { fig?: { share?: string } };

const Trailer: React.FC<{ x: number; y: number; lit: number }> = ({ x, y, lit }) => (
  <g>
    <Block x={x} y={y - 330} w={560} h={290} r={10} fill="#d9dee8" />
    <rect x={x + 30} y={y - 300} width={500} height={60} rx={8} fill="#1f6fbf" />
    <path d={`M ${x + 140} ${y - 190} Q ${x + 280} ${y - 140} ${x + 420} ${y - 195}`} fill="none" stroke="#ff9900" strokeWidth={16} strokeLinecap="round" />
    {[x + 90, x + 470].map((wx) => <Ball key={wx} x={wx} y={y - 30} r={40} fill="#2a2d38" />)}
    <Glow x={x + 280} y={y - 190} r={360} color="#ffd27a" o={0.35 * lit} />
  </g>
);

const Dock: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const yet = m.at("yet", 4), bring = m.at("bring", 18), just = m.at("just", 30), sales = m.at("sales", 42);
  const roll = m.lerp([0, m.end], [0, -420], Easing.linear);
  const lift = m.lerp([bring - 4, bring + 14], [-220, 0]);
  const zoom = m.t < just ? m.lerp([0, just], [1.18, 1.12]) : m.t < sales ? m.lerp([just, just + 10], [1.12, 1.35]) : m.lerp([sales, sales + 12], [1.35, 1.6]);
  const cx = m.lerp([just, sales + 12], [540, 640]), cy = m.lerp([just, sales + 12], [1000, 980]);
  return (
    <Stage p={p} bg="#2a1e3d" vignette={0.42}
      defs={<linearGradient id="dk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a6a" /><stop offset="0.6" stopColor="#d9637a" /><stop offset="1" stopColor="#ffae5c" /></linearGradient>}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-400} y={-300} width={1880} height={1100} fill="url(#dk-sky)" />
        <circle cx={860} cy={560} r={90} fill="#ffe4a8" />
        {/* the warehouse wall with its dock doors */}
        <rect x={-400} y={560} width={1880} height={420} fill="#5c6680" stroke={INK} strokeWidth={STROKE} />
        {[-300, 60, 420, 780, 1140].map((x) => <Block key={x} x={x} y={640} w={280} h={340} fill="#3c4458" />)}
        <rect x={-400} y={980} width={1880} height={900} fill="#4b4a55" />
        <line x1={-400} y1={980} x2={1480} y2={980} stroke={INK} strokeWidth={STROKE} />
        <g transform={`translate(${roll} 0)`}>
          {[-260, 340, 940, 1540].map((x, i) => <Trailer key={i} x={x} y={1180} lit={m.lerp([sales, sales + 8], [0, 1])} />)}
        </g>
        <Glow x={540} y={1200} r={700} color="#ffb070" o={0.15} />
        {/* the forklift and its crate */}
        <g transform={`translate(${m.lerp([yet, bring], [360, 0])} 0)`}>
          <Block x={780} y={1270} w={220} h={170} r={14} fill="#ffc43d" />
          <Limb a={[760, 1100]} b={[760, 1440]} w={18} color="#2a2f3d" sw={4} />
          <Ball x={830} y={1450} r={36} fill="#2a2d38" />
          <Ball x={960} y={1450} r={36} fill="#2a2d38" />
          <Char x={890} y={1300} s={170} who="priya" face="neutral" armL={[70, 60]} armR={[70, 60]} sit look={[-0.8, 0]} />
          <g transform={`translate(0 ${lift})`}>
            <rect x={560} y={1290} width={210} height={16} fill="#2a2f3d" />
            <Rack x={590} y={1060} w={150} h={230} t={m.t} seed="crate" />
          </g>
        </g>
        <Tag x={470} y={880} w={330} h={150} text={share} size={100} k={m.pop(just, 10)} rot={-6} bg="#e0352b" fg="#ffffff" />
        {m.t >= just + 4 ? <Txt x={635} y={1050} size={48} fill="#ffffff" weight={800} stroke={INK}>OF SALES</Txt> : null}
      </View>
    </Stage>
  );
};

export default Dock;
