// "From that fortress he gathered clans scattered by war into one nation, the Basotho, farming the wide valleys
// to the west." The camera pulls back from Thaba Bosiu; small groups walk in, huts pop up across the land, the
// Basotho blue paints over the mountains and the valleys, maize fields stripe the west, which glows.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, rng } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BLUE, Field, Hut, LESOTHO_C, Map, THABA, WEST, Walker, Zone } from "./props";

const R = rng("v1124n");
const HUTS: [number, number][] = Array.from({ length: 14 }, () => [26.7 + R() * 2.4, -28.5 - R() * 1.6] as [number, number]);
const FIELDS: [number, number][] = [[27.1, -28.7], [27.6, -28.5], [26.8, -29.3], [27.4, -29.0]];

const Things: React.FC<{ t: number; walk: number; huts: number; fields: number }> = ({ t, walk, huts, fields }) => {
  const at = useAt();
  const th = at(THABA);
  return (
    <g>
      {FIELDS.map((f, i) => { const xy = at(f); return xy ? <Field key={i} x={xy[0]} y={xy[1]} w={150} k={Math.min(1, fields * 2 - i * 0.3)} /> : null; })}
      {HUTS.map((h, i) => { const xy = at(h); return xy ? <Hut key={i} x={xy[0]} y={xy[1]} s={48} k={Math.min(1, huts * 3 - i * 0.18)} /> : null; })}
      {th && walk > 0 && walk < 1 ? [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 420 * (1 - walk);
        return <Walker key={i} x={th[0] + Math.cos(a) * r} y={th[1] + Math.sin(a) * r * 0.7} s={46} color={["#c8102e", "#2f6fd0", "#e0a020", "#3a7a3a", "#7a3a8a", "#d06a2a"][i]!} step={t / 4 + i} />;
      }) : null}
    </g>
  );
};

const Nation: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fo = m.at("fortress", 4), ga = m.at("gathered", 18), cl = m.at("clans", 30), na = m.at("nation", 62), ba = m.at("basotho", 74), fa = m.at("farming", 90), va = m.at("valleys", 110), we = m.at("west", 124);
  const back = m.lerp([fo, na + 6], [0, 1]);
  const glide = m.lerp([va - 4, we + 10], [0, 1]);
  const center: [number, number] = [THABA[0] - 0.4 * back - 0.6 * glide + 0.3 * (1 - back), THABA[1] + 0.15 * back];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={center} scale={30000 - 18000 * back + 3000 * glide} colors={{
          Lesotho: { fill: BLUE, k: 0.8 * m.lerp([na, na + 16], [0, 1]) }, "South Africa": { fill: "#d9c08a" },
        }}>
          <Zone via={WEST} fill={BLUE} k={m.lerp([na, na + 18], [0, 1])} o={0.7} edge={m.lerp([we, we + 16], [0, 1])} />
          <Things t={m.t} walk={m.lerp([ga, cl + 20], [0, 1])} huts={m.lerp([cl, cl + 40], [0, 1])} fields={m.lerp([fa, fa + 20], [0, 1])} />
          <MapLabel at={[LESOTHO_C[0] - 0.5, LESOTHO_C[1] + 0.35]} text="BASOTHO" size={64} k={m.pop(ba, 12)} />
        </Map>
      </View>
    </Stage>
  );
};

export default Nation;
