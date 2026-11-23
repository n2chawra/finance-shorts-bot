// Smoke: "And the west wind did what wind does. It carried all that smoke east, over the streets downwind. So who
// had to breathe it?" Back on the city plan, chimneys standing: on "wind" arrows blow across from the west; on
// "carried" smoke pours from every chimney and leans east; on "smoke" the camera pushes in and a black cloud rolls
// across; on "east" it settles over the east half; on "streets" the east goes dark; on "downwind" DOWNWIND writes
// on; on "breathe" a question mark puffs out of the cloud.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { CityPlan, QMark } from "./props";

const Smoke: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wi = m.at("wind", 6), dz = m.at("does", 24), af = m.at("after", 104), ca = m.at("carried", 40), sm = m.at("smoke", 52), ea = m.at("east", 60), st = m.at("streets", 74), dw = m.at("downwind", 90), br = m.at("breathe", 120);
  const push = m.lerp([sm, sm + 18], [0, 1]) * (1 - m.lerp([dw, dw + 16], [0, 0.6]));
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34 + 0.2 * m.lerp([st, st + 10], [0, 1])}>
      <View zoom={1.02 + 0.2 * push + m.wave(80, 0.008)} cx={540 + 120 * push} cy={900}>
        <CityPlan t={m.t} west={0.35} east={0.25 + 0.75 * m.lerp([st, st + 12], [0, 1])} villas={0} terraces={0} chim={1} vane={m.t} pennant={1}
          wind={m.lerp([wi, wi + 10], [0, 0.6]) + m.lerp([dz, dz + 8], [0, 0.4])} smoke={m.lerp([ca, ca + 16], [0, 1])} cloud={m.lerp([sm, ea + 16], [0, 0.8]) + m.lerp([af, af + 14], [0, 0.2])} labels={1}>
          {dw > 0 ? <Txt x={790} y={1290} size={60} fill="#ffffff" stroke={INK}>{"DOWNWIND".slice(0, Math.round(8 * m.lerp([dw, dw + 12], [0, 1])))}</Txt> : null}
          <QMark x={800} y={700} k={m.pop(br, 10)} t={m.t} size={200} />
        </CityPlan>
      </View>
    </Stage>
  );
};
export default Smoke;
