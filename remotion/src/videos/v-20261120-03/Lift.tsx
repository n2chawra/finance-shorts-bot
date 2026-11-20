// Turn: "So the team's price climbed with the league, not with the scoreboard."
// A construction site: a price arrow sign lights on the arena's roof on "price", a giant jack pumps the arena up into
// the sky on "climbed", a league banner unrolls under it, rising too, on "league", and the small scoreboard left on the
// ground still shows L on "scoreboard", close.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Limb, SourceLine, Stage, Tag, View, motion } from "../../flat/kit";
import { GOLD, PURPLE, Scoreboard, TEAL } from "./props";

const Lift: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = m.at("price", 4), climbed = m.at("climbed", 14), league = m.at("league", 34), board = m.at("scoreboard", 60);
  const up = m.lerp([climbed, board], [0, 1], Easing.inOut(Easing.cubic)) * 480 + m.wave(10, 6) * (m.t > climbed && m.t < board ? 1 : 0);
  const banner = m.lerp([league, league + 12], [0, 1]);
  const close = m.lerp([board - 2, board + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#7cc4ff" vignette={0.3}>
        <View zoom={1.0 + 0.25 * close} cx={540 - 200 * close + m.wave(60, 6)} cy={800 + 220 * close - 100 * (1 - close) * (up / 480)}>
          <rect x={-500} y={-900} width={2080} height={2300} fill="#8fd0ff" />
          <rect x={-500} y={1300} width={2080} height={1300} fill="#c9a46a" />
          {/* the crane */}
          <Limb a={[960, 1300]} b={[960, 100]} w={26} color="#f0b020" />
          <Limb a={[700, 120]} b={[1200, 120]} w={22} color="#f0b020" />
          {/* the jack */}
          <Block x={460} y={1300 - up} w={160} h={up + 10} fill="#d23b2b" />
          <Block x={380} y={1240} w={320} h={80} r={10} fill="#3a3a48" />
          {/* the league banner under the arena */}
          <g opacity={banner}>
            <Block x={180} y={1060 - up} w={720} h={180 * banner} r={10} fill="#ffffff" />
            <rect x={200} y={1080 - up} width={340} height={140 * banner} fill="#2f6fd6" />
            <rect x={540} y={1080 - up} width={340} height={140 * banner} fill="#e23b3b" />
          </g>
          {/* the arena */}
          <g transform={`translate(0 ${-up})`}>
            <path d="M 160 1060 Q 540 760 920 1060 Z" fill={TEAL} stroke="#1d1a2b" strokeWidth={8} />
            <Block x={160} y={1000} w={760} h={70} r={10} fill={PURPLE} />
            <Glow x={540} y={760} r={260} color={GOLD} o={m.t >= price ? 0.6 : 0} />
            <Tag x={400} y={700} w={280} h={110} text="PRICE ▲" size={52} bg={GOLD} k={m.t >= price ? 1 : 0} />
          </g>
          {/* the scoreboard left on the ground */}
          <Scoreboard x={40} y={900} w={320} text="L" m={m} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Lift;
