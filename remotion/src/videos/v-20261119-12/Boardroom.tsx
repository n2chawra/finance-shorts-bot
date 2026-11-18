// Build: "Inside Netflix, every show gets a score in dollars: its impact value."
// Netflix's boardroom high above the city: the doors swing open on a long table on "Inside", show posters slide up on
// the wall screen on "every", a dollar scorecard flips under each poster on "score", the dollar signs light up on
// "dollars", and an IMPACT VALUE folder lands on the table on "impact".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, CityWindow, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Folder } from "./props";

const Boardroom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const inside = m.at("inside", 2), every = m.at("every", 14), score = m.at("score", 26), dollars = m.at("dollars", 38), impact = m.at("impact", 50);
  const doors = m.lerp([inside - 2, inside + 12], [0, 1], Easing.out(Easing.cubic));
  const posters = [0, 1, 2].map((i) => 0.55 + 0.45 * m.lerp([every - 2 + i * 4, every + 8 + i * 4], [0, 1], Easing.out(Easing.back(1.4))));
  const cards = [0, 1, 2].map((i) => m.pop(score - 1 + i * 3, 10));
  const lit = m.t >= dollars;
  const folder = m.lerp([impact - 6, impact + 4], [0, 1], Easing.bounce);
  const push = m.lerp([score - 4, score + 12], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([impact - 4, impact + 12], [0, 1], Easing.inOut(Easing.cubic));
  const colors = ["#f07aa8", "#5ab4ff", "#f5c542"];
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#141826" vignette={0.42}>
        <View zoom={1.0 + 0.14 * push + 0.14 * close} cx={540 + m.wave(60, 8)} cy={760 + 300 * close + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#20263a" />
          <CityWindow x={-300} y={200} w={300} h={700} night seed="board-l" />
          <CityWindow x={1080} y={200} w={300} h={700} night seed="board-r" />
          {/* the wall screen */}
          <Block x={60} y={220} w={960} h={620} r={16} fill="#0b0f14" />
          <Txt x={540} y={290} size={52} fill="#e50914">NETFLIX</Txt>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${(1 - posters[i]!) * 120})`} opacity={posters[i]!}>
              <Block x={110 + i * 310} y={340} w={240} h={300} r={10} fill={colors[i]!} />
              <circle cx={230 + i * 310} cy={450} r={60} fill="#ffffff" opacity={0.6} />
              <rect x={150 + i * 310} y={560} width={160} height={20} rx={8} fill="#ffffff" opacity={0.7} />
            </g>
          ))}
          {[0, 1, 2].map((i) => (cards[i]! > 0 ? (
            <g key={i} transform={`translate(${230 + i * 310} 730) scale(1 ${cards[i]!}) translate(${-(230 + i * 310)} -730)`}>
              <Block x={130 + i * 310} y={670} w={200} h={120} r={10} fill="#ffffff" />
              <Txt x={230 + i * 310} y={730} size={64} fill={lit ? "#3fb07a" : "#9aa3b5"}>USD</Txt>
            </g>
          ) : null))}
          <Glow x={540} y={540} r={500} color="#5ab4ff" o={lit ? 0.3 : 0.12} />
          {/* the doors and the table */}
          <rect x={-400} y={900} width={1880} height={1000} fill="#2c2420" />
          <Block x={60} y={1020} w={960} h={140} r={30} fill="#6a4a30" />
          {[150, 930].map((x, i) => <Char key={i} x={x} y={1340} s={170} outfit="suit" face={lit ? "grin" : "neutral"} look={[i ? -1 : 1, -0.6]} armR={[30, 20]} armL={[30, 20]} />)}
          <Folder x={310} y={760 + 280 * folder} w={460} open={0} title="IMPACT VALUE" />
          <rect x={-400} y={-400} width={1880 * (1 - doors) / 2} height={2700} fill="#3a2a1a" />
          <rect x={1480 - 1880 * (1 - doors) / 2} y={-400} width={1880 * (1 - doors) / 2} height={2700} fill="#3a2a1a" />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Boardroom;
