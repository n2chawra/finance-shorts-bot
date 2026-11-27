// "On a flat world map, they sit at opposite edges. Spin the map around the globe, and they nearly touch." The camera
// pulls out from the strait to the whole flat world map with its usual centre: Russia lights on its right edge, Alaska
// on its left; then the world spins (its central meridian turning half way round) until Russia and Alaska slide
// together in the middle, and the camera pushes in on the strait between them.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { WorldMap } from "../../flat/map";
import { between, mix, type LL } from "./props";

const Edges: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fl = m.at("flat", 2), wo = m.at("world", 12), op = m.at("opposite", 24), ed = m.at("edges", 36), sp = m.at("spin", 50), gl = m.at("globe", 66), ne = m.at("nearly", 80), to = m.at("touch", 92);
  const spin = m.lerp([sp, ne + 6], [0, 1], (x) => (1 - Math.cos(x * Math.PI)) / 2);
  const lon0 = mix(20, -169, spin);
  const out = m.lerp([0, fl + 14], [0, 1]);
  const far = { center: [lon0, 52] as LL, scale: 175 };
  const start = { center: [-168.9, 65.84] as LL, scale: 15000 };
  const a = between(start, far, out);
  const cam = between(a, { center: [-168.9, 65.84], scale: 15000 }, m.lerp([to - 4, m.end], [0, 1], (x) => x * x));
  const edge = m.lerp([wo, wo + 12], [0, 1]) * (1 - spin);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <WorldMap w={1080} h={1920} center={cam.center} scale={cam.scale} lon0={lon0} kind="flat" look="vintage" political={0.35} detail="110m"
          colors={{
            Russia: { fill: "#e6a39a", k: m.lerp([op, op + 10], [0, 1]), trace: m.lerp([op, op + 24], [0, 1]), flag: "Russia" },
            "United States of America": { fill: "#a8c0e0", k: m.lerp([ed, ed + 10], [0, 1]), trace: m.lerp([ed, ed + 24], [0, 1]), flag: "United States of America" },
          }} />
      </View>
      {edge > 0 ? (
        <g opacity={edge}>
          <rect x={14} y={300} width={22} height={1060} fill="#ffe08a" stroke={INK} strokeWidth={4} />
          <rect x={1044} y={300} width={22} height={1060} fill="#ffe08a" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      <g opacity={m.pulse(gl, 10) * 0.25}><rect x={0} y={0} width={1080} height={1920} fill="#ffffff" /></g>
    </Stage>
  );
};
export default Edges;
