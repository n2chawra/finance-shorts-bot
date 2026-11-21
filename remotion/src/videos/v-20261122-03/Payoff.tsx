// Payoff: "That's over {now_per_part} for each pizza."
// An auction stage under a spotlight: the light hits one Papa John's box on a velvet pedestal on "over", a giant price
// tag stamps onto it on "each", the bidders gasp and the second box rolls in on its own pedestal on "pizza".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BigTag, PizzaBox } from "./props";

type Params = { fig?: { each?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const each = (p.beat.params as Params).fig?.each ?? "";
  const over = m.at("over", 2), ea = m.at("each", 20), pizza = m.at("pizza", m.end - 14);
  const spot = m.lerp([over, over + 8], [0.2, 1]);
  const tag = m.pop(over + 4, 9);
  const roll = m.lerp([pizza, pizza + 14], [0, 1]);
  const zoom = m.t < ea ? m.lerp([0, ea], [1.0, 1.08]) : m.t < pizza ? m.lerp([ea, ea + 12], [1.08, 1.26]) : m.lerp([pizza, pizza + 14], [1.26, 1.04]);
  const cy = m.t < ea ? 920 : m.t < pizza ? m.lerp([ea, ea + 12], [920, 820]) : m.lerp([pizza, pizza + 14], [820, 900]);
  const gasp = m.t >= pizza;
  return (
    <Stage p={p} bg="#1a0f24" vignette={0.5}>
      <View zoom={zoom} cx={540 + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#3a1030" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${-500 + i * 300} -100 q 60 700 0 1400`} fill="none" stroke="#5a1848" strokeWidth={40} />)}
        <path d={`M 470 -100 L 610 -100 L ${780} 1150 L ${300} 1150 Z`} fill="#fff6d8" opacity={0.18 * spot} />
        <Glow x={540} y={900} r={360} color="#fff6d8" o={0.5 * spot} />
        {/* the pedestal and the box */}
        <Block x={390} y={1000} w={300} h={260} fill="#8a1d3b" />
        <rect x={370} y={980} width={340} height={30} rx={8} fill="#c9a24a" />
        <PizzaBox x={540} y={940} w={300} m={m} />
        {roll > 0 ? (
          <g transform={`translate(${(1 - roll) * 600} 0)`}>
            <Block x={760} y={1060} w={220} h={200} fill="#8a1d3b" />
            <PizzaBox x={870} y={1010} w={220} m={m} />
          </g>
        ) : null}
        <BigTag x={520} y={700} w={400} text={each} k={tag} size={84} rot={-6} />
        {/* the bidders in the dark */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Char key={i} x={120 + i * 210} y={1720} s={200} top={["#3fa7ff", "#ff8a3d", "#7ad36b", "#b07bff", "#ff5f6d"][i]} back={!gasp}
            face={gasp ? "shock" : "neutral"} armR={gasp ? [150, 30] : [10, 10]} armL={gasp && i % 2 ? [150, 30] : [10, 10]} />
        ))}
      </View>
    </Stage>
  );
};

export default Payoff;
