// "Cut off, the sun took {fact3} cubic kilometres of water a year." A lock is stamped on the closed strait; the sun
// blazes bigger over the whole sea; a gauge on the shore shows the yearly loss; steam pours off the water; the
// waterline drops a step.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, View, motion } from "../../flat/kit";
import { Bridge, Dry, GIB, Gauge, Map, On, Steam, Sun } from "./props";
import { MapRoute } from "../../flat/map";

type Params = { fig?: { loss?: string } };

const Lock: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const s = 1.6 - 0.6 * Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <path d="M-26,-10 L-26,-38 Q0,-70 26,-38 L26,-10" fill="none" stroke="#5a5a66" strokeWidth={12} />
      <Block x={-40} y={-12} w={80} h={64} fill="#c9a227" r={10} sw={4} />
    </g>
  );
};

const Drain: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const loss = (p.beat.params as Params).fig?.loss ?? "";
  const cu = m.at("cut", 2), su = m.at("sun", 16), cb = m.at("cubic", 50), wa = m.at("water", 66), ye = m.at("year", 76), no = m.at("nothing", 96), re = m.at("replace", 112);
  const push = m.lerp([ye - 4, ye + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.38}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[15.0 + 1.5 * push, 35.4]} scale={1500 + 500 * push}>
          <Dry level={1 - 0.12 * m.lerp([ye, ye + 14], [0, 1]) - 0.12 * m.lerp([re, re + 14], [0, 1]) - 0.001} t={m.t} />
          <Bridge k={1} />
          <On at={GIB} draw={(x, y) => <Lock x={x} y={y - 30} k={m.pop(cu, 10)} />} />
          <On at={[15.0, 43.5]} draw={(x, y) => <Sun x={x} y={y - 150} r={60 + 30 * m.lerp([su, su + 14], [0, 1])} k={1} t={m.t} />} />
          {[[3.5, 38.8], [12.0, 39.8], [18.0, 35.0], [25.0, 34.0], [30.0, 33.5]].map((s, i) => <On key={i} at={s as [number, number]} draw={(x, y) => <Steam x={x} y={y} t={m.t + i * 9} k={0.5 + 0.5 * m.lerp([wa, wa + 10], [0, 1])} s={0.8 + 0.3 * m.lerp([wa, wa + 10], [0, 1])} />} />)}
          <MapRoute via={[[31.2, 27.0], [31.0, 29.0], [31.2, 30.4], [31.0, 31.5]]} k={1} color="#3f86c9" width={14 - 9 * m.lerp([no, no + 14], [0, 1])} dash={false} />
          <On at={[15.0, 31.0]} draw={(x, y) => <Gauge x={x} y={y + 230} label="LOST A YEAR, KM³" value={loss} k={m.pop(cb, 12)} needle={m.lerp([cb, ye], [0.2, 0.9])} w={560} />} />
        </Map>
      </View>
    </Stage>
  );
};
export default Drain;
