// "Decades later, the British colonies all around it joined into one country, South Africa. Basutoland stayed
// out." The whole region: four colonies light up round Basutoland, each with a British flag; their colours flow
// together into one, South Africa's flag fills it, and Basutoland stays apart, its border flashing.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { FREE_STATE, LESOTHO_C, LesothoEdge, Map, NATAL, Planted, TRANSVAAL, Zone } from "./props";

const COLS: { via: [number, number][]; fill: string }[] = [
  { via: FREE_STATE, fill: "#e88a2a" }, { via: TRANSVAAL, fill: "#7a9a3a" }, { via: NATAL, fill: "#c8506a" },
];
const FLAGS: [number, number][] = [[21.5, -31.6], [26.0, -28.3], [28.6, -25.0], [30.9, -28.7]];

const Flags: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  return <g>{FLAGS.map((f, i) => { const xy = at(f); return xy ? <Planted key={i} x={xy[0]} y={xy[1]} s={70} k={Math.min(1, k * 2 - i * 0.25)} name="United Kingdom" wave={Math.sin(t / 7 + i)} /> : null; })}</g>;
};

const SaFlag: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([23.6, -30.6]);
  return xy ? <Planted x={xy[0]} y={xy[1]} s={120} k={k} name="South Africa" wave={Math.sin(t / 7)} /> : null;
};

const Union: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const de = m.at("decades", 2), br = m.at("british", 12), co = m.at("colonies", 20), ar = m.at("around", 34), jo = m.at("joined", 44), cn = m.at("country", 58), so = m.at("south", 68), st = m.at("stayed", 90), ou = m.at("out", 100);
  const merge = m.lerp([jo, cn + 10], [0, 1]);
  const close = m.lerp([st - 4, st + 16], [0, 1]);
  const names = m.pop(ar, 12) * (1 - merge);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(80, 0.008)}>
        <Map center={[25.6 + 2.6 * close + 0.4 * m.lerp([de, de + 20], [0, -1]), -29.6 + 0.2 * close]} scale={4200 + 5000 * close} colors={{
          "South Africa": { fill: m.t >= jo ? "#3f8a5a" : "#4aa0a0", k: m.pop(co, 12) },
          Lesotho: { fill: "#f2d24a", k: m.pop(co, 12) },
        }}>
          {COLS.map((c, i) => <Zone key={i} via={c.via} fill={c.fill} k={m.pop(co + i * 3, 12)} o={0.85 * (1 - merge)} />)}
          <Flags k={m.lerp([br, br + 16], [0, 1]) * (1 - m.lerp([so, so + 10], [0, 1]))} t={m.t} />
          <SaFlag k={m.pop(so, 12)} t={m.t} />
          <MapLabel at={[21.5, -30.9]} text="CAPE" size={52} k={names} />
          <MapLabel at={[25.9, -27.7]} text="FREE STATE" size={48} k={names} />
          <MapLabel at={[28.6, -24.3]} text="TRANSVAAL" size={48} k={names} />
          <MapLabel at={[30.9, -28.0]} text="NATAL" size={48} k={names} />
          <MapLabel at={[23.0, -32.6]} text="SOUTH AFRICA" size={56} k={m.pop(so + 6, 12) * (1 - close)} />
          <LesothoEdge k={m.lerp([jo, jo + 16], [0, 1])} w={10 + 8 * m.pulse(st + 6, 10) + 8 * m.pulse(ou + 6, 10)} color="#ffffff" />
          <MapLabel at={[LESOTHO_C[0], LESOTHO_C[1] - 1.0]} text="BASUTOLAND" size={52} k={m.pop(jo + 6, 12)} />
        </Map>
      </View>
    </Stage>
  );
};

export default Union;
