// "That race for fur is most of why Russia is now the biggest country on Earth." The camera pulls back across the
// continent while pelts flicker at the forts along the rivers; Russia's border traces in light, its red deepens,
// and BIGGEST COUNTRY writes across it (Crimea drawn apart, the recognised border).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { Asia, FORTS, LENA, Line, OB, Pelt, RIVER, RedLand, YENISEI } from "./props";

const Furs: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  return <g>{FORTS.map((f, i) => { const xy = at(f); return xy && k > 0 ? <Pelt key={i} x={xy[0]} y={xy[1] - 30 - Math.abs(Math.sin(t / 6 + i)) * 12} s={40} kind={i % 2 ? "fox" : "sable"} k={k} /> : null; })}</g>;
};

const Biggest: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ra = m.at("race", 2), fu = m.at("fur", 12), ru = m.at("russia", 26), bi = m.at("biggest", 40), co = m.at("country", 48), ea = m.at("earth", 58), ba = m.at("baltic", 74), pc = m.at("pacific", 90);
  const back = m.lerp([ra, bi + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + 0.03 * m.lerp([ea, m.end], [0, 1]) + m.wave(90, 0.008)}>
        <Asia center={[120 - 20 * back, 61 + 1 * back]} scale={650 - 265 * back}>
          <RedLand east={Math.min(179.9, 150 + 30 * m.lerp([ru, ru + 20], [0, 1]))} id="v1123g" front={1 - m.lerp([ru, ru + 20], [0, 1])} o={0.62 + 0.3 * m.lerp([bi, bi + 12], [0, 1])} outline={m.lerp([ru, ru + 30], [0, 1])} />
          {[OB, YENISEI, LENA].map((r, i) => <Line key={i} via={r} color={RIVER} w={7} />)}
          <Furs k={m.pop(fu, 10) * (1 - m.lerp([bi, bi + 10], [0, 1]))} t={m.t} />
          <MapLabel at={[96, 64]} text="RUSSIA" size={86} k={m.pop(ru, 10)} />
          <MapPin at={[29.5, 60.0]} k={m.pop(ba, 10)} r={26} />
          <MapPin at={[158.6, 53.0]} k={m.pop(pc, 10)} r={26} />
          <Line via={[[29.5, 60.0], [90, 69], [158.6, 53.0]]} k={m.lerp([pc, pc + 18], [0, 1])} color="#ffe08a" w={9} dash />
        </Asia>
      </View>
      <Tag x={220} y={500} w={640} h={120} text="BIGGEST COUNTRY" size={52} k={m.pop(co, 10)} rot={-3} />
    </Stage>
  );
};

export default Biggest;
