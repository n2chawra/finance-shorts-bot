// "That's slow. So what happens if it never stops?" A snail crawls along the rift in Kenya, a clock dial pops up on
// the map, its hands start to spin on "never" and blur on "stops" while the map shivers.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Crack, Map, SeaMarks, mix, riftAt } from "./props";
import { RIFTV } from "./Line";

const Snail: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(riftAt(0.62 + 0.04 * k));
  if (!xy) return null;
  const [x, y] = [xy[0] + 30, xy[1]];
  return (
    <g>
      <path d={`M${x - 70},${y} Q${x - 80},${y - 22} ${x - 50},${y - 18} L${x + 60},${y - 14} Q${x + 80},${y - 10} ${x + 70},${y} Z`} fill="#c9a07a" stroke={INK} strokeWidth={4} />
      <Ball x={x} y={y - 50} r={44} fill="#d98a3d" sw={4} />
      <path d={`M${x},${y - 50} m-24,0 a24,24 0 1,1 24,24 a14,14 0 1,1 -14,-14`} fill="none" stroke={INK} strokeWidth={4} />
      <Limb a={[x + 62, y - 14]} b={[x + 80, y - 50 + Math.sin(t / 8) * 4]} w={5} color={INK} sw={1} />
    </g>
  );
};

const Clock: React.FC<{ k: number; spin: number }> = ({ k, spin }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(540,560) scale(${q})`}>
      <Block x={-14} y={150} w={28} h={140} fill="#6b4a2a" r={4} />
      <Ball x={0} y={0} r={170} fill="#f4e6c4" sw={7} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(a) * 130} y1={-Math.cos(a) * 130} x2={Math.sin(a) * 150} y2={-Math.cos(a) * 150} stroke={INK} strokeWidth={6} />;
      })}
      <g transform={`rotate(${spin * 30})`}><Limb a={[0, 0]} b={[0, -90]} w={14} color={INK} sw={2} /></g>
      <g transform={`rotate(${spin * 360})`}><Limb a={[0, 0]} b={[0, -125]} w={9} color="#c0392b" sw={2} /></g>
      <circle cx={0} cy={0} r={14} fill={INK} />
    </g>
  );
};

const Question: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sl = m.at("slow", 4), fe = m.at("feel", 20), wh = m.at("what", 24), ne = m.at("never", 40), st = m.at("stops", 52);
  const close = m.lerp([ne, ne + 20], [0, 1]);
  const spin = m.t < ne ? 0 : ((m.t - ne) / 30) ** 1.6 * 3;
  const shiver = m.t > st ? Math.sin(m.t * 2.2) * 4 : 0;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)} cx={540 + shiver}>
        <Map center={[36.6, 1.0]} scale={mix(RIFTV.scale, 2600, m.lerp([0, sl + 20], [0, 1])) + 700 * close}
          colors={{ Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 1 }, Kenya: { fill: "#c9604a", flag: "Kenya", k: 1 }, Tanzania: { fill: "#7fb6d9", flag: "Tanzania", k: 1 } }}>
          <SeaMarks t={m.t} />
          <Crack glow={0.5 + 0.4 * Math.abs(Math.sin(spin))} w={12} />
          <Snail k={m.lerp([sl, m.end], [0, 1])} t={m.t + 20 * m.pulse(fe + 4, 8)} />
        </Map>
        <Clock k={m.pop(wh)} spin={spin} />
      </View>
    </Stage>
  );
};
export default Question;
