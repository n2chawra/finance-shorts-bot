// "When the soldiers left, one corporal, William Glass, asked to stay with his family. Sailors and settlers joined
// them." Tristan close from above, its north-west shore: the garrison ship loads at the shore on "soldiers" and sails
// off north on "left"; one figure stays on the shore on "corporal"; the camera closes in on "Glass" as his wife and
// children join him and his name writes on; a hut pops on "stay"; small boats sail in from the west on "Sailors";
// more huts pop along the shore on "settlers".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { BigIsle, Folk, House, Patterns, RED_COAT, SEA, Ship, Sign } from "./props";

const X = 620, Y = 900, R = 340;
const SHORE: [number, number] = [X - 0.62 * R, Y - 0.62 * R];

const Stay: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const so = m.at("soldiers", 4), lf = m.at("left", 16), co = m.at("corporal", 30), gl = m.at("glass", 44), st = m.at("stay", 64), sa = m.at("sailors", 92), se = m.at("settlers", 108), gr = m.at("grand", 130), ed = m.at("edinburgh", 142), sv = m.at("seas", 160), fm = m.at("family", 80), jn = m.at("joined", 120);
  const close = m.lerp([gl - 6, gl + 12], [0, 1]) * (1 - m.lerp([sa - 4, sa + 14], [0, 1]));
  const sign = m.lerp([gr - 4, gr + 12], [0, 1]);
  const away = m.lerp([lf, lf + 40], [0, 1]);
  const boatsIn = m.lerp([sa, jn + 4], [0, 1]);
  const [sx, sy] = SHORE;
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.38}>
      <Patterns />
      <rect x={-300} y={-300} width={1680} height={2520} fill={SEA} />
      <View zoom={1.05 + 0.2 * close - 0.05 * sign + m.wave(80, 0.01)} cx={540 - 60 * close} cy={900 - 260 * close + 60 * sign}>
        <BigIsle x={X} y={Y} r={R} t={m.t} />
        {/* the garrison's ship at the shore, then away north */}
        <Ship x={sx - 120 - 200 * away} y={sy - 110 - 700 * away} s={150} kind="sail" t={m.t} crew={1 - away * 0.6} angle={away > 0 ? -100 : 0} />
        {/* soldiers on the beach walk aboard */}
        {[0, 1, 2].map((i) => <Folk key={i} x={sx + 30 + i * 40 - 120 * m.lerp([so, lf], [0, 1])} y={sy + 30} s={70} k={1 - m.lerp([lf - 4, lf + 4], [0, 1])} coat={RED_COAT} t={m.t} />)}
        {/* William Glass and his family */}
        <Folk x={sx + 70} y={sy + 50} s={86} k={m.pop(co, 11)} coat={RED_COAT} t={m.t} />
        {[0, 1, 2].map((i) => <Folk key={`f${i}`} x={sx + 130 + i * 44} y={sy + 54} s={i ? 56 : 80} k={m.pop(Math.min(gl + 4 + i * 4, fm + i * 3), 11)} coat={["#6d9a4c", "#f2b134", "#3b6fb8"][i]!} t={m.t} />)}
        <Txt x={sx + 150} y={sy - 120} size={56} fill="#ffffff" stroke={INK}>{"WILLIAM GLASS".slice(0, Math.round(13 * m.lerp([gl, gl + 14], [0, 1])))}</Txt>
        <House x={sx + 20} y={sy + 120} s={70} k={m.pop(st, 11)} roof="#8a6a4a" />
        {/* sailors and settlers arrive from the west */}
        {[0, 1].map((i) => <Ship key={`b${i}`} x={-160 + (sx - 120 + 160) * boatsIn + i * 40} y={sy + 120 + i * 170} s={80} kind="sail" t={m.t + i * 20} crew={1} />)}
        {[0, 1, 2, 3].map((i) => <House key={`h${i}`} x={X - (0.8 - i * 0.12) * R} y={Y - (0.25 + i * 0.16) * R + 30} s={56} k={m.pop(se + i * 4, 12)} roof={i % 2 ? "#d9483b" : "#3b6fb8"} />)}
        <Sign x={540} y={1330} w={760} text={"EDINBURGH".slice(0, Math.round(9 * m.lerp([ed, ed + 10], [0, 1])))} sub={"OF THE SEVEN SEAS".slice(0, Math.round(17 * m.lerp([sv - 6, sv + 8], [0, 1])))} k={m.pop(gr, 11)} size={70} />
      </View>
    </Stage>
  );
};

export default Stay;
