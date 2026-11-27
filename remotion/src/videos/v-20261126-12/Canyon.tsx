// "Rivers like the Nile chased the falling water, carving deep canyons down to the new floor." The Nile glints as it
// flows north; NILE writes on; its end runs north after the waterline; a canyon cuts open along its path; the camera
// pushes in on the canyon walls; the river spills onto the salt floor.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { Dry, Map, NILE, On } from "./props";

const RIVER: [number, number][] = [[31.3, 26.5], [31.1, 28.5], [31.25, 30.1], NILE];
const CUT: [number, number][] = [[31.25, 30.1], NILE, [31.2, 32.3], [31.0, 33.0]];

const Canyon: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ri = m.at("rivers", 2), ni = m.at("nile", 12), ch = m.at("chased", 26), ca = m.at("carving", 46), cn = m.at("canyons", 60), fl = m.at("floor", 82);
  const close = m.lerp([cn - 4, cn + 18], [0, 1]);
  const cut = m.lerp([ca, ca + 26], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[31.1, 30.0 + 0.8 * close]} scale={7000 + 3000 * close}>
          <Dry level={0.3} t={m.t} glitter={0.5} />
          <MapRoute via={CUT} k={cut} color="#7a4a2a" width={70} dash={false} />
          <MapRoute via={CUT} k={cut} color="#b0703a" width={44} dash={false} />
          <MapRoute via={RIVER} k={1} color="#3f86c9" width={16 + 4 * m.pulse(ri, 14)} dash={false} />
          <MapRoute via={CUT} k={m.lerp([ch, fl + 10], [0, 1])} color="#3f86c9" width={14} dash={false} />
          <MapLabel at={[30.3, 28.8]} text="NILE" size={56} k={m.pop(ni, 12)} />
          <On at={CUT[3]!} draw={(x, y) => m.t > fl ? <circle cx={x} cy={y} r={20 + 50 * m.lerp([fl, fl + 20], [0, 1])} fill="#5f9fae" stroke="#f4fbfb" strokeWidth={5} /> : null} />
          <MapLabel at={[32.3, 31.9]} text="CANYON" size={50} k={m.pop(cn, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Canyon;
