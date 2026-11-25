// "From there it runs north, across the red desert of South Australia." A patrol truck sets off from the cliffs and
// drives the fence north, the camera following it and the odometer counting; the land warms to desert red, dunes
// and a salt pan slide past and SOUTH AUSTRALIA writes on beside the line.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, countText, motion, rng } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Fence, Map, Odo, OnFence, START, along, mix, mixLL, type LL, SeaMarks } from "./props";

type Params = { fig?: { length?: string } };

export const NORTH_END = 0.3;
const R = rng("dunes-25-11");
const DUNES: LL[] = Array.from({ length: 26 }, () => [131.5 + R() * 7, -32 + R() * 4.6] as LL);

const Desert: React.FC<{ k: number; salt: number }> = ({ k, salt }) => {
  const at = useAt();
  if (k <= 0) return null;
  const s = at([136.2, -30.4]);
  return (
    <g>
      {DUNES.map((d, i) => {
        const xy = at(d);
        if (!xy) return null;
        return <path key={i} d={`M${xy[0] - 46},${xy[1]} q46,-34 92,0`} fill="#d4743a" stroke="#8a4320" strokeWidth={4} opacity={0.85 * k} />;
      })}
      {s && salt > 0 ? <ellipse cx={s[0]} cy={s[1]} rx={150 * salt} ry={70 * salt} fill="#f4f1ea" stroke="#b8a888" strokeWidth={5} opacity={0.9} /> : null}
    </g>
  );
};

const North: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const th = m.at("there", 2), no = m.at("north", 14), re = m.at("red", 40), de = m.at("salt", 52), so = m.at("desert", 64);
  const k = m.lerp([th, m.end], [0, NORTH_END]);
  const look: LL = mixLL([START[0] + 0.55, START[1] + 0.35], [along(k)[0] + 0.3, along(k)[1] - 0.2], m.lerp([0, no], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <Map center={look} scale={mix(12600, 7000, m.lerp([0, no + 10], [0, 1]))}>
          <Desert k={m.lerp([re, re + 14], [0, 1])} salt={m.pop(de)} />
          <SeaMarks t={m.t} />
          <Fence w={12} />
          <MapLabel at={[135.4, -31.0]} text="SOUTH AUSTRALIA" size={56} type={m.lerp([so, so + 20], [0, 1])} />
          <OnFence k={k} t={m.t} />
        </Map>
      </View>
      <Odo value={countText(len, k)} k={m.lerp([th, th + 8], [0, 1])} />
    </Stage>
  );
};
export default North;
