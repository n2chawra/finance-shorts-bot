// "And about {fact3} of all the world's trade by sea goes through this one canal. All of it riding on the rain."
// Back over Panama with its flag: shipping lanes light up towards the canal from both oceans, ships ride them, a
// sign at the canal shows the share of the world's sea trade, then a rain cloud rolls over and the canal glows.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Board, Canal, Cargo, Cloud, LAKE_C, Lake, PMap, Ship } from "./props";

type Params = { fig?: { share?: string } };

const LANES: [number, number][][] = [[[-66, 18.5], [-74, 13.5], [-79.92, 9.42]], [[-86, 16.5], [-81.5, 12], [-79.92, 9.42]], [[-77.5, -1], [-79, 5], [-79.53, 8.88]], [[-92, 3], [-84, 6.5], [-79.53, 8.88]]];

const Over: React.FC<{ t: number; ships: number; cloud: number; rain: number }> = ({ t, ships, cloud, rain }) => {
  const at = useAt();
  const c = at(LAKE_C);
  return (
    <g>
      {ships > 0 ? LANES.map((l, i) => {
        const a = at(l[0]!), b = at(l[1]!);
        if (!a || !b) return null;
        const f = (ships + i * 0.2) % 1;
        return <Ship key={i} x={a[0] + (b[0] - a[0]) * f} y={a[1] + (b[1] - a[1]) * f} s={50} rot={(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI} color={["#d23b30", "#3a7ad0", "#3aa06a", "#e07a3a"][i]!} />;
      }) : null}
      {c ? <Cloud x={c[0] - 20} y={c[1] - 240} s={150} rain={rain} t={t} k={cloud} dark /> : null}
    </g>
  );
};

const Trade: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const ab = m.at("about", 2), sha = m.at("share", 48), car = m.at("cars", 56), gra = m.at("grain", 62), fue = m.at("fuel", 70), wo = m.at("world's", 10), tr = m.at("trade", 18), se = m.at("sea", 26), ca = m.at("canal", 44), ri = m.at("riding", 70), ra = m.at("rain", 86);
  const cg = [m.pop(car, 12), m.pop(gra, 12), m.pop(fue, 12)].map((v) => v * (1 - m.lerp([ri, ri + 10], [0, 1])));
  const rise = m.lerp([sha, sha + 12], [0, 1]);
  const close = m.lerp([ca - 4, ca + 12], [0, 0.6]) + m.lerp([ra - 4, ra + 10], [0, 0.4]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(80, 0.008)}>
        <PMap trees={1} center={[-79.75 + 0.1 * (1 - close), 9.1 + 0.25 * (1 - close)]} scale={3200 + 32800 * Math.pow(close, 1.5)} colors={{ Panama: { fill: "#d9b77a", k: 0.5 } }}>
          <Lake k={1} glow={m.lerp([ra, ra + 14], [0, 1])} />
          {LANES.map((l, i) => <MapRoute key={i} via={l} k={m.lerp([wo + i * 3, wo + 14 + i * 3], [0, 1])} color="#ffe08a" width={10} />)}
          <Canal w={14 + 10 * close} glow={m.pulse(se + 6, 12) + m.pulse(ab + 6, 10) + m.lerp([ra, ra + 12], [0, 1])} />
          <Over t={m.t} ships={m.lerp([tr, m.end], [0, 1.4])} cloud={m.pop(ri, 12)} rain={m.lerp([ra, ra + 8], [0, 1])} />
        </PMap>
        <Board x={540} y={720 + 60 * (1 - rise)} label="WORLD SEA TRADE" value={share} k={Math.max(m.pop(ca, 12), 0.5 * rise)} w={560} />
        {(["cars", "grain", "fuel"] as const).map((kd, i) => <Cargo key={kd} x={300 + i * 240 - (1 - Math.min(1, cg[i] ?? 0)) * 200} y={1180 + (i % 2) * 40} s={90} kind={kd} k={cg[i] ?? 0} />)}
      </View>
    </Stage>
  );
};

export default Trade;
