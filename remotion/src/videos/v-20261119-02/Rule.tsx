// "Iceland broke away long ago. Greenland stayed, and in {fact5} it won home rule, with its own parliament in
// Nuuk, its capital." Iceland glows on its name and its ribbon to Denmark snaps on "broke", Iceland turning its
// own blue; the camera glides to Greenland on its name, its ribbon holding on "stayed"; a year board stamps onto
// the coast on "home"; a small parliament house rises at Nuuk on "parliament"; Nuuk's name writes on and
// Greenland's flag waves on "Nuuk".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Atlantic, SNOW, COPENHAGEN, Flag, ICELAND, NUUK, RED, Ribbon, Sign, Spot } from "./props";

type Params = { fig?: { year?: string } };

const House: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(NUUK);
  if (!xy || k <= 0) return null;
  const h = Math.min(1, k);
  return (
    <g transform={`translate(${xy[0] + 70} ${xy[1] + 10}) scale(1.3 ${1.3 * h})`}>
      <Block x={-70} y={-70} w={140} h={70} fill="#f4efe4" r={4} shadow="bottom" />
      <path d="M -82 -68 L 0 -112 L 82 -68 Z" fill="#3b6fb8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[-46, -16, 14, 44].map((x) => <rect key={x} x={x - 7} y={-56} width={14} height={40} fill="#c9d6e6" stroke={INK} strokeWidth={3} />)}
    </g>
  );
};

const Board: React.FC<{ k: number; year: string }> = ({ k, year }) => {
  const xy = useAt()([-44, 68.5]);
  return xy ? <Sign x={xy[0]} y={xy[1]} w={400} text={year} sub="HOME RULE" k={k} size={92} /> : null;
};

const GFlag: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(NUUK);
  return xy ? <Flag x={xy[0] + 150} y={xy[1] - 120} s={110} k={k} kind="gl" t={t} /> : null;
};

const Star: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(NUUK);
  if (!xy || k <= 0) return null;
  const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 16 : 38; const a = (i * Math.PI) / 5 - Math.PI / 2; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(" ");
  return <polygon points={pts} transform={`translate(${xy[0]} ${xy[1] - 60}) scale(${Math.min(1.2, k)})`} fill="#f2b134" stroke={INK} strokeWidth={5} />;
};

const Rule: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const ic = m.at("iceland", 4), br = m.at("broke", 14), gl = m.at("greenland", 40), st = m.at("stayed", 50), home = m.at("home", 70), par = m.at("parliament", 88), nk = m.at("nuuk", 104), lng = m.at("long", 24), own = m.at("own", 82), cap = m.at("capital", 112), and = m.at("and", 58);
  const glide = m.lerp([gl - 6, gl + 18], [0, 1]);
  const close = m.lerp([own, par + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.008)}>
        <Atlantic near center={[-12 - 32 * glide - 4 * close, 64 + 1 * glide]} scale={1200 + 500 * glide + 900 * close}
          colors={{ Iceland: { fill: "#3b7dd8", k: m.lerp([br, br + 10], [0.25, 1]), lift: m.lerp([lng, lng + 10], [0, 1]) }, Denmark: { fill: RED }, Greenland: { fill: SNOW } }}>
          <Ribbon from={COPENHAGEN} to={ICELAND} k={1} snap={m.lerp([br, br + 10], [0, 1])} bow={0.2} />
          <Ribbon from={COPENHAGEN} to={[-40, 70]} k={1} width={12 + 4 * m.pulse(st + 4, 8)} />
          <Spot at={ICELAND} name="ICELAND" k={m.lerp([ic - 4, ic + 4], [0, 1])} size={48} />
          <Board k={m.pop(and, 12)} year={m.t < home ? "" : year} />
          <House k={m.lerp([par, par + 12], [0, 1])} />
          <Spot at={NUUK} name="NUUK" k={m.lerp([nk, nk + 10], [0, 1])} size={56} left />
          <GFlag k={m.lerp([nk, nk + 10], [0, 1])} t={m.t} />
          <Star k={m.pop(cap, 12)} />
        </Atlantic>
      </View>
    </Stage>
  );
};

export default Rule;
