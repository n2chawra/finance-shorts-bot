// Drawing: "On paper, one long rod per hanger ran through both walkways."
// The drawing sheet slides onto the dark drafting table under a lamp ("paper"); the one long rod draws
// down from the roof ("rod"); its label types on ("hanger"); both walkway beams light on it ("both").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { Flat } from "./World";
import { HangerSheet } from "./Sheet";

const Drawing: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const paper = m.at("paper", 2), rod = m.at("rod", 20), hanger = m.at("long", 30), both = m.at("both", 50);
  const slideIn = m.lerp([0, paper + 10], [420, 0]);
  const zoom = m.lerp([0, rod], [1.06, 1.1]) + m.lerp([rod, both], [0, 0.06]) - m.lerp([both, m.end], [0, 0.06]);
  const cy = m.lerp([rod, both], [760, 700]) + m.lerp([both, m.end], [0, 40]);
  return (
    <Flat t={m.t} tag="as drawn">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <radialGradient id="lamp41" cx="50%" cy="38%" r="60%"><stop offset="0" stopColor="rgba(255,214,150,0.22)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#lamp41)" />
        <View zoom={zoom} cx={540} cy={cy}>
          <g transform={`translate(0 ${slideIn}) rotate(${m.lerp([0, paper + 10], [-4, -1])} 540 830)`}>
            <HangerSheet t={m.t} draw={m.lerp([rod, rod + 22], [0, 1])} hot4={m.lerp([both, both + 8], [0, 1])} hot2={m.lerp([both + 4, both + 12], [0, 1])}
              labels={{ w4: paper + 8, w2: paper + 14, rod: hanger }} />
          </g>
          {/* the pencil, resting on the table */}
          <g transform={`translate(${860 + m.wave(90, 6)} ${1160}) rotate(-28)`}>
            <rect x={0} y={0} width={260} height={22} fill="#e3b341" rx={4} />
            <polygon points="260,0 300,11 260,22" fill="#e9d6b0" />
          </g>
        </View>
      </svg>
    </Flat>
  );
};
export default Drawing;
