// Dutch: "Start in Europe. The Netherlands is low, flat land, and the North Sea pours in until most of it is gone."
// On "Europe" the camera flies in over Europe; on "Netherlands" it traces with its flag; on "flat" windmills stand on
// it; on "North" the North Sea's name writes on; on "pours" water pours over the coast; on "gone" most of it is sea
// and the windmills sink.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { Drown, World } from "./props";

const NEAR = ["Netherlands", "Belgium", "Germany", "France", "United Kingdom", "Denmark", "Luxembourg", "Switzerland", "Austria", "Czechia", "Poland"];

const Mill: React.FC<{ at: [number, number]; k: number; sink: number; t: number }> = ({ at, k, sink, t }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const [x, y] = [xy[0], xy[1] + 40 * sink];
  return (
    <g opacity={(1 - 0.8 * sink) * Math.min(1, k * 2)} transform={`translate(${x} ${y}) scale(${Math.min(1, k)})`}>
      <path d="M -20 0 L -12 -70 L 12 -70 L 20 0 Z" fill="#c9543f" stroke={INK} strokeWidth={4} />
      <g transform={`translate(0 -66) rotate(${t * 3})`}>
        {[0, 90, 180, 270].map((a) => <g key={a} transform={`rotate(${a})`}><Limb a={[0, 0]} b={[0, -56]} w={6} color="#4a3218" sw={2} /><rect x={2} y={-54} width={14} height={40} fill="#f4efe4" stroke={INK} strokeWidth={3} /></g>)}
      </g>
    </g>
  );
};

const Dutch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const eu = m.at("europe", 4), ne = m.at("netherlands", 18), fl = m.at("flat", 40), no = m.at("north", 56), po = m.at("pours", 64), go = m.at("gone", 90), am = m.at("amsterdam", 104), ro = m.at("rotterdam", 116);
  const fly = m.lerp([eu, eu + 20], [0, 1]);
  const flood = m.lerp([no, no + 12], [0, 0.45]) + m.lerp([po, po + 20], [0, 0.55]);
  const sink = m.lerp([go, go + 16], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1.04 + 0.1 * m.lerp([fl, fl + 12], [0, 1]) + m.wave(90, 0.01)}>
        <World center={[8 - 3 * fly, 50 + 2.2 * fly]} scale={2600 + 3400 * fly} fine only={NEAR}
          colors={{ Netherlands: { fill: "#e8742c", flag: flood > 0.3 ? undefined : "Netherlands", k: 1 - 0.8 * flood, trace: m.lerp([ne, ne + 24], [0, 1]) } }}>
          <Drown name="Netherlands" k={Math.min(1, flood)} t={m.t} />
          {[[5.0, 52.75], [6.3, 52.3], [5.3, 51.6]].map((a, i) => <Mill key={i} at={a as [number, number]} k={m.pop(fl + i * 3, 12)} sink={sink} t={m.t} />)}
          {[[4.9, 52.37, am], [4.48, 51.92, ro]].map(([lo, la, w], i) => <g key={`p${i}`} opacity={1 - 0.7 * m.lerp([w! + 10, w! + 22], [0, 1])}><MapPin at={[lo!, la!]} k={m.pop(w!, 10)} color="#d9483b" r={22} /></g>)}
          <MapLabel at={[3.2, 54.4]} text="NORTH SEA" size={56} fill="#ffffff" type={m.lerp([no, no + 14], [0, 1])} />
          <MapLabel at={[5.6, 52.1]} text="NETHERLANDS" size={50} k={m.lerp([ne, ne + 10], [0, 1])} dy={110} />
        </World>
      </View>
    </Stage>
  );
};
export default Dutch;
