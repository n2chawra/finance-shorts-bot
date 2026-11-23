// Keep: "But those three keep their high ground. So which countries lose everything?" The world from space: on "three"
// the Netherlands, Bangladesh and Florida pulse; on "keep" their high ground glows green; on "high" little hills rise
// above the water; on "which" a question mark spins over the Indian Ocean; on "everything" the camera pushes toward it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { FLORIDA, NEW_SEA, QMark, Shape, Stars, World } from "./props";

const Hill: React.FC<{ at: [number, number]; k: number }> = ({ at, k }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return <g transform={`translate(${xy[0]} ${xy[1]}) scale(${Math.min(1, k)})`}><Ball x={0} y={-10} r={26} ry={18} fill="#5ea052" sw={4} shadow={false} /></g>;
};

const Keep: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const th = m.at("three", 6), ke = m.at("keep", 14), hi = m.at("high", 24), wh = m.at("which", 40), ev = m.at("everything", 62);
  const push = m.lerp([ev, ev + 18], [0, 1]);
  const pulse = 0.7 + 0.3 * Math.abs(Math.sin(m.t / 5));
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <World center={[10 + 60 * push, 25 - 25 * push]} scale={330 + 200 * push}
          colors={{ Netherlands: { fill: NEW_SEA, k: pulse * m.lerp([th, th + 6], [0.6, 1]) }, Bangladesh: { fill: NEW_SEA, k: pulse * m.lerp([th + 4, th + 10], [0.6, 1]) } }}>
          <Shape pts={FLORIDA} fill={NEW_SEA} k={0.9} stroke="#9fd3e0" sw={3} />
          {[[5.9, 50.9], [91.8, 24.5], [-82.0, 30.4]].map((a, i) => <MapPin key={i} at={a as [number, number]} k={m.pop(th + i * 4, 10)} color="#3f8f4a" r={24} />)}
          {[[5.9, 50.9], [91.8, 24.5], [-82.0, 30.4]].map((a, i) => <Hill key={`h${i}`} at={a as [number, number]} k={m.pop(hi + i * 3, 12) * (0.6 + 0.4 * m.lerp([ke, ke + 8], [0, 1]))} />)}
        </World>
      </View>
      <QMark x={620 + 120 * push} y={1100 - 80 * push} k={m.pop(wh, 10)} t={m.t} size={220} />
    </Stage>
  );
};
export default Keep;
