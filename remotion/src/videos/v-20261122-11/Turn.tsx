// Turn: "Then the mills closed, and the air cleared. And the strange part? The split stayed." On "mills" the chimneys
// topple one by one; on "closed" a CLOSED board lands on a mill; on "air" the black cloud breaks up; on "cleared"
// the camera pulls back under a blue sky; on "strange" it pushes to the dividing line; on "split" the line glows
// red; on "stayed" it stamps down hard, the west still green and the east still grey.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Tag, View, motion } from "../../flat/kit";
import { CityPlan } from "./props";

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mi = m.at("mills", 4), cl = m.at("closed", 16), ai = m.at("air", 30), cr = m.at("cleared", 40), st = m.at("strange", 60), sp = m.at("split", 82), sy = m.at("stayed", 92);
  const wide = m.lerp([cr, cr + 14], [0, 1]) * (1 - m.lerp([st, st + 14], [0, 1]));
  const push = m.lerp([st, st + 14], [0, 1]);
  const stamp = m.pulse(sy + 3, 5);
  return (
    <Stage p={p} bg={m.t >= cr ? "#7cc0de" : "#3f7f96"} vignette={0.3}>
      <View zoom={1.1 - 0.08 * wide + 0.14 * push + 0.03 * stamp + m.wave(80, 0.008)} cx={560} cy={940}>
        <CityPlan t={m.t} west={1} east={1} villas={1} terraces={1} chim={1} topple={m.lerp([mi, mi + 30], [0, 1])} smoke={1} cloud={1}
          clear={m.lerp([ai, cr + 14], [0, 1])} labels={1} line={1} lineGlow={m.lerp([sp, sp + 8], [0, 1])}>
          <Tag x={600} y={590} w={240} h={78} text="CLOSED" rot={-10} bg="#e8453c" fg="#ffffff" size={46} k={m.pop(cl, 12)} />
        </CityPlan>
      </View>
      <Flash k={stamp * 0.35} />
    </Stage>
  );
};
export default Turn;
