// "That gap is just {fact5} kilometres wide, the sea's only door to the open Atlantic Ocean." Close on the strait:
// a ruler swings across the gap and its width tag stamps on; two door posts stand on either shore; ATLANTIC writes on
// to the west and waves roll on the ocean side.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { GIB, Map, On } from "./props";

type Params = { fig?: { width?: string } };

const Narrow: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const width = (p.beat.params as Params).fig?.width ?? "";
  const th = m.at("that", 2), wi = m.at("wide", 40), dr = m.at("door", 60), at = m.at("atlantic", 84), oc = m.at("ocean", 96);
  const swing = m.lerp([th, th + 18], [-70, 0]);
  const pull = m.lerp([at - 4, at + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[-5.6 - 0.6 * pull, 35.75 + 0.1 * pull]} scale={42000 - 18000 * pull}>
          <On at={[-5.6, 36.02]} draw={(x, y) => (
            <g transform={`rotate(${swing} ${x} ${y})`}>
              <Block x={x - 34} y={y - 190} w={68} h={380} fill="#f2d28a" r={10} />
              {Array.from({ length: 9 }).map((_, i) => <Limb key={i} a={[x - 34, y - 160 + i * 40]} b={[x - 8, y - 160 + i * 40]} w={4} color="#3a2a1a" sw={0} />)}
            </g>
          )} />
          <On at={[-5.6, 35.98]} draw={(x, y) => <Tag x={x - 150} y={y + 220} w={300} h={110} text={width + " KM"} size={58} bg="#ffc43d" k={m.pop(wi, 10)} />} />
          <On at={[-5.6, 36.12]} draw={(x, y) => m.t > dr ? <Block x={x - 18} y={y - 200 * m.lerp([dr, dr + 10], [0, 1])} w={36} h={200 * m.lerp([dr, dr + 10], [0, 1])} fill="#8a6a4a" /> : null} />
          <On at={[-5.6, 35.86]} draw={(x, y) => m.t > dr ? <Block x={x - 18} y={y} w={36} h={200 * m.lerp([dr + 3, dr + 13], [0, 1])} fill="#8a6a4a" /> : null} />
          <On at={[-6.6, 35.95]} draw={(x, y) => m.t > oc ? <g>{[0, 1, 2].map((i) => <path key={i} d={`M${x - 60 + Math.sin(m.t / 9 + i) * 10},${y + i * 50 - 40} q20,-16 40,0 q20,16 40,0`} fill="none" stroke="#e7f3f5" strokeWidth={6} strokeLinecap="round" />)}</g> : null} />
          <MapLabel at={[-6.55, 36.25]} text="ATLANTIC" size={56} k={m.pop(at, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Narrow;
