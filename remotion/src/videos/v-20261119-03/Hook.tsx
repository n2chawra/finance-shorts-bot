// Hook: "The Sahara, the biggest hot desert on Earth, used to be green grassland. So could it turn green again?"
// North Africa on the old map. Frame 0: the Sahara's countries in sand with SAHARA across them, dunes rippling
// and a hippo standing in the middle of the sand. The sand flickers green on "green" and is grassland on
// "grassland"; on "could" it fades back to sand as the camera closes in; on "again" a green sprout pushes up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Africa, Dunes, GREEN, Hippo, saharaColors } from "./props";

const Things: React.FC<{ hippo: number; sprout: number; t: number }> = ({ hippo, sprout, t }) => {
  const at = useAt();
  const h = at([19, 17]);
  const s = at([4, 24]);
  return (
    <g>
      {h && hippo > 0 ? <Hippo x={h[0]} y={h[1] + Math.sin(t / 10) * 3} s={210} k={hippo} /> : null}
      {s && sprout > 0 ? (
        <g transform={`translate(${s[0]} ${s[1]}) scale(${Math.min(1.1, sprout) * 1.6})`}>
          <Limb a={[0, 0]} b={[0, -60 * Math.min(1, sprout)]} w={8} color={GREEN} sw={3} />
          <path d="M 0 -40 Q -34 -60 -40 -34 Q -20 -30 0 -40 Z M 0 -54 Q 30 -80 40 -52 Q 18 -46 0 -54 Z" fill={GREEN} stroke={INK} strokeWidth={4} opacity={Math.min(1, sprout * 1.5)} />
        </g>
      ) : null}
    </g>
  );
};

/** The hook's map (the loop lands on it). */
export const HookMap: React.FC<{ t: number; green: number; flick: number; hippo: number; sprout: number; scale: number; center: [number, number] }> = ({ t, green, flick, hippo, sprout, scale, center }) => (
  <Africa center={center} scale={scale} colors={saharaColors(Math.max(green, flick))}>
    <Dunes k={1 - Math.max(green, flick)} t={t} />
    <MapLabel at={[12, 25]} text="SAHARA" size={92} />
    <Things hippo={hippo} sprout={sprout} t={t} />
  </Africa>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const g = m.at("green", 48), gr = m.at("grassland", 58), could = m.at("could", 80), again = m.at("again", 96), big = m.at("biggest", 14);
  const flick = m.t >= g && m.t < gr ? (Math.floor((m.t - g) / 3) % 2 ? 0.9 : 0.15) : 0;
  const green = m.lerp([gr, gr + 6], [0, 1]) * (1 - m.lerp([could, could + 12], [0, 1]));
  const close = m.lerp([could - 4, could + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <HookMap t={m.t} green={green} flick={flick} hippo={1} sprout={m.pop(again, 12)}
          scale={1300 + 300 * close + 60 * m.lerp([big, big + 30], [0, 1])} center={[11 - 2 * close, 20 + 1 * close]} />
      </View>
    </Stage>
  );
};

export default Hook;
