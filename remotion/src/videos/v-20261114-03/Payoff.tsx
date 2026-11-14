// Payoff: "Play this twice, and the Strip has kept another $16,772. Would you still play?"
// Back on the Strip at night: the giant slot machine spins again on "Play", the clock's second hand sweeps round
// on "twice", the towers flash on "Strip", the jackpot screen lands on the figure again on "another", Rohan
// hesitates with a chip on "Would", and on "still" the camera settles on the opening frame of the hook (the loop).
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chip, Clock, GiantSlot, NightStrip } from "./props";

type Params = { fig?: { min?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.min ?? "";
  const play = m.at("play", 2), twice = m.at("twice", 10), strip = m.at("strip", 24), another = m.at("another", 34), would = m.at("would", 80), still = m.at("still", 92);
  const mid = m.lerp([another - 4, another + 10], [0, 1], Easing.inOut(Easing.cubic));
  const home = m.lerp([still - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  let zoom = 0.95 + 0.22 * mid, cy = 960 - 280 * mid;
  zoom += (1.05 - zoom) * home; cy += (900 - cy) * home;
  const spin = m.t >= play && m.t < another ? 1 : 0;
  const flash = m.pulse(strip, 8) + m.pulse(another, 8);
  return (
    <Stage p={p} bg="#140f33" vignette={0.45}
      defs={<linearGradient id="lv-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0a2e" /><stop offset="1" stopColor="#4a1f6b" /></linearGradient>}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={540 + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-500} y={-500} width={2080} height={1760} fill="url(#lv-sky2)" />
        <NightStrip base={1260} flash={flash} />
        <rect x={-500} y={1250} width={2080} height={1000} fill="#2a2440" />
        <GiantSlot x={290} y={360} w={500} value={m.t >= another ? v : ""} spin={spin} t={m.t} lever={m.lerp([play - 2, play + 6], [0, 1]) * (1 - m.lerp([play + 8, play + 20], [0, 1]))} />
        <Clock x={250} y={760} r={85} sec={m.lerp([twice - 2, another + 10], [0, 120])} />
        <Txt x={250} y={875} size={40} fill="#ffffff" deco>ONE MINUTE</Txt>
        <Txt x={540} y={235} size={90} fill="#ff6fc0" glow="#ff3fa4" stroke="#2a0a3a">LAS VEGAS</Txt>
        <Char x={900} y={1520} s={190} who="rohan" hair="side" outfit="shirt" face={m.t > would ? "worried" : "smirk"} look={[-1, -0.6]}
          armR={m.t > would - 4 ? [-110, -80] : [15, 10]} holdR={m.t > would - 4 ? (h) => <Chip x={h[0]} y={h[1]} r={30} /> : undefined} />
      </View>
    </Stage>
  );
};

export default Payoff;
