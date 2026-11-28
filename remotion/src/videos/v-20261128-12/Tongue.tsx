// "Today the two still share a language, from Mexico City to Madrid, with an ocean in between." The Atlantic with
// both countries; a speech bubble pops over Mexico on "share"; on "language" the camera follows an arc across the ocean;
// pins drop on Mexico City and Madrid on their names and a matching bubble pops over Spain; waves run along the arc on "ocean".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute, useAt } from "../../flat/map";
import { ES_FILL, GeoMap, MX_FILL, SEA, mix } from "./props";

const MADRID: [number, number] = [-3.7, 40.42], CDMX: [number, number] = [-99.13, 19.43];

const Bubble: React.FC<{ at: [number, number]; k: number; text: string; dx?: number }> = ({ at, k, text, dx = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const s = Math.min(1, k);
  const x = xy[0] + dx, y = xy[1] - 190;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-130} y={-60} width={260} height={110} rx={40} fill="#fffaf0" stroke={INK} strokeWidth={6} />
      <path d="M -20 48 L 0 90 L 20 48 Z" fill="#fffaf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-22} y={40} width={44} height={14} fill="#fffaf0" />
      <Txt x={0} y={-4} size={58} fill={INK}>{text}</Txt>
    </g>
  );
};

const Tongue: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const to = m.at("today", 2), sh = m.at("share", 14), la = m.at("language", 26), ci = m.at("city", 40), ma = m.at("madrid", 54), oc = m.at("ocean", 72);
  const pan = m.lerp([ci + 8, ma + 2], [0, 1]);
  const cam = { center: [mix(-97, -8, pan), mix(24, 37, pan)] as [number, number], scale: (2000 - 900 * m.lerp([oc - 4, oc + 16], [0, 1])) * (1 - 0.3 * Math.sin(Math.PI * pan)) };
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + 0.03 * m.lerp([0, m.end], [0, 1]) + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, flag: "Spain" }, Mexico: { fill: MX_FILL, k: 1, flag: "Mexico" } }}>
          <MapRoute via={[CDMX, [-50, 34], MADRID]} k={Math.max(m.lerp([la, ci + 8], [0, 0.08]), pan)} color="#fff4d0" width={10} dash={m.t < oc} />
          <MapPin at={MADRID} k={m.pop(ma)} />
          <MapPin at={CDMX} k={m.pop(sh)} />
          <MapLabel at={[-3.7, 38.3]} text="MADRID" size={46} type={m.lerp([ma, ma + 12], [0, 1])} />
          <MapLabel at={[-99, 17.2]} text="MEXICO CITY" size={46} type={m.lerp([ci, ci + 12], [0, 1])} />
          <Bubble at={CDMX} k={m.pop(sh)} text="HOLA" />
          <Bubble at={MADRID} k={m.pop(ma - 10)} text="HOLA" />
          {m.t >= to ? <MapLabel at={[-45, 31]} text="ATLANTIC" size={46} fill="#e8f4fa" type={m.lerp([oc, oc + 12], [0, 1])} /> : null}
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Tongue;
