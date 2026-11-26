// "Until most of its {fact4} cubic kilometres were gone, leaving a salt desert kilometres deep. So how did the sea
// ever come back?" The last lakes shrink; the volume tank on the shore empties; the old shoreline glows as a dashed
// line; salt crystals glitter; a depth line drops from shore to floor; a question mark pops over the basin.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Bridge, Dry, Map, On, QMark } from "./props";

type Params = { fig?: { volume?: string } };

const Tank: React.FC<{ x: number; y: number; fill: number; value: string; k: number }> = ({ x, y, fill, value, k }) => {
  if (k <= 0) return null;
  const w = 300, h = 300;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Block x={x - w / 2} y={y - h} w={w} h={h} fill="#f4e6c4" r={20} />
      <rect x={x - w / 2 + 20} y={y - 20 - (h - 110) * fill} width={w - 40} height={(h - 110) * fill} fill="#3f86a8" />
      <Txt x={x} y={y - h + 58} size={48} fill="#3a2a1a">{value}</Txt>
      <Txt deco x={x} y={y - h + 92} size={28} fill="#6b5236">KM³ OF WATER</Txt>
    </g>
  );
};

const Desert: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const volume = (p.beat.params as Params).fig?.volume ?? "";
  const un = m.at("until", 2), go = m.at("gone", 34), le = m.at("leaving", 44), sa = m.at("salt", 56), de = m.at("deep", 74), ho = m.at("how", 96), ba = m.at("back", 110);
  const close = m.lerp([sa - 4, sa + 16], [0, 1]) * (1 - m.lerp([ho - 2, ho + 16], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.4}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[16.0 + 2.0 * close, 35.6 - 0.4 * close]} scale={1500 + 1000 * close}>
          <Dry level={0.35 - 0.3 * m.lerp([un, go], [0, 1])} t={m.t} glitter={m.lerp([sa, sa + 10], [0.3, 1])} shore={m.lerp([le, le + 12], [0, 1])} />
          <Bridge k={1} />
          <On at={[20.0, 37.5]} draw={(x, y) => m.t > de ? <g><Limb a={[x, y]} b={[x, y + 260 * m.lerp([de, de + 16], [0, 1])]} w={8} color="#c8102e" sw={2} /><Txt x={x} y={y + 330} size={48} fill="#3a2a1a">KILOMETRES DEEP</Txt></g> : null} />
          <On at={[18.0, 35.5]} draw={(x, y) => <QMark x={x} y={y - 40} size={150} k={m.pop(ba, 12)} t={m.t} />} />
        </Map>
      </View>
      <Tank x={760} y={1250} fill={1 - m.lerp([un, go], [0.6, 1])} value={volume} k={m.pop(un, 12)} />
    </Stage>
  );
};
export default Desert;
