// "It began in the eighteen-eighties as a fence against rabbits, and against rabbits it failed. So why keep it?" A
// stretch of the early wire in the outback turns sepia like an old photograph; rabbits pour across the land at it,
// slip under and through, a red cross stamps on the wire, the camera pulls back and a question mark pops over it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, Stage, View, motion, rng } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Fence, Map, Panel, QMark, Sides, mix, type LL, SeaMarks } from "./props";

const AT: LL = [137.6, -29.3];
const R = rng("rabbits-25-11");
const BUNS = Array.from({ length: 14 }, (_, i) => ({ x: -420 + R() * 840, y: -520 + R() * 160, d: i * 2.2, ph: R() * 6 }));

const Bunny: React.FC<{ x: number; y: number; s: number; hop: number }> = ({ x, y, s, hop }) => (
  <g transform={`translate(${x},${y - Math.abs(Math.sin(hop)) * s * 0.35})`}>
    <ellipse cx={0} cy={Math.abs(Math.sin(hop)) * s * 0.35} rx={s * 0.4} ry={s * 0.07} fill="#000" opacity={0.2} />
    <Ball x={0} y={-s * 0.25} r={s * 0.34} ry={s * 0.25} fill="#a89a8a" sw={3} shadow={false} />
    <Ball x={s * 0.3} y={-s * 0.45} r={s * 0.17} fill="#a89a8a" sw={3} shadow={false} />
    <Limb a={[s * 0.26, -s * 0.58]} b={[s * 0.2, -s * 0.92]} w={s * 0.09} color="#a89a8a" sw={2} />
    <Limb a={[s * 0.36, -s * 0.58]} b={[s * 0.42, -s * 0.9]} w={s * 0.09} color="#a89a8a" sw={2} />
    <circle cx={-s * 0.34} cy={-s * 0.24} r={s * 0.09} fill="#ffffff" stroke={INK} strokeWidth={2} />
    <circle cx={s * 0.36} cy={-s * 0.47} r={s * 0.03} fill={INK} />
  </g>
);

const Scene: React.FC<{ wire: number; sepia: number; run: number; through: number; cross: number; q: number; t: number }> = ({ wire, sepia, run, through, cross, q, t }) => {
  const xy = useAt()(AT);
  if (!xy) return null;
  const [x, y] = xy;
  return (
    <g>
      {[-480, -240, 0, 240].map((dx, i) => <Panel key={i} x={x + dx} y={y + 20} h={170} w={240} k={Math.max(0, Math.min(1, wire * 3 - i * 0.5))} />)}
      <rect x={x - 560} y={y - 640} width={1120} height={900} fill="#a0703a" opacity={0.22 * sepia} />
      {BUNS.map((b, i) => {
        const k = Math.max(0, Math.min(1, run * 1.6 - i * 0.04));
        if (k <= 0) return null;
        const yy = y + b.y + (520 * k) + 260 * Math.max(0, through - i * 0.03);
        return <Bunny key={i} x={x + b.x + Math.sin(t / 8 + b.ph) * 12} y={yy} s={70} hop={t / 4 + b.ph} />;
      })}
      {cross > 0 ? (
        <g transform={`translate(${x},${y - 80}) scale(${1.6 - 0.6 * Math.min(1, cross)})`} opacity={Math.min(1, cross * 2)}>
          <Limb a={[-110, -110]} b={[110, 110]} w={40} color="#e0352b" />
          <Limb a={[110, -110]} b={[-110, 110]} w={40} color="#e0352b" />
        </g>
      ) : null}
      <QMark x={x} y={y - 420} size={150} k={q} t={t} />
    </g>
  );
};

const Rabbits: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const be = m.at("began", 2), ei = m.at("eighteen-eighties", 14), fe = m.at("fence", 40), ra = m.at("rabbits", 54), fa = m.at("failed", 90), wh = m.at("why", 110), ke = m.at("keep", 120);
  const back = m.lerp([wh, wh + 24], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <Map center={[AT[0], AT[1] + 0.6 + 0.25 * back]} scale={mix(9500, 7000, back) + 300 * m.lerp([be, ra], [0, 1])}>
          <Sides dingo={0.45} sheep={0.55} />
          <SeaMarks t={m.t} />
          <Fence w={12} />
          <Scene wire={m.lerp([be, fe + 10], [0, 1])} sepia={m.lerp([ei, ei + 16], [0, 1])} run={m.lerp([ra, fa], [0, 1])} through={m.lerp([fa - 6, fa + 30], [0, 1])}
            cross={m.lerp([fa, fa + 8], [0, 1])} q={m.pop(ke)} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Rabbits;
