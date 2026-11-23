// "It runs {fact3} from end to end, the short cut from the oil fields of the Gulf to the factories of China, Japan
// and Korea." A ruler draws along the strait and stamps its length; the camera pulls back to all of Asia; an oil
// rig on the Gulf, factories in China, Japan and Korea light up on their names, and a route joins them through the lane.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { GOLD, LANE, Line, ROUTE, SEAsia, type LL } from "./props";

type Params = { fig?: { length?: string } };

const Rig: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${1.7 * Math.min(1.1, k)})`}>
    <Limb a={[-30, 0]} b={[0, -90]} w={8} color="#5a5a66" sw={3} />
    <Limb a={[30, 0]} b={[0, -90]} w={8} color="#5a5a66" sw={3} />
    <Block x={-40} y={-10} w={80} h={20} fill="#2d2d3a" sw={3} />
    <circle cx={0} cy={-96} r={12} fill="#ff9a3c" stroke={INK} strokeWidth={3} />
  </g>
);
const Factory: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${1.5 * Math.min(1.1, k)})`}>
    <path d="M-50,0 L-50,-40 L-25,-58 L-25,-40 L0,-58 L0,-40 L25,-58 L25,-40 L50,-40 L50,0 Z" fill="#b9b2a4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <Block x={30} y={-90} w={14} h={50} fill="#8a8478" sw={3} shadow={false} />
    <circle cx={37} cy={-100} r={10} fill="#e9e4da" opacity={0.8} />
  </g>
);

const GULF: LL = [51.5, 26.5], CHINA: LL = [113.5, 23.5], JAPAN: LL = [131.0, 33.6], KOREA: LL = [127.5, 36.5];

const Things: React.FC<{ g: number; gl: number; c: number; j: number; ko: number; route: number }> = ({ g, gl, c, j, ko, route }) => {
  const at = useAt();
  const xy = (p: LL) => at(p) ?? [0, 0];
  return (
    <g>
      <Line via={[GULF, [60, 21], [80, 7], ...LANE.slice(2, 8), [110, 12], [118, 22], [125, 30], KOREA]} k={route} color={ROUTE} w={9} dash />
      <Rig x={xy(GULF)[0]} y={xy(GULF)[1]} k={g} />
      <MapLabel at={[51.5, 31.5]} text="GULF" size={56} k={gl} />
      <Factory x={xy(CHINA)[0]} y={xy(CHINA)[1]} k={c} />
      <MapLabel at={[105, 30]} text="CHINA" size={56} k={c} />
      <Factory x={xy(JAPAN)[0]} y={xy(JAPAN)[1]} k={j} />
      <MapLabel at={[123.5, 41.5]} text="KOREA" size={50} k={ko} />
      <Factory x={xy(KOREA)[0]} y={xy(KOREA)[1]} k={ko} />
      <MapLabel at={[127, 28.5]} text="JAPAN" size={50} k={j} />
    </g>
  );
};

const Ruler: React.FC<{ k: number; text: string; stamp: number }> = ({ k, text, stamp }) => {
  const at = useAt();
  const a = at([96.0, 6.0]);
  if (!a) return null;
  return (
    <g>
      <Line via={LANE.slice(1, 7)} k={k} color={GOLD} w={14} />
      {stamp > 0 ? <Tag x={a[0] + 140} y={a[1] - 160} w={300} h={110} text={text} size={60} k={stamp} rot={-5} /> : null}
    </g>
  );
};

const Length: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const ru = m.at("runs", 2), en = m.at("end", 30), sh = m.at("short", 40), fi = m.at("fields", 54), gu = m.at("gulf", 60), ch = m.at("china", 84), ja = m.at("japan", 92), ko = m.at("korea", 100);
  const back = m.lerp([sh - 4, fi], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01)}>
        <SEAsia center={[100 - 4 * back, 3.2 + 15 * back]} scale={3800 - 3240 * back} wide={back > 0.3}
          colors={{ Malaysia: { fill: "#e0b46a" }, Indonesia: { fill: "#c9c27a" } }}>
          <Ruler k={m.lerp([ru, en], [0, 1])} text={len} stamp={m.pop(en, 10) * (1 - back)} />
          <Things g={m.pop(fi, 10)} gl={m.pop(gu, 10)} c={m.pop(ch, 10)} j={m.pop(ja, 10)} ko={m.pop(ko, 10)} route={m.lerp([ko, m.end], [0, 1])} />
        </SEAsia>
      </View>
    </Stage>
  );
};

export default Length;
