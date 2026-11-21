// Hook: "Elon Musk flies a private jet almost everywhere. So why isn't the jet his?"
// A desert runway at sunset: Elon Musk (his real photo head) walks across to the white jet from frame 0, waving on
// "Elon"; the engines glow on "flies"; the camera pulls back to the whole jet on "jet"; he stops on the steps and
// looks back on "why"; a big red question mark stamps onto the jet's door on "his" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, type Motion, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Jet, Runway, SUNSET } from "./props";

/** Musk on the runway, walking from `from` to the steps as `k` goes 0 -> 1. */
export const MuskWalk: React.FC<{ m: Motion; k: number; wave?: number; back?: number }> = ({ m, k, wave = 0, back = 0 }) => {
  const x = 140 + k * 560;
  const step = Math.sin(m.t / 4) * (k < 1 ? 1 : 0);
  return (
    <Char x={x} y={1330 - Math.max(0, k - 0.85) * 300 + Math.abs(step) * -6} s={230} photo="musk" outfit="suit" top="#292a32" pants="#1d1d26"
      face="neutral" look={[back > 0.5 ? -0.8 : 0.8, 0]} armR={[60 + wave * 110, 30 + wave * 40]} armL={[10 + step * 20, 10]} tilt={step * 2} />
  );
};

export const Mark: React.FC<{ x: number; y: number; k: number; r?: number; color?: string }> = ({ x, y, k, r = 80, color = "#e0352b" }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.3 + 0.7 * Math.min(1, k) + (1 - Math.min(1, k)) * 0.6}) rotate(${(1 - Math.min(1, k)) * -20})`}>
      <circle r={r} fill={color} stroke={INK} strokeWidth={7} />
      <Txt x={0} y={6} size={r * 1.5} fill="#ffffff">?</Txt>
    </g>
  );

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const elon = m.at("elon", 0), flies = m.at("flies", 18), jet = m.at("jet", 34), why = m.at("why", 60), his = m.at("his", m.end - 14);
  const walk = m.lerp([0, why], [0.05, 0.95]);
  const wave = m.pulse(elon + 8, 10);
  const glow = m.lerp([flies, flies + 10], [0, 1]);
  const mark = m.pop(his, 9);
  const zoom = m.t < jet ? m.lerp([0, jet], [1.15, 1.18]) : m.t < his ? m.lerp([jet, jet + 18], [1.18, 0.98]) : m.lerp([his, his + 14], [0.98, 1.28]);
  const cx = m.t < his ? m.lerp([0, jet + 18], [420, 540]) : m.lerp([his, his + 14], [540, 700]);
  const cy = m.t < his ? 1020 : m.lerp([his, his + 14], [1020, 980]);
  return (
    <Stage p={p} bg={SUNSET} vignette={0.35}>
      <View zoom={zoom} cx={cx + m.wave(120, 5)} cy={cy}>
        <Runway m={m} />
        <Jet x={520} y={980} s={0.85} m={m} steps={1} glow={glow} />
        <MuskWalk m={m} k={walk} wave={wave} back={m.t >= why ? 1 : 0} />
        <Mark x={762} y={880} k={mark} r={78} />
      </View>
    </Stage>
  );
};

export default Hook;
