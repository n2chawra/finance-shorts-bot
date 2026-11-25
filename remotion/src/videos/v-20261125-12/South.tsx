// "Then where does the water go? It follows the crack south, through Ethiopia and Kenya, and a brand-new coastline
// is drawn on both sides." The step sign turns to THEN, a question mark pops over the flooded Afar, the sea runs down
// the crack through Ethiopia and Kenya, and a pen rides its tip drawing the new coast on both banks.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Flood, Map, QMark, RiftSea, SeaMarks, mix, mixLL, riftAt } from "./props";
import { RIFTV } from "./Line";

const Pen: React.FC<{ k: number; on: number }> = ({ k, on }) => {
  const xy = useAt()(riftAt(k));
  if (!xy || on <= 0) return null;
  return (
    <g transform={`translate(${xy[0] + 30},${xy[1] - 30}) rotate(35)`} opacity={Math.min(1, on * 2)}>
      <Block x={-14} y={-150} w={28} h={130} fill="#2f6fd0" r={8} />
      <path d="M-14,-20 L14,-20 L0,20 Z" fill="#f4e6c4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-4,8 L4,8 L0,20 Z" fill={INK} />
    </g>
  );
};

const Q: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([41.4, 12.4]);
  return xy ? <QMark x={xy[0] + 120} y={xy[1] - 120} size={130} k={k} t={t} /> : null;
};

const South: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const th = m.at("then", 2), wa = m.at("water", 18), fo = m.at("follows", 40), so = m.at("south", 56), et = m.at("ethiopia", 72), ke = m.at("kenya", 90), bn = m.at("brand-new", 110), dr = m.at("drawn", 130);
  const k = m.lerp([fo, ke + 20], [0, 1]);
  const go = m.lerp([fo, so + 20], [0, 1]);
  const out = m.lerp([bn, bn + 30], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.03 * m.lerp([th, th + 20], [0, 1]) + m.wave(80, 0.008)}>
        <Map center={mixLL(mixLL([41.9, 12.0], RIFTV.center, go), [36.5, 3.0], out)} scale={mix(mix(5400, RIFTV.scale, go), 1400, out)}
          colors={{ Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 1, trace: m.lerp([et, et + 26], [0, 1]) }, Kenya: { fill: "#c9604a", flag: "Kenya", k: 1, trace: m.lerp([ke, ke + 26], [0, 1]) } }}>
          <SeaMarks t={m.t} />
          <Flood k={1} />
          <RiftSea k={k} w={mix(26, 40, out) + 14 * m.lerp([bn, dr], [0, 1])} />
          <Pen k={k} on={m.lerp([bn - 4, bn + 6], [0, 1]) * (1 - m.lerp([dr, dr + 10], [0, 1])) + (m.t > fo && m.t < bn ? 1 : 0)} />
          <Q k={m.pop(wa) * (1 - m.lerp([fo + 10, fo + 20], [0, 1]))} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default South;
