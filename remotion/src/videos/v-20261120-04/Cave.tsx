// "Under the grass of Elidir Fawr, in Snowdonia, there is a cave {fact4} high, with giant machines
// spinning in the dark." The mountain from above on the old map, sheep on its grass; its name writes on,
// SNOWDONIA stamps on; on "cave" its side peels open on a lit hall, the height on a sign; the machines
// appear one by one and spin, the hall's lights flickering.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Cavern, ELIDIR, HALL, Lake, MARCHLYN, Mountain, PERIS, Sheep, Sign, Valley } from "./props";

type Params = { fig?: { height?: string } };

const Flock: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(ELIDIR);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k * 2)}>{[[-120, 90], [-60, 150], [60, -110], [140, 60], [10, 200]].map(([dx, dy], i) => <Sheep key={i} x={xy[0] + dx!} y={xy[1] + dy! + (1 - k) * -40} s={46} t={t} phase={i} />)}</g>;
};

const HeightSign: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()(HALL);
  if (!xy) return null;
  return <Sign x={Math.min(700, Math.max(300, xy[0]))} y={Math.max(420, xy[1] - 330)} w={440} label="CAVE HEIGHT" value={text} k={k} />;
};

const Cave: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const h = (p.beat.params as Params).fig?.height ?? "";
  const gr = m.at("grass", 4), el = m.at("elidir", 20), sn = m.at("snowdonia", 45), cv = m.at("cave", 70), gi = m.at("giant", 110), ma = m.at("machines", 125), dk = m.at("dark", 150);
  const push = m.lerp([cv - 4, cv + 18], [0, 1]) - 0.35 * m.lerp([dk, dk + 20], [0, 1]);
  const scale = 800000 * Math.pow(1.9, push);
  const center: [number, number] = [-4.088 - 0.01 * push, 53.131 - 0.006 * push];
  const n = m.t < gi ? 0 : m.t < ma ? 1 : Math.min(6, 1 + Math.floor((m.t - ma) / 4));
  const spin = m.t < dk ? m.t * 2 : m.t * 2 + (m.t - dk) * (m.t - dk) * 0.25;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1.02 + m.wave(90, 0.012)}>
        <Valley center={center} scale={scale}>
          <Mountain />
          <Lake at={MARCHLYN} rx={170} ry={100} level={1} seed={2} rot={-0.3} t={m.t} />
          <Lake at={PERIS} rx={240} ry={60} level={1} seed={5} rot={-0.65} t={m.t} />
          <Flock k={m.lerp([gr, gr + 12], [0, 1])} t={m.t} />
          <MapLabel at={[-4.07, 53.141]} text="ELIDIR FAWR" size={60} type={m.lerp([el, el + 14], [0, 1])} />
          <Cavern open={m.lerp([cv, cv + 16], [0, 1])} n={n} spin={spin} lit={m.lerp([gi, gi + 10], [0, 1])} flicker={m.t > dk ? Math.sin(m.t * 1.7) : 0} />
          <HeightSign k={m.pop(cv + 8, 12)} text={countText(h, m.lerp([cv + 8, cv + 28], [0, 1]))} />
        </Valley>
      </View>
      <Tag x={290} y={250} w={500} h={110} text="SNOWDONIA" bg="#3a9d5d" fg="#ffffff" k={m.pop(sn, 12)} rot={-4} />
      <SourceLine p={p} />
    </Stage>
  );
};

export default Cave;
