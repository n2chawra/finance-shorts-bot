// "About {fact1} years ago, that door slammed shut." A stone tablet with the date rises on the African shore; the map
// turns old and sepia; the land on both sides creeps together and closes the gap with a thud and dust; the Atlantic
// arrows stop.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, View, motion } from "../../flat/kit";
import { Bridge, GIB, Map, On, Stream, Tablet } from "./props";

type Params = { fig?: { ago?: string } };

const Shut: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ago = (p.beat.params as Params).fig?.ago ?? "";
  const ab = m.at("about", 2), ye = m.at("years", 36), dr = m.at("door", 48), sl = m.at("slammed", 58), sh = m.at("shut", 68);
  const close = m.lerp([sl - 4, sl + 14], [0, 1]);
  const dust = m.pulse(sl + 4, 24);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[-5.6, 35.55 + 0.15 * close]} scale={26000 + 10000 * close}>
          <Bridge k={m.lerp([dr, sl + 6], [0.15, 1])} />
          <On at={[-7.0, 35.97]} draw={(x, y) => <Stream a={[x, y]} b={[x + 300, y]} t={m.t} k={1 - m.lerp([sh, sh + 8], [0, 1])} />} />
          <On at={GIB} draw={(x, y) => dust > 0 ? <g>{[0, 1, 2, 3, 4].map((i) => <Ball key={i} x={x + (i - 2) * 50 * (1 + dust)} y={y - 30 - 40 * dust} r={30 + 20 * dust} fill="#d8c8a8" sw={0} shadow={false} />)}</g> : null} />
          <On at={[-5.0, 35.55]} draw={(x, y) => <Tablet x={x} y={y} text={ago} sub="YEARS AGO" k={m.pop(ab, 14)} />} />
        </Map>
        <rect x={-200} y={-200} width={1480} height={2320} fill="#a8875a" opacity={0.2 * m.lerp([ye, ye + 14], [0, 1])} />
      </View>
    </Stage>
  );
};
export default Shut;
