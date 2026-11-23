// "Now rub it out. A tanker sailing east from India meets a wall of land, with Sumatra on one side and Malaysia on
// the other." An eraser sweeps the lane and land fills it; a tanker comes in from the west with a FROM INDIA sign,
// bumps into the new land and stops; Sumatra and Malaysia flash on their names.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, Tag, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { LAND, LANE, Line, SEAsia, Tanker, tipOf, type LL } from "./props";

const PATCH: LL[] = LANE.slice(2, 8);

const Rub: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const tip = tipOf(at, PATCH, k);
  return (
    <g>
      <Line via={PATCH} k={k} color={LAND} w={150} ink={false} />
      <Line via={PATCH} k={k} color="#c9b47e" w={60} ink={false} o={0.5} />
      {tip && k > 0 && k < 1 ? (
        <g transform={`translate(${tip[0]} ${tip[1] - 40 + Math.sin(t / 2) * 8}) rotate(-25)`}>
          <Block x={-70} y={-40} w={140} h={80} r={14} fill="#f08fa6" sw={6} />
          <Block x={-70} y={-40} w={50} h={80} r={10} fill="#3b6fb8" sw={6} shadow={false} />
        </g>
      ) : null}
    </g>
  );
};

const Ship: React.FC<{ k: number; t: number; sign: number; bump: number }> = ({ k, t, sign, bump }) => {
  const at = useAt();
  const a = at([94.0, 6.6]), b = at([98.4, 4.65]);
  if (!a || !b || k <= 0) return null;
  const x = a[0] + (b[0] - a[0]) * k - 18 * bump, y = a[1] + (b[1] - a[1]) * k;
  return (
    <g>
      <Tanker x={x} y={y} s={110} rot={24} t={t} />
      {sign > 0 ? <Tag x={x - 270} y={y - 260} w={330} h={96} text="FROM INDIA" size={50} k={sign} rot={-4} /> : null}
      {bump > 0 ? <g opacity={bump}>{[0, 1, 2].map((i) => <path key={i} d={`M${x + 140 + i * 6},${y - 40 + i * 30} l40,${-14 + i * 14}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />)}</g> : null}
    </g>
  );
};

const Erase: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ru = m.at("rub", 2), ou = m.at("out", 12), ta = m.at("tanker", 22), ind = m.at("india", 40), wa = m.at("wall", 56), su = m.at("sumatra", 76), ma = m.at("malaysia", 100);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.06 * m.lerp([ta, ta + 14], [0, 1]) - 0.04 * m.lerp([ma - 4, ma + 10], [0, 1]) + m.wave(80, 0.008) + 0.02 * m.pulse(wa + 3, 6)}>
        <SEAsia center={[99.0, 3.6]} scale={4200}
          colors={{ Malaysia: { fill: "#e0b46a", k: 1, trace: m.lerp([ma, ma + 24], [0, 1]) }, Indonesia: { fill: "#c9c27a", trace: m.lerp([su, su + 24], [0, 1]) } }}>
          <Rub k={m.lerp([ru, ou + 14], [0, 1])} t={m.t} />
          <Ship k={m.lerp([ta, wa], [0, 1])} t={m.t} sign={m.pop(ind, 10)} bump={m.pulse(wa + 4, 10)} />
        </SEAsia>
      </View>
    </Stage>
  );
};

export default Erase;
