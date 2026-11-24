// "It nearly happened. In a drought, the canal cut the ships crossing each day from {fact1} to just {fact2}."
// A sun blazes over the lake, its blue pales and the land browns; at the Caribbean entrance a board shows ships a
// day and drops from the first figure to the second as the line of ships waiting there grows.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Board, COLON, Canal, LAKE_C, Lake, PMap, Ship, Sun } from "./props";

type Params = { fig?: { normal?: string; cap?: string } };

const Over: React.FC<{ t: number; sun: number; board: number; drop: number; line: number; normal: string; cap: string }> = ({ t, sun, board, drop, line, normal, cap }) => {
  const at = useAt();
  const c = at(LAKE_C), e = at(COLON);
  return (
    <g>
      {c ? <Sun x={c[0] + 160} y={c[1] - 330} s={110} k={sun} t={t} /> : null}
      {e ? [0, 1, 2, 3, 4].map((i) => (line * 5 > i ? <Ship key={i} x={e[0] - 90 - (i % 2) * 120} y={e[1] - 40 - i * 70 + Math.sin(t / 9 + i) * 4} s={58} rot={90} /> : null)) : null}
      {e ? <Board x={e[0] + 190} y={e[1] - 20} label="SHIPS A DAY" value={drop > 0.5 ? cap : normal} k={board} /> : null}
    </g>
  );
};

const Nearly: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ne = m.at("nearly", 4), dr = m.at("drought", 20), cu = m.at("cut", 34), sh = m.at("ships", 42), da = m.at("day", 56), ju = m.at("just", 100);
  const close = m.lerp([cu - 4, cu + 12], [0, 1]) - m.lerp([ju - 4, ju + 12], [0, 0.6]);
  const pale = m.lerp([dr, dr + 20], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.1 * close + m.wave(80, 0.008) + 0.03 * m.pulse(ju + 2, 6)} cy={960 - 140 * close}>
        <PMap trees={1} brown={pale} center={[-79.82, 9.2]} scale={55000} colors={{ Panama: { fill: pale > 0.5 ? "#c9a86a" : "#d9c08a", k: 0.5 + 0.5 * pale } }}>
          <Lake k={1 - 0.08 * pale} mud={pale} color={pale > 0.5 ? "#6aa6d6" : "#3f86c9"} />
          <Canal w={24} />
          <Over t={m.t} sun={m.pop(ne, 12)} board={m.pop(cu, 12)} drop={m.lerp([da + 10, ju], [0, 1])} line={m.lerp([sh, ju + 20], [0.2, 1])} normal={f.normal ?? ""} cap={f.cap ?? ""} />
        </PMap>
      </View>
    </Stage>
  );
};

export default Nearly;
