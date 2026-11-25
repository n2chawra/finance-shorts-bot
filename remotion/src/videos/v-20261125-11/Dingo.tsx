// "Because on the other side lives the hunter of sheep: the dingo, Australia's wild dog, roaming the north and west."
// The camera whips across the wire to the outback; that side lights up orange, a big dingo trots up to the fence,
// WILD DOG stamps on its tag, more dingoes roam the outback, DINGO COUNTRY writes on to the north and paw prints
// run off to the west.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Dingo as Dog, Fence, Map, Paws, Sides, mix, mixLL, type LL, SeaMarks } from "./props";

const PACK: LL[] = [[131.0, -24.6], [131.8, -22.6], [128.2, -27.4], [126.0, -22.6]];

const Pack: React.FC<{ big: number; rest: number[]; wild: number; prints: number; t: number }> = ({ big, rest, wild, prints, t }) => {
  const at = useAt();
  const b = at([136.6, -28.15]);
  const w = at([124.5, -26.0]);
  return (
    <g>
      {PACK.map((d, i) => {
        const xy = at(d);
        const q = rest[i] ?? 0;
        if (!xy || q <= 0) return null;
        return <Dog key={i} x={xy[0] + Math.sin(t / 30 + i) * 30} y={xy[1]} s={150} k={q} trot={t / 3 + i} flip={i % 2 === 1} />;
      })}
      {b && w ? <Paws a={[b[0] - 120, b[1] + 10]} b={w} k={prints} n={10} s={18} /> : null}
      {b && big > 0 ? (
        <g>
          <Dog x={b[0] + (1 - Math.min(1, big)) * -260} y={b[1]} s={330} k={1} trot={big < 1 ? t / 2.5 : 0} head={Math.sin(t / 20) * 4} />
          <Tag x={b[0] - 170} y={b[1] + 30} w={340} h={90} text="WILD DOG" k={wild} bg="#ffd36a" />
        </g>
      ) : null}
    </g>
  );
};

const Dingo: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hu = m.at("hunter", 4), ot = m.at("other", 16), di = m.at("dingo", 32), wi = m.at("wild", 50), ro = m.at("roaming", 62), no = m.at("north", 76), we = m.at("west", 86);
  const close = m.lerp([di, di + 20], [0, 1]) - m.lerp([ro, ro + 26], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <Map center={mixLL(mixLL([146.0, -31.9], [133.0, -25.6], m.lerp([0, hu + 14], [0, 1])), [135.6, -27.0], close)} scale={mix(3600, 3000, m.lerp([0, hu + 14], [0, 1])) + 3000 * close}>
          <Sides dingo={m.lerp([ot, ot + 12], [0.45, 1])} sheep={0.5} />
          <SeaMarks t={m.t} />
          <Fence w={10} />
          <MapLabel at={[131.0, -19.8]} text="DINGO COUNTRY" size={60} type={m.lerp([no, no + 20], [0, 1])} />
          <Pack big={m.lerp([di - 6, di + 16], [0, 1])} rest={[m.pop(ro), m.pop(ro + 5), m.pop(ro + 10), m.pop(ro + 15)]} wild={m.lerp([wi, wi + 8], [0, 1])} prints={m.lerp([we, we + 24], [0, 1])} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Dingo;
