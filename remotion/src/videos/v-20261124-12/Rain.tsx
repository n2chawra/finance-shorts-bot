// "The only thing that fills it back up is rain, falling on the forest all around it." The camera pulls back over
// the hills; rivers draw into the lake, clouds roll in and rain falls, the lake grows back and rainforest pops up
// in a ring round it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, rng } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Canal, Cloud, LAKE, LAKE_C, Lake, PMap, RIVERS, Tree } from "./props";

const R = rng("v1124r");
const TREES: [number, number][] = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + R() * 0.3, r = 0.2 + R() * 0.08;
  return [LAKE_C[0] + Math.cos(a) * r * 1.2, LAKE_C[1] + Math.sin(a) * r * 0.8] as [number, number];
});

const Over: React.FC<{ t: number; clouds: number; rain: number; trees: number }> = ({ t, clouds, rain, trees }) => {
  const at = useAt();
  const c = at(LAKE_C);
  return (
    <g>
      {TREES.map((tr, i) => { const xy = at(tr); return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={70} k={Math.min(1, trees * 3 - i * 0.12)} /> : null; })}
      {c ? [[-190, -330], [150, -380], [0, -260]].map(([dx, dy], i) => <Cloud key={i} x={c[0] + dx! * 1.4 - (1 - clouds) * 400} y={c[1] + dy! * 1.2} s={190} rain={rain} t={t + i * 7} k={Math.min(1, clouds * 2 - i * 0.3)} dark />) : null}
    </g>
  );
};

const Rain: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const on = m.at("only", 4), fi = m.at("fills", 16), ra = m.at("rain", 36), fa = m.at("falling", 46), fo = m.at("forest", 60), ar = m.at("around", 72);
  const back = m.lerp([on, fi + 10], [0, 1]);
  const close = m.lerp([fo - 4, fo + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.12 * close + m.wave(80, 0.008)}>
        <PMap trees={1} center={[-79.8, 9.13]} scale={34000 - 12000 * back} colors={{ Panama: { fill: "#c7d49a", k: m.lerp([fo, ar + 10], [0, 0.8]) } }}>
          <Lake k={0.88 + 0.12 * m.lerp([fa, fa + 30], [0, 1])} />
          {RIVERS.map((r, i) => <MapRoute key={i} via={r} k={m.lerp([fi + i * 4, fi + 18 + i * 4], [0, 1])} color={LAKE} width={12} dash={false} />)}
          <Canal w={20} />
          <Over t={m.t} clouds={m.lerp([ra - 6, ra + 10], [0, 1])} rain={m.lerp([ra, ra + 8], [0, 1])} trees={m.lerp([fo, ar + 16], [0, 1])} />
        </PMap>
      </View>
    </Stage>
  );
};

export default Rain;
