// "So what changed? In nineteen ninety-one, the Soviet Union fell apart." The dial swings to TODAY; the red land
// shakes; bright cracks run along the inner borders; the pieces drift apart a little and the red drains out.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { Dial, Map, Piece, SOVIET } from "./props";

const Breakup: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ch = m.at("changed", 4), ni = m.at("nineteen", 22), so = m.at("soviet", 44), fe = m.at("fell", 58), ap = m.at("apart", 68);
  const shake = m.pulse(ni, 30) * 10 * Math.sin(m.t * 2.2);
  const crack = m.lerp([so, so + 20], [0, 1]);
  const drain = 1 - m.lerp([ap, ap + 22], [0, 1]);
  const drift = m.lerp([fe, fe + 20], [0, 1]);
  const close = m.lerp([ap - 4, ap + 18], [0, 1]);
  const c = (n: number) => ({ fill: SOVIET, k: 0.9 * drain, trace: crack, traceColor: "#ffe08a", lift: 0.25 * drift * n });
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)} cx={540 + shake}>
        <Map center={[28.5 - 3.5 * close, 54.8 - 0.3 * close]} scale={3100 + 1200 * close} colors={{
          Russia: c(0), Lithuania: c(1), Latvia: c(1), Estonia: c(1), Belarus: c(1), Ukraine: c(1),
        }}>
          <Piece k={0.9 * drain + 0.1} fill={SOVIET} trace={crack} />
        </Map>
        <Flash k={m.pulse(fe, 8) * 0.5} />
      </View>
      <Dial pos={1 + m.lerp([ch, ch + 20], [0, 1])} />
    </Stage>
  );
};
export default Breakup;
