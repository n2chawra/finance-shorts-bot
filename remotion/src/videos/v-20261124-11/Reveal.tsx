// "That hole is a country, Lesotho." Closer over the gap in South Africa: it pulses, its border runs round in
// light, and on "Lesotho" the country's flag fills it and its name writes across it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { HOOK_START, HookMap, pushTo } from "./Hook";

const Reveal: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ho = m.at("hole", 2), co = m.at("country", 16), le = m.at("lesotho", 34);
  const push = 0.7 + 0.3 * m.lerp([0, le + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01) + 0.03 * m.lerp([le, m.end], [0, 1])}>
        <HookMap center={pushTo(push)} scale={HOOK_START.scale + 6100 * push}
          trace={1}
          hole={0.35 + m.pulse(ho + 4, 10) * (1 - m.lerp([co, le], [0, 1]))}
          edge={m.lerp([co, co + 20], [0, 1])}
          flag={m.lerp([le, le + 14], [0, 1])}
          label={m.pop(le + 4, 12)} sa={0} />
      </View>
    </Stage>
  );
};

export default Reveal;
