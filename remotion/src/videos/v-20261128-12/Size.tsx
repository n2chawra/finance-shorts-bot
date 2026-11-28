// "Mexico has 3.9 times as much land as Spain, from the deserts of the north to the jungles of the south." Mexico in
// its place traces with its flag; a sign rises on it with the ratio; Spain shapes stack beside it in the Pacific one
// after another; cacti spring up across the northern desert on "deserts", trees across the south on "jungles".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Lift } from "../../flat/map";
import { At, Cactus, ES_FILL, GeoMap, MEXICO, MX_FILL, Post, SEA, Tree, between } from "./props";

type Params = { fig?: { ratio?: string } };
const NORTH: [number, number][] = [[-112, 30.2], [-108, 29], [-105.5, 27.5], [-103, 28.6], [-110.5, 28], [-106.5, 30.4]];
const SOUTH: [number, number][] = [[-92.5, 16.8], [-90.5, 18.6], [-89, 19.6], [-94, 17.4], [-91.7, 17.6], [-88.6, 18.2]];
const STACK: [number, number][] = [[-110.5, 29], [-101.5, 27.2], [-100.2, 20.3], [-91.8, 18]];

const Size: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ratio = (p.beat.params as Params).fig?.ratio ?? "";
  const mx = m.at("mexico", 2), la = m.at("land", 16), sp = m.at("spain", 28), de = m.at("desert", 50), no = m.at("northern", 46), ju = m.at("jungle", 76), so = m.at("southern", 70);
  const cam = between({ center: [-102, 22], scale: 2200 }, { center: [-104, 19.5], scale: 2000 }, m.lerp([sp, sp + 20], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={960}>
        <GeoMap cam={cam} colors={{ Mexico: { fill: MX_FILL, k: 1, trace: m.lerp([mx, mx + 24], [0, 1]), flag: "Mexico", traceColor: m.t > no && m.t < no + 20 ? "#ffd84a" : undefined } }}>
          {STACK.map((s, i) => { const a = m.lerp([sp + i * 6 - 4, sp + i * 6 + 6], [0, 1]); return a > 0 ? <g key={i} opacity={0.78 * a} transform={`translate(0 ${(1 - a) * -60})`}><Lift name="Spain" to={s} k={1} fill={ES_FILL} flag="Spain" /></g> : null; })}
          {NORTH.map((c, i) => <At key={`c${i}`} ll={c}>{(x, y) => <Cactus x={x} y={y} k={m.pop(de + i * 3)} s={1.1} />}</At>)}
          {SOUTH.map((c, i) => <At key={`t${i}`} ll={c}>{(x, y) => <Tree x={x} y={y} k={m.pop(ju + i * 3)} s={1.0} />}</At>)}
          <Post at={[-104, 33.5]} text={`${ratio} SPAIN`} label="LAND" k={m.pop(mx + 4)} w={400} />
          {m.pulse(so + 6, 10) > 0 ? <At ll={[-92, 17]}>{(x, y) => <circle cx={x} cy={y} r={60 + 40 * m.pulse(so + 6, 10)} fill="none" stroke="#ffd84a" strokeWidth={8} />}</At> : null}
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Size;
