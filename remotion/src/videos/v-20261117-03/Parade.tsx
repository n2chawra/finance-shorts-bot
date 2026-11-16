// Promise: "A top day costs $224. The lowest paid characters earn $26 an hour."
// The parade on the park's main street: the float rolls in with its top-day price banner on "top", the bear
// dancing on the float waves on "lowest", more costumed characters march behind on "characters", a pay badge on
// the bear's vest flips over on "earn", and on "hour" the badge's figure stamps in as the camera closes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Bear } from "./props";

type Params = { fig?: { price?: string; pay?: string } };

const Parade: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const top = m.at("top", 1), lowest = m.at("lowest", 40), chars = m.at("characters", 50), earn = m.at("earn", 60), hour = m.at("hour", 80), many = m.at("many", 100), tk = m.at("ticket", 115);
  const roll = m.lerp([top - 2, top + 22], [0, 1], Easing.out(Easing.cubic));
  const flip = m.lerp([earn - 2, earn + 8], [0, 1]);
  const stamp = m.t < hour ? 0 : m.pop(hour, 9);
  const march = m.lerp([chars - 2, chars + 40], [0, 1], Easing.linear);
  const mid = m.lerp([lowest - 4, lowest + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([hour - 6, hour + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.1 * mid + 0.12 * close;
  const cx = 540 + 20 * mid, cy = 900 - 60 * mid - 40 * close;
  const fx = -700 + 700 * roll;
  return (
    <Stage p={p} bg="#ffd8a8" vignette={0.24}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={1900} fill="#ffe2bf" />
        {/* main street shop fronts */}
        {[["#f4a3a3", "#d7262b"], ["#a3d8f4", "#3a6ad5"], ["#c8f4a3", "#3a9d5d"], ["#f4e3a3", "#d4af37"], ["#e3a3f4", "#8a4ab8"]].map(([wall, aw], i) => (
          <g key={i}>
            <Block x={-360 + i * 360} y={240} w={340} h={720} fill={wall!} />
            {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${-360 + i * 360 + k * 57} 600 l 28 60 l 29 -60 Z`} fill={k % 2 ? "#ffffff" : aw!} stroke={INK} strokeWidth={3} />)}
            <Block x={-320 + i * 360} y={330} w={110} h={160} fill="#bfe6ff" sw={4} shadow={false} />
            <Block x={-170 + i * 360} y={330} w={110} h={160} fill="#bfe6ff" sw={4} shadow={false} />
          </g>
        ))}
        <rect x={-500} y={960} width={2080} height={1000} fill="#c9b48a" />
        {/* the marching characters behind */}
        {[0, 1, 2].map((i) => <g key={i} opacity={march > 0 ? 1 : 0}><Bear x={-200 + i * 170 + 500 * march} y={1180 + m.wave(10, 6, i)} s={70} wave={0.5 + 0.5 * Math.sin(m.t / 4 + i)} /></g>)}
        {/* the float */}
        <g transform={`translate(${fx} 0)`}>
          <Block x={140} y={1180} w={800} h={160} r={30} fill="#ff7cc0" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <Ball key={i} x={190 + i * 115} y={1180} r={30} fill={["#ffcf4a", "#7cff9a", "#4dd2ff"][i % 3]!} sw={4} />)}
          <Ball x={260} y={1350} r={46} fill="#2b2b33" />
          <Ball x={820} y={1350} r={46} fill="#2b2b33" />
          {/* price banner */}
          <Block x={170} y={1010} w={740} h={150} r={20} fill="#ffffff" />
          <Txt x={360} y={1085} size={56} fill="#6b6880">TOP DAY</Txt>
          <Txt x={700} y={1085} size={90} fill="#d7262b">{P.price ?? ""}</Txt>
          {m.t >= tk ? <g transform={`translate(860 950) scale(${m.pop(tk, 9)})`}><circle r={60} fill="#ffcf4a" stroke={INK} strokeWidth={5} /><Txt x={0} y={4} size={80} fill={INK}>?</Txt></g> : null}
          {/* the bear on the float and its pay badge */}
          <Bear x={540} y={1010 + m.wave(12, 8)} s={160} wave={m.t >= many ? 0.1 : m.t >= lowest ? 0.6 + 0.4 * Math.sin(m.t / 3) : 0.2} />
          <g transform={`translate(540 ${770 + m.wave(12, 8)}) scale(${Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))} 1)`}>
            <circle r={115} fill={flip > 0.5 ? "#ffcf4a" : "#ffffff"} stroke={INK} strokeWidth={6} />
            {Math.abs(Math.cos(flip * Math.PI)) < 0.85 ? null : flip > 0.5 ? <Txt x={0} y={-30} size={44} fill={INK}>AN HOUR</Txt> : <Txt x={0} y={0} size={48} fill={INK}>PAY</Txt>}
            {flip > 0.5 ? <g transform={`scale(${0.6 + 0.4 * stamp})`}><Txt x={0} y={35} size={72} fill="#1f8a52">{stamp > 0 ? P.pay ?? "" : ""}</Txt></g> : null}
          </g>
        </g>
      </View>
    </Stage>
  );
};

export default Parade;
