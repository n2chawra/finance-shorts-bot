// "Because this one lane carries about {fact5} of all the goods the world trades, every one of those ships now takes
// the long way round." The closed lane flashes red; container ships queue behind it; a crate stack shows the share;
// the camera pulls back over the region and every ship's route bends south round the islands and closes past Borneo.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Tag, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { LANE, LOMBOK_ROUTE, Line, RED, SEAsia, SUNDA_ROUTE, Tanker, tipOf } from "./props";

type Params = { fig?: { share?: string } };

const Ships: React.FC<{ t: number; q: number; bend: number }> = ({ t, q, bend }) => {
  const at = useAt();
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const route = i % 2 ? LOMBOK_ROUTE : SUNDA_ROUTE;
        const held = tipOf(at, LANE, 0.25 - i * 0.04);
        const moving = tipOf(at, route, 0.1 + bend * (0.75 - i * 0.08));
        const tip = bend > 0 ? moving : held;
        return tip && q > 0 ? <Tanker key={i} x={tip[0]} y={tip[1]} s={70} rot={tip[2]} t={t + i * 6} boxes k={Math.min(1, q * 4 - i)} /> : null;
      })}
    </g>
  );
};

const Crates: React.FC<{ k: number; stamp: number; text: string }> = ({ k, stamp, text }) => {
  if (k <= 0) return null;
  const cols = ["#e8453c", "#3b6fb8", "#f2b134", "#3a9d5d"];
  return (
    <g transform="translate(700 520)">
      {Array.from({ length: 8 }, (_, i) => <Block key={i} x={(i % 4) * 66 - 132} y={-Math.floor(i / 4) * 52 - 52} w={62} h={48} fill={cols[i % 4]!} sw={4} opacity={Math.min(1, k * 8 - i)} />)}
      {stamp > 0 ? <Tag x={-150} y={-260} w={300} h={110} text={text} size={64} k={stamp} rot={-4} /> : null}
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const la = m.at("lane", 4), ca = m.at("carries", 12), ab = m.at("about", 26), go = m.at("goods", 40), tr = m.at("trades", 50), wo = m.at("world", 56), ev = m.at("every", 66), sh = m.at("ships", 74), lo = m.at("long", 86), ro = m.at("round", 96);
  const back = m.lerp([wo - 4, wo + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01)}>
        <SEAsia center={[101 + 9 * back, 2.5 - 4 * back]} scale={4600 - 2700 * back} colors={{ Malaysia: { fill: "#e0b46a" }, Indonesia: { fill: "#c9c27a" } }}>
          <Line via={LANE.slice(2, 8)} k={1} color={RED} w={22} ink={false} o={0.5 + 0.5 * m.pulse(la + 4, 12)} />
          <Line via={SUNDA_ROUTE} k={m.lerp([ev, lo + 6], [0, 1])} w={10} dash />
          <Line via={[[100.5, 3.2], [99.5, 0.5]]} k={m.lerp([sh, sh + 10], [0, 1])} color="#ffffff" w={12} />
          <Line via={LOMBOK_ROUTE} k={m.lerp([lo - 4, ro + 14], [0, 1])} color="#ff9a3c" w={10} dash />
          <Ships t={m.t} q={m.lerp([ca, ca + 16], [0, 1])} bend={m.lerp([tr, m.end], [0, 1])} />
        </SEAsia>
      </View>
      <Crates k={m.lerp([ab, go + 6], [0, 1])} stamp={m.pop(go, 10)} text={share} />
    </Stage>
  );
};

export default Payoff;
