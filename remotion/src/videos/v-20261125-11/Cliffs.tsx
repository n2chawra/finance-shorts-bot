// "It starts on the cliffs of the south coast: wire 180 centimetres high, taller than you." The camera flies from the
// hook's map down to the fence's south end on the Bight; cliffs rise along the coast with waves below, the first
// panel of mesh stands up, a height marker climbs to the figure and a small walker looks up at the top wire.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, useAt } from "../../flat/map";
import { Fence, Map, Panel, START, mix, mixLL, type LL, SeaMarks } from "./props";
import { PUSHED } from "./Hook";

type Params = { fig?: { height?: string } };

const CLOSE: LL = [START[0] + 0.55, START[1] + 0.35];

const Coast: React.FC<{ rise: number; t: number; panel: number; mark: number; walker: number; look: number; height: string }> = ({ rise, t, panel, mark, walker, look, height }) => {
  const xy = useAt()(START);
  if (!xy) return null;
  const [x, y] = xy;
  const ch = 150 * rise;
  const H = 300, W = 240;
  return (
    <g>
      {rise > 0 ? (
        <g>
          <path d={`M${x - 620},${y + 30} L${x + 520},${y + 10} L${x + 520},${y + 30 + ch} L${x - 620},${y + 50 + ch} Z`} fill="#c98a55" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {[-500, -360, -200, -40, 120, 280, 420].map((dx, i) => (
            <line key={i} x1={x + dx} y1={y + 30} x2={x + dx + 30} y2={y + 30 + ch} stroke="#9a643a" strokeWidth={6} />
          ))}
          {[-520, -300, -80, 140, 360].map((dx, i) => {
            const ph = Math.sin(t / 9 + i) * 14;
            return <path key={i} d={`M${x + dx + ph},${y + 70 + ch} q40,-26 80,0 q40,-26 80,0`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.85 * rise} />;
          })}
        </g>
      ) : null}
      <Panel x={x - 40} y={y + 20} h={H} w={W} k={panel} />
      {mark > 0 ? (
        <g>
          <Block x={x - 100} y={y + 20 - H * Math.min(1, mark)} w={22} h={H * Math.min(1, mark)} fill="#ffd36a" r={6} />
          <Block x={x - 330} y={y - H - 40} w={230} h={96} fill="#ffd36a" r={14} opacity={Math.min(1, mark * 2)} />
          <Txt x={x - 215} y={y - H + 8} size={56} fill={INK}>{`${countText(height, mark)} CM`}</Txt>
        </g>
      ) : null}
      {walker > 0 ? <Char x={x + 300 - 120 * Math.min(1, walker)} y={y + 22} s={98} outfit="tee" face={look > 0.5 ? "shock" : "neutral"} look={[-0.6, -look]} armR={[20, 10]} armL={[12, 8]} /> : null}
      <Glow x={x + 80} y={y - H / 2} r={260} color="#fff2c0" o={0.18} />
    </g>
  );
};

const Cliffs: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const height = (p.beat.params as Params).fig?.height ?? "";
  const st = m.at("starts", 4), cl = m.at("cliffs", 20), wi = m.at("wire", 40), hi = m.at("high", 60), ta = m.at("taller", 90), yo = m.at("you", 100);
  const fly = m.lerp([0, cl + 6], [0, 1]);
  const close = m.lerp([wi, wi + 20], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + 0.04 * close + m.wave(80, 0.008)}>
        <Map center={mixLL(PUSHED.center, CLOSE, fly)} scale={mix(PUSHED.scale, 11000, fly) + 1600 * close}>
          <SeaMarks t={m.t} />
          <Fence w={14} run={m.lerp([st, st + 30], [0.05, 0])} />
          <MapLabel at={[START[0] + 1.2, START[1] - 0.9]} text="NULLARBOR CLIFFS" size={52} k={m.pop(cl)} />
          <Coast rise={m.lerp([cl, cl + 14], [0, 1])} t={m.t} panel={m.lerp([wi, wi + 12], [0, 1])} mark={m.lerp([hi, hi + 20], [0, 1])}
            walker={m.lerp([ta, ta + 16], [0, 1])} look={m.lerp([yo, yo + 8], [0, 1])} height={height} />
        </Map>
      </View>
    </Stage>
  );
};
export default Cliffs;
