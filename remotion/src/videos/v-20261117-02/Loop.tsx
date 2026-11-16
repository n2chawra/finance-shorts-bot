// Loop: "Popcorn or the film: which one is AMC really selling? Because"
// Back in the AMC lobby: the popcorn machine glows on "Popcorn", the film poster over it lights up on "film", the
// AMC sign flickers on "AMC", Rohan looks from one to the other on "selling", and on "Because" the camera pushes to
// the box office, the hook's first frame.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Lobby } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pop = m.at("popcorn", 1), film = m.at("film", 14), amc = m.at("amc", 26), selling = m.at("selling", 36), because = m.at("because", 50);
  const poster = m.t >= film ? 1 : 0.25;
  const sign = m.t < amc ? 0.3 : (m.t < amc + 8 ? (Math.floor(m.t / 2) % 2 ? 0.4 : 1) : 1);
  const look: [number, number] = m.t < selling ? [1, -0.5] : (Math.floor((m.t - selling) / 10) % 2 ? [1, -0.5] : [-1, -0.4]);
  const push = m.lerp([because - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.1 * push, cx = 540 - 70 * push, cy = 880 + 20 * push;
  return (
    <Stage p={p} bg="#2a1630" vignette={0.44}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <Lobby m={m} price="" sign={sign} slide={0} burst={m.t >= pop ? 1 : 0.15} face="worried" look={look} />
        <g opacity={poster}>
          <Glow x={785} y={300} r={260} color="#7cc4ff" o={0.5} />
          <Block x={640} y={120} w={290} h={340} r={10} fill="#1b2a5a" />
          <Txt x={785} y={210} size={48} fill="#ffffff">NOW</Txt>
          <Txt x={785} y={270} size={48} fill="#ffffff">SHOWING</Txt>
          <Block x={690} y={320} w={190} h={110} r={8} fill="#7cc4ff" />
        </g>
      </View>
    </Stage>
  );
};

export default Loop;
