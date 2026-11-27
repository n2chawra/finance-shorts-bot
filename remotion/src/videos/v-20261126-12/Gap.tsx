// "It already did, once, and it all hangs on one gap at Gibraltar." The sea floods back to full; ONCE is stamped on
// it; the camera slides west; the gap between Europe and Africa glows; GIBRALTAR writes on beside it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Dry, GIB, Map, On } from "./props";

const Gap: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const al = m.at("already", 2), on = m.at("once", 16), ha = m.at("hangs", 34), ga = m.at("gap", 50), gi = m.at("gibraltar", 62);
  const west = m.lerp([ha - 2, ga + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[15.0 - 18.5 * west, 35.6 + 0.6 * west]} scale={1500 + 2600 * west}>
          <Dry level={0.4 + 0.6 * m.lerp([al, al + 18], [0, 1])} t={m.t} />
          <On at={[15.0, 37.0]} draw={(x, y) => <Tag x={x - 150} y={y - 50} w={300} h={100} text="ONCE" size={64} rot={-8} bg="#f2b134" k={m.pop(on, 10) * (1 - west)} />} />
          <On at={GIB} draw={(x, y) => <Glow x={x} y={y} r={90 + 20 * Math.sin(m.t / 6)} color="#fff2b0" o={0.9 * m.lerp([ga, ga + 10], [0, 1])} />} />
          <MapLabel at={[GIB[0] + 1.2, GIB[1] + 1.1]} text="GIBRALTAR" size={56} k={m.pop(gi, 12)} type={m.lerp([gi, gi + 16], [0, 1])} />
        </Map>
      </View>
    </Stage>
  );
};
export default Gap;
