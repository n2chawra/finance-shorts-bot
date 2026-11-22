// Hook: "Antarctica's ice melts, all of it. Which countries vanish from the map first?" The world from space, the
// white ice cap of Antarctica at the bottom: on "ice" it traces in light; on "melts" cracks run across it; on "all"
// meltwater rings spread from its coast; on "countries" coastlines around the world flicker blue; on "vanish" the
// camera pushes toward Europe and Asia; on "map" a question mark drops onto the ocean; on "first" it eases back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { ICE, QMark, Stars, World, iceColor } from "./props";

export const Cracks: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  if (k <= 0) return null;
  const lines: [number, number][][] = [[[-60, -72], [-20, -78], [20, -74]], [[40, -70], [80, -76], [120, -71]], [[140, -73], [170, -80], [200, -75]]];
  return <g>{lines.map((ln, i) => {
    const xy = ln.map((p) => at(p)).filter((p): p is [number, number] => !!p);
    const n = Math.max(2, Math.round(xy.length * Math.min(1, k * 1.5)));
    const d = xy.slice(0, n).map((p, j) => `${j ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
    return <path key={i} d={d} fill="none" stroke="#6aa8c0" strokeWidth={7} strokeLinecap="round" />;
  })}</g>;
};

export const MeltRings: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  if (k <= 0) return null;
  return <g opacity={Math.min(1, k * 2)}>{[[-30, -66], [60, -66], [150, -66], [240, -66]].map((p, i) => {
    const xy = at(p as [number, number]);
    if (!xy) return null;
    return [0, 1, 2].map((j) => {
      const f = ((t / 45) + j / 3 + i * 0.1) % 1;
      return <ellipse key={`${i}${j}`} cx={xy[0]} cy={xy[1]} rx={30 + 160 * f} ry={12 + 50 * f} fill="none" stroke="#bfe6f0" strokeWidth={5} opacity={(1 - f) * k} />;
    });
  })}</g>;
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ic = m.at("ice", 6), me = m.at("melts", 18), al = m.at("all", 30), co = m.at("countries", 50), va = m.at("vanish", 62), mp = m.at("map", 80), fi = m.at("first", 92);
  const push = m.lerp([va, va + 16], [0, 1]) * (1 - m.lerp([fi, fi + 18], [0, 0.7]));
  const flick = m.lerp([co, co + 8], [0, 1]) * (0.6 + 0.4 * Math.abs(Math.sin(m.t / 4)));
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <World center={[15 + 35 * push, -28 + 50 * push]} scale={340 + 220 * push}
          colors={{ Antarctica: { fill: iceColor(m.lerp([me, me + 40], [0, 0.6])), k: 1, trace: m.lerp([ic, ic + 24], [0.3, 1]), traceColor: "#bfe6f0" },
            Netherlands: { fill: "#2f6f8f", k: flick }, Bangladesh: { fill: "#2f6f8f", k: flick }, Denmark: { fill: "#2f6f8f", k: flick * 0.8 }, Vietnam: { fill: "#2f6f8f", k: flick * 0.7 } }}>
          <Cracks k={m.lerp([me, me + 20], [0, 1])} />
          <MeltRings k={m.lerp([al, al + 12], [0, 1])} t={m.t} />
          <MapLabel at={[20, -72]} text="ANTARCTICA" size={60} fill={ICE} k={1 - m.lerp([va - 6, va + 4], [0, 1])} />
        </World>
      </View>
      <QMark x={720} y={1080} k={m.pop(mp, 10)} t={m.t} size={220} />
    </Stage>
  );
};
export default Hook;
