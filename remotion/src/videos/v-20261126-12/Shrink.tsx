// "Year after year, coast after coast, the water pulled back into salty lakes." A year counter flips on each word;
// the Adriatic dries, then the Aegean; salt crusts spread over the floor; the camera pulls back on the few blue lakes
// left in the deep basins.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Bridge, Dry, Map } from "./props";

const Flip: React.FC<{ k: number; n: number }> = ({ k, n }) => (
  <g>
    <Block x={340} y={250} w={400} h={150} fill="#2b2b3a" r={18} />
    <Txt x={540} y={300} size={44} fill="#cfc6b0">YEAR AFTER YEAR</Txt>
    <g transform={`translate(540,360) scale(1,${Math.abs(Math.cos(k * Math.PI))})`}>
      <Txt x={0} y={18} size={52} fill="#ffe08a">{["I", "II", "III", "IV", "V"][n % 5] ?? ""}</Txt>
    </g>
  </g>
);

const Shrink: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ye = m.at("year", 2), af = m.at("after", 12), co = m.at("coast", 24), pu = m.at("pulled", 44), sa = m.at("salty", 60), la = m.at("lakes", 70), lv = m.at("leaving", 62), dp = m.at("deepest", 84);
  const level = 0.85 - 0.5 * m.lerp([ye, dp], [0, 1]);
  const wide = m.lerp([la - 4, la + 18], [0, 1]);
  const flips = [ye, af, co, pu, sa].filter((f) => m.t >= f).length;
  const last = [ye, af, co, pu, sa][Math.max(0, flips - 1)] ?? 0;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[19.0 - 3.5 * wide, 38.0 - 2.2 * wide]} scale={2600 - 1050 * wide}>
          <Dry level={level} t={m.t} glitter={m.lerp([sa, sa + 12], [0, 0.5]) + m.lerp([lv, lv + 10], [0, 0.4])} />
          <Bridge k={1} />
          {wide < 0.05 ? <MapLabel at={[15.6, 43.4]} text="ADRIATIC" size={48} k={m.pop(co, 12)} /> : null}
          {wide < 0.05 ? <MapLabel at={[25.0, 39.6]} text="AEGEAN" size={48} k={m.pop(pu, 12)} /> : null}
          <MapLabel at={[17.0, 34.2]} text="SALT LAKES" size={52} k={m.pop(dp, 12)} />
        </Map>
      </View>
      <Flip k={m.lerp([last, last + 8], [0, 1])} n={flips} />
    </Stage>
  );
};
export default Shrink;
