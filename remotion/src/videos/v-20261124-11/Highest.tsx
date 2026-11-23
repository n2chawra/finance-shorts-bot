// "And the Basotho kept only the high ground: the lowest point in Lesotho is {fact2} above the sea, higher than
// any other country's lowest point." Lesotho lifts off the map on its mountains, its shadow on South Africa; a
// pin drops where the river leaves it, a height post rises with the figure on its sign, the camera pulls back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { BLUE, LOWEST, LesothoEdge, Map, Peaks } from "./props";

type Params = { fig?: { low?: string } };

const Post: React.FC<{ k: number; sign: number; low: string; lift: number; c: number; lit: number }> = ({ k, sign, low, lift, c, lit }) => {
  const xy = useAt()(LOWEST);
  if (!xy || k <= 0) return null;
  const [x, y] = [xy[0], xy[1] - 30 * lift];
  const top = y - 330 * Math.min(1, k);
  return (
    <g>
      <Limb a={[x, y]} b={[x, top]} w={14} color="#ffffff" />
      {[0.25, 0.5, 0.75].map((f, i) => <line key={i} x1={x - 18} x2={x + 18} y1={y - 330 * f * Math.min(1, k)} y2={y - 330 * f * Math.min(1, k)} stroke={lit > 0.5 ? "#ffe08a" : "#1d1a2b"} strokeWidth={5 + 4 * lit} />)}
      {sign > 0 ? (
        <g transform={`translate(${x},${top}) scale(${Math.min(1, sign)})`}>
          <Block x={-210} y={-150} w={420} h={140} fill="#f4e6c4" r={12} />
          <Txt x={0} y={-104} size={44} fill="#5a3a1a">LOWEST POINT</Txt>
          <Txt x={0} y={-44} size={60} fill="#1d1a2b">{countText(low, c)}</Txt>
        </g>
      ) : null}
    </g>
  );
};

const Sea: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([31.05, -29.85]);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Glow x={xy[0]} y={xy[1]} r={120} color="#9fe3ff" o={0.7} />
      <Block x={xy[0] - 90} y={xy[1] - 90} w={180} h={70} fill="#f4e6c4" r={10} />
      <Txt x={xy[0]} y={xy[1] - 42} size={46} fill="#1d1a2b">SEA</Txt>
    </g>
  );
};

const Highest: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const low = (p.beat.params as Params).fig?.low ?? "";
  const cl = m.at("climb", 118), bs = m.at("basotho", 2), kp = m.at("kept", 8), hi = m.at("high", 10), gr = m.at("ground", 18), lo = m.at("lowest", 34), po = m.at("point", 42), se = m.at("sea", 74), hr = m.at("higher", 86), ot = m.at("other", 98), cs = m.at("country's", 110);
  const lift = m.lerp([hi, gr + 10], [0, 1]);
  const back = m.lerp([hr - 4, hr + 20], [0, 1]);
  const close = m.lerp([lo - 4, lo + 12], [0, 1]) * (1 - back);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.08 * close + m.wave(80, 0.008)} cy={960 - 120 * close}>
        <Map center={[28.0 + 1.6 * back, -29.4 - 0.3 * back]} scale={12000 - 6000 * back} colors={{
          Lesotho: { fill: BLUE, flag: "Lesotho", lift },
          "South Africa": { fill: "#d9b77a", k: 0.5 },
        }}>
          <g transform={`translate(0,${-12 * m.pulse(bs + 4, 8)})`}><Peaks k={1} s={56 * (1 - 0.4 * back)} /></g>
          <LesothoEdge k={1} w={8 + 8 * m.pulse(cs + 6, 12) + 8 * m.pulse(kp + 6, 12)} color="#ffffff" />
          <MapPin at={LOWEST} k={m.pop(lo, 12)} r={26} />
          <Post k={m.lerp([po, po + 18], [0, 1])} sign={m.pop(Math.min(se - 18, po + 16), 12)} low={low} lift={lift} c={m.lerp([cl - 20, cl + 20], [0, 1])} lit={m.pulse(cl + 4, 14)} />
          <Sea k={m.pop(ot, 12)} />
        </Map>
      </View>
    </Stage>
  );
};

export default Highest;
