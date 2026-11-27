// "Norway takes the slice facing Africa, just months before the Second World War." On "Norway" the slider lands on
// 1939 and the Norwegian flag plants on the ice; on "slice" its slice sweeps open; on "facing" the camera pans up
// toward Africa and AFRICA writes on; on "war" the slider darkens red and the map dims.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { AFRICA, AntMap, ClaimFlag, Floes, Name, SEA, Slices, WHOLE, YearBar, between, mix } from "./props";

const Norway: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const no = m.at("year", 2), sl = m.at("slice", 14), fa = m.at("facing", 26), af = m.at("africa", 36), mo = m.at("months", 48), wa = m.at("war", 70);
  const cam = between({ center: [15, -80], scale: 1150 }, AFRICA, m.lerp([fa, fa + 28], [0, 1]));
  const dark = m.lerp([wa - 4, wa + 14], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35 + 0.3 * dark}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1060}>
        <AntMap cam={between(cam, WHOLE, 0)}>
          <Floes t={m.t} n={60} />
          <Slices s={{ uk: { k: 1, stripes: true }, nz: { k: 1 }, fra: { k: 1 }, ausw: { k: 1 }, ause: { k: 1 }, nor: { k: m.lerp([sl, sl + 18], [0, 1]), glow: m.pulse(sl + 14, 10) } }} />
          <ClaimFlag id="nor" k={m.pop(no + 2)} t={m.t} s={1.1} />
          <Name at={[24, -30]} text="AFRICA" size={60} type={m.lerp([af - 4, af + 10], [0, 1])} />
        </AntMap>
        <rect x={-400} y={-400} width={1880} height={2720} fill="#2a0e0a" opacity={0.28 * dark} />
      </View>
      <YearBar year={mix(1933, 1939, m.lerp([0, no + 10], [0, 1]))} flash={m.pulse(no + 8, 8) + m.pulse(mo + 4, 8)} dark={dark} />
    </Stage>
  );
};
export default Norway;
