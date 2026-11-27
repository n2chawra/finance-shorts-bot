// "And right in the middle sit two islands: Big Diomede, which is Russian, and Little Diomede, which is American."
// The camera drifts to the middle of the strait and pushes in; two islands rise out of the sea with surf round them,
// BIG DIOMEDE writes on the larger one and a Russian flag plants on it, LITTLE DIOMEDE writes on the smaller one and
// an American flag plants on it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { BIG, BMap, Diomedes, ISLES, LITTLE, Planted, SEA_STRAIT, STRAIT, Waves, between, type LL , Floes } from "./props";

const SEA_ISLES: LL[] = [[-169.2, 65.73], [-168.85, 65.72], [-169.15, 65.83], [-168.88, 65.82], [-169.0, 65.7], [-169.25, 65.79]];

const Islands: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mi = m.at("middle", 4), tw = m.at("two", 14), is = m.at("islands", 22), bi = m.at("big", 34), ru = m.at("russian", 50), li = m.at("little", 62), am = m.at("american", 80);
  const mid = { center: [-169.0, 65.8] as LL, scale: 35000 };
  const a = between(STRAIT, mid, m.lerp([mi, tw + 6], [0, 1]));
  const cam = between(a, ISLES, m.lerp([bi - 6, bi + 18], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={cam.center} scale={cam.scale}>
          <Floes t={m.t} size={50} />
          <Waves pts={[...SEA_STRAIT, ...SEA_ISLES]} t={m.t} />
          <Diomedes k={m.lerp([tw, tw + 14], [0, 1]) * (1 + 0.15 * m.pulse(is, 12))} t={m.t} />
          <MapLabel at={[BIG[0] - 0.02, BIG[1] + 0.045]} text="BIG DIOMEDE" size={54} type={m.lerp([bi, bi + 14], [0, 1])} />
          <MapLabel at={[LITTLE[0] + 0.03, LITTLE[1] - 0.04]} text="LITTLE DIOMEDE" size={54} type={m.lerp([li, li + 14], [0, 1])} />
          <Planted at={[BIG[0] - 0.02, BIG[1]]} name="Russia" k={m.pop(ru)} s={130} dx={-70} />
          <Planted at={[LITTLE[0], LITTLE[1]]} name="United States of America" k={m.pop(am)} s={130} dx={10} />
        </BMap>
      </View>
    </Stage>
  );
};
export default Islands;
