// "until it finally stops among the farms of the Darling Downs." The odometer rolls to the full length as the truck
// pulls up at the last post; green paddocks and a farmhouse appear round the end, a windmill turns and DARLING
// DOWNS writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, View, countText, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { END, Fence, GREEN, Map, Odo, OnFence, along, mix, mixLL, SeaMarks } from "./props";
import { EAST_END } from "./East";

type Params = { fig?: { length?: string } };

const Farm: React.FC<{ fields: number; house: number; mill: number; t: number }> = ({ fields, house, mill, t }) => {
  const xy = useAt()(END);
  if (!xy) return null;
  const [x, y] = xy;
  const F: [number, number, number, number][] = [[-40, 40, 220, 120], [200, 30, 200, 140], [-20, 180, 260, 120], [260, 190, 180, 110], [30, -140, 200, 110]];
  return (
    <g>
      {F.map(([dx, dy, w, h], i) => {
        const q = Math.max(0, Math.min(1, fields * 3 - i * 0.5));
        return q > 0 ? <Block key={i} x={x + dx} y={y + dy} w={w * q} h={h} fill={i % 2 ? "#9cc25a" : GREEN} r={8} sw={3} shadow={false} /> : null;
      })}
      {house > 0 ? (
        <g transform={`translate(${x + 300},${y - 20}) scale(${Math.min(1, house)})`}>
          <Block x={-80} y={-90} w={160} h={90} fill="#f4ead6" r={4} />
          <path d="M-100,-88 L0,-160 L100,-88 Z" fill="#c0392b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Block x={-20} y={-55} w={40} h={55} fill="#7a4a2a" r={3} shadow={false} />
        </g>
      ) : null}
      {mill > 0 ? (
        <g transform={`translate(${x + 470},${y - 10}) scale(${Math.min(1, mill)})`}>
          <Limb a={[-30, 0]} b={[0, -220]} w={8} color="#777" sw={2} />
          <Limb a={[30, 0]} b={[0, -220]} w={8} color="#777" sw={2} />
          <g transform={`rotate(${t * 6} 0 -220)`}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path key={a} d="M0,-220 L-12,-300 L12,-300 Z" fill="#e8e8e0" stroke={INK} strokeWidth={3} transform={`rotate(${a} 0 -220)`} />
            ))}
          </g>
          <circle cx={0} cy={-220} r={10} fill={INK} />
        </g>
      ) : null}
    </g>
  );
};

const Farms: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const fi = m.at("finally", 4), st = m.at("stops", 18), fa = m.at("farms", 34), da = m.at("darling", 48), dw = m.at("downs", 58);
  const k = m.lerp([0, st], [EAST_END, 1]);
  const close = m.lerp([st, st + 24], [0, 1]);
  const at = along(k);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.05 * close + m.wave(70, 0.008)}>
        <Map center={mixLL([at[0] + 0.3, at[1] - 0.1], [END[0] + 0.9, END[1] - 0.2], close)} scale={mix(3600, 9500, m.lerp([fi, st + 24], [0, 1]))}>
          <Farm fields={m.lerp([fa, fa + 24], [0, 1])} house={m.pop(fa + 4)} mill={m.pop(da)} t={m.t} />
          <SeaMarks t={m.t} />
          <Fence w={12} flash={m.pulse(st + 2, 10)} />
          <MapLabel at={[END[0] + 1.0, END[1] - 1.1]} text="DARLING DOWNS" size={60} type={m.lerp([dw, dw + 18], [0, 1])} />
          <OnFence k={k} t={k < 1 ? m.t : 0} />
        </Map>
      </View>
      <Odo value={countText(len, k)} />
    </Stage>
  );
};
export default Farms;
