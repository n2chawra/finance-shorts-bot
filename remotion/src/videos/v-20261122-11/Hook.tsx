// Hook: "Why is the east side of so many old English cities the poorer side?" The old city plan from frame 0, the
// wind's arrows drifting over it; on "east" the east half turns grey; on "side" the dividing line draws down the
// middle; on "old" the cartouche writes on; on "English" St George's pennant pops up on the town hall; on "cities"
// the river shimmers; on "poorer" the camera pushes onto the east and a gold question mark drops onto it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { Cartouche, CityPlan, QMark } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ea = m.at("east", 8), si = m.at("side", 14), ol = m.at("old", 24), en = m.at("english", 30), po = m.at("poorer", 50);
  const push = m.lerp([po, po + 18], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.08 + 0.16 * push + m.wave(80, 0.008)} cx={540 + 160 * push} cy={900 + 20 * push}>
        <CityPlan t={m.t} west={0.5 + 0.5 * m.lerp([ea, ea + 10], [0, 1])} east={0.3 + 0.7 * m.lerp([ea, ea + 10], [0, 1])}
          line={m.lerp([si, si + 16], [0, 1])} labels={m.lerp([ea, ea + 8], [0.6, 1])} villas={1} terraces={1} pennant={m.pop(en, 10)} vane={m.t} wind={0.6}>
          <QMark x={790} y={760} k={m.pop(po, 10)} t={m.t} size={240} />
        </CityPlan>
      </View>
      <Cartouche text="OLD ENGLISH CITY" k={m.lerp([ol - 10, ol + 12], [0.35, 1])} y={250} />
      <Flash k={m.pulse(po, 4) * 0.3} />
    </Stage>
  );
};
export default Hook;
