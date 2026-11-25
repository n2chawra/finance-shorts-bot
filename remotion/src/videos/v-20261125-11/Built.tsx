// "So the wire was raised and joined into one fence, post by post, kilometre after kilometre, to keep the dingo out."
// Close on the line: two workers in old hats lift the wire higher, a roll of wire unrolls along it joining two
// stretches, posts drop into the ground one by one and march off along the line; a dingo on the far side stops at
// the wire and turns away.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Dingo, Fence, Map, Sides, Worker, mix, type LL, SeaMarks } from "./props";

const AT: LL = [139.6, -29.0];

const Works: React.FC<{ raise: number; roll: number; posts: number[]; march: number; dog: number; turn: number; t: number }> = ({ raise, roll, posts, march, dog, turn, t }) => {
  const xy = useAt()(AT);
  if (!xy) return null;
  const [x, y] = xy;
  const top = y - 120 - 70 * raise;
  const N = 9;
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const px = x - 460 + i * 115;
        const k = i < 3 ? (posts[i] ?? 0) : Math.max(0, Math.min(1, march * (N - 3) - (i - 3) * 0.7));
        if (k <= 0) return null;
        const drop = (1 - Math.min(1, k)) * -140;
        return <Block key={i} x={px - 12} y={top + drop} w={24} h={y - top + 10} fill="#7a5532" r={4} sw={3} />;
      })}
      {[0, 0.33, 0.66, 1].map((f, i) => (
        <line key={i} x1={x - 460} y1={top + (y - top) * f} x2={x - 460 + 115 * (N - 1) * Math.max(0.35, roll)} y2={top + (y - top) * f} stroke="#d6d6d0" strokeWidth={5} />
      ))}
      {roll > 0 && roll < 1 ? <circle cx={x - 460 + 115 * (N - 1) * roll} cy={y - 30} r={34} fill="#bdbdb4" stroke={INK} strokeWidth={4} /> : null}
      <Worker x={x - 380} y={y + 150} s={150} swing={Math.max(0, Math.sin(t / 5)) * raise} />
      <Worker x={x - 170} y={y + 160} s={150} shirt="#b0574f" swing={Math.max(0, Math.sin(t / 5 + 1.5))} />
      <Limb a={[x - 330, y + 10]} b={[x - 330, top]} w={8} color="#c98652" sw={2} />
      {dog > 0 ? <Dingo x={x + 380 - 220 * Math.min(1, dog) + 140 * turn} y={y - 170} s={170} trot={dog < 1 || (turn > 0 && turn < 1) ? t / 2.5 : 0} flip={turn > 0.4} /> : null}
    </g>
  );
};

const Built: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const so = m.at("so", 2), ra = m.at("raised", 12), jo = m.at("joined", 30), po = m.at("post", 50), by = m.at("by", 58), ki = m.at("kilometre", 70), ke = m.at("keep", 100), ou = m.at("out", 118);
  const drop = m.lerp([so, so + 18], [0, 1]);
  const pull = m.lerp([ke, ke + 26], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <Map center={[AT[0] + 0.15, AT[1] + 0.08 + 0.15 * pull]} scale={mix(7000, 13000, drop) - 3000 * pull}>
          <Sides dingo={0.6} sheep={0.6} />
          <SeaMarks t={m.t} />
          <Fence w={14} />
          <Works raise={m.lerp([ra, ra + 16], [0, 1])} roll={m.lerp([jo, jo + 30], [0, 1])} posts={[m.pop(po), m.pop(by), m.pop(by + 8)]} march={m.lerp([ki, ki + 30], [0, 1])}
            dog={m.lerp([ke - 20, ke + 4], [0, 1])} turn={m.lerp([ou, ou + 14], [0, 1])} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Built;
