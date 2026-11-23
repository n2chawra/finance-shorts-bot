// "It's only a thought experiment, but look how thin this lane is: between Malaysia and the island of Sumatra, just
// {fact4} wide at its narrowest." A thought bubble frames the map; the camera pushes in on the Phillip Channel,
// Malaysia and Indonesia trace in light, a measuring bar spans the channel with the width on it, a tanker squeezes by.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { GOLD, SEAsia, Spot, Tanker } from "./props";

type Params = { fig?: { width?: string } };

const Bar: React.FC<{ k: number; stamp: number; width: string; ship: number; t: number }> = ({ k, stamp, width, ship, t }) => {
  const at = useAt();
  const a = at([103.72, 1.21]), b = at([103.72, 1.1]);
  if (!a || !b || k <= 0) return null;
  const mx = a[0], top = Math.min(a[1], b[1]), bot = Math.max(a[1], b[1]);
  const len = (bot - top) * Math.min(1, k);
  return (
    <g>
      <line x1={mx} y1={top} x2={mx} y2={top + len} stroke={INK} strokeWidth={16} />
      <line x1={mx} y1={top} x2={mx} y2={top + len} stroke={GOLD} strokeWidth={9} />
      <line x1={mx - 40} y1={top} x2={mx + 40} y2={top} stroke={INK} strokeWidth={10} />
      {k >= 1 ? <line x1={mx - 40} y1={bot} x2={mx + 40} y2={bot} stroke={INK} strokeWidth={10} /> : null}
      {stamp > 0 ? <Tag x={mx - 230} y={top - 220} w={300} h={110} text={width} size={60} k={stamp} rot={-4} /> : null}
      {ship > 0 ? <Tanker x={mx - 420 + 840 * ship} y={(top + bot) / 2} s={70} rot={-4} t={t} /> : null}
    </g>
  );
};

const IslandGlow: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([103.95, 1.05]);
  return xy && k > 0 ? <circle cx={xy[0]} cy={xy[1]} r={260} fill="#ffe08a" opacity={0.35 * k} /> : null;
};

const Narrow: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const width = (p.beat.params as Params).fig?.width ?? "";
  const th = m.at("thought", 2), lo = m.at("look", 20), tn = m.at("thin", 28), my = m.at("malaysia", 44), su = m.at("sumatra", 58), isl = m.at("island", 50), ex = m.at("experiment", 10), ju = m.at("just", 70), wi = m.at("wide", 80), na = m.at("narrowest", 92);
  const push = m.lerp([lo, tn + 10], [0, 1]);
  const bub = m.pop(th, 12) * (1 - m.lerp([lo, lo + 14], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <SEAsia center={[103.75 - 0.6 * (1 - push), 1.25 + 0.5 * (1 - push)]} scale={26000 + 30000 * push}
          colors={{ Malaysia: { fill: "#e0b46a", trace: m.lerp([my, my + 26], [0, 1]) }, Indonesia: { fill: "#c9c27a", trace: m.lerp([su, su + 26], [0, 1]) }, Singapore: { fill: "#e8453c" } }}>
          <Spot at={[103.86, 1.36]} name="SINGAPORE" k={m.lerp([tn, tn + 12], [0, 1])} size={52} dy={-50} />
          <Spot at={[103.95, 1.03]} name="INDONESIA" k={m.lerp([su, su + 12], [0, 1])} size={48} dy={40} left />
          <IslandGlow k={m.pulse(isl + 6, 14)} />
          <Bar k={m.lerp([ju, wi], [0, 1])} stamp={m.pop(wi, 10)} width={width} ship={m.lerp([na - 4, m.end], [0, 1])} t={m.t} />
        </SEAsia>
      </View>
      {bub > 0 ? (
        <g opacity={bub}>
          <ellipse cx={540} cy={900} rx={560} ry={760} fill="none" stroke="#ffffff" strokeWidth={22} strokeDasharray="90 40" />
          <circle cx={170} cy={1560 - 40 * m.lerp([ex, ex + 20], [0, 1])} r={36} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <circle cx={110} cy={1640 - 60 * m.lerp([ex, ex + 20], [0, 1])} r={22} fill="#ffffff" stroke={INK} strokeWidth={5} />
        </g>
      ) : null}
    </Stage>
  );
};

export default Narrow;
