// Payoff: "So 36% of his whole Oracle stake now backs loans for his ventures outside Oracle."
// A dock at dusk: a crane lifts the padlocked block of certificates on "So", it hangs beside his whole stake on
// "whole", the dial on the crane's scale swings to the figure on "stake" as the camera closes on it, cash bags slide
// down a chute from the block on "backs", and on "ventures" the camera pulls back as a boat carries the cash out to
// new buildings going up across the water.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { CashBag, CertStack, Padlock } from "./props";

type Params = { fig?: { pct?: string } };

const Scale: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pct = (p.beat.params as Params).fig?.pct ?? "";
  const so = m.at("so", 2), whole = m.at("whole", 12), stake = m.at("stake", 30), backs = m.at("backs", 44), ventures = m.at("ventures", 62);
  const lift = m.lerp([so - 2, whole + 6], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([stake - 4, stake + 10], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([ventures - 4, ventures + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.4 * close - 0.45 * wide, cx = 520 - 100 * close + 160 * wide, cy = 860 - 160 * close + 280 * wide;
  const needle = m.lerp([stake - 2, stake + 16], [-120, -120 + 240 * 0.36], Easing.out(Easing.back(1.6)));
  const boat = m.lerp([ventures, m.end], [0, 1], Easing.inOut(Easing.quad));
  const hookY = 760 - 300 * lift;
  return (
    <Stage p={p} bg="#2b2350" vignette={0.42}
      defs={<linearGradient id="ell-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e2a6e" /><stop offset="0.75" stopColor="#e07a6a" /><stop offset="1" stopColor="#ffc07a" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(90, 6)} cy={cy}>
        <rect x={-500} y={-700} width={2080} height={2000} fill="url(#ell-dusk)" />
        {/* new buildings across the water */}
        {[[820, 980, 200], [1020, 900, 280], [1220, 1000, 180]].map(([x, y, h], i) => {
          const up = m.lerp([ventures + i * 6, ventures + 30 + i * 6], [0.3, 1]);
          return <g key={i}><Block x={x!} y={1300 - h! * up} w={150} h={h! * up} fill="#5a4a7a" sw={4} /><Limb a={[x! + 75, 1300 - h! * up]} b={[x! + 75, 1300 - h! * up - 120]} w={8} color="#ffcf4a" sw={3} /></g>;
        })}
        <rect x={-500} y={1300} width={2080} height={900} fill="#2f5f8a" />
        {[0, 1, 2].map((i) => <line key={i} x1={-500} y1={1350 + i * 60} x2={1580} y2={1350 + i * 60} stroke="#7fc0e0" strokeWidth={4} strokeDasharray="70 50" strokeDashoffset={m.t * (2 + i)} />)}
        {/* the dock */}
        <Block x={-500} y={1260} w={900} h={80} fill="#8a6a4a" />
        {/* the crane */}
        <Limb a={[40, 1260]} b={[40, 180]} w={34} color="#ffcf4a" />
        <Limb a={[40, 200]} b={[560, 200]} w={28} color="#ffcf4a" />
        <line x1={480} y1={210} x2={480} y2={hookY - 40} stroke={INK} strokeWidth={6} />
        {/* the scale dial on the hook */}
        <g transform={`translate(480 ${hookY - 120})`}>
          <circle r={110} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
          <path d="M -90 30 A 95 95 0 0 1 90 30" stroke="#c9c4d8" strokeWidth={14} fill="none" />
          <line x1={0} y1={0} x2={Math.sin((needle * Math.PI) / 180) * 85} y2={-Math.cos((needle * Math.PI) / 180) * 85} stroke="#e0352b" strokeWidth={10} strokeLinecap="round" />
          <circle r={14} fill={INK} />
          <Txt x={0} y={60} size={50} fill={INK}>{m.t >= stake - 2 ? pct : ""}</Txt>
        </g>
        <Glow x={480} y={hookY - 120} r={220} color="#ffd23f" o={0.5 * m.pulse(stake + 8, 10)} />
        {/* the pledged block, hanging */}
        <g transform={`translate(0 ${hookY - 760})`}>
          <line x1={480} y1={720} x2={380} y2={780} stroke={INK} strokeWidth={5} />
          <line x1={480} y1={720} x2={580} y2={780} stroke={INK} strokeWidth={5} />
          <CertStack x={360} y={1060} w={240} n={13} />
          <Padlock x={480} y={980} s={0.9} />
        </g>
        {/* his whole stake on the dock */}
        <CertStack x={60} y={1260} w={240} n={m.lerp([whole - 4, whole + 8], [22, 22])} />
        <rect x={50} y={1210 - 22 * 22 - 70} width={260} height={64} rx={10} fill="#ffffff" stroke={INK} strokeWidth={4} opacity={m.pop(whole, 10)} />
        <Txt x={180} y={1210 - 22 * 22 - 38} size={46} fill={INK}>HIS STAKE</Txt>
        {/* cash down the chute, out on the boat */}
        <polygon points="560,1000 760,1250 720,1270 520,1030" fill="#9aa3b5" stroke={INK} strokeWidth={4} />
        {m.t >= backs ? [0, 1, 2].map((i) => {
          const f = ((m.t - backs) / 14 + i / 3) % 1;
          return <CashBag key={i} x={560 + f * 180} y={1010 + f * 230} s={0.5} />;
        }) : null}
        <g transform={`translate(${700 + boat * 420} ${1310 + m.wave(20, 6)})`}>
          <polygon points="-140,0 160,0 120,70 -110,70" fill="#e8e1d4" stroke={INK} strokeWidth={5} />
          <CashBag x={-40} y={0} s={0.55} />
          <CashBag x={40} y={0} s={0.55} />
        </g>
      </View>
    </Stage>
  );
};

export default Scale;
