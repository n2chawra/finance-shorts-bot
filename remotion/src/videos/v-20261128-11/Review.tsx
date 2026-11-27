// "From 2048, the treaty's voting members can ask to rewrite the rules. But is every slice taken?" The slider runs
// forward past today to the year; the ring of the voting members' flags flickers; a hand goes up from the treaty
// scroll; on "rewrite" a magnifying glass slides over it and the frost thins; on "every" each slice's edge lights in
// turn; on "taken" the one gap between the slices flickers dark.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { ClaimSlice } from "../../flat/polar";
import { ALL, AntMap, BYRD, CLAIMS, FlagRing, Floes, Frost, SEA, SIGNERS, Scroll, Slices, YearBar, mix } from "./props";

type Params = { fig?: { review?: string } };

const Review: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = Number((p.beat.params as Params).fig?.review ?? "0");
  const yr = m.at("year", 2), vo = m.at("voting", 20), as = m.at("ask", 34), re = m.at("rewrite", 44), ru = m.at("rules", 54), ev = m.at("every", 76), ta = m.at("taken", 92);
  const ids = Object.keys(CLAIMS);
  const lit = (i: number) => m.pulse(ev + i * 3 + 4, 6);
  const s = ALL({ frost: 1 - 0.6 * m.lerp([ru, ru + 14], [0, 1]) });
  ids.forEach((id, i) => { s[id] = { ...s[id], glow: lit(i) }; });
  const gx = mix(-200, 540, m.lerp([re - 4, re + 14], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + 0.05 * m.lerp([re, re + 20], [0, 1]) + m.wave(80, 0.01)} cx={540} cy={1060}>
        <AntMap cam={{ center: [60, -78], scale: 1500 }}>
          <Floes t={m.t} n={50} />
          <Slices s={s} />
          <ClaimSlice from={BYRD.from} to={BYRD.to} fill="#1d2a3a" opacity={0.5 * Math.abs(Math.sin((m.t - ta) / 3)) * m.lerp([ta, ta + 4], [0, 1])} />
          <Frost k={1 - 0.6 * m.lerp([ru, ru + 14], [0, 1])} t={m.t} n={70} />
          <FlagRing names={SIGNERS} k={1} lat={-66} w={96} t={m.t} flicker={m.lerp([vo, vo + 6], [0, 1]) * (1 - m.lerp([as + 10, as + 16], [0, 1]))} />
        </AntMap>
      </View>
      <YearBar year={mix(1959, year, m.lerp([0, yr + 18], [0, 1]))} flash={m.pulse(yr + 18, 8)} />
      <Scroll x={160} y={420} w={760} k={m.lerp([0, 10], [0.6, 1])} title="RULES REVIEW" figure={`FROM ${(p.beat.params as Params).fig?.review ?? ""}`} />
      {m.t >= as ? <g transform={`translate(790 ${720 - 60 * m.pop(as)})`}><Limb a={[0, 80]} b={[0, -20]} w={28} color="#f2c79a" /><Ball x={0} y={-36} r={26} fill="#f2c79a" /></g> : null}
      {m.t >= re - 4 ? (
        <g transform={`translate(${gx} 600)`}>
          <circle r={110} fill="#dff3fb" opacity={0.25} stroke={INK} strokeWidth={14} />
          <circle r={110} fill="none" stroke="#c9a76a" strokeWidth={7} />
          <Limb a={[78, 78]} b={[170, 170]} w={30} color="#6b4a2b" />
        </g>
      ) : null}
    </Stage>
  );
};
export default Review;
