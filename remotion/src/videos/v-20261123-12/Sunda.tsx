// "So where's the next door? The Sunda Strait, a gap between Sumatra and Java, far to the south." The closed lane
// stays filled; a question mark hops down Sumatra's coast, a door opens at the gap, SUNDA STRAIT writes in it, the
// islands trace, and a dashed route draws south round Sumatra into the gap with a tanker on its tip.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { LAND, LANE, Line, QMark, ROUTE, SEAsia, SUNDA, SUNDA_ROUTE, Tanker, tipOf, type LL } from "./props";

const COAST: LL[] = [[95.5, 4.0], [98.0, 0.5], [101.0, -3.2], [104.0, -5.2]];

const Bits: React.FC<{ t: number; q: number; door: number; route: number }> = ({ t, q, door, route }) => {
  const at = useAt();
  const hop = tipOf(at, COAST, q);
  const d = at(SUNDA);
  const tip = tipOf(at, SUNDA_ROUTE, route);
  return (
    <g>
      <Line via={LANE.slice(2, 8)} k={1} color={LAND} w={60} ink={false} />
      {hop && q > 0 && q < 1 ? <QMark x={hop[0] - 60} y={hop[1] - 20} k={1} t={t} size={150} /> : null}
      {d && door > 0 ? (
        <g transform={`translate(${d[0] + 10} ${d[1] - 10})`}>
          <rect x={-45} y={-110} width={90} height={130} fill="none" stroke={INK} strokeWidth={14} />
          <rect x={-45} y={-110} width={90} height={130} fill="none" stroke="#ffe08a" strokeWidth={7} />
          <path d={`M-45,-110 L${-45 + 70 * (1 - door)},-96 L${-45 + 70 * (1 - door)},6 L-45,20 Z`} fill="#8a5a32" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      {route > 0 ? <Line via={SUNDA_ROUTE} k={route} color={ROUTE} w={10} dash /> : null}
      {tip && route > 0 ? <Tanker x={tip[0]} y={tip[1]} s={70} rot={tip[2]} t={t} /> : null}
    </g>
  );
};

const Sunda: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wh = m.at("where's", 2), dr = m.at("door", 12), su = m.at("sunda", 26), ga = m.at("gap", 40), sm = m.at("sumatra", 52), ja = m.at("java", 62), so = m.at("south", 78);
  const push = m.lerp([su - 4, su + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.04 * m.pulse(ga + 3, 10) + m.wave(80, 0.008)}>
        <SEAsia center={[101.5 + 2.5 * push, -0.5 - 3 * push]} scale={2700 + 900 * push}
          colors={{ Indonesia: { fill: "#c9c27a", trace: m.lerp([sm, ja + 20], [0, 1]) }, Malaysia: { fill: "#e0b46a" } }}>
          <Bits t={m.t} q={m.lerp([wh, dr + 4], [0, 1])} door={m.lerp([dr, dr + 14], [0, 1])} route={m.lerp([so - 6, m.end], [0, 1])} />
          <MapLabel at={[103.5, -7.6]} text="SUNDA STRAIT" size={54} type={m.lerp([su - 2, su + 14], [0, 1])} />
          <MapLabel at={[100.0, -1.0]} text="SUMATRA" size={50} k={m.pop(sm, 10)} />
          <MapLabel at={[108.6, -7.6]} text="JAVA" size={50} k={m.pop(ja, 10)} />
        </SEAsia>
      </View>
    </Stage>
  );
};

export default Sunda;
