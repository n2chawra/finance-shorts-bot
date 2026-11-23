// Hook: "A Starbucks barista works a whole year. How long does her boss take to earn that?"
// A green Starbucks café counter in the morning rush: the sign flickers on on "Starbucks", the barista slides a cup to
// Rohan on "barista", her year's pay slip pops up over the counter on "year", the camera pulls back to the boss's
// poster (Brian Niccol's real head) above the menu on "boss", and a stopwatch drops beside it and ticks on "earn".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Barista, CafeSet, Cup, Poster, Slip } from "./props";

type Params = { fig?: { year?: string } };

export const Stopwatch: React.FC<{ x: number; y: number; r: number; t: number; k: number }> = ({ x, y, r, t, k }) => (
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y - (1 - Math.min(1, k)) * 300})`}>
      <rect x={-r * 0.18} y={-r * 1.32} width={r * 0.36} height={r * 0.3} rx={6} fill="#c9ced8" stroke={INK} strokeWidth={5} />
      <Ball x={0} y={0} r={r} fill="#ffffff" />
      <Limb a={[0, 0]} b={[Math.sin(t / 6) * r * 0.75, -Math.cos(t / 6) * r * 0.75]} w={8} color="#c8102e" sw={3} />
      <circle r={10} fill={INK} />
    </g>
  )
);

const Cafe: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const sb = m.at("starbucks", 0), barista = m.at("barista", 10), yr = m.at("year", 24), boss = m.at("boss", 44), earn = m.at("earn", m.end - 20);
  const sign = Math.max(0.6, m.lerp([sb, sb + 6], [0.6, 1]));
  const slide = m.lerp([barista, barista + 12], [0, 1]);
  const slip = m.pop(yr, 10);
  const watch = m.lerp([earn, earn + 10], [0, 1], (x) => 1 - (1 - x) * (1 - x));
  const zoom = m.t < yr ? 1.1 : m.t < boss ? m.lerp([yr, yr + 10], [1.1, 1.2]) : m.lerp([boss, boss + 14], [1.2, 1.0]);
  const cy = m.t < yr ? 900 : m.t < boss ? m.lerp([yr, yr + 10], [900, 820]) : m.lerp([boss, boss + 14], [820, 860]);
  return (
    <Stage p={p} bg="#efe6d6" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(110, 4)} cy={cy}>
        <CafeSet m={m} sign={sign} />
        <Poster x={190} y={380} w={300} glow={m.lerp([boss, boss + 10], [0, 1])} />
        <Barista x={640} y={1330} s={170} m={m} face="happy" look={[-0.6, 0]} armL={[60 + 30 * slide, 70]} armR={[20, 10]} />
        <Cup x={560 - 200 * slide} y={1180} s={0.9} />
        <Char x={170} y={1560} s={190} who="rohan" face="happy" look={[0.6, -0.3]} armR={[60 + 20 * slide, 50]} armL={[10, 10]} back={false} />
        <Slip x={720} y={760} w={300} amount={year} rot={6} k={slip} />
        <Stopwatch x={540} y={470} r={70} t={m.t} k={watch} />
      </View>
    </Stage>
  );
};

export default Cafe;
