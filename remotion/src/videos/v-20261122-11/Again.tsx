// Again: "From London to the mill towns of the north, it happens again and again. And the reason isn't on the
// ground. It's in the air." England on the old map: a split pin drops on London; on "mill" pins drop on the mill
// towns; on "north" the camera slides north; on "again" the pins split green west, grey east; on "reason" a
// magnifying glass sweeps the land; on "ground" it presses down and finds nothing; on "air" swirls of wind rise.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Britain, CITIES, CityLabels, SplitPin, WindArrow } from "./props";
import { INK } from "../../flat/kit";

const Glass: React.FC<{ k: number; at: [number, number]; press: number; t: number }> = ({ k, at, press, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const s = 1 - 0.12 * press;
  return (
    <g transform={`translate(${xy[0] + Math.sin(t / 10) * 10} ${xy[1] - 20 * (1 - press)}) scale(${s * Math.min(1, k)})`} opacity={Math.min(1, k * 2)}>
      <line x1={70} y1={70} x2={170} y2={170} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <line x1={70} y1={70} x2={170} y2={170} stroke="#7a5230" strokeWidth={22} strokeLinecap="round" />
      <circle cx={0} cy={0} r={100} fill="#ffffff" opacity={0.25} stroke={INK} strokeWidth={14} />
      <circle cx={0} cy={0} r={100} fill="none" stroke="#c9c9d4" strokeWidth={7} />
    </g>
  );
};

const Again: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const lo = m.at("london", 4), mi = m.at("mill", 20), no = m.at("north", 34), ag = m.at("again", 46), re = m.at("reason", 80), gr = m.at("ground", 100), ai = m.at("air", 125);
  const up = m.lerp([no, no + 24], [0, 1]);
  const lift = m.lerp([ai, ai + 14], [0, 1]);
  const pinK = CITIES.map((_, i) => (i === 0 ? m.pop(lo, 10) : m.pop(mi + (i - 1) * 3, 10)));
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.0 + 0.12 * m.lerp([gr, gr + 12], [0, 1]) - 0.1 * lift + m.wave(90, 0.008)}>
        <Britain center={[-1.6 - 0.2 * up, 52.2 + 1.1 * up]} scale={5600} uk={1} trace={m.lerp([lo, lo + 30], [0, 1])}>
          {CITIES.map((c, i) => <SplitPin key={c.name} at={c.at} k={pinK[i]!} split={i === 0 ? m.lerp([lo + 6, lo + 14], [0, 1]) : m.lerp([ag + i * 2, ag + i * 2 + 8], [0, 1])} r={30} />)}
          <CityLabels k={pinK} size={44} />
          <Glass k={m.lerp([re, re + 10], [0, 1]) * (1 - lift)} at={[-1.9, 53.0 + 0.6 * m.lerp([re, gr], [0, 1])]} press={m.pulse(gr + 6, 8)} t={m.t} />
        </Britain>
        {lift > 0 ? [560, 760, 960].map((y, i) => <WindArrow key={i} x={-200 + ((m.t - ai) * 9 + i * 260) % 1300} y={y} len={250} k={lift} />) : null}
      </View>
    </Stage>
  );
};
export default Again;
