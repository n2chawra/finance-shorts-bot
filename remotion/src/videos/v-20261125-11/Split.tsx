// "Now look at the map. One wire splits the land into two sides. So what lives on each side?" The camera pulls back
// from the last post to the whole continent; the fence flashes, Australia's outline glows, the two sides tint in two
// colours and a question mark drops on each side.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { END, Fence, Map, QMark, Sides, mix, mixLL, type LL, SeaMarks } from "./props";
import { WIDE } from "./Hook";

const Marks: React.FC<{ a: number; b: number; t: number }> = ({ a, b, t }) => {
  const at = useAt();
  const p = at([128.5, -23.5]), q = at([146.5, -32.5]);
  return (
    <g>
      {p ? <QMark x={p[0]} y={p[1]} size={140} k={a} t={t} /> : null}
      {q ? <QMark x={q[0]} y={q[1]} size={140} k={b} t={t} /> : null}
    </g>
  );
};

const Split: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const lo = m.at("look", 2), wi = m.at("wire", 30), la = m.at("land", 50), tw = m.at("two", 64), li = m.at("lives", 84), si = m.at("side", 100);
  const out = m.lerp([lo, lo + 30], [0, 1]);
  const push = m.lerp([si, m.end], [0, 1]);
  const from: LL = [END[0] + 0.9, END[1] - 0.2];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.06 * push + m.wave(80, 0.008)}>
        <Map center={mixLL(from, WIDE.center, out)} scale={mix(6000, WIDE.scale, out)} trace={m.lerp([la, la + 30], [0, 1])}>
          <Sides dingo={m.lerp([tw, tw + 14], [0, 1])} sheep={m.lerp([tw + 6, tw + 20], [0, 1])} />
          <SeaMarks t={m.t} />
          <Fence w={10} flash={m.pulse(wi + 4, 14)} run={m.lerp([wi, wi + 30], [0, 1])} />
          <Marks a={m.pop(li)} b={m.pop(si)} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Split;
