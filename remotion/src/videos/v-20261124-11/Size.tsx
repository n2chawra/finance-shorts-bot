// "A whole kingdom of {fact1}, about as big as Belgium, and every road out of it crosses into South Africa."
// A sign planted on Lesotho carries its area; Belgium's own shape slides in beside it at true scale; roads draw
// out from Maseru and a border gate pops wherever each one crosses into South Africa.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Lift, MapLabel, MapRoute, useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { BELGIUM_AT, LESOTHO_C, LesothoEdge, MASERU, Map } from "./props";

type Params = { fig?: { area?: string } };

const EXITS: [number, number][] = [[27.25, -29.2], [27.9, -28.75], [28.95, -28.5], [29.55, -29.6], [28.1, -30.8], [27.05, -30.25]];

const Sign: React.FC<{ k: number; area: string; land: number; c: number }> = ({ k, area, land, c }) => {
  const xy = useAt()([28.3, -29.4]);
  if (!xy || k <= 0) return null;
  const x = xy[0], y = xy[1] - 20 + (1 - Math.min(1, k)) * -80;
  const s = 0.9 + 0.1 * Math.min(1, k) + 0.06 * land;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[0, 0]} b={[0, -160]} w={14} color="#6b4a2a" sw={3} />
      <Block x={-230} y={-290} w={460} h={140} fill="#f4e6c4" r={12} />
      <Txt x={0} y={-238} size={46} fill="#5a3a1a">AREA</Txt>
      <Txt x={0} y={-176} size={56} fill="#1d1a2b">{countText(area, c)}</Txt>
    </g>
  );
};

const BelFlag: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(BELGIUM_AT);
  if (!xy || k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${xy[0]},${xy[1]}) scale(${q})`}>
      <FlagArt name="Belgium" x={-90} y={-60} w={180} h={120} />
      <rect x={-90} y={-60} width={180} height={120} fill="none" stroke="#1d1a2b" strokeWidth={4} />
    </g>
  );
};

const Gates: React.FC<{ k: number[] }> = ({ k }) => {
  const at = useAt();
  return (
    <g>
      {EXITS.map((e, i) => {
        const xy = at(e);
        const q = k[i] ?? 0;
        if (!xy || q <= 0) return null;
        return (
          <g key={i} transform={`translate(${xy[0]},${xy[1]}) scale(${Math.min(1.1, q)})`}>
            <Block x={-8} y={-50} w={16} h={50} fill="#6b4a2a" sw={3} />
            <g transform={`rotate(${-70 * Math.min(1, q)} 0 -40)`}>
              <rect x={0} y={-46} width={80} height={12} fill="#e0352b" stroke="#1d1a2b" strokeWidth={3} />
              <rect x={20} y={-46} width={16} height={12} fill="#ffffff" />
              <rect x={52} y={-46} width={16} height={12} fill="#ffffff" />
            </g>
          </g>
        );
      })}
    </g>
  );
};

const Size: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const area = (p.beat.params as Params).fig?.area ?? "";
  const ki = m.at("kingdom", 6), cn = m.at("count", 57), ab = m.at("about", 70), be = m.at("belgium", 86), ro = m.at("road", 120), cr = m.at("crosses", 140), so = m.at("south", 160);
  const wide = m.lerp([be - 4, be + 16], [0, 1]) - m.lerp([ro - 4, ro + 16], [0, 0.35]);
  const c: [number, number] = [LESOTHO_C[0] - 1.6 * wide, LESOTHO_C[1] - 0.25];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={c} scale={10000 - 3000 * wide} colors={{
          "South Africa": { fill: "#d9b77a", k: 0.45 + 0.4 * m.lerp([so, so + 12], [0, 1]) },
          Lesotho: { fill: "#2f6fd0", flag: "Lesotho" },
        }}>
          <LesothoEdge k={1} />
          <Lift name="Belgium" to={BELGIUM_AT} k={m.lerp([be - 6, be + 22], [0, 1])} fill="#f2b134" />
          <BelFlag k={m.pop(be + 14, 12)} />
          <MapLabel at={[BELGIUM_AT[0], BELGIUM_AT[1] - 1.15]} text="BELGIUM" size={56} k={m.pop(be + 18, 12)} />
          {EXITS.map((e, i) => <MapRoute key={i} via={[MASERU, e]} k={m.lerp([ro + i * 3, ro + 12 + i * 3], [0, 1])} color="#ffffff" width={9} />)}
          <Gates k={EXITS.map((_, i) => m.pop(cr + i * 3, 12))} />
          <Sign k={m.pop(ki, 12)} area={area} land={m.pulse(ab, 8) + m.pulse(cn + 20, 8)} c={m.lerp([ki + 4, cn + 18], [0, 1])} />
        </Map>
      </View>
    </Stage>
  );
};

export default Size;
