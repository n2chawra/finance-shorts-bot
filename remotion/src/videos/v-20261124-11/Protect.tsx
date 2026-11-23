// "So how did any of it survive? Moshoeshoe asked Britain to protect what was left, and his land became
// Basutoland." A question mark over the last blue land; Moshoeshoe on his mountain holds up a letter that flies
// off the top of the map towards Britain, a British flag drops onto the land and BASUTOLAND writes across it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { BLUE, FREE_STATE, LESOTHO_C, LesothoEdge, Letter, Map, ORANGE, Peaks, Planted, QMark, THABA, Zone } from "./props";

const Chief: React.FC<{ t: number; k: number; arm: number; fly: number }> = ({ t, k, arm, fly }) => {
  const xy = useAt()(THABA);
  if (!xy || k <= 0) return null;
  const hx = xy[0] + 70, hy = xy[1] - 230;
  return (
    <g>
      <Char x={xy[0]} y={xy[1] + 10} s={80 * Math.min(1, k)} photo="moshoeshoe" outfit="suit" top="#3a3036" armR={[40 + 120 * arm, 150 * arm]} />
      {arm > 0.3 ? <Letter x={hx + fly * 300} y={hy - fly * 1400 + Math.sin(t / 5) * 6} s={90} rot={-10 + 30 * fly} /> : null}
    </g>
  );
};

const Mark: React.FC<{ q: number; t: number }> = ({ q, t }) => {
  const xy = useAt()([LESOTHO_C[0] + 0.3, LESOTHO_C[1] + 0.1]);
  return xy ? <QMark x={xy[0]} y={xy[1] - 160} size={160} k={q} t={t} /> : null;
};

const Flag: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([LESOTHO_C[0] + 0.45, LESOTHO_C[1] + 0.1]);
  if (!xy || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -160, top = xy[1] - 176 + drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Planted x={xy[0]} y={xy[1]} s={110} k={k} color="#ffffff" wave={0} />
      <g transform={`skewY(${Math.sin(t / 7) * 4})`} style={{ transformOrigin: `${xy[0]}px ${top}px` }}>
        <FlagArt name="United Kingdom" x={xy[0]} y={top} w={99} h={66} />
        <rect x={xy[0]} y={top} width={99} height={66} fill="none" stroke="#1d1a2b" strokeWidth={3} />
      </g>
    </g>
  );
};

const Protect: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const su = m.at("survive", 10), mo = m.at("moshoeshoe", 26), as = m.at("asked", 40), br = m.at("britain", 50), pr = m.at("protect", 62), le = m.at("left", 74), la = m.at("land", 86), ba = m.at("basutoland", 100);
  const wide = m.lerp([br - 4, br + 14], [0, 1]) - m.lerp([ba - 4, ba + 12], [0, 1.4]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[28.0, -29.55]} scale={11500 - 2500 * wide} colors={{ Lesotho: { fill: BLUE, k: 0.8 }, "South Africa": { fill: "#d9c08a" } }}>
          <Zone via={FREE_STATE} fill={ORANGE} k={1} o={0.75} edge={m.pulse(le + 4, 12)} />
          <Peaks k={1} s={56} />
          <LesothoEdge k={m.lerp([la, la + 20], [0, 1])} />
          <Mark q={m.pop(su, 12) * (1 - m.lerp([mo, mo + 8], [0, 1]))} t={m.t} />
          <Chief t={m.t} k={m.pop(mo, 12)} arm={m.lerp([as, as + 10], [0, 1])} fly={m.lerp([br, br + 22], [0, 1])} />
          <Flag k={m.pop(pr, 12)} t={m.t} />
          <MapLabel at={[LESOTHO_C[0], LESOTHO_C[1] - 1.2]} text="BASUTOLAND" size={60} k={m.pop(ba, 12)} />
        </Map>
      </View>
    </Stage>
  );
};

export default Protect;
