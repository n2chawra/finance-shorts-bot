// "How far could that go? Up the Ob, across to the Yenisei, on to the Lena, dragging the boats from river to
// river." All of Siberia: each river traces in blue on its name with a fort popping on it, the camera pushes in
// on men hauling a boat over the land between the Yenisei and the Lena, then pulls back as red runs east.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, Boat, Cossack, FORTS, Fort, LENA, Line, OB, RIVER, RedLand, Ridge, WOOD, YENISEI, type LL } from "./props";

const PORTAGE: [LL, LL] = [[102.7, 58.0], [105.7, 56.8]];

const Forts: React.FC<{ ks: number[]; s: number; t: number }> = ({ ks, s, t }) => {
  const at = useAt();
  return <g>{FORTS.slice(1, 4).map((f, i) => { const xy = at(f); return xy && ks[i]! > 0 ? <Fort key={i} x={xy[0]} y={xy[1]} s={s} k={1} flag={ks[i]!} t={t} /> : null; })}</g>;
};

const Haul: React.FC<{ k: number; t: number; s: number }> = ({ k, t, s }) => {
  const at = useAt();
  const a = at(PORTAGE[0]), b = at(PORTAGE[1]);
  if (!a || !b || k <= 0) return null;
  const f = 0.2 + 0.6 * k;
  const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
  const pull = Math.sin(t / 5) * 6;
  return (
    <g opacity={Math.min(1, k * 4)}>
      <Line via={[PORTAGE[0], PORTAGE[1]]} k={1} color="#c9a25a" w={8} dash />
      {[-50, 0, 50].map((dx, i) => <Ball key={i} x={x + dx * s / 100} y={y + 18 * s / 100} r={10 * s / 100} fill={WOOD} sw={3} shadow={false} />)}
      <Boat x={x} y={y} s={s} rot={20} crew={0} />
      <Limb a={[x + 90 * s / 100, y]} b={[x + 190 * s / 100 + pull, y + 30 * s / 100]} w={4} color="#3a2a1a" sw={1} />
      <Cossack x={x + 200 * s / 100 + pull} y={y + 60 * s / 100} s={s * 0.8} arm={-0.5} />
      <Cossack x={x + 260 * s / 100 + pull} y={y + 72 * s / 100} s={s * 0.8} arm={-0.5} coat="#3b5b8c" />
    </g>
  );
};

const NEWF: LL = [125, 61.6];
const NewFort: React.FC<{ k: number; flash: number; run: number; t: number }> = ({ k, flash, run, t }) => {
  const at = useAt();
  const a = at(NEWF), b = at([137, 60.6]);
  if (!a || !b || k <= 0) return null;
  return (
    <g>
      {flash > 0 ? <circle cx={a[0]} cy={a[1] - 30} r={60 + 90 * (1 - flash)} fill="none" stroke="#ffe08a" strokeWidth={10} opacity={flash} /> : null}
      <Fort x={a[0]} y={a[1]} s={70} k={k} flag={k} t={t} />
      {run > 0 ? <Boat x={a[0] + (b[0] - a[0]) * run} y={a[1] + (b[1] - a[1]) * run + 20} s={70} crew={3} oar={t / 3} leader /> : null}
    </g>
  );
};

const Rivers: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fa = m.at("far", 4), ob = m.at("ob", 22), ye = m.at("yenisei", 40), le = m.at("lena", 58), dr = m.at("dragging", 72), ri = m.at("river", 92), nw = m.at("new", 110), sta = m.at("start", 122), rn = m.at("run", 130);
  const inn = m.lerp([dr - 6, dr + 10], [0, 1]) * (1 - m.lerp([ri - 4, ri + 14], [0, 1]));
  const east = 70 + 14 * m.lerp([ob, ob + 16], [0, 1]) + 12 * m.lerp([ye, ye + 16], [0, 1]) + 18 * m.lerp([le, le + 16], [0, 1]) + 8 * m.lerp([ri, ri + 24], [0, 1]) + 10 * m.lerp([sta, sta + 20], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <Asia center={[100 + 4 * inn - 6 * m.lerp([0, fa + 10], [1, 0]), 61 - 3.5 * inn]} scale={620 + 980 * inn + 260 * m.lerp([0, fa + 10], [1, 0])}>
          <RedLand east={east} id="v1123r" front={1} o={0.6} />
          <Ridge k={1} s={0.8} />
          <Line via={OB} k={m.lerp([ob - 2, ob + 16], [0, 1])} color={RIVER} w={12} />
          <Line via={YENISEI} k={m.lerp([ye - 2, ye + 16], [0, 1])} color={RIVER} w={12} />
          <Line via={LENA} k={m.lerp([le - 2, le + 16], [0, 1])} color={RIVER} w={12} />
          <MapLabel at={[76, 66.5]} text="OB" size={58} k={m.pop(ob, 10)} />
          <MapLabel at={[94.5, 66]} text="YENISEI" size={58} k={m.pop(ye, 10)} />
          <MapLabel at={[118, 65.5]} text="LENA" size={58} k={m.pop(le, 10)} />
          <Forts ks={[m.pop(ob + 8, 10), m.pop(ye + 8, 10), m.pop(le + 8, 10)]} s={70 + 40 * inn} t={m.t} />
          <Haul k={inn} t={m.t} s={70} />
          <NewFort k={m.pop(nw, 10)} flash={m.pulse(sta + 3, 8)} run={m.lerp([rn, m.end], [0, 1])} t={m.t} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Rivers;
