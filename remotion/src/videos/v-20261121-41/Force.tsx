// Force: "Now one nut held its own walkway, and the one hanging below."
// Inside the 4th-floor box beam: the front web slides away and the upper nut glows ("nut"); a blue arrow
// pushes down for its own walkway ("own"); an amber arrow joins it from the lower rod ("below").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, motion, View } from "../../flat/kit";
import { Flat } from "./World";
import { BEAM, JointSvg, UPPER_X } from "./JointSvg";

const Force: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const nut = m.at("nut", 6), own = m.at("own", 24), below = m.at("below", 44);
  const zoom = m.lerp([0, nut + 10], [1.25, 1.12]) + m.lerp([below, m.end], [0, 0.08]);
  const cy = m.lerp([0, nut + 10], [BEAM.y + 330, BEAM.y + 230]) + m.lerp([below, m.end], [0, 70]);
  return (
    <Flat t={m.t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540} cy={cy}>
          <Glow x={UPPER_X} y={BEAM.y + BEAM.h + 70} r={140} color="#ffd84a" o={0.35 + 0.35 * m.pulse(nut + 8, 14)} />
          <JointSvg t={m.t} open={m.lerp([nut - 4, nut + 14], [0, 1])} labelAt={nut + 6}
            arrows={{ own: m.lerp([own, own + 12], [0, 1]), below: m.lerp([below, below + 12], [0, 1]) }} />
        </View>
      </svg>
    </Flat>
  );
};
export default Force;
