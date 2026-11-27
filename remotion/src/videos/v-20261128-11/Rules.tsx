// "No country grows its slice, no army builds a base, and no bomb is tested on the ice." Close on the frozen ice
// inside the slices: on "country" Norway's slice edge pushes outward, on "grows" it snaps back under a red cross; on
// "army" a little fort rises on the ice, on "base" a cross stamps over it; on "bomb" a bomb drops toward the ice,
// on "tested" a cross stamps over it; on "ice" the camera settles back on the white ice.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { ClaimSlice } from "../../flat/polar";
import { ALL, AntMap, CLAIMS, Cross, Floes, Frost, SEA, Slices, between } from "./props";

const Fort: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const s = Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={8} rx={110} ry={20} fill="#1d1a2b" opacity={0.25} />
      <Block x={-90} y={-90} w={180} h={90} fill="#8d8f96" r={4} />
      {[-90, -30, 30].map((dx) => <Block key={dx} x={dx} y={-118} w={60} h={30} fill="#a4a6ad" r={3} />)}
      <Block x={-22} y={-50} w={44} h={50} fill="#3a3330" r={20} />
      <line x1={0} y1={-118} x2={0} y2={-180} stroke={INK} strokeWidth={6} />
      <path d="M 0 -180 L 50 -168 L 0 -156 Z" fill="#5a6b3a" stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Bomb: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const yy = y - 420 * (1 - Math.min(1, k));
  return (
    <g transform={`translate(${x} ${yy}) rotate(8)`}>
      <path d="M -30 -110 L 30 -110 L 18 -80 L -18 -80 Z" fill="#555a63" stroke={INK} strokeWidth={5} />
      <Ball x={0} y={-30} r={56} fill="#3b3f47" />
      <Ball x={0} y={24} r={16} fill="#3b3f47" />
    </g>
  );
};

const At: React.FC<{ ll: [number, number]; children: (x: number, y: number) => React.ReactNode }> = ({ ll, children }) => {
  const xy = useAt()(ll);
  return xy ? <>{children(xy[0], xy[1])}</> : null;
};

const Rules: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const co = m.at("country", 4), gr = m.at("grows", 14), ar = m.at("army", 32), ba = m.at("base", 44), bo = m.at("bomb", 62), te = m.at("tested", 74), ic = m.at("ice", 88);
  const close = { center: [20, -82] as [number, number], scale: 1700 };
  const cam = between({ center: [0, -85], scale: 1150 }, close, m.lerp([0, ar + 10], [0, 1]));
  const camB = between(cam, { center: [0, -85], scale: 1200 }, m.lerp([ic, ic + 24], [0, 1]));
  const push = m.lerp([co, co + 12], [0, 1]) * (1 - m.lerp([gr, gr + 8], [0, 1]));
  const n = CLAIMS.nor!;
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1000}>
        <AntMap cam={camB}>
          <Floes t={m.t} n={50} />
          <Slices s={ALL({ frost: 1 })} />
          <ClaimSlice from={n.from} to={n.to + 14 * push} k={1} fill="#e0605a" glow={push} land />
          <Frost k={1} t={m.t} n={70} />
          <At ll={[50, -72]}>{(x, y) => <Cross x={x} y={y} r={70} k={m.pop(gr)} />}</At>
          <At ll={[-10, -80]}>{(x, y) => <g><Fort x={x} y={y} k={m.pop(ar)} /><Cross x={x} y={y - 60} k={m.pop(ba)} /></g>}</At>
          <At ll={[90, -80]}>{(x, y) => <g><Bomb x={x} y={y} k={m.lerp([bo, bo + 14], [0, 1])} /><Cross x={x} y={y - 50} k={m.pop(te)} /></g>}</At>
        </AntMap>
      </View>
    </Stage>
  );
};
export default Rules;
