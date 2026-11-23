// Chimneys: "Then came the factories, burning coal. Researchers have mapped about {fact1} of their chimneys in
// England's cities in the eighteen eighties." On "factories" chimneys rise at the city pins; on "coal" coal heaps pile
// up and smoke puffs; on "Researchers" a surveyor with a clipboard stands on the map; on "mapped" a board plants and
// counts up; on "chimneys" more chimneys pop up all over England; on "cities" the camera eases back; on "eighties"
// a COAL AGE stamp lands on the board.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Board, Britain, CITIES, CityLabels, MapChimney, Walker } from "./props";

type Params = { fig?: { chimneys?: string } };

const EXTRA: [number, number][] = [[-2.1, 53.6], [-1.2, 53.0], [-2.6, 53.7], [-1.8, 52.7], [-1.3, 54.6], [-2.9, 53.2], [-1.75, 53.95], [-0.4, 51.6], [-2.4, 52.6], [-1.0, 53.6], [-2.2, 54.1], [-1.4, 52.9]];

const Heap: React.FC<{ at: [number, number]; k: number }> = ({ at, k }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return <g transform={`translate(${xy[0] - 36} ${xy[1] + 6}) scale(${Math.min(1, k)})`}>
    {[[-10, 0, 14], [6, -4, 15], [20, 2, 12], [4, 8, 13]].map(([x, y, r], i) => <Ball key={i} x={x!} y={y!} r={r!} fill="#2b2530" shadow={false} sw={3} />)}
  </g>;
};

const Surveyor: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-0.6, 52.3]);
  if (!xy || k <= 0) return null;
  return <g opacity={Math.min(1, k * 2)}>
    <Walker x={xy[0]} y={xy[1] + (1 - Math.min(1, k)) * 40} s={70} top="#3a5a8c" hat t={t} armR={[60, 120]}
      hold={([hx, hy]) => <g><rect x={hx - 6} y={hy - 46} width={44} height={56} rx={4} fill="#f4efe4" stroke={INK} strokeWidth={4} /><line x1={hx + 2} y1={hy - 30} x2={hx + 30} y2={hy - 30} stroke={INK} strokeWidth={3} /><line x1={hx + 2} y1={hy - 18} x2={hx + 30} y2={hy - 18} stroke={INK} strokeWidth={3} /></g>} />
  </g>;
};

const Chimneys: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig?.chimneys ?? "";
  const fa = m.at("factories", 8), co = m.at("coal", 24), re = m.at("researchers", 40), ma = m.at("mapped", 56), ch = m.at("chimneys", 80), ci = m.at("cities", 96), ei = m.at("eighties", 120);
  const back = m.lerp([ci, ci + 20], [0, 1]);
  const push = m.lerp([ma, ma + 14], [0, 1]) * (1 - back);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.0 + 0.18 * push + m.wave(90, 0.008)} cy={960 - 80 * push}>
        <Britain center={[-1.7, 52.75 - 0.2 * back]} scale={6400 - 1400 * back} uk={1}>
          {CITIES.map((c, i) => <MapChimney key={c.name} at={c.at} k={m.pop(fa + i * 2, 12)} t={m.t} s={0.6} smoke={m.lerp([co, co + 10], [0, 1])} />)}
          {CITIES.map((c, i) => <Heap key={`h${c.name}`} at={c.at} k={m.pop(co + i * 2, 12)} />)}
          {EXTRA.map((a, i) => <MapChimney key={`e${i}`} at={a} k={m.pop(ch + i * 2, 12)} t={m.t} s={0.42} smoke={1} />)}
          <CityLabels k={CITIES.map(() => 1)} size={44} />
          <Surveyor k={m.pop(re, 12)} t={m.t} />
        </Britain>
      </View>
      <Board x={620} y={360} w={520} label="CHIMNEYS MAPPED" value={countText(fig, m.lerp([ma, ma + 30], [0, 1]))} k={m.pop(ma - 4, 12)} />
      <Tag x={620} y={280} w={300} h={80} text="COAL AGE" rot={-8} bg="#e8453c" fg="#ffffff" size={46} k={m.pop(ei, 12)} />
    </Stage>
  );
};
export default Chimneys;
