// "Then in {fact6} came self-rule, and with it the right to choose independence by its own vote. So the biggest
// island on Earth stays with Denmark until its {fact4} people decide otherwise." At Nuuk: a second year board
// stamps on "self-rule"; a ballot box appears on "right", a key hangs over it on "independence", ballots drop in
// on "vote"; the camera pulls back over the whole island on "biggest"; the ribbon to Denmark stretches thin on
// "stays"; the population sign rises on the ice with tiny figures along the coast on "people"; a pair of
// scissors hovers over the ribbon on "decide".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Atlantic, SNOW, COPENHAGEN, GOLD, NUUK, RED, Ribbon, Sign, Spot } from "./props";

type Params = { fig?: { year?: string; people?: string } };
const COAST: [number, number][] = [[-51.7, 64.2], [-53, 66.9], [-51.1, 69.2], [-45.5, 61.2], [-47.9, 60.9], [-37.6, 65.6], [-22, 70.5], [-53.5, 68.7], [-50.7, 63.0]];

const Box: React.FC<{ k: number; key2: number; drop: number; t: number }> = ({ k, key2, drop, t }) => {
  const xy = useAt()(NUUK);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0] + 150} ${xy[1] - 30}) scale(${Math.min(1.1, k) * 1.2})`}>
      {drop > 0 ? [0, 1, 2].map((i) => {
        const u = ((t * 3 + i * 26) % 80) / 80;
        return <rect key={i} x={-22 + i * 6} y={-150 + u * 110} width={44} height={30} fill="#ffffff" stroke={INK} strokeWidth={3} opacity={u < 0.95 ? drop : 0} />;
      }) : null}
      <Block x={-70} y={-40} w={140} h={100} fill="#f4efe4" r={6} shadow="right" />
      <rect x={-34} y={-44} width={68} height={10} fill={INK} />
      <Txt x={0} y={14} size={44} fill={INK}>VOTE</Txt>
      {key2 > 0 ? (
        <g transform={`translate(0 ${-170 + Math.sin(t / 8) * 8}) scale(${Math.min(1, key2)})`}>
          <circle cx={-34} cy={0} r={22} fill="none" stroke={GOLD} strokeWidth={12} />
          <Limb a={[-12, 0]} b={[44, 0]} w={12} color={GOLD} sw={3} />
          <Limb a={[34, 0]} b={[34, 18]} w={9} color={GOLD} sw={3} />
        </g>
      ) : null}
    </g>
  );
};

const People: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  return <g>{COAST.map((c, i) => { const xy = at(c); const kk = Math.max(0, Math.min(1, k * 1.5 - i * 0.06)); return xy && kk > 0 ? (
    <g key={i} transform={`translate(${xy[0]} ${xy[1] - Math.abs(Math.sin(t / 6 + i)) * 4}) scale(${kk})`}>
      <Limb a={[0, 0]} b={[0, -18]} w={10} color={["#c4442c", "#3b6fb8", "#2f8a57"][i % 3]!} sw={2} />
      <Ball x={0} y={-26} r={8} fill="#e8b88a" shadow={false} sw={2} />
    </g>) : null; })}</g>;
};

const PopSign: React.FC<{ k: number; people: string }> = ({ k, people }) => {
  const xy = useAt()([-40, 74]);
  return xy ? <Sign x={xy[0]} y={xy[1]} w={520} text={people} sub="PEOPLE" k={k} size={92} bg="#ffffff" /> : null;
};

const Board: React.FC<{ k: number; year: string }> = ({ k, year }) => {
  const xy = useAt()([-44, 68.5]);
  return xy ? <Sign x={xy[0]} y={xy[1]} w={400} text={year} sub="SELF-RULE" k={k} size={92} /> : null;
};

const Scissors: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-24, 67]);
  if (!xy || k <= 0) return null;
  const o = 18 + Math.sin(t / 4) * 14;
  return (
    <g transform={`translate(${xy[0]} ${xy[1] - 40}) scale(${Math.min(1, k) * 1.3})`}>
      {[o, -o].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d="M 0 0 L 90 -6 L 90 6 Z" fill="#c9d1dc" stroke={INK} strokeWidth={4} />
          <circle cx={-26} cy={0} r={18} fill="none" stroke={RED} strokeWidth={10} />
        </g>
      ))}
      <circle r={6} fill={INK} />
    </g>
  );
};

const Vote: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const self = m.at("self-rule", 8), right = m.at("right", 26), ind = m.at("independence", 44), vote = m.at("vote", 62), big = m.at("biggest", 84), stays = m.at("stays", 104), dkw = m.at("denmark", 116), until = m.at("until", 126), cnt = m.at("count", 128), ppl = m.at("people", 136), dec = m.at("decide", 160);
  const back = m.lerp([big - 4, big + 22], [0, 1]);
  const thin = m.lerp([stays, stays + 16], [12, 5]) * (1 + 0.5 * m.pulse(dkw + 4, 8));
  const fray = m.t >= until ? Math.sin(m.t * 1.7) * 6 : 0;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.008)}>
        <Atlantic near center={[-46 + 14 * back, 66 + 4.5 * back]} scale={2600 - 1720 * back}
          colors={{ Greenland: { fill: SNOW }, Denmark: { fill: RED, lift: m.pulse(dkw + 6, 10) } }}>
          <g transform={`translate(0 ${fray})`}><Ribbon from={COPENHAGEN} to={[-40, 70]} k={back > 0 ? 1 : 0} width={thin} /></g>
          <Board k={m.pop(self, 12) * (1 - back)} year={f.year ?? ""} />
          <Box k={m.pop(right, 12) * (1 - back)} key2={m.pop(ind, 12)} drop={m.lerp([vote, vote + 6], [0, 1])} t={m.t} />
          <Spot at={NUUK} name="NUUK" k={1 - back} size={50} left />
          <People k={m.lerp([ppl, ppl + 20], [0, 1])} t={m.t} />
          <PopSign k={m.pop(cnt, 12)} people={countText(f.people ?? "", m.lerp([cnt, ppl + 4], [0.3, 1]))} />
          <Scissors k={m.pop(dec, 12)} t={m.t} />
        </Atlantic>
      </View>
    </Stage>
  );
};

export default Vote;
