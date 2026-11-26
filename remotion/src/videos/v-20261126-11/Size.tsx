// "It covers {fact1}, about half the size of Belgium." The piece shades in and its area sign stamps onto the land;
// Belgium's outline, with its flag, slides in from the west and lands over the piece at true scale.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Lift, MapLabel, useAt } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { Map, On, PIECE_C, Piece, Signpost } from "./props";
import { Ball, Limb } from "../../flat/kit";
import { MapRoute } from "../../flat/map";

const TREES: [number, number][] = [[20.2, 54.95], [21.6, 54.95], [22.3, 54.6], [21.0, 54.55], [20.6, 54.85], [22.0, 54.4]];
const FIELDS: [number, number][] = [[21.2, 54.75], [20.4, 54.55], [21.9, 54.75]];
const COAST: [number, number][] = [[19.95, 54.93], [20.6, 54.98], [20.95, 55.15], [21.2, 55.28]];

type Params = { fig?: { area?: string } };

/** Belgium at true scale over the map: the Lift is drawn on an equal-area projection, so it is scaled by the
 * Mercator stretch at this latitude to match the map the piece is drawn on. */
const Belgium: React.FC<{ to: [number, number] }> = ({ to }) => {
  const xy = useAt()(to);
  if (!xy) return null;
  const s = 1 / Math.cos((to[1] * Math.PI) / 180);
  return (
    <g opacity={0.62} transform={`translate(${xy[0]},${xy[1]}) scale(${s}) translate(${-xy[0]},${-xy[1]})`}>
      <Lift name="Belgium" to={to} k={1} fill="#f2c94c" />
    </g>
  );
};

const Size: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const area = (p.beat.params as Params).fig?.area ?? "";
  const co = m.at("covers", 4), fo = m.at("forest", 14), fa = m.at("farms", 24), bc = m.at("beaches", 40), ha = m.at("half", 30), be = m.at("belgium", 44);
  const slide = m.lerp([ha, be + 8], [0, 1]);
  const close = m.lerp([be - 4, be + 18], [0, 1]);
  const to: [number, number] = [PIECE_C[0] + 0.1, PIECE_C[1] - 0.15];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.0 - 0.3 * close, 54.25 - 0.2 * close]} scale={8200 + 1200 * close} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
                    <Piece k={1} flagK={1} trace={1} glow={m.pulse(co, 16)} />
          {TREES.map((tp, i) => <On key={`t${i}`} at={tp} draw={(x, y) => { const k = m.pop(fo + i * 2, 10); return k > 0 ? <g transform={`translate(${x},${y}) scale(${k})`}><Limb a={[0, 0]} b={[0, -30]} w={10} color="#6b4a2a" sw={2} /><Ball x={0} y={-50} r={30} fill="#3f8a4a" sw={3} /></g> : null; }} />)}
          {FIELDS.map((fp, i) => <On key={`f${i}`} at={fp} draw={(x, y) => { const k = m.lerp([fa + i * 3, fa + i * 3 + 10], [0, 1]); return k > 0 ? <g>{[0, 1, 2].map((r) => <rect key={r} x={x - 50} y={y + r * 18} width={100 * k} height={10} rx={5} fill="#e9c94a" stroke="#8a6a2a" strokeWidth={2} />)}</g> : null; }} />)}
          <MapRoute via={COAST} k={m.lerp([bc, bc + 14], [0, 1])} color="#f6e3a8" width={18} dash={false} />
          {slide > 0 ? <Belgium to={[to[0] - 6 * (1 - slide), to[1]]} /> : null}
          <MapLabel at={[to[0] - 1.2, to[1] - 0.75]} text="BELGIUM" size={52} k={slide > 0.98 ? 1 : 0} />
          {slide > 0.98 ? <On at={[to[0] - 1.25, to[1] - 0.35]} draw={(x, y) => <FlagArt name="Belgium" x={x - 66} y={y - 44} w={132} h={88} />} /> : null}
          <On at={[PIECE_C[0] + 0.9, PIECE_C[1] + 0.15]} draw={(x, y) => <Signpost x={x} y={y} w={460} text={area} size={60} k={m.pop(co + 2, 12)} />} />
          <MapLabel at={[PIECE_C[0], PIECE_C[1] + 0.55]} text="HALF OF BELGIUM" size={50} k={m.pop(be + 6, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Size;
