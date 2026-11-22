// Loop: "Barista or boss: who earns more from your next coffee at Starbucks?"
// Back at the green Starbucks café counter: the barista waves on "Barista", the boss's poster lights up on "boss", a
// fresh cup slides onto the counter on "coffee", and the green STARBUCKS sign flickers on "Starbucks" as the morning
// rush comes back: the hook's opening frame, so the Short loops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Barista, CafeSet, Cup, Poster } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const b = m.at("barista", 0), boss = m.at("boss", 10), coffee = m.at("coffee", 24), sb = m.at("starbucks", m.end - 14);
  const wave = m.t >= b ? Math.sin((m.t - b) / 3) * 20 : 0;
  const glow = m.lerp([boss, boss + 8], [0, 1]) * (1 - m.lerp([coffee, coffee + 10], [0, 1]));
  const slide = m.lerp([coffee, coffee + 12], [0, 1]);
  const sign = 0.6 + 0.4 * Math.abs(Math.sin(Math.max(0, m.t - sb) / 2));
  const zoom = m.t < coffee ? 1.0 : m.t < sb ? m.lerp([coffee, coffee + 10], [1.0, 1.15]) : m.lerp([sb, m.end], [1.15, 1.1]);
  const cy = m.t < coffee ? 860 : 900;
  return (
    <Stage p={p} bg="#efe6d6" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(110, 4)} cy={cy}>
        <CafeSet m={m} sign={m.t >= sb ? sign : 1} />
        <Poster x={190} y={380} w={300} glow={glow} />
        <Barista x={640} y={1330} s={170} m={m} face="happy" look={[-0.6, 0]} armL={[150 + wave, 160]} armR={[20, 10]} />
        <Cup x={900 - 300 * slide} y={1180} s={0.9} />
        <Char x={170} y={1560} s={190} who="rohan" face="neutral" look={[0.6, -0.3]} armR={[30, 20]} armL={[10, 10]} />
      </View>
    </Stage>
  );
};

export default Loop;
