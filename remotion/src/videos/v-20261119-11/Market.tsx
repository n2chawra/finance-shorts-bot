// Build: "Musk's part alone gives each person about {musk_per_part}."
// A busy street market in the morning: a delivery drone marked MUSK drops an envelope at the fruit stall on
// "Musk's", Rohan tears it open and bills fan out on "gives", the amount stamps on the envelope's tag on "each",
// and Rohan holds the bills up beside a bag of fruit, grinning, on "person".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Cash, Glow, Limb, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Envelope } from "./props";

type Params = { fig?: { each?: string } };

const Market: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const musk = m.at("musks", 2), gives = m.at("gives", 14), each = m.at("each", 22), person = m.at("person", 30);
  const drop = m.lerp([0, musk + 10], [0, 1], Easing.out(Easing.cubic));
  const open = m.lerp([gives - 2, gives + 8], [0, 1]);
  const fan = m.pop(gives + 2);
  const tag = m.pop(each - 1, 9);
  const hold = m.lerp([person - 3, person + 8], [0, 1], Easing.out(Easing.back(1.4)));
  const push = m.lerp([gives - 4, gives + 12], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([person - 4, person + 14], [0, 1], Easing.inOut(Easing.cubic));
  const envY = 300 + 520 * drop;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#ffd89a" vignette={0.3}>
        <View zoom={1.04 + 0.2 * push - 0.14 * back} cx={540 + m.wave(60, 8)} cy={900 + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#ffe2ad" />
          <Glow x={200} y={200} r={300} color="#fff6c0" o={0.7} />
          {/* shop fronts behind */}
          {[-200, 260, 720].map((x, i) => (
            <g key={i}>
              <Block x={x} y={300} w={420} h={700} fill={["#e8a87c", "#c3d7a4", "#a4c3d7"][i]!} />
              <Block x={x + 60} y={560} w={120} h={180} fill="#3a5068" shadow={false} />
              <Block x={x + 240} y={560} w={120} h={180} fill="#3a5068" shadow={false} />
            </g>
          ))}
          <rect x={-400} y={1250} width={1880} height={900} fill="#b9a68a" />
          {/* the fruit stall */}
          <Block x={60} y={980} w={960} h={280} fill="#8a5a3a" />
          {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${40 + i * 100} 760 L ${140 + i * 100} 760 L ${140 + i * 100} 830 Q ${90 + i * 100} 870 ${40 + i * 100} 830 Z`} fill={i % 2 ? "#ffffff" : "#e9473b"} stroke="#1d1a2b" strokeWidth={4} />)}
          <Limb a={[60, 760]} b={[60, 990]} w={14} color="#6a4a2a" />
          <Limb a={[1020, 760]} b={[1020, 990]} w={14} color="#6a4a2a" />
          {Array.from({ length: 12 }).map((_, i) => <Ball key={i} x={120 + (i % 6) * 70} y={950 - Math.floor(i / 6) * 50} r={30} fill={i % 3 ? "#f39c12" : "#e74c3c"} sw={4} />)}
          {Array.from({ length: 6 }).map((_, i) => <Ball key={i} x={620 + i * 60} y={950} r={26} fill="#7ac943" sw={4} />)}
          {/* the drone */}
          <g transform={`translate(${-200 * (1 - drop)} ${-40 * drop + m.wave(14, 4)})`}>
            <Block x={420} y={160} w={240} h={70} r={20} fill="#2a2f3d" />
            <Txt x={540} y={196} size={46} fill="#ffffff">MUSK</Txt>
            <Limb a={[400, 150]} b={[680, 150]} w={8} color="#2a2f3d" />
            <ellipse cx={400} cy={140} rx={70 * Math.abs(Math.cos(m.t))} ry={10} fill="#9aa3b5" />
            <ellipse cx={680} cy={140} rx={70 * Math.abs(Math.cos(m.t + 1))} ry={10} fill="#9aa3b5" />
          </g>
          {/* Rohan with the envelope */}
          <Char x={330} y={1330 + m.wave(50, 3)} s={160} who="rohan" face={m.t >= person ? "grin" : m.t >= gives ? "happy" : "neutral"} look={[0.8, -0.3]}
            armR={[60 + 80 * hold, 40 + 60 * hold]} armL={[40, 30]} />
          <Envelope x={460} y={envY - 100 * hold} w={260} open={open} label={open > 0.5 ? "" : "MUSK"} />
          {fan > 0 ? [0, 1, 2].map((i) => (
            <g key={i} transform={`rotate(${(i - 1) * 18 * fan} ${590} ${envY - 100 * hold})`}>
              <Cash x={540} y={envY - 100 * hold - 120 * fan} w={110} />
            </g>
          )) : null}
          {tag > 0 ? <Tag x={450} y={540} w={340} h={140} text={fig.each ?? ""} size={84} bg="#ffd34a" rot={5} k={tag} /> : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Market;
