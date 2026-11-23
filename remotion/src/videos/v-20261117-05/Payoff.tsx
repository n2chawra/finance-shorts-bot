// Payoff: "So a line drawn for river boats, about {fact5} from the water, is still where a whole country
// begins and ends." The map at dusk, close on the river: a fisherman's boat glides past a white border stone
// on "line", the gap from the water to the stone is measured with the figure; more boats drift by on
// "boats"; on "still" the camera lifts high above, Gambia lights up red on "country" and its border traces
// itself all the way round on "ends".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapRoute } from "../../flat/map";
import { At, Boat, BorderTrace, GREEN, GeoMap, RED, RIVER, Tint } from "./props";

type Params = { fig?: { gap?: string } };

const STONE: [number, number] = [-16.14, 13.47];   // west of the boats, about 10 km north of the river

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gap = (p.beat.params as Params).fig?.gap ?? "";
  const line = m.at("line", 6), boats = m.at("boats", 30), still = m.at("still", 70), country = m.at("country", 90), ends = m.at("ends", 110);
  const up = m.lerp([still, still + 26], [0, 1]);
  const scale = 20000 - 11000 * up;
  const center: [number, number] = [-15.1, 13.56 + 0.3 * up];
  const red = m.lerp([country, country + 12], [0.3, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.6}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <GeoMap center={center} scale={scale} colors={{ Gambia: { fill: RED, k: m.t < country ? 0.3 : 1, paint: m.t < country ? 1 : m.lerp([country, country + 22], [0.05, 1]), from: [-16.6, 13.45] }, Senegal: { fill: GREEN, k: 0.6 } }}>
          
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={10} dash={false} />
          <MapRoute via={RIVER} k={m.lerp([line - 10, still + 10], [0.3, 0.6])} color="rgba(0,0,0,0)" width={1} dash={false}
            mover={(x, y) => <Boat x={x} y={y - 4} s={110 - 80 * up} color="#7a3b1e" sail />} />
          {[0, 1].map((i) => (
            <MapRoute key={i} via={RIVER} k={m.lerp([boats + i * 6, still + 20], [0.62 - i * 0.03, 0.48 - i * 0.03])} color="rgba(0,0,0,0)" width={1} dash={false}
              mover={(x, y) => (m.t >= boats + i * 6 ? <Boat x={x} y={y - 4} s={90 - 60 * up} color="#b5652b" load={i === 1} /> : null)} />
          ))}
          <At at={STONE}>{(x, y) => {
            const k = m.pop(line + 4, 12) * (1 - up);
            const s = 1 - up;
            return k > 0.01 ? (
              <g>
                <Block x={x - 22 * s} y={y - 70 * s} w={44 * s} h={70 * s} r={8} fill="#f1f1f1" sw={4} />
                <line x1={x} y1={y} x2={x} y2={y + 0.09 * scale * Math.PI / 180} stroke={INK} strokeWidth={6} strokeDasharray="10 8" />
                <Tag x={x - 90} y={y - 200} w={240} h={96} text={gap} k={k} rot={-3} />
              </g>) : null;
          }}</At>
          <BorderTrace name="Gambia" k={m.lerp([ends - 4, ends + 22], [0, 1])} width={9} color="#ffd75e" glow={1} />
        </GeoMap>
      </View>
    </Stage>
  );
};

export default Payoff;
