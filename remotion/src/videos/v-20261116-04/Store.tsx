// Promise: "Its whole North American store made less: {fact5}." The Amazon warehouse floor under the
// logo: parcels slide along the conveyor on "whole", the shelves light up down the aisle on "North", the
// worker turns to the parcel pallet on "store" and slaps the store's profit tag on it on "less".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Floor, Parcel, Shelves } from "./props";

type Params = { fig?: { store?: string } };

const Store: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const store = (p.beat.params as Params).fig?.store ?? "";
  const whole = m.at("whole", 2), north = m.at("north", 8), am = m.at("american", 14), st = m.at("store", 20), made = m.at("made", 25), less = m.at("less", 30), only = m.at("only", 34), year = m.at("year", 60);
  const fall = m.lerp([am, am + 12], [0, 1], Easing.in(Easing.quad));
  const slide = Math.max(0, (m.t - whole) * 9);
  const lights = m.lerp([north, north + 10], [0, 1], Easing.linear);
  const zoom = m.t < st ? m.lerp([0, st], [0.95, 1.0]) : m.t < only ? m.lerp([made - 2, made + 8], [1.0, 1.15]) : m.lerp([only, only + 10], [1.15, 1.4]);
  const cy = m.t < st ? 960 : m.t < only ? m.lerp([made - 2, made + 8], [960, 1000]) : m.lerp([only, only + 10], [1000, 960]);
  return (
    <Stage p={p} bg="#3b4a63" vignette={0.42}>
      <View zoom={zoom} cx={540} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={1600} fill="#55688a" />
        {[-200, 160, 520, 880, 1240].map((x) => <rect key={x} x={x} y={-300} width={30} height={1600} fill="#4a5c7c" stroke={INK} strokeWidth={4} />)}
        {[0, 1, 2].map((i) => <Glow key={i} x={180 + i * 360} y={120} r={260} color="#fff3c4" o={(0.12 + 0.25 * Math.min(1, Math.max(0, lights * 3 - i))) * m.lerp([year, year + 10], [1, 0.3])} />)}
        <Shelves x={-260} y={640} w={420} h={760} seed="hl" />
        <Shelves x={920} y={640} w={420} h={760} seed="hr" />
        <g transform={`translate(540 ${560 + m.wave(70, 4)})`}><Photo name="amazon" s={210} t={m.t / p.fps} /></g>
        <Floor y={1400} color="#6f6a63" />
        <rect x={160} y={1180} width={760} height={46} rx={20} fill="#2a2f3d" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={190 + i * 88} cy={1203} r={14} fill="#8a92a6" stroke={INK} strokeWidth={3} />)}
        {[0, 300, 600].map((o) => {
          const x = 20 + ((slide + o) % 900);
          return x > 120 && x < 800 ? <Parcel key={o} x={x} y={1080} w={130} /> : null;
        })}
        <rect x={250} y={1340} width={580} height={40} fill="#b98a52" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => <Parcel key={i} x={270 + i * 140} y={1240} w={130} />)}
        {[0, 1, 2].map((i) => <Parcel key={`u${i}`} x={340 + i * 140} y={1150} w={120} />)}
        {m.t >= am ? <Parcel x={m.lerp([am, am + 12], [80, 300])} y={640 + fall * 420} w={110} rot={fall * 200} /> : null}
        <Tag x={270} y={790} w={540} h={170} text={store} size={110} k={m.pop(only, 10)} rot={-3 + 3 * m.pulse(year, 6)} />
        <Glow x={540} y={875} r={420} color="#ffc43d" o={0.5 * m.pulse(year, 10)} />
        <Char x={900} y={1620 + m.wave(55, 3)} s={300} who="rohan" outfit="tee" top="#2b5fa8" hair="cap" hat="#ff9900" face={m.t >= year ? "sad" : m.t >= less ? "worried" : "neutral"}
          look={[-0.6, -0.3]} armL={[60, m.lerp([only - 6, only], [40, 120])]} armR={[20, 30]} />
      </View>
    </Stage>
  );
};

export default Store;
