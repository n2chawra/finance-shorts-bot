// "Beyond them lay Siberia, a frozen forest so wide it ran all the way to the far side of Asia." The camera
// glides east over the ridge; SIBERIA writes on, frost runs down the rivers, pines pop up across the belt, and a
// gold measuring line stretches from the Urals to the Pacific shore, which flashes on "Asia".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, FOREST, GOLD, LENA, Line, OB, OKHOTSK, Pine, RedLand, Ridge, YENISEI } from "./props";

const Trees: React.FC<{ k: number; frost: number }> = ({ k, frost }) => {
  const at = useAt();
  return (
    <g>
      {FOREST.map(([lon, lat, r], i) => {
        const xy = at([lon, lat]);
        const kk = Math.max(0, Math.min(1, (k - r * 0.7) * 3.3));
        return xy ? <Pine key={i} x={xy[0]} y={xy[1]} s={38} k={kk} frost={frost} /> : null;
      })}
    </g>
  );
};

const Shore: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(OKHOTSK);
  return xy && k > 0 ? <Glow x={xy[0]} y={xy[1]} r={170} color="#ffe08a" o={0.8 * k} /> : null;
};

const Siberia: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const be = m.at("beyond", 2), si = m.at("siberia", 14), fr = m.at("frozen", 26), fo = m.at("forest", 36), wi = m.at("wide", 46), rn = m.at("ran", 54), far = m.at("far", 62), as = m.at("asia", 76);
  const go = m.lerp([be, far + 8], [0, 1]);
  const frost = m.lerp([fr, fr + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <Asia center={[60 + 44 * go, 59 + 2 * go]} scale={1300 - 680 * go}>
          <RedLand east={58} id="v1123s" front={0.6} />
          <Ridge k={1} s={1.1} />
          {[OB, YENISEI, LENA].map((r, i) => <Line key={i} via={r} k={frost} color="#d9eef8" w={9} />)}
          <Trees k={m.lerp([fo - 4, wi + 20], [0, 1])} frost={frost} />
          <MapLabel at={[80, 64.5]} text="SIBERIA" size={78} type={m.lerp([si - 2, si + 16], [0, 1])} />
          <Line via={[[60, 55.2], [100, 55.2], [141, 57]]} k={m.lerp([rn, far + 10], [0, 1])} color={GOLD} w={10} dash />
          <Shore k={m.pop(as, 10) * (1 - m.lerp([as + 16, as + 40], [0, 0.5]))} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Siberia;
