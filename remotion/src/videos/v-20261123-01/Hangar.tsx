// Payoff: "Split over every passenger, the airline keeps about {fact3} a seat."
// One airline seat under a spotlight in a dark empty hangar: the spotlight snaps on on "Split", rows of ghost seats
// stretch away into the dark on "every", a giant price tag stamps onto the seat with the figure on "keeps", and a
// single coin drops onto the cushion on "seat".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Coin, Flash, Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { Seat } from "./props";

type Params = { fig?: { seat?: string } };

const Hangar: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const seat = (p.beat.params as Params).fig?.seat ?? "";
  const split = m.at("split", 2), every = m.at("every", 14), keeps = m.at("keeps", 32), seatW = m.at("seat", 48);
  const spot = m.lerp([split, split + 4], [0, 1]);
  const ghosts = m.lerp([every, every + 20], [0, 1]);
  const tag = m.pop(every, 9);
  const drop = m.lerp([seatW, seatW + 10], [0, 1], (x) => x * x);
  const zoom = m.t < keeps ? m.lerp([0, keeps], [1.0, 1.05]) : m.t < seatW ? m.lerp([keeps, keeps + 10], [1.05, 1.25]) : m.lerp([seatW, seatW + 14], [1.25, 1.12]);
  const cy = m.t < keeps ? 980 : m.lerp([keeps, keeps + 10], [980, 900]);
  return (
    <Stage p={p} bg="#0b0d16" vignette={0.5}>
      <View zoom={zoom} cx={540 + m.wave(120, 3)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#0b0d16" />
        {/* the hangar's ribs */}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${-300 + i * 340} 1300 L ${-300 + i * 340} 300 Q ${540} ${-80 - i * 10} ${1380 - i * 340} 300`} fill="none" stroke="#1d2233" strokeWidth={14} />)}
        <rect x={-400} y={1300} width={1880} height={1200} fill="#141826" />
        {/* the ghost rows */}
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 6 }).map((__, c) => {
            const k = Math.max(0, Math.min(1, ghosts * 1.6 - r * 0.2));
            const s = 0.34 - r * 0.06;
            return <g key={`${r}-${c}`} opacity={0.35 * k}><Seat x={60 + c * 190 + (r % 2) * 60} y={1150 - r * 70} s={s} color="#3a4a7a" /></g>;
          }),
        )}
        {/* the spotlight */}
        <path d={`M 470 -100 L 610 -100 L 860 1400 L 220 1400 Z`} fill="#fff4c2" opacity={0.18 * spot} />
        <Glow x={540} y={1330} r={420} ry={110} color="#fff4c2" o={0.7 * spot} />
        <g opacity={0.25 + 0.75 * spot}><Seat x={540} y={1260} s={1.05} /></g>
        <Tag x={210} y={640} w={660} h={200} text={`UNDER ${seat}`} k={tag} rot={-6} size={130} />
        {drop > 0 ? <Coin x={560} y={760 + 470 * drop} r={36} spin={Math.abs(Math.cos(m.t / 3))} /> : null}
        <Flash k={m.pulse(split, 4) * 0.5} color="#fff4c2" />
      </View>
    </Stage>
  );
};

export default Hangar;
