// Promise: "So what was it worth when he finally sold?"
// An auction hall: the lights come up on a podium with the team jersey on a stand on "So", the price board spins its
// digits on "worth", the auctioneer raises the gavel on "finally", and it slams on "sold" as a question mark stamps on
// the board.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, SourceLine, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GOLD, Gavel, Jersey, PURPLE, PriceBoard } from "./props";

/** The hall, shared with the payoff. */
export const Hall: React.FC<{ lit: number; children?: React.ReactNode }> = ({ lit, children }) => (
  <g>
    <rect x={-500} y={-600} width={2080} height={3200} fill="#3a1f2c" />
    {[-200, 200, 600, 1000].map((x) => <Block key={x} x={x} y={-200} w={120} h={1400} fill="#5a2f40" />)}
    <rect x={-500} y={1150} width={2080} height={1400} fill="#6b3a2a" />
    {Array.from({ length: 5 }).map((_, i) => <Block key={i} x={-120 + i * 280} y={1400} w={220} h={120} r={20} fill={PURPLE} />)}
    <Glow x={540} y={500} r={700} color={GOLD} o={0.15 + 0.25 * lit} />
    {children}
  </g>
);


const Auction: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const so = m.at("so", 2), worth = m.at("worth", 14), fin = m.at("finally", 30), sold = m.at("sold", 40);
  const lit = m.lerp([so, so + 10], [0.2, 1]);
  const spin = m.t >= worth && m.t < sold ? ["? ? ?", "?  ? ", " ? ? "][Math.floor(m.t / 3) % 3]! : "";
  const lift = m.t < fin ? 0 : m.t < sold ? m.lerp([fin, fin + 6], [0, 1]) : m.lerp([sold, sold + 3], [1, 0]);
  const q = m.pop(sold, 9);
  const push = m.lerp([sold - 4, sold + 10], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a1f2c" vignette={0.42}>
        <View zoom={1.0 + 0.15 * push + 0.08 * m.pulse(sold, 4)} cx={540 + m.wave(60, 6)} cy={820 - 60 * push}>
          <Hall lit={lit}>
            <PriceBoard x={190} y={250} w={700} h={330} text={spin} label="SOLD FOR" m={m} />
            {q > 0 ? <Tag x={440} y={390} w={200} h={170} text="?" size={140} bg="#ff4b4b" fg="#ffffff" k={q} /> : null}
            <Jersey x={300} y={960} s={1.1} />
            <Block x={600} y={1130} w={360} h={250} r={12} fill="#7a4a2a" />
            <Char x={830} y={1140 + m.wave(50, 3)} s={180} outfit="suit" top="#2c2c38" face={m.t >= sold ? "grin" : "neutral"} look={[-1, -0.3]} armR={[80 + 60 * lift, 40]} />
            <Gavel x={680} y={1100} lift={lift} />
          </Hall>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Auction;
