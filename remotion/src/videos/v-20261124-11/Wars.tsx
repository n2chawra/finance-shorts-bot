// "War after war, the Boers took the farmland, and the Basotho were pushed back toward the mountains." Crossed
// spears stamp on the valleys, horsemen ride east, the Free State's orange sweeps over the fields, the blue is
// pushed back to the river and the mountains rise along the edge of what is left.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { BLOEM, BLUE, FREE_STATE, Field, Map, ORANGE, Peaks, Spears, Sweep, WEST, Walker, Zone } from "./props";

const FIELDS: [number, number][] = [[27.1, -28.7], [27.6, -28.5], [26.8, -29.3], [27.4, -29.0]];

const Front: React.FC<{ t: number; ride: number; spears: number; turn: number }> = ({ t, ride, spears, turn }) => {
  const at = useAt();
  const b = at(BLOEM), s = at([27.4, -28.95]);
  return (
    <g>
      {FIELDS.map((f, i) => { const xy = at(f); return xy ? <Field key={i} x={xy[0]} y={xy[1]} w={130} k={1} color={turn > i * 0.25 ? ORANGE : "#e9c94a"} /> : null; })}
      {b && ride > 0 ? [0, 1, 2].map((i) => <Walker key={i} x={b[0] + 60 + ride * 420 - i * 70} y={b[1] + 30 - i * 40} s={66} color="#8a3020" step={t / 2.5 + i} hat />) : null}
      {s ? <Spears x={s[0]} y={s[1] - 40} s={90} k={spears} /> : null}
    </g>
  );
};

const Wars: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wa = m.at("war", 2), bo = m.at("boers", 20), to = m.at("took", 30), fa = m.at("farmland", 40), pu = m.at("pushed", 62), mo = m.at("mountains", 80);
  const out = m.lerp([mo - 4, mo + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.1 * m.lerp([to - 4, to + 12], [0, 1]) * (1 - out) + m.wave(80, 0.008) + 0.03 * m.pulse(wa + 4, 6)}>
        <Map center={[27.7 + 0.4 * out, -29.25 - 0.2 * out]} scale={13000 - 3500 * out} colors={{ Lesotho: { fill: BLUE, k: 0.8 }, "South Africa": { fill: "#d9c08a" } }}>
          <Zone via={FREE_STATE} fill={ORANGE} k={1} o={0.75} />
          <Zone via={WEST} fill={BLUE} k={1} o={0.7 * (1 - m.lerp([pu, pu + 16], [0, 1]))} />
          <Sweep via={WEST} fill={ORANGE} east={26.3 + 2.8 * m.lerp([to, pu + 10], [0, 1])} id="v1124w" />
          <Front t={m.t} ride={m.lerp([bo, pu], [0, 1])} spears={m.pop(wa, 10) * (1 - m.lerp([pu, pu + 10], [0, 1]))} turn={m.lerp([fa, fa + 24], [0, 1])} />
          <Peaks k={m.lerp([mo, mo + 24], [0, 1])} s={60} />
        </Map>
      </View>
    </Stage>
  );
};

export default Wars;
