// "Russia even keeps its Baltic Fleet there, in the port of Baltiysk." Close on the harbour at the lagoon's mouth: a
// Russian flag rises over the quay, warships slide into their berths one after another, BALTIC FLEET writes on; the
// camera pulls back to the harbour mouth and BALTIYSK writes on beside the port.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, Stage, View, motion } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { MapLabel } from "../../flat/map";
import { BALTIYSK, Map, On, Piece, Ship, Waves } from "./props";

const Fleet: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ru = m.at("russia", 2), ke = m.at("keeps", 14), ba = m.at("baltic", 28), fl = m.at("fleet", 40), po = m.at("port", 60), bt = m.at("baltiysk", 74);
  const wide = m.lerp([po - 4, po + 18], [0, 1]);
  const ship = (i: number, at: number) => m.lerp([at + i * 5, at + i * 5 + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[BALTIYSK[0] + 0.15 + 0.4 * wide, BALTIYSK[1] - 0.12 - 0.15 * wide]} scale={30000 - 14000 * wide} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
          <Piece k={0.6} fill="#e05a4a" trace={1} />
          <On at={[BALTIYSK[0] - 0.12, BALTIYSK[1] + 0.02]} draw={(x, y) => <Waves x={x} y={y} t={m.t} n={4} />} />
          <On at={[BALTIYSK[0] + 0.03, BALTIYSK[1] - 0.02]} draw={(x, y) => {
            const rise = m.lerp([ru, ru + 16], [0, 1]);
            return (
              <g>
                <Block x={x - 260} y={y + 10} w={520} h={40} fill="#9a8e7a" sw={3} />
                <Limb a={[x + 220, y + 10]} b={[x + 220, y - 230]} w={10} color="#6b4a2a" sw={3} />
                {rise > 0 ? <g transform={`skewY(${Math.sin(m.t / 7) * 4})`} style={{ transformOrigin: `${x + 220}px ${y - 230}px` }}>
                  <FlagArt name="Russia" x={x + 220} y={y + 10 - 240 * rise} w={120} h={80} />
                </g> : null}
                {[0, 1, 2].map((i) => {
                  const k = ship(i, i === 0 ? ke : ba);
                  return k > 0 ? <Ship key={i} x={x - 180 + i * 170 - 300 * (1 - k)} y={y + 5} s={140} war rock={m.wave(44 + i * 6, 2)} /> : null;
                })}
              </g>
            );
          }} />
          <MapLabel at={[BALTIYSK[0] - 0.05, BALTIYSK[1] + 0.22]} text="BALTIC FLEET" size={58} k={m.pop(fl, 12)} type={m.lerp([fl, fl + 18], [0, 1])} />
          <MapLabel at={[BALTIYSK[0] + 0.35, BALTIYSK[1] - 0.18]} text="BALTIYSK" size={54} k={m.pop(bt, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Fleet;
