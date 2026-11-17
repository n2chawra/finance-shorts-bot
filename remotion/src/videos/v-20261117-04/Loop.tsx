// Loop: "Coffee or gas: which one is it really selling you? Because"
// Back at the pump at night: Rohan lifts his coffee on "Coffee", the nozzle in his other hand rises on "gas", he looks
// from one to the other as the camera pulls back on "selling", and on "Because" the pump's fuel bar starts running
// again as the camera settles on the hook's first frame.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Forecourt } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const coffee = m.at("coffee", 2), gas = m.at("gas", 16), selling = m.at("selling", 34), because = m.at("because", 50);
  const lift = m.t >= coffee ? m.pop(coffee, 10) : 0;
  const wide = m.lerp([selling - 4, selling + 10], [0, 1], Easing.inOut(Easing.cubic));
  const settle = m.lerp([because - 2, because + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.22 - 0.16 * wide + 0.12 * settle;
  const look: [number, number] = m.t >= selling ? [Math.sin(m.t / 6), -0.3] : m.t >= gas ? [1, -0.4] : [-0.6, -0.4];
  return (
    <Stage p={p} bg="#141a33" vignette={0.42}>
      <View zoom={Math.min(zoom, 1.22)} cx={600 - 60 * wide + 60 * settle + m.wave(40, 14)} cy={(820 + 60 * wide - 60 * settle) + m.wave(56, 10)}>
        <Forecourt m={m} flow={m.t >= because ? 1 : m.t >= gas ? 0.6 : 0.2} sign={m.t >= gas ? 1 : 0.6} tag={0} share="" coffee={lift} face={m.t >= selling ? "grin" : "neutral"} look={look} />
      </View>
    </Stage>
  );
};

export default Loop;
