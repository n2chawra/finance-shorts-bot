// Loop: "तो अगली बार नक्शे पर ये छोटा सा स्टेट देखें, तो याद रखिए," From all of India the camera pushes back in towards
// Sikkim: India's state lines glint on "नक्शे", Sikkim pulses gold on "छोटा", and on "याद" the golden crown fades back in over
// it, close among the peaks as in the first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { INDIA_STATES, Neighbour, type StateFx } from "../../flat/india";
import { Crown, F, GOLD, MapView, OnMap, SAFFRON, SIK, lerpFrame } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ag = m.at("agli", 2), nk = m.at("naksha", 12), ch = m.at("chhota", 26), ya = m.at("yaad", 44);
  let frame = lerpFrame(F.india, F.region, m.lerp([ag, ch + 6], [0, 1]));
  frame = lerpFrame(frame, F.close, m.lerp([ya - 2, m.end], [0, 1]));
  const states: Record<string, StateFx> = { Sikkim: { fill: m.t < ch ? SAFFRON : GOLD, k: 1, lift: 0.3 + 0.5 * m.pulse(ch + 6, 10), trace: m.lerp([ch, ch + 20], [0, 1]) } };
  const gl = m.pulse(nk + 6, 8);
  if (gl > 0) for (const s of INDIA_STATES) if (s !== "Sikkim") states[s] = { fill: "#ffffff", k: 0.6 * gl };
  const crownS = 120 + 110 * m.lerp([ya - 2, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(80, 0.01)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.4}>
          <Neighbour name="Nepal" k={0.5 * m.lerp([ch, ch + 10], [0, 1])} />
          <Neighbour name="Bhutan" k={0.5 * m.lerp([ch, ch + 10], [0, 1])} />
          <OnMap ll={SIK}>{(xy) => <Crown x={xy[0]} y={xy[1] - crownS * 0.9} s={crownS} k={m.pop(ya, 10)} tilt={m.wave(50, 3)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Loop;
