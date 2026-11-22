// Bengal: "Fly east to Bangladesh, a country of river mouths. Most of it slips under the Bay of Bengal." On "Fly" a
// plane crosses the map east; on "Bangladesh" it traces with its flag; on "river" rivers fan into the sea; on "mouths"
// a small boat bobs at a river mouth; on "slips" the water creeps north over the land; on "Bay" its name writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { Drown, World } from "./props";

const NEAR = ["Bangladesh", "India", "Myanmar", "Bhutan", "Nepal", "China"];
const RIVERS: [number, number][][] = [[[89.6, 25.9], [89.8, 24.4], [90.3, 23.4], [90.6, 22.3]], [[88.1, 24.8], [89.0, 23.9], [90.0, 23.2], [90.4, 22.6]], [[91.9, 24.9], [91.2, 24.2], [90.8, 23.4], [90.9, 22.5]]];

const Boat: React.FC<{ at: [number, number]; k: number; t: number }> = ({ at, k, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0]} ${xy[1] + Math.sin(t / 7) * 5}) scale(${Math.min(1, k)})`}>
      <path d="M -40 0 Q 0 22 40 0 Z" fill="#8a5a2e" stroke={INK} strokeWidth={4} />
      <path d="M 0 -4 L 0 -54 L 30 -10 Z" fill="#f4efe4" stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Bengal: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fl = m.at("fly", 2), ba = m.at("bangladesh", 14), ri = m.at("river", 34), mo = m.at("mouths", 44), sl = m.at("slips", 62), bay = m.at("bay", 80), dh = m.at("dhaka", 110);
  const fly = m.lerp([fl, fl + 16], [0, 1]);
  const flood = m.lerp([ri, ri + 14], [0, 0.4]) + m.lerp([sl, sl + 18], [0, 0.6]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1.04 + 0.12 * m.lerp([sl, sl + 14], [0, 1]) + m.wave(90, 0.01)}>
        <World center={[86 + 4.2 * fly, 23.2]} scale={1800 + 2200 * fly} fine only={NEAR}
          colors={{ Bangladesh: { fill: "#1f7a4a", flag: flood > 0.3 ? undefined : "Bangladesh", k: 1 - 0.8 * flood, trace: m.lerp([ba, ba + 24], [0, 1]) } }}>
          {RIVERS.map((r, i) => <MapRoute key={i} via={r} k={m.lerp([ri + i * 3, ri + i * 3 + 14], [0, 1])} color="#6fc3dc" width={9} dash={false} />)}
          <Drown name="Bangladesh" k={Math.min(1, flood)} t={m.t} />
          <g opacity={1 - 0.7 * m.lerp([dh + 10, dh + 22], [0, 1])}><MapPin at={[90.41, 23.81]} k={m.pop(dh, 10)} color="#d9483b" r={24} /></g>
          <Boat at={[90.4, 21.9]} k={m.pop(mo, 12)} t={m.t} />
          <MapLabel at={[90.0, 20.4]} text="BAY OF BENGAL" size={56} fill="#ffffff" type={m.lerp([bay, bay + 16], [0, 1])} />
          <MapLabel at={[90.3, 24.0]} text="BANGLADESH" size={50} k={m.lerp([ba, ba + 10], [0, 1])} dy={-160} />
        </World>
      </View>
      {fly < 1 ? <g transform={`translate(${-100 + 1300 * fly} ${700 - 100 * fly}) rotate(-8)`}><path d="M -60 0 L 60 0 L 80 -10 L 60 10 L -60 10 Z M -10 0 L -40 -40 L 0 -40 L 20 0 Z M -10 10 L -40 50 L 0 50 L 20 10 Z" fill="#f4efe4" stroke={INK} strokeWidth={4} /></g> : null}
    </Stage>
  );
};
export default Bengal;
