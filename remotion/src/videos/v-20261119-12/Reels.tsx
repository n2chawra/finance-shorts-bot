// Build: "Each episode cost Netflix about {fact3}."
// An editing room with film reels: an editor slides a reel onto the desk on "Each", the reel's label
// lights EPISODE on "episode", a stack of reels rises beside it on "Netflix", and a price tag stamps onto the reel on
// "about".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Reel } from "./props";

type Params = { fig?: { each?: string } };

const Reels: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const each = (p.beat.params as Params).fig?.each ?? "";
  const e = m.at("each", 2), ep = m.at("episode", 10), nf = m.at("netflix", 22), ab = m.at("about", 30);
  const slide = m.lerp([e - 2, e + 10], [0, 1], Easing.out(Easing.cubic));
  const label = m.pop(ep - 1);
  const stack = m.lerp([nf - 2, nf + 12], [0, 1], Easing.out(Easing.back(1.3)));
  const tag = m.pop(ab, 9);
  const push = m.lerp([ep - 4, ep + 10], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([ab - 2, ab + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#14182a" vignette={0.42}>
        <View zoom={1.05 + 0.2 * push - 0.15 * back} cx={560 + m.wave(60, 8)} cy={860 + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#1c2238" />
          {/* the monitors */}
          <Block x={80} y={260} w={420} h={260} r={12} fill="#0b0f14" />
          <Block x={560} y={260} w={420} h={260} r={12} fill="#0b0f14" />
          <rect x={100} y={280} width={380} height={220} fill="#f07aa8" opacity={0.7} />
          <rect x={580} y={280} width={380} height={220} fill="#3fb07a" opacity={0.7} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={100 + i * 32} y={470} width={26} height={18} fill={i <= (m.t / 3) % 12 ? "#ffffff" : "#55556a"} />)}
          <Glow x={540} y={400} r={500} color="#f07aa8" o={0.2} />
          {/* the desk */}
          <Block x={-200} y={980} w={1480} h={80} fill="#5a4030" />
          <rect x={-200} y={1060} width={1480} height={900} fill="#2a2030" />
          <Char x={200} y={1300 + m.wave(50, 3)} s={150} who="priya" face={m.t >= ab ? "grin" : "neutral"} look={[1, 0.2]}
            armR={[70 + 20 * (1 - slide), 70]} armL={[30, 20]} />
          {/* stack of reels */}
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} opacity={stack > i / 5 ? 1 : 0}>
              <Block x={760} y={960 - i * 46 * stack} w={200} h={40} r={8} fill="#8a8fa0" />
            </g>
          ))}
          <Reel x={330 + 260 * slide} y={830} r={150} spin={m.t * 3} label={label > 0 ? "EPISODE" : undefined} />
          {tag > 0 ? <Tag x={330} y={560} w={420} h={140} text={each} size={80} bg="#ffd34a" rot={-6} k={tag} /> : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Reels;
