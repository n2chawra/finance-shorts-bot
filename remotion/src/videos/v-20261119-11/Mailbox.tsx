// Payoff: "Each of us gets about {all_per_part}, one time. Then the pile is gone."
// Rohan's front door in the morning: he opens the mailbox on "Each", a cheque slides out with the amount on it on
// "gets", a red ONE TIME stamp slams across it on "one", the gold heap down the street drains away on "Then", and
// the camera pulls back to the street with nothing left on "gone".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Cheque, GoldPile, Mailbox as Box } from "./props";

type Params = { fig?: { each?: string } };

const Mailbox: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const each = m.at("each", 2), gets = m.at("gets", 12), one = m.at("once", 40), then = m.at("then", 55), gone = m.at("gone", 70);
  const open = m.lerp([each - 2, each + 8], [0, 1]);
  const out = m.lerp([gets - 4, gets + 12], [0, 1], Easing.out(Easing.back(1.3)));
  const stamp = m.pop(one - 1, 8);
  const drain = m.lerp([then - 2, gone + 6], [1, 0.02]);
  const close = m.lerp([gets - 4, gets + 12], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([then - 4, gone + 10], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#bfe3ff" vignette={0.3}>
        <View zoom={1.04 + 0.2 * close - 0.24 * back} cx={540 + m.wave(60, 8)} cy={860 + 80 * back + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#bfe3ff" />
          <Glow x={880} y={180} r={240} color="#fff6c0" o={0.8} />
          {/* the gold heap down the street */}
          <GoldPile x={640} y={1040} w={400} k={drain} t={m.t} seed="street" />
          <rect x={-400} y={1040} width={1880} height={1100} fill="#9fd08a" />
          <rect x={-400} y={1200} width={1880} height={900} fill="#b0a69a" />
          {/* the house front */}
          <Block x={-200} y={380} w={560} h={820} fill="#e8c89a" />
          <Block x={60} y={700} w={200} h={500} r={10} fill="#a0442c" />
          <Block x={-140} y={500} w={160} h={160} fill="#9fd4ff" />
          <Box x={430} y={850} w={210} open={open} />
          <Char x={300} y={1300 + m.wave(50, 3)} s={150} who="rohan" face={m.t >= then ? "sad" : m.t >= gets ? "happy" : "neutral"} look={[1, -0.2]}
            armR={[80 + 30 * out, 70]} armL={[25, 15]} />
          <Cheque x={330} y={540 - 40 * out} w={560} amount={fig.each ?? ""} k={out} rot={-4 * out} />
          {stamp > 0 ? <Tag x={470} y={790} w={380} h={110} text="ONE TIME" size={66} bg="#e9473b" fg="#ffffff" rot={-12} k={stamp} /> : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Mailbox;
