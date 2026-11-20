// Payoff: "What Uber has left at the end is just {prof_pct} of Rohan's fare."
// The office after hours, one desk lamp. The camera pushes down on the jar on "What"; one coin rattles at its
// bottom on "left"; on "just" the share stamps onto the long fare receipt beside it; on "fare" the receipt
// unrolls across the desk and only a sliver at its end glows Uber green.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { Jar as GlassJar, UBERGREEN } from "./props";

type Params = { fig?: { pct?: string; fare?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const what = m.at("what", 2), left = m.at("left", 16), just = m.at("just", 34), fare = m.at("fare", 60);
  const push = m.lerp([what, left + 10], [0, 1], Easing.inOut(Easing.cubic));
  const unroll = m.lerp([just - 10, fare + 6], [0.35, 1], Easing.out(Easing.cubic));
  const rattle = m.t >= left && m.t < left + 14 ? Math.sin(m.t * 2.6) * 10 : 0;
  const len = 1000 * unroll;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#07091a" vignette={0.55}>
        <View zoom={1.0 + 0.15 * push} cx={540} cy={820 + 40 * push}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#0e1124" />
          {/* the lamp */}
          <path d="M 860 120 L 760 300 L 960 300 Z" fill="#3a3f55" stroke={INK} strokeWidth={STROKE} />
          <polygon points="760,300 960,300 1200,1100 300,1100" fill="#ffe7a3" opacity={0.18} />
          <Glow x={700} y={900} r={520} color="#ffd98a" o={0.45} />
          <Block x={-200} y={1080} w={1480} h={120} r={10} fill="#8a5226" />
          <rect x={-200} y={1200} width={1480} height={800} fill="#5a3418" stroke={INK} strokeWidth={STROKE} />
          {/* the jar with one coin */}
          <GlassJar x={230} y={1085} w={260} h={330} fill={0} />
          <Coin x={230 + rattle} y={1050} r={30} spin={Math.abs(Math.cos(m.t / 5))} />
          {/* the long fare receipt, unrolling up the wall from the desk */}
          <g transform="translate(470 1080)">
            <rect x={0} y={-len} width={420} height={len} fill="#fffdf6" stroke={INK} strokeWidth={5} />
            <rect x={3} y={-len + 3} width={414} height={110} fill="#000000" />
            <g transform={`translate(210 ${-len + 85})`}><Photo name="uber" s={50} t={0} /></g>
            <Txt x={210} y={-len + 160} size={46} fill={INK}>YOUR FARE</Txt>
            <Txt x={210} y={-len + 230} size={64} fill={INK}>{f.fare ?? ""}</Txt>
            {Array.from({ length: 8 }).map((_, i) => (-len + 300 + i * 80 < -60 ? <rect key={i} x={40} y={-len + 300 + i * 80} width={340} height={12} rx={6} fill="#d9d3c4" /> : null))}
            {/* the sliver Uber keeps in the end */}
            <rect x={3} y={-26} width={414} height={23} fill={UBERGREEN} opacity={0.5 + 0.5 * m.pulse(fare, 10) + 0.3 * m.wave(20, 0.3)} />
            <Glow x={210} y={-14} r={220} color={UBERGREEN} o={0.35 + 0.4 * m.pulse(fare, 10)} ry={40} />
          </g>
          <Tag x={110} y={480} w={320} h={150} text={f.pct ?? ""} size={96} bg={UBERGREEN} fg="#ffffff" k={m.pop(just, 10)} rot={-8} />
          {m.t >= just ? <Txt x={275} y={680} size={44} fill="#ffffff" stroke={INK}>LEFT FOR UBER</Txt> : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Payoff;
