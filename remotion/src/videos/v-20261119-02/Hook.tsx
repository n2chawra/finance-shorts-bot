// Hook: "Greenland sits next to Canada, not Europe, yet it belongs to Denmark. Why?" The North Atlantic on the
// old map. In frame 0 Greenland's outline is already drawing itself; Canada's coast lights up beside it on
// "Canada", Europe far to the east on "Europe"; on "belongs" a red line shoots across the ocean and on
// "Denmark" the camera pulls back as it lands on Copenhagen; on "Why" a question mark stamps over Greenland.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { Atlantic, COPENHAGEN, GL_MID, ICE, QMark, RED, Spot } from "./props";

const EUROPE = ["Norway", "Sweden", "Finland", "United Kingdom", "Ireland", "Germany", "France", "Netherlands", "Belgium", "Poland", "Spain", "Portugal", "Italy"];

const Q: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(GL_MID);
  return xy ? <QMark x={xy[0]} y={xy[1] - 40} k={k} t={t} size={260} /> : null;
};

/** The hook's map; the loop ends on it at `draw` ~0.35 (frame 0). */
export const HookMap: React.FC<{ t: number; draw: number; label: number; canada: number; europe: number; line: number; dk: number; q: number; scale: number; center: [number, number] }> = ({
  t, draw, label, canada, europe, line, dk, q, scale, center,
}) => {
  const colors: Record<string, { fill: string; k?: number; draw?: number }> = {
    Greenland: { fill: ICE, draw: Math.max(0.001, draw) },
    Canada: { fill: "#d9a35f", k: canada },
    Denmark: { fill: RED, k: dk },
  };
  for (const n of EUROPE) colors[n] = { fill: "#c9b07a", k: europe * 0.8 };
  return (
    <Atlantic center={center} scale={scale} colors={colors}>
      <MapLabel at={[-41, 74]} text="GREENLAND" size={68} k={label > 0 ? 1 : 1} />
      <MapLabel at={[-58, 60]} text="CANADA" size={56} k={1} />
      <MapLabel at={[2, 49]} text="EUROPE" size={56} type={europe} />
      {line > 0.02 ? <MapRoute via={[[-38, 66], [-20, 64], COPENHAGEN]} k={line} color={RED} width={12} dash={false} /> : null}
      <MapPin at={COPENHAGEN} k={dk} r={26} />
      <Spot at={COPENHAGEN} name="DENMARK" k={dk} size={52} left />
      <Q k={q} t={t} />
    </Atlantic>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gl = m.at("greenland", 4), ca = m.at("canada", 20), eu = m.at("europe", 34), be = m.at("belongs", 48), dk = m.at("denmark", 60), why = m.at("why", 76);
  const back = m.lerp([dk - 6, dk + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <HookMap t={m.t}
          draw={m.lerp([0, gl + 22], [0.35, 1])}
          label={1}
          canada={m.lerp([ca, ca + 10], [0, 1])}
          europe={m.lerp([eu, eu + 10], [0, 1])}
          line={m.lerp([be, dk + 4], [0, 1])}
          dk={m.pop(dk, 12)}
          q={m.pop(why, 10)}
          scale={880 - 250 * back}
          center={[-42 + 14 * back, 70 - 6 * back]} />
      </View>
    </Stage>
  );
};

export default Hook;
