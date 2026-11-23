// "For {fact4} days, nothing moved, and ships piled up at both ends." A DAY counter over the canal starts on
// "nothing" and climbs to the figure on "moved"; ships arrive one by one and queue at the Mediterranean end
// on "ships" and at the Red Sea end on "piled"; on "ends" the camera pulls back on the two long queues.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Display, Stage, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Canal, Ship, World } from "./props";

type Params = { fig?: { days?: string } };

const Queue: React.FC<{ from: [number, number]; dir: [number, number]; n: number; k: number; s: number; t: number }> = ({ from, dir, n, k, s, t }) => {
  const at = useAt();
  const xy = at(from);
  if (!xy) return null;
  const shown = Math.round(n * Math.max(0, Math.min(1, k)));
  return (
    <g>
      {Array.from({ length: shown }).map((_, i) => (
        <Ship key={i} x={xy[0] + dir[0] * i * s * 0.75 + ((i * 37) % 23) - 11} y={xy[1] + dir[1] * i * s * 0.55 + Math.sin(t / 14 + i) * 3} s={s} angle={0} hull={["#2c3e66", "#5a3a28", "#1f6b4a", "#7a2f3a"][i % 4]} />
      ))}
    </g>
  );
};

const Jam: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const days = (p.beat.params as Params).fig?.days ?? "";
  const nothing = m.at("nothing", 8), moved = m.at("moved", 24), ships = m.at("ships", 40), piled = m.at("piled", 56), ends = m.at("ends", 72);
  const back = m.lerp([ends - 4, ends + 18], [0, 1]);
  const scale = 30000 - 16000 * back;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <World center={[32.45, 30.5]} scale={scale}>
          <Canal k={1} width={10 + scale / 1200} color="#3d6f93" />
          <Queue from={[32.3, 31.45]} dir={[0.25, -1]} n={7} k={m.lerp([ships, ships + 24], [0, 1])} s={130 - 50 * back} t={m.t} />
          <Queue from={[32.6, 29.75]} dir={[0.35, 1]} n={7} k={m.lerp([piled, piled + 24], [0, 1])} s={130 - 50 * back} t={m.t} />
        </World>
        <Display x={250} y={330} w={580} h={210} label="DAYS STUCK" value={m.t < nothing ? "- -" : countText(days, m.lerp([nothing, moved + 6], [0.05, 1]))} />
      </View>
    </Stage>
  );
};

export default Jam;
