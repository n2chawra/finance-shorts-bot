// Hook: "Drop Mexico onto Spain at its real size, and it doesn't stop at Spain's coast." The Atlantic on the old map
// from frame 0, Mexico in its flag on the left and Spain on the right; on "Drop" Mexico's own outline lifts off the
// Americas and slides across the ocean at true scale, the camera following; on "Spain" Spain traces with its flag;
// on "stop" the outline hangs over Spain, its edges past the coast, and on "coast" Spain's coast flashes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, SourceLine, Stage, View, motion } from "../../flat/kit";
import { Lift, MapLabel } from "../../flat/map";
import { ES_C, ES_FILL, GeoMap, MX_C, MX_FILL, SEA, mix } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dr = m.at("drop", 2), mx = m.at("mexico", 8), sp = m.at("spain", 20), re = m.at("real", 40), st = m.at("stop", 62), co = m.at("coast", 80);
  const slide = m.lerp([dr + 4, st + 6], [0.001, 1]);
  const cam = { center: [mix(MX_C[0], ES_C[0], slide), mix(MX_C[1], ES_C[1], slide) - 1.5] as [number, number], scale: Math.exp(mix(Math.log(2200), Math.log(1600), slide)) };
  return (
    <>
      <Stage p={p} bg={SEA} vignette={0.35}>
        <View zoom={1.02 + m.wave(90, 0.01)} cy={980}>
          <GeoMap cam={cam} colors={{
            Mexico: { fill: MX_FILL, k: 0.5 },
            Spain: { fill: ES_FILL, k: m.lerp([sp, sp + 12], [0.3, 1]), trace: m.lerp([sp, sp + 26], [0, 1]), flag: "Spain" },
          }}>
            <MapLabel at={[-4, 44.5]} text="SPAIN" size={52} k={m.pop(sp)} fill="#ffffff" />
            {slide > 0 ? (
              <g opacity={0.85}>
                <Lift name="Mexico" to={ES_C} k={slide} fill={MX_FILL} flag="Mexico" label={m.t >= mx - 30 ? "MEXICO" : undefined} />
              </g>
            ) : null}
          </GeoMap>
        </View>
        <Flash k={m.pulse(co + 4, 6) * 0.25} />
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Hook;
