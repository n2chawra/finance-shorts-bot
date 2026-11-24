// "So what if it never rained there again?" Closer over Gatun Lake: a question mark drops over it, the last
// raindrops stop, the camera pushes in and the lake's edge flickers.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Canal, CanalShip, Cloud, LAKE_C, Lake, PMap, QMark } from "./props";

const Over: React.FC<{ t: number; q: number; rain: number }> = ({ t, q, rain }) => {
  const c = useAt()(LAKE_C);
  if (!c) return null;
  return (
    <g>
      <Cloud x={c[0] + 120} y={c[1] - 300} s={170} rain={rain} t={t} k={0.3 + 0.7 * rain} />
      <QMark x={c[0] - 150} y={c[1] - 250} size={170} k={q} t={t} />
    </g>
  );
};

const Question: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wh = m.at("what", 4), ne = m.at("never", 14), ra = m.at("rained", 22), ag = m.at("again", 34);
  const push = m.lerp([ra - 4, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.12 * push + m.wave(90, 0.01)}>
        <PMap trees={1} center={[LAKE_C[0] + 0.02, LAKE_C[1] + 0.02]} scale={78000}>
          <Lake k={1} glow={0.4 * Math.abs(m.wave(8, 1)) * m.lerp([ag, ag + 4], [0, 1])} />
          <Canal w={26} />
          <CanalShip f={0.45} s={80} />
          <MapLabel at={[-79.86, 9.24]} text="GATUN LAKE" size={56} k={1} />
          <Over t={m.t} q={m.pop(wh, 12)} rain={0.3 * (1 - m.lerp([ne, ne + 10], [0, 1]))} />
        </PMap>
      </View>
    </Stage>
  );
};

export default Question;
