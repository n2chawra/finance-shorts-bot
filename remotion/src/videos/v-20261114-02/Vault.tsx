// Turn: "Those cards brought in $5.9B in one year."
// The counting room behind the desk at night: one card slides into the vault door's slot on "Those", then
// thousands pour down a chute into a mountain on "cards"; the camera pulls back on "brought" as the counter
// over the vault counts up, landing on the figure on "one" as gold light floods the room.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, INK, Limb, STROKE, Stage, View, countText, motion, rng } from "../../flat/kit";
import { BLUE, BigCard, RED } from "./props";

type Params = { fig?: { fees?: string } };

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fees = (p.beat.params as Params).fig?.fees ?? "";
  const those = m.at("those", 2), cards = m.at("cards", 12), brought = m.at("brought", 22), one = m.at("one", 70);
  const back = m.lerp([brought - 2, brought + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.75 - 0.75 * back + m.lerp([brought + 16, m.end], [0, 0.05]);
  const cx = 540, cy = 860 - 20 * back;
  const k = m.lerp([brought + 6, one + 4], [0, 1], Easing.out(Easing.quad));
  const gold = m.lerp([one, one + 12], [0, 1]);
  const r = rng("vault-cards");
  const pile = Array.from({ length: 60 }).map(() => [r(), r(), r() * 60 - 30] as const);
  const grow = m.lerp([brought + 6, one + 10], [0, 1], Easing.out(Easing.quad));
  const slide = m.lerp([those, those + 12], [-260, 0], Easing.out(Easing.quad));
  return (
    <Stage p={p} bg="#141a33" vignette={0.5}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={2700} fill="#1d2547" />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={-400 + i * 160} y1={-400} x2={-400 + i * 160} y2={1100} stroke="#232c55" strokeWidth={8} />)}
        <rect x={-500} y={1100} width={2080} height={1100} fill="#2a2f4a" />
        <Glow x={540} y={820} r={700} color="#ffcf5c" o={0.15 + 0.5 * gold} />
        {/* the vault door */}
        <Ball x={540} y={820} r={280} fill="#8f96ad" />
        <Ball x={540} y={820} r={210} fill="#a9b0c4" />
        <g transform={`rotate(${m.lerp([0, m.end], [0, 40])} 540 820)`}>
          {[0, 60, 120].map((a) => <Limb key={a} a={[540 - Math.cos((a * Math.PI) / 180) * 150, 820 - Math.sin((a * Math.PI) / 180) * 150]} b={[540 + Math.cos((a * Math.PI) / 180) * 150, 820 + Math.sin((a * Math.PI) / 180) * 150]} w={18} color="#5b6278" sw={4} />)}
          <Ball x={540} y={820} r={50} fill="#5b6278" />
        </g>
        <Block x={430} y={600} w={220} h={34} r={8} fill="#0b0f14" shadow={false} />
        {m.t < cards + 6 ? (
          <g transform={`translate(${slide} ${m.lerp([those + 12, cards + 6], [0, -80])})`}><BigCard x={470} y={520} w={140} h={90} name={false} /></g>
        ) : null}
        {/* the chute and the mountain of cards */}
        <polygon points="-200,180 120,180 330,600 230,640" fill="#5b6278" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        {m.t > cards ? Array.from({ length: 10 }).map((_, i) => {
          const f = ((m.t - cards) * 0.07 + i / 10) % 1;
          return <g key={i}><BigCard x={-120 + 380 * f - 45} y={190 + 460 * f + f * f * 300} w={90} h={58} name={false} rot={f * 300 + i * 30} /></g>;
        }) : null}
        {grow > 0.02 ? <g transform={`translate(540 1300) scale(${grow}) translate(-540 -1300)`}>
          <path d="M 40 1300 Q 540 820 1040 1300 Z" fill="#e9ecf3" stroke={INK} strokeWidth={STROKE} />
          {pile.map(([a, b, rot], i) => {
            const x = 120 + a * 840, top = 1300 - (1 - Math.abs(x - 540) / 520) * 430 * b;
            return <g key={i}><BigCard x={x - 50} y={top - 30} w={100} h={64} name={false} rot={rot} /></g>;
          })}
        </g> : null}
        <Display x={130} y={190} w={820} h={290} label="MEMBERSHIP FEES" value={countText(fees, k)} color={gold > 0.5 ? "#ffd23f" : "#4dff9a"} k={m.lerp([brought + 6, brought + 14], [0, 1])} />
        <rect x={130} y={480} width={14} height={120} fill={RED} />
        <rect x={936} y={480} width={14} height={120} fill={BLUE} />
      </View>
    </Stage>
  );
};

export default Vault;
