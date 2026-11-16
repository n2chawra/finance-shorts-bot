// Hook: "Edwin Castro won the biggest jackpot ever. So why didn't he get all $2.04B?"
// A lottery press stage under flashbulbs: the giant Powerball cheque with his name and the jackpot is up from
// frame 0, Castro beams at the podium; flashes pop on "Edwin", confetti bursts on "jackpot", a giant pair of
// scissors swings down over the cheque on "why", and on "all" the camera pushes in on the figure as the blades open.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, SourceLine, Stage, View, motion, rng, type Motion } from "../../flat/kit";
import { Castro, Cheque, NamePlate, Scissors } from "./props";
import { Photo } from "../../studio/photo";

type Params = { fig?: { jackpot?: string } };

/** The press stage, shared with the loop's billboard push. */
export const PressStage: React.FC<{ m: Motion; jackpot: string; flash: number; confetti: number; face?: "happy" | "grin" | "worried" | "shock" }> = ({ m, jackpot, flash, confetti, face = "grin" }) => {
  const r = rng("castro-confetti");
  const bits = Array.from({ length: 46 }).map(() => ({ x: r() * 1300 - 110, y0: r() * 500 - 700, sp: 14 + r() * 16, c: ["#ffcf4a", "#e0352b", "#4dd2ff", "#7cff9a", "#ffffff"][Math.floor(r() * 5)]!, rot: r() * 360 }));
  return (
    <g>
      <rect x={-400} y={-400} width={1880} height={2600} fill="#1b2350" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-400 + i * 160} y={-400} width={70} height={1800} fill="#222c62" />)}
      <Glow x={540} y={620} r={640} color="#9fb6ff" o={0.35} />
      <rect x={-400} y={1340} width={1880} height={900} fill="#3a2a4a" />
      <g transform="translate(540 395)"><Photo name="powerball" s={250} t={m.t / 30} /></g>
      <Cheque x={170} y={430} w={740} amount={jackpot} t={m.t / 30} />
      <Castro x={540} y={1470 + m.wave(60, 3)} s={215} face={face} armL={[150, 170]} armR={[150, 190]} />
      <Block x={330} y={1130} w={420} h={240} fill="#2c3f7a" shadow="bottom" />
      <NamePlate x={540} y={1170} w={410} text="EDWIN CASTRO" />
      <Glow x={110} y={560} r={260} color="#ffffff" o={0.9 * flash} />
      <Glow x={970} y={700} r={240} color="#ffffff" o={0.8 * flash} />
      {confetti > 0 ? bits.map((b, i) => (
        <rect key={i} x={b.x} y={b.y0 + confetti * b.sp * 40} width={18} height={30} fill={b.c} transform={`rotate(${b.rot + confetti * 300} ${b.x + 9} ${b.y0 + confetti * b.sp * 40 + 15})`} />
      )) : null}
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const jackpot = (p.beat.params as Params).fig?.jackpot ?? "";
  const edwin = m.at("edwin", 1), jack = m.at("jackpot", 26), why = m.at("why", 40), all = m.at("wasn't", 50);
  const flash = Math.max(m.pulse(edwin + 2, 5), m.pulse(edwin + 12, 4), m.pulse(jack + 3, 5));
  const confetti = m.t < jack ? 0 : (m.t - jack) / 60;
  const wide = m.lerp([jack - 4, jack + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([all - 6, all + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.1 - 0.1 * wide + 0.25 * close;
  const cx = 540, cy = 880 + 20 * wide - 300 * close;
  const sc = m.lerp([why - 2, why + 12], [0, 1], Easing.out(Easing.back(1.4)));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1b2350" vignette={0.44}>
        <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
          <PressStage m={m} jackpot={jackpot} flash={flash} confetti={confetti} face={m.t >= why ? "worried" : "grin"} />
          <g transform={`rotate(${-30 + 30 * sc} 780 ${-300 + 720 * sc})`}>
            <Scissors x={780} y={-300 + 720 * sc} s={0.95} open={0.2 + 0.6 * m.lerp([all - 2, all + 8], [0, 1])} />
          </g>
          <Glow x={540} y={760} r={300} color="#ffd23f" o={0.4 * m.pulse(all + 6, 10)} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
