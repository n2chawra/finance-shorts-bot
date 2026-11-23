// "Here's the twist. After backing Napoleon and losing, that kingdom had to hand Norway to Sweden, but the treaty
// left Greenland, Iceland and the Faroe Islands with Denmark." Scandinavia in Denmark-Norway's red: the camera
// swings in on "twist"; cannon smoke and a cracked shield over Denmark on "losing"; Norway cracks off on "Norway"
// and turns Sweden's blue on "Sweden"; a treaty scroll unrolls over the sea and the camera pulls back on "treaty";
// red ribbons tie Greenland, Iceland and the Faroes to Copenhagen on their names, all glowing on "Denmark".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Atlantic, COPENHAGEN, FAROES, ICELAND, RED, Ribbon, SWEDE, Spot, mixHex } from "./props";

const Smoke: React.FC<{ k: number; crack: number }> = ({ k, crack }) => {
  const xy = useAt()([10, 56.5]);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0] - 40} ${xy[1] - 20})`}>
      {[[-40, 10, 40], [0, -20, 52], [44, 6, 38]].map(([dx, dy, r], i) => <Ball key={i} x={dx! * (0.6 + 0.4 * k)} y={dy! - 20 * k} r={r! * k} fill="#e4e0d8" shadow={false} sw={4} />)}
      <g transform={`translate(0 90) scale(${0.6 + 0.4 * Math.min(1, crack * 2)})`} opacity={Math.min(1, crack * 3)}>
        <path d="M -40 -46 L 40 -46 L 40 0 Q 40 40 0 56 Q -40 40 -40 0 Z" fill={RED} stroke={INK} strokeWidth={6} />
        <path d={`M 4 -46 L -8 -10 L 10 6 L -4 52`} fill="none" stroke={INK} strokeWidth={7 * crack} />
      </g>
    </g>
  );
};

const Scroll: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([-2, 59]);
  if (!xy || k <= 0) return null;
  const w = 380 * Math.min(1, k);
  return (
    <g transform={`translate(${xy[0]} ${xy[1]})`}>
      <rect x={-w / 2} y={-80} width={w} height={150} fill="#f4e3bd" stroke={INK} strokeWidth={6} />
      {k > 0.7 ? <Txt x={0} y={-30} size={50} fill={INK}>TREATY</Txt> : null}
      {k > 0.7 ? <path d="M -120 22 L 120 22 M -120 46 L 60 46" stroke="#8a7350" strokeWidth={6} /> : null}
      <rect x={-w / 2 - 16} y={-92} width={24} height={174} rx={12} fill="#c99a5a" stroke={INK} strokeWidth={5} />
      <rect x={w / 2 - 8} y={-92} width={24} height={174} rx={12} fill="#c99a5a" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const Kiel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tw = m.at("twist", 4), lose = m.at("losing", 24), no = m.at("norway", 46), sw = m.at("sweden", 58), tr = m.at("treaty", 76), gl = m.at("greenland", 92), ic = m.at("iceland", 102), fa = m.at("faroe", 112), dk = m.at("denmark", 128);
  const swing = m.lerp([0, tw + 14], [0, 1]);
  const back = m.lerp([tr - 4, gl + 6], [0, 1]);
  const toBlue = m.lerp([sw, sw + 12], [0, 1]);
  const glow = 1 + 0.25 * m.pulse(dk + 6, 10);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.008)}>
        <Atlantic near center={[12 - 2 * swing - 26 * back, 61 - 1 * swing + 5 * back]} scale={1900 - 300 * swing - 700 * back}
          colors={{
            Denmark: { fill: RED },
            Norway: { fill: mixHex(RED, SWEDE, toBlue), lift: m.lerp([no, no + 8], [0, 1]) * (1 - toBlue) },
            Sweden: { fill: SWEDE },
            Greenland: { fill: "#f4f8fb", k: m.lerp([gl, gl + 8], [0, 1]) },
            Iceland: { fill: "#e9a07e", k: m.lerp([ic, ic + 8], [0, 1]) },
          }}>
          <MapLabel at={[9.5, 62.6]} text="NORWAY" size={50} type={m.lerp([no, no + 8], [0, 1]) * (1 - m.lerp([tr - 6, tr], [0, 1]))} />
          <MapLabel at={[16, 60.5]} text="SWEDEN" size={48} type={m.lerp([sw, sw + 8], [0, 1]) * (1 - m.lerp([tr - 6, tr], [0, 1]))} />
          <Smoke k={m.lerp([lose, lose + 14], [0, 1]) * (1 - m.lerp([tr, tr + 8], [0, 1]))} crack={m.lerp([lose + 6, lose + 14], [0, 1])} />
          <Scroll k={m.lerp([tr, tr + 14], [0, 1]) * (1 - m.lerp([gl - 2, gl + 6], [0, 1]))} />
          <Ribbon from={COPENHAGEN} to={[-40, 70]} k={m.lerp([gl, gl + 12], [0, 1])} width={12 * glow} />
          <Ribbon from={COPENHAGEN} to={ICELAND} k={m.lerp([ic, ic + 10], [0, 1])} width={12 * glow} bow={0.2} />
          <Ribbon from={COPENHAGEN} to={FAROES} k={m.lerp([fa, fa + 10], [0, 1])} width={12 * glow} bow={0.15} />
          <MapLabel at={[-40, 72.5]} text="GREENLAND" size={54} type={m.lerp([gl + 8, gl + 16], [0, 1])} />
          <Spot at={ICELAND} name="ICELAND" k={m.lerp([ic, ic + 8], [0, 1])} size={46} />
          <Spot at={FAROES} name="FAROES" k={m.lerp([fa, fa + 8], [0, 1])} size={46} />
          <Spot at={COPENHAGEN} name="DENMARK" k={m.lerp([dk - 4, dk + 6], [0, 1])} size={50} left color={RED} />
        </Atlantic>
      </View>
    </Stage>
  );
};

export default Kiel;
