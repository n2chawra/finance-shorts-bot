// "Then Chile and Argentina draw theirs right across Britain's, and three flags land on one peninsula." Back on the
// peninsula with Britain's slice; on "Chile" the slider runs to 1940 and Chile's stripes sweep over it, on
// "Argentina" to 1943 and Argentina's stripes over both; on "across" the crossing edges flash; on "Britain's" its
// slice shakes; on "three" the three flags drop one by one and the camera pushes in; PENINSULA writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { PlantedFlag } from "../../flat/polar";
import { AntMap, CLAIMS, Floes, Name, PEN, PEN_FLAGS, SEA, Slices, YearBar, between, mix } from "./props";

const Overlap: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ch = m.at("chile", 6), ar = m.at("argentina", 20), ac = m.at("across", 36), bs = m.at("britains", 46), th = m.at("three", 62), fl = m.at("flags", 72), pe = m.at("peninsula", 88);
  const wide = { center: [-55, -75] as [number, number], scale: 1500 };
  const cam = between(between(wide, PEN, m.lerp([0, th], [0, 0.8])), { center: [-61.5, -68], scale: 3400 }, m.lerp([th, th + 24], [0, 1]));
  const year = m.t < ar ? mix(1939, 1940, m.lerp([ch - 4, ch + 6], [0, 1])) : mix(1940, 1943, m.lerp([ar - 4, ar + 8], [0, 1]));
  const shake = m.pulse(bs + 6, 10) * Math.sin(m.t * 2.2) * 10;
  const flash = m.pulse(ac + 6, 10);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1000}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={70} lat={-63} />
          <g transform={`translate(${shake} 0)`}><Slices s={{ uk: { k: 1, stripes: true, glow: flash } }} /></g>
          <Slices s={{ chile: { k: m.lerp([ch, ch + 16], [0, 1]), stripes: true, glow: flash }, arg: { k: m.lerp([ar, ar + 16], [0, 1]), stripes: true, glow: flash } }} />
          {PEN_FLAGS.map((f, i) => <PlantedFlag key={f.id} at={f.at} name={CLAIMS[f.id]!.flag!} k={m.pop(th + i * 6)} s={0.9} t={m.t * (1 + 0.8 * m.lerp([fl, fl + 8], [0, 1]))} />)}
          <Name at={[-71, -66.5]} text="PENINSULA" size={50} type={m.lerp([pe - 4, pe + 12], [0, 1])} />
        </AntMap>
      </View>
      <YearBar year={year} flash={m.pulse(ch + 4, 8) + m.pulse(ar + 4, 8)} />
    </Stage>
  );
};
export default Overlap;
