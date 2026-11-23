// "Then a treaty drew its border down the Caledon River, the same line it has today." A treaty paper unrolls over
// the map, a giant pen draws the border down the river, the river glows under it, CALEDON RIVER writes along it,
// the line closes round the land and today's border traces in light.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { BLUE, CALEDON, FREE_STATE, LESOTHO_C, LesothoEdge, Map, ORANGE, Peaks, RIVER, Zone } from "./props";

const Pen: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-35)`}>
    <Limb a={[0, -40]} b={[0, -230]} w={30} color="#2b2b3a" />
    <path d="M-15,-40 L0,0 L15,-40 Z" fill="#c9a227" stroke="#1d1a2b" strokeWidth={4} />
  </g>
);

const Paper: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const h = 250 * Math.min(1, k);
  return (
    <g>
      <Block x={300} y={250} w={480} h={h} fill="#f4e6c4" r={10} />
      {k > 0.6 ? (
        <g opacity={(k - 0.6) / 0.4}>
          <Txt x={540} y={320} size={48} fill="#5a3a1a">TREATY</Txt>
          {[0, 1, 2].map((i) => <rect key={i} x={360} y={360 + i * 34} width={360 - i * 60} height={10} rx={5} fill="#b59a6a" />)}
        </g>
      ) : null}
    </g>
  );
};

const Treaty: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const th = m.at("then", 2), tr = m.at("treaty", 8), dr = m.at("drew", 18), bo = m.at("border", 26), ca = m.at("caledon", 40), ri = m.at("river", 50), li = m.at("runs", 66), to = m.at("today", 80);
  const pen = m.lerp([dr, li], [0, 1]);
  const wide = m.lerp([to - 4, to + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.06 * m.lerp([ca - 4, ca + 12], [0, 1]) * (1 - wide) + m.wave(80, 0.008)}>
        <Map center={[27.9 + 0.3 * wide - 0.2 * m.lerp([th, th + 20], [0, 1]), -29.25 - 0.25 * wide]} scale={17000 - 5500 * wide} colors={{ Lesotho: { fill: BLUE, k: 0.8 }, "South Africa": { fill: "#d9c08a" } }}>
          <Zone via={FREE_STATE} fill={ORANGE} k={1} o={0.75} />
          <Peaks k={1} s={56} />
          <MapRoute via={CALEDON} k={1} color={RIVER} width={14 + 14 * m.lerp([ca, ca + 12], [0, 1])} dash={false} />
          <MapRoute via={CALEDON.slice(0, 9)} k={pen} color="#ffe08a" width={10} dash={false}
            mover={(x, y) => (pen > 0 && pen < 1 ? <Pen x={x} y={y} /> : null)} />
          <LesothoEdge k={m.lerp([li, li + 16], [0, 1])} />
          <MapLabel at={[27.0, -29.15]} text="CALEDON RIVER" size={52} k={m.pop(ri, 12)} />
          <MapLabel at={[LESOTHO_C[0] + 0.2, LESOTHO_C[1] - 0.2]} text="BASUTOLAND" size={52} k={m.t < bo ? 1 : 0} />
        </Map>
        <Paper k={m.lerp([tr, tr + 14], [0, 1]) * (1 - m.lerp([to, to + 10], [0, 1]))} />
      </View>
    </Stage>
  );
};

export default Treaty;
