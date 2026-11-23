// "Day three: the Emirates pipe oil to Fujairah, a port just outside the strait." DAY THREE on the sign; the
// Emirates trace and fill on "Emirates"; a pipe draws east across them on "pipe"; a pin drops on Fujairah; cranes
// pop up at the port on "port"; the camera shows the port beyond the barrier on "outside"; a tanker slips away.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { Barrier, DayBoard, FUJAIRAH, Gulf, HABSHAN, Tanker } from "./props";

const PIPE: [number, number][] = [HABSHAN, [54.6, 24.3], [55.6, 24.8], FUJAIRAH];

const Cranes: React.FC<{ k: number; tk: number; t: number }> = ({ k, tk, t }) => {
  const xy = useAt()(FUJAIRAH);
  if (!xy) return null;
  return (
    <g>
      {[0, 1].map((i) => {
        const h = 110 * Math.min(1, Math.max(0, k * 1.4 - i * 0.3));
        if (h <= 0) return null;
        const x = xy[0] + 40 + i * 60;
        return <g key={i}><Limb a={[x, xy[1]]} b={[x, xy[1] - h]} w={10} color="#f2b134" sw={3} /><Limb a={[x - 10, xy[1] - h]} b={[x + 60, xy[1] - h]} w={8} color="#f2b134" sw={3} /><path d={`M ${x + 50} ${xy[1] - h} l 0 30`} stroke={INK} strokeWidth={4} /></g>;
      })}
      {tk > 0 ? <Tanker x={xy[0] + 120 + 300 * tk} y={xy[1] + 60 + 120 * tk} s={80} t={t} /> : null}
    </g>
  );
};

const Fujairah: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dy = m.at("day", 2), em = m.at("emirates", 14), pi = m.at("pipe", 30), fu = m.at("fujairah", 42), po = m.at("port", 60), ou = m.at("outside", 74), st = m.at("strait", 90);
  const back = m.lerp([ou - 4, ou + 16], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[55.2 + 0.4 * back, 25.0 + 0.6 * back]} scale={8500 - 2000 * back}
          colors={{ "United Arab Emirates": { fill: "#00732f", trace: m.lerp([em, em + 24], [0, 1]), k: m.lerp([em + 8, em + 22], [0, 1]) }, Oman: { fill: "#c9543f", k: 0.5 } }}>
          <Barrier k={1} />
          {m.t >= pi ? <MapRoute via={PIPE} k={m.lerp([pi, fu], [0.03, 1])} color="#9aa0ad" width={16} dash={false} /> : null}
          <MapPin at={FUJAIRAH} k={m.pop(fu, 11)} r={30} />
          <MapLabel at={[FUJAIRAH[0] - 0.95, FUJAIRAH[1] + 0.25]} text="FUJAIRAH" size={58} type={m.lerp([fu, fu + 12], [0, 1])} />
          <MapLabel at={[54.3, 23.6]} text="EMIRATES" size={60} k={m.lerp([em, em + 10], [0, 1])} />
          <Cranes k={m.lerp([po, po + 14], [0, 1])} tk={m.lerp([st, m.end], [0, 1])} t={m.t} />
        </Gulf>
      </View>
      <DayBoard day={3} flip={m.pop(dy, 10)} />
    </Stage>
  );
};

export default Fujairah;
