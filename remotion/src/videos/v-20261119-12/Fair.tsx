// Turn: "Double what it cost? Far more than that."
// A fairground strength tester at dusk: Rohan swings the hammer and the puck rises to the DOUBLE mark on "Double",
// it hangs there wobbling on "cost", shoots on up the tower on "Far", and the bell at the top rings with the lights
// blazing on "that".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, Limb, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Striker } from "./props";

const Fair: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dbl = m.at("double", 2), cost = m.at("cost", 14), far = m.at("far", 26), that = m.at("that", 36);
  const swing = m.lerp([dbl - 6, dbl], [0, 1], Easing.in(Easing.quad));
  const low = m.lerp([dbl, dbl + 8], [0, 0.22], Easing.out(Easing.cubic));
  const wobble = m.t >= cost && m.t < far ? Math.sin((m.t - cost) / 2) * 0.01 : 0;
  const high = m.lerp([far - 1, that], [0, 1], Easing.out(Easing.cubic));
  const k = Math.min(1, low + wobble + (1 - 0.22) * high);
  const ring = m.pulse(that + 4, 16);
  const back = m.lerp([far - 4, far + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a2050" vignette={0.4}>
        <View zoom={1.18 - 0.18 * back} cx={540 + m.wave(50, 8)} cy={1000 - 160 * back + m.wave(60, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#4a2a60" />
          <Glow x={540} y={300} r={700} color="#ff9a5a" o={0.25} />
          {/* fairground lights strung across */}
          {Array.from({ length: 14 }).map((_, i) => (
            <Ball key={i} x={-100 + i * 100} y={160 + Math.sin(i) * 20} r={14} fill={(i + Math.floor(m.t / 3)) % 3 === 0 || ring > 0.3 ? "#ffe08a" : "#7a6a40"} sw={3} />
          ))}
          {/* striped tents and a ferris wheel behind */}
          <g transform={`rotate(${m.t * 0.6} 120 620)`}>
            <circle cx={120} cy={620} r={330} fill="none" stroke="#f5e6c8" strokeWidth={14} />
            {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={120} y1={620} x2={120 + 330 * Math.cos((i * Math.PI) / 4)} y2={620 + 330 * Math.sin((i * Math.PI) / 4)} stroke="#f5e6c8" strokeWidth={8} />)}
          </g>
          {Array.from({ length: 8 }).map((_, i) => <Ball key={i} x={120 + 330 * Math.cos((i * Math.PI) / 4 + m.t * 0.0105)} y={620 + 330 * Math.sin((i * Math.PI) / 4 + m.t * 0.0105)} r={34} fill={["#e9473b", "#5ab4ff", "#f5c542", "#3fb07a"][i % 4]!} sw={4} />)}
          {[[-260, "#e9473b"], [820, "#5ab4ff"]].map(([x, c], i) => (
            <g key={i}>
              <path d={`M ${x} 1300 L ${x} 1000 L ${(x as number) + 210} 820 L ${(x as number) + 420} 1000 L ${(x as number) + 420} 1300 Z`} fill="#f5e6c8" stroke="#1d1a2b" strokeWidth={6} />
              {[0, 1, 2].map((j) => <path key={j} d={`M ${(x as number) + 210} 820 L ${(x as number) + 40 + j * 140} 1000 L ${(x as number) + 110 + j * 140} 1000 Z`} fill={c as string} />)}
            </g>
          ))}
          <rect x={-400} y={1300} width={1880} height={900} fill="#5a4030" />
          <Striker x={600} y={1300} h={980} k={k} ring={ring} mark="DOUBLE" />
          {/* Rohan with the hammer */}
          <Char x={330} y={1340} s={190} who="rohan" face={m.t >= that ? "shock" : "grin"} look={[1, m.t >= far ? -1 : 0.3]}
            armR={[160 - 120 * swing, 20]} armL={[150 - 110 * swing, 20]} />
          <g transform={`translate(110 0) rotate(${-150 + 160 * swing} 330 ${1340 - 190 * 1.9})`}>
            <Limb a={[330, 1340 - 190 * 1.9]} b={[330, 1340 - 190 * 1.9 - 260]} w={14} color="#7a5a3a" />
            <Block x={270} y={1340 - 190 * 1.9 - 320} w={120} h={70} r={10} fill="#9aa3b5" />
          </g>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Fair;
