// Build: "A giant paycheck? No. Most of it comes as McDonald's shares and stock options."
// A steel vault under the tower. The round door swings open on a giant paycheck on "giant", it shrinks to a thin slip
// on "No", share certificates with the golden arches rain into a pile on "shares" (a SHARES tag stamps), and a second
// pile of option papers climbs beside it on "options" (an OPTIONS tag stamps).
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, SourceLine, Stage, Tag, Txt, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Certificate, GOLD } from "./props";

const R = rng("mcd-vault");
const FALL = Array.from({ length: 14 }).map((_, i) => ({ dx: R() * 260 - 130, rot: R() * 40 - 20, d: i * 2 }));

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const giant = m.at("giant", 2), no = m.at("no", 26), shares = m.at("shares", 60), options = m.at("options", 80);
  const door = m.lerp([giant - 4, giant + 12], [0, 1], Easing.out(Easing.cubic));
  const shrink = m.lerp([no - 1, no + 8], [1, 0.55], Easing.out(Easing.back(1.5)));
  const pileA = m.lerp([shares, shares + 24], [0, 1]);
  const pileB = m.lerp([options, options + 24], [0, 1]);
  const wide = m.lerp([options - 4, options + 14], [0, 1], Easing.inOut(Easing.cubic));
  const pile = (x: number, k: number, key: string, tint: boolean) => (
    <g key={key}>
      {Array.from({ length: Math.round(k * 10) }).map((_, i) => (
        <g key={i} transform={tint ? "" : ""}><Certificate x={x + ((i * 37) % 50) - 25} y={1180 - i * 62} rot={((i * 53) % 16) - 8} /></g>
      ))}
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#232a3d" vignette={0.42}>
        <View zoom={1.12 - 0.12 * wide} cx={540 + m.wave(70, 6)} cy={860 + 60 * wide + m.wave(60, 5)}>
          <rect x={-500} y={-500} width={2080} height={3000} fill="#5a6278" />
          {[300, 560, 820].map((y) => <Block key={y} x={-400} y={y} w={1880} h={24} fill="#3a4258" />)}
          {[300, 560].map((y) => [0, 1, 2, 3, 4, 5].map((i) => <Block key={`${y}-${i}`} x={-60 + i * 210} y={y - 120} w={150} h={120} r={6} fill={i % 2 ? "#6b7590" : "#7a849e"} />))}
          <rect x={-500} y={1300} width={2080} height={1300} fill="#3a3f52" />
          <Glow x={540} y={800} r={600} color={GOLD} o={0.18 + 0.2 * pileA} />
          {/* the giant paycheck, then a thin slip */}
          <g transform={`translate(540 760) scale(${door > 0.2 ? shrink : 0.01})`}>
            <Block x={-360} y={-150} w={720} h={300} r={16} fill="#e9f4e4" />
            <Txt x={0} y={-80} size={42} fill="#2f6b45" deco>PAYCHECK</Txt>
            <Txt x={0} y={60} size={40} fill="#d62d20" deco>CASH</Txt>
            <rect x={-280} y={20} width={560} height={14} rx={6} fill="#9cc4a8" />
            <rect x={-280} y={70} width={380} height={14} rx={6} fill="#9cc4a8" />
          </g>
          {/* falling and piled certificates */}
          {m.t >= shares && pileA < 1 ? FALL.map((f, i) => (
            <Certificate key={i} x={380 + f.dx} y={-100 + ((m.t - shares - f.d) * 38) % 1200} rot={f.rot + m.t * 2} />
          )) : null}
          {pile(320, pileA, "a", false)}
          {pile(740, pileB, "b", true)}
          <Tag x={240} y={1220} w={300} h={100} text="SHARES" bg={GOLD} k={m.t >= shares ? 1 : 0} rot={-4} />
          <Tag x={630} y={1220} w={300} h={100} text="OPTIONS" bg="#7fd1a8" k={m.t >= options ? 1 : 0} rot={4} />
          <Char x={120} y={1580} s={190} outfit="suit" top="#2c3550" photo="kempczinski" face={m.t >= shares ? "grin" : "smirk"} look={[1, -0.6]}
            armR={m.t >= shares ? [150 + m.wave(9, 18), 160 + m.wave(9, 12)] : [40, 30]} armL={m.t >= shares ? [140 - m.wave(9, 18), 150] : [20, 10]} />
          {/* the round vault door swinging open */}
          <g transform={`translate(${-60 + 1060 * door} 760) scale(${1 - 0.8 * door} 1)`}>
            <circle cx={0} cy={0} r={560} fill="#8a93a8" stroke="#1d1a2b" strokeWidth={8} />
            <circle cx={0} cy={0} r={420} fill="#9aa3b8" stroke="#1d1a2b" strokeWidth={6} />
            <circle cx={0} cy={0} r={80} fill="#5a6278" stroke="#1d1a2b" strokeWidth={6} />
          </g>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Vault;
