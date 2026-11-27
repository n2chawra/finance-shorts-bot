// "Then, about {fact2} years ago, the Atlantic broke back in at Gibraltar." The stone tablet turns to the new date;
// the Atlantic rises against the land bridge; the bridge cracks and water bursts through; a waterfall foams down into
// the dry basin.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Bridge, Dry, Flood, GIB, Map, On, Stream, Tablet } from "./props";

type Params = { fig?: { ago?: string } };

const Break: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ago = (p.beat.params as Params).fig?.ago ?? "";
  const th = m.at("then", 2), at = m.at("atlantic", 40), br = m.at("broke", 54), gi = m.at("gibraltar", 72), sp = m.at("spilling", 84), ro = m.at("rock", 96);
  const close = m.lerp([br - 4, br + 14], [0, 1]);
  const burst = m.lerp([br, br + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)} cx={540 + (m.t > br && m.t < br + 12 ? 8 * Math.sin(m.t * 3) : 0)}>
        <Map center={[-5.3 + 0.2 * close, 35.6 + 0.1 * close]} scale={24000 + 10000 * close}>
          <Dry level={0.0} t={m.t} glitter={0.6} />
          <Flood k={0.05 * burst + 0.1 * m.lerp([sp, ro], [0, 1]) + 0.15 * m.lerp([ro, m.end], [0, 1])} t={m.t} />
          <Bridge k={1} crack={m.lerp([br - 4, br + 6], [0, 1])} />
          <On at={[-6.9, 35.97]} draw={(x, y) => <Stream a={[x, y]} b={[x + 260 + 200 * burst, y]} t={m.t} k={m.lerp([at, at + 10], [0, 1])} />} />
          <On at={[GIB[0] + 0.2, GIB[1]]} draw={(x, y) => burst > 0 ? <g>{Array.from({ length: 7 }).map((_, i) => <Ball key={i} x={x + 20 + i * 26 * burst + Math.sin(m.t / 3 + i) * 8} y={y - 60 + i * 20} r={16 + i * 3} fill="#f4fbfb" sw={0} shadow={false} />)}</g> : null} />
          <On at={[-4.9, 35.5]} draw={(x, y) => <Tablet x={x} y={y + 40} text={ago} sub="YEARS AGO" k={m.pop(th, 14)} />} />
          <MapLabel at={[-6.6, 36.3]} text="ATLANTIC" size={54} k={m.pop(at, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Break;
