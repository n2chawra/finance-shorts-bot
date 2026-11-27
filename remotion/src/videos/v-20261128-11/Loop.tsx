// "Nobody's, or cut up for good: which should it be? Until then, three countries keep claiming one slice." The whole
// continent turns white on "Nobody's"; on "cut" the slices crack back into place; a question mark swings over the
// pole on "which"; on "Until" the camera glides up to the peninsula; on "three" the three flags rise there; on
// "claiming" the three stripes sweep over each other and the frame settles on the hook's peninsula.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { PlantedFlag } from "../../flat/polar";
import { ALL, AntMap, CLAIMS, Floes, PEN, PEN_FLAGS, SEA, Slices, between } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const nb = m.at("nobodys", 2), cu = m.at("cut", 20), wh = m.at("which", 40), un = m.at("until", 64), th = m.at("three", 80), cl = m.at("claiming", 92);
  const cam = between({ center: [0, -90], scale: 900 }, PEN, m.lerp([un, th + 20], [0, 1]));
  const white = m.lerp([nb, nb + 10], [0, 1]) * (1 - m.lerp([cu, cu + 10], [0, 1]));
  const s = ALL({ k: 1 - white * 0.95, lift: m.pulse(cu + 6, 8) });
  for (const id of ["uk", "chile", "arg"]) s[id] = { ...s[id], k: Math.max(1 - white * 0.95, 0), glow: m.pulse(cl + 6, 10) };
  const q = m.pop(wh) * (1 - m.lerp([un, un + 10], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.01)} cy={1000}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={60} />
          <Slices s={s} />
          {PEN_FLAGS.map((f, i) => <PlantedFlag key={f.id} at={f.at} name={CLAIMS[f.id]!.flag!} k={m.pop(th + i * 5)} s={0.9} t={m.t * 1.4} />)}
        </AntMap>
        {q > 0 ? <Txt x={540} y={760} size={170 * q} fill="#fff4d0" stroke={INK} rotate={m.wave(24, 10)}>?</Txt> : null}
      </View>
    </Stage>
  );
};
export default Loop;
