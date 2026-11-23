// "People herded cattle across it, and painted them on rocks still standing in the Algerian desert." Close on
// southern Algeria: small herders walk across the green on "People" with a herd behind them on "cattle"; a
// hand-painted cow appears on "painted"; on "rocks" the camera pushes in on a red rock face standing at Tassili;
// more painted cattle appear on it on "still"; Algeria outlines itself and its name writes on at "Algerian".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Africa, Cow, Herder, Name, TASSILI, saharaColors } from "./props";

const Herd: React.FC<{ k: number; cows: number; t: number }> = ({ k, cows, t }) => {
  const xy = useAt()([3, 24.5]);
  if (!xy || k <= 0) return null;
  const walk = t * 1.4;
  return (
    <g>
      <Herder x={xy[0] + walk} y={xy[1]} s={120} k={k} step={Math.sin(t / 4)} />
      {[0, 1, 2, 3].map((i) => <Cow key={i} x={xy[0] + walk - 120 - i * 95} y={xy[1] + (i % 2) * 30} s={110} k={Math.max(0, Math.min(1, cows * 2 - i * 0.3))} />)}
    </g>
  );
};

const RockFace: React.FC<{ k: number; paint: number; more: number }> = ({ k, paint, more }) => {
  const xy = useAt()(TASSILI);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0]} ${xy[1]}) scale(${Math.min(1, k)})`}>
      <path d="M -260 40 L -230 -230 L -120 -300 L 60 -290 L 200 -240 L 260 40 Z" fill="#a8512e" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -200 -60 L -160 -200 M 120 -220 L 170 -60" stroke="#8a3f22" strokeWidth={8} />
      <Cow x={-60} y={-110} s={160} k={paint} paint />
      <Cow x={100} y={-170} s={110} k={more} paint />
      <Cow x={60} y={-30} s={100} k={Math.max(0, more - 0.3)} paint />
    </g>
  );
};

const Rock: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pe = m.at("people", 2), ca = m.at("cattle", 14), pa = m.at("painted", 30), ro = m.at("rocks", 44), st = m.at("still", 52), al = m.at("algerian", 66);
  const push = m.lerp([ro - 4, ro + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + 0.1 * push + m.wave(80, 0.01)}>
        <Africa center={[6 + 2.5 * push, 26 - 0.5 * push]} scale={2400} colors={saharaColors(1, 1, { Algeria: { fill: "#7cbf5a", lift: m.lerp([al, al + 10], [0, 1]) } })}>
          <Herd k={m.pop(pe, 12) * (1 - push)} cows={m.lerp([ca, ca + 14], [0, 1])} t={m.t} />
          <RockFace k={m.lerp([pa - 2, pa + 12], [0, 1])} paint={m.lerp([pa, pa + 10], [0, 1])} more={m.lerp([st, st + 14], [0, 1])} />
          <Name at={[5.5, 29]} text="ALGERIA" k={m.lerp([al, al + 12], [0, 1])} size={66} />
        </Africa>
      </View>
    </Stage>
  );
};

export default Rock;
