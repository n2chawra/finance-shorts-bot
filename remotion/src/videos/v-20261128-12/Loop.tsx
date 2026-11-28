// "Bigger Spain or smaller Mexico: which map would you pick? Either way, drop Mexico on Spain and it won't stop." The
// Atlantic with both countries: Spain swells a little on "Bigger", Mexico's outline shrinks a little on "smaller", a
// question mark swings between them on "pick"; on "drop" Mexico lifts back off Spain and slides toward its home,
// and the frame settles on the hook's Atlantic map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Lift } from "../../flat/map";
import { ES_C, ES_FILL, GeoMap, MX_C, MX_FILL, SEA, mix } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ju = m.at("just", 90), wa = m.at("way", 44), ma = m.at("map", 24), ei = m.at("either", 40), bi = m.at("bigger", 2), sm = m.at("smaller", 14), pi = m.at("pick", 30), dr = m.at("drop", 50), st = m.at("stop", 70);
  const back = m.lerp([dr, m.end], [1, 0.001]);
  const cam = { center: [mix(MX_C[0], ES_C[0], back), mix(MX_C[1], ES_C[1], back) - 1.5] as [number, number], scale: Math.exp(mix(Math.log(2200), Math.log(1600), back)) };
  const q = m.pop(pi) * (1 - m.lerp([dr, dr + 8], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, flag: "Spain", lift: m.pulse(bi + 6, 10) + m.pulse(ma + 6, 10) + 0.6 * m.pulse(wa + 6, 8) }, Mexico: { fill: MX_FILL, k: 0.5 } }}>
          <g opacity={0.85}><Lift name="Mexico" to={ES_C} k={back} fill={MX_FILL} flag="Mexico" sx={1 - 0.08 * m.pulse(sm + 6, 10)} label={m.t >= ju ? "MEXICO" : undefined} /></g>
        </GeoMap>
        {q > 0 ? <Txt x={540} y={700} size={160 * q} fill="#fff4d0" stroke={INK} rotate={m.wave(24, 10) + 360 * m.lerp([ei, ei + 12], [0, 1])}>?</Txt> : null}
      </View>
    </Stage>
  );
};
export default Loop;
