// "Turn it round: Spain dropped into Mexico sits almost wholly inside it, with Madrid in the middle." The camera swings
// back to Mexico; Spain's flag-filled outline lifts off Europe and drops into Mexico; Mexico's border traces round
// it; a pin drops on Madrid's spot, pulsing in the middle of Mexico.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin } from "../../flat/map";
import { GeoMap, MX_C, MX_FILL, SEA, SpainInMexico, between } from "./props";

const Inside: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tu = m.at("turn", 2), sp = m.at("spain", 12), dr = m.at("dropped", 20), ins = m.at("inside", 44), ma = m.at("madrid", 62), mi = m.at("middle", 72);
  const cam = between(between({ center: [-85, 26], scale: 1700 }, { center: [-102, 22.5], scale: 2100 }, m.lerp([tu, dr + 14], [0, 1])), { center: [-102, 23.2], scale: 2500 }, m.lerp([mi - 4, mi + 16], [0, 1]));
  const k = m.lerp([sp, dr + 16], [0.82, 1]);
  // Madrid's spot inside Spain is just north of Spain's centroid, so on Mexico it lands just north of Mexico's
  const madrid: [number, number] = [MX_C[0], MX_C[1] + 0.2];
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={960}>
        <GeoMap cam={cam} colors={{ Mexico: { fill: MX_FILL, k: 1, trace: m.lerp([ins, ins + 26], [0, 1]), traceColor: "#ffd84a" } }}>
          <SpainInMexico k={k} />
          <MapPin at={madrid} k={m.pop(ma)} r={22 + 6 * m.pulse(mi + 6, 10)} />
          <MapLabel at={[madrid[0], madrid[1] + 1.4]} text="MADRID" size={46} type={m.lerp([ma, ma + 12], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Inside;
