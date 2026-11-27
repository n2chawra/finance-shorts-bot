// Hook: "सिक्किम का कभी अपना राजा था। फिर ये भारत का स्टेट कैसे बना?" Close on Sikkim in the Himalaya, already gold at frame
// 0; it traces on its name, a golden crown drops onto it on "राजा", the camera pulls back on "भारत" as India's states flash
// white, and a question mark stamps beside Sikkim on "कैसे".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { INDIA_STATES, Neighbour, type StateFx } from "../../flat/india";
import { Crown, F, GOLD, MapView, OnMap, Question, SIK, lerpFrame } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sk = m.at("sikkim", 2), ra = m.at("raja", 14), bh = m.at("bharat", 34), ka = m.at("kaise", 52);
  const frame = lerpFrame(F.close, F.region, m.lerp([bh - 2, bh + 18], [0, 1]));
  const states: Record<string, StateFx> = { Sikkim: { fill: GOLD, trace: m.lerp([sk, sk + 22], [0, 1]), lift: 0.4 + 0.4 * m.pulse(ra + 6, 10) } };
  const fl = m.pulse(bh + 8, 8);
  if (fl > 0) for (const s of INDIA_STATES) if (s !== "Sikkim") states[s] = { fill: "#ffffff", k: 0.7 * fl };
  const crownS = 230 - 110 * m.lerp([bh - 2, bh + 18], [0, 1]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(80, 0.01) + 0.03 * m.pulse(ka + 2, 6)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.4}>
          <Neighbour name="Nepal" k={0.5} />
          <Neighbour name="Bhutan" k={0.5} />
          <OnMap ll={SIK}>{(xy) => (
            <g>
              <Crown x={xy[0]} y={xy[1] - crownS * 0.9} s={crownS} k={m.pop(ra, 10)} tilt={m.wave(50, 3)} />
              <Question x={Math.min(xy[0] + 260, 860)} y={xy[1] + 40} k={m.pop(ka, 10)} r={90} />
            </g>
          )}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Hook;
