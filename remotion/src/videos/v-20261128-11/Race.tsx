// "New Zealand follows, then France, then Australia, which takes the biggest slice of all." The camera on the far
// side of the continent; on each name the slider runs on to its year and that country's slice sweeps open with its
// flag; on "biggest" Australia's two slices glow and lift; on "all" the camera pulls back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { AntMap, ClaimFlag, FAR, Floes, Name, SEA, Slices, WHOLE, YearBar, between, mix } from "./props";

const Race: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const nz = m.at("zealand", 8), fr = m.at("france", 30), au = m.at("australia", 46), bi = m.at("biggest", 70), al = m.at("all", 84);
  const cam = between(between(WHOLE, FAR, m.lerp([0, nz + 16], [0, 1])), WHOLE, m.lerp([al - 4, al + 24], [0, 1]));
  const year = m.t < fr ? mix(1908, 1923, m.lerp([nz - 6, nz + 8], [0, 1])) : m.t < au ? mix(1923, 1924, m.lerp([fr - 4, fr + 6], [0, 1])) : mix(1924, 1933, m.lerp([au - 4, au + 8], [0, 1]));
  const big = m.lerp([bi, bi + 12], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1060}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={50} />
          <Slices s={{
            uk: { k: 1, stripes: true },
            nz: { k: m.lerp([nz, nz + 16], [0, 1]), glow: m.pulse(nz + 12, 8) },
            fra: { k: m.lerp([fr, fr + 10], [0, 1]), glow: m.pulse(fr + 8, 8) },
            ausw: { k: m.lerp([au, au + 18], [0, 1]), glow: big, lift: big },
            ause: { k: m.lerp([au + 6, au + 20], [0, 1]), glow: big, lift: big },
          }} />
          <Name at={[180, -77]} text="ROSS SEA" size={46} fill="#e8f4fa" type={m.lerp([nz, nz + 12], [0, 1])} />
          <ClaimFlag id="nz" k={m.pop(nz + 4)} t={m.t} />
          <ClaimFlag id="fra" k={m.pop(fr + 2)} t={m.t} s={0.9} />
          <ClaimFlag id="ausw" k={m.pop(au + 2)} t={m.t} s={1.1} />
        </AntMap>
      </View>
      <YearBar year={year} flash={m.pulse(nz + 6, 8) + m.pulse(fr + 4, 8) + m.pulse(au + 6, 8)} />
    </Stage>
  );
};
export default Race;
