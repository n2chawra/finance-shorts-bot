// "भारत की पूरी ज़मीनी सीमा है {fact1}। पर सबसे लंबा हिस्सा किसका?" The camera pulls back to all of India on "भारत";
// a bright line runs along every land border on "पूरी"; border posts pop up along it on "ज़मीनी"; a road sign with the
// total rises over the north on "है"; a question mark pops beside it on "किसका".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour } from "../../flat/india";
import { ALL, F, MapView, N, OnMap, Question, lerpFrame } from "./props";

type Params = { fig?: { total?: string } };
const POSTS: [number, number][] = [[71.0, 27.0], [74.6, 32.6], [79.6, 32.0], [81.5, 29.0], [85.5, 27.2], [89.6, 26.8], [92.6, 28.0], [95.8, 27.4], [94.3, 24.5], [92.4, 22.8], [89.0, 24.2]];

const Total: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const total = (p.beat.params as Params).fig?.total ?? "";
  const bh = m.at("bharat", 2), po = m.at("poori", 10), ze = m.at("zameeni", 18), hai = m.at("hai", 28), ks = m.at("kiska", 70), sb = m.at("sabse", 56), hs = m.at("hissa", 64);
  const frame = lerpFrame(F.north, F.india, m.lerp([bh, bh + 22], [0, 1]));
  const run = m.lerp([po, po + 40], [0, 1]);
  const sk = m.pop(hai, 12);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(hai + 3, 7)}>
        <MapView frame={frame} dim={0.5}>
          {ALL.map((n) => <Neighbour key={n} name={n} fill={n === "Bangladesh" ? "#9aa0a8" : N[n]!.fill} k={0.35 + 0.15 * m.lerp([po, po + 20], [0, 1])} />)}
          {ALL.map((n) => <BorderLine key={`b${n}`} name={n} k={run} width={12 + 6 * m.pulse(sb + 4, 8)} />)}
          <g data-probe="skip">
            {POSTS.map((ll, i) => <OnMap key={i} at={ll}>{(x, y) => {
              const k = m.pop(ze + i * 2, 12) + 0.25 * m.pulse(72 + i * 2, 5);
              if (k <= 0) return null;
              return <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k)})`}><rect x={-7} y={-44} width={14} height={44} fill="#ffffff" stroke={INK} strokeWidth={3} /><rect x={-7} y={-44} width={14} height={14} fill="#e8453c" stroke={INK} strokeWidth={3} /></g>;
            }}</OnMap>)}
          </g>
        </MapView>
        {sk > 0 ? (
          <g transform={`translate(520 ${330 + (1 - Math.min(1, sk)) * 300 - 24 * m.pulse(hs + 3, 5)})`} opacity={Math.min(1, sk * 2)}>
            <rect x={-300 + 10} y={-110 + 12} width={600} height={220} rx={26} fill={INK} opacity={0.4} />
            <Block x={-300} y={-110} w={600} h={220} r={26} fill="#1f7a45" sw={STROKE} shadow={false} />
            <rect x={-282} y={-92} width={564} height={184} rx={16} fill="none" stroke="#ffffff" strokeWidth={5} />
            <Txt x={0} y={-40} size={50} fill="#ffffff" weight={700}>ज़मीनी सीमा</Txt>
            <Txt x={0} y={44} size={90} fill={m.pulse(108, 8) > 0.3 ? "#ffd84a" : "#ffffff"} weight={900}>{total}</Txt>
          </g>
        ) : null}
        <Question x={850} y={560} k={m.pop(ks, 10)} r={70} />
      </View>
    </Stage>
  );
};

export default Total;
