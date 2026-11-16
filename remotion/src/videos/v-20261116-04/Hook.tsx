// Hook: "Amazon's rented computers made {fact1} in profit last year." A humming Amazon server hall with
// the real Amazon logo over the racks from frame 0: the rack lights flick on row by row on "rented", the
// camera pushes in on the middle rack on "computers", its counter counts on "made" and lands on the
// cloud's profit with a flash on "profit".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, Glow, INK, SourceLine, Stage, View, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { Floor, Rack } from "./props";

type Params = { fig?: { cloud?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cloud = (p.beat.params as Params).fig?.cloud ?? "";
  const rented = m.at("rented", 8), push = m.at("computers", 14), made = m.at("made", 22), land = m.at("profit", 40);
  const on = m.lerp([rented - 4, rented + 12], [0.25, 1], Easing.linear);
    const zoom = m.t < push ? m.lerp([0, push], [1.0, 1.04]) : m.t < land ? m.lerp([push, push + 12], [1.04, 1.3]) : m.lerp([land, land + 12], [1.3, 1.12]);
  const cy = m.t < push ? 960 : m.lerp([push, push + 12], [960, 820]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0c1324" vignette={0.5}>
        <View zoom={zoom} cx={540} cy={cy}>
          <rect x={-300} y={-300} width={1680} height={1600} fill="#121c33" />
          <Floor y={1300} color="#1b2640" />
          {([[-120, 180, 860], [60, 160, 760], [900, 160, 760], [1060, 180, 860]] as const).map(([x, w, h], i) => (
            <Rack key={i} x={x} y={1300 - h} w={w} h={h} t={m.t + i * 5} on={on} seed={`side${i}`} />
          ))}
          <Rack x={330} y={420} w={420} h={880} t={m.t} on={on} seed="mid" />
          <rect x={-300} y={160} width={1680} height={40} fill="#2a3550" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-280 + i * 150} y={172} width={90} height={16} fill={i % 2 ? "#ff9900" : "#4dd8ff"} opacity={0.5 + 0.5 * on} />)}
          <g transform={`translate(540 ${525 + m.wave(70, 4)})`}><Photo name="amazon" s={170} t={m.t / p.fps} /></g>
          <Display x={240} y={560} w={600} h={250} label="RENTED COMPUTERS" value={cloud} color={m.t >= made && m.t < made + 10 ? "#ffffff" : "#4dd8ff"} />
          <Glow x={540} y={700} r={600} color="#4dd8ff" o={0.15 + 0.3 * m.pulse(land, 10)} />
        </View>
      </Stage>
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(land, 5) * 0.4 }} />
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
