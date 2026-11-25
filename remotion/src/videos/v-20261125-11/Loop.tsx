// "Sheep side or dingo side: which would you pick? Now you know what one wire across Australia is keeping out." A
// sheep pops on the south-east side and a dingo on the north-west, a pointer swings between them, then the camera
// pulls back to the whole continent, a light runs along the fence, Australia's border lights up with its flag and
// the frame settles on the hook's own map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Dingo, Fence, Map, Sheep, Sides, mix, mixLL, SeaMarks } from "./props";
import { WIDE } from "./Hook";

const Pair: React.FC<{ sheep: number; dog: number; point: number; fade: number; t: number }> = ({ sheep, dog, point, fade, t }) => {
  const at = useAt();
  const s = at([146.0, -32.4]), d = at([129.0, -24.0]);
  if (!s || !d) return null;
  const tx = s[0] + (d[0] - s[0]) * point, ty = s[1] - 200 + (d[1] - s[1]) * point;
  return (
    <g opacity={1 - fade}>
      <Sheep x={s[0]} y={s[1]} s={150} k={sheep} graze={0.3 + 0.3 * Math.sin(t / 12)} />
      <Dingo x={d[0]} y={d[1]} s={170} k={dog} head={Math.sin(t / 15) * 5} />
      {point > 0 ? <path d={`M${tx},${ty} l-34,-60 l68,0 Z`} fill="#ffd36a" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
    </g>
  );
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sh = m.at("sheep", 2), di = m.at("dingo", 16), pi = m.at("pick", 40), kn = m.at("know", 64), wi = m.at("wire", 84), au = m.at("australia", 100), ke = m.at("keeping", 116);
  const out = m.lerp([kn, kn + 30], [0, 1]);
  const swing = pi > 0 ? 0.5 + 0.5 * Math.sin((m.t - pi) / 10) : 0;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.01)}>
        <Map center={mixLL([137.5, -28.2], WIDE.center, out)} scale={mix(1750, WIDE.scale, out)} flag={m.lerp([au, au + 16], [0, 1])} trace={m.lerp([au, au + 30], [0, 1])}>
          <Sides dingo={1 - m.lerp([ke, m.end - 4], [0, 1])} sheep={1 - m.lerp([ke, m.end - 4], [0, 1])} />
          <SeaMarks t={m.t} />
          <Fence run={m.lerp([wi, wi + 30], [0, 1])} />
          <Pair sheep={m.pop(sh)} dog={m.pop(di)} point={m.t >= pi ? swing : 0} fade={m.lerp([ke - 10, ke + 12], [0, 1])} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Loop;
