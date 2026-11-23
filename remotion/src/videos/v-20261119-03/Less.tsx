// "Turn the Sahara green, and much of that dust stays put. The world's biggest rainforest would lose one of its
// fertilisers." Green sweeps over the Sahara on "Turn" and the plume's source dims on "green"; the plume thins
// and breaks over the ocean on "stays"; the camera glides west to the Amazon on "world's"; the trees sway on
// "rainforest"; a fertiliser sack on the forest edge empties on "lose" and tips over on "fertilisers".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { AMAZON, Africa, DUST, Name, RED, saharaColors } from "./props";
import { Forest, Plume } from "./Catch";

const Sack: React.FC<{ k: number; empty: number; tip: number }> = ({ k, empty, tip }) => {
  const xy = useAt()([-50, -12]);
  if (!xy || k <= 0) return null;
  const fill = 1 - 0.7 * empty;
  return (
    <g transform={`translate(${xy[0]} ${xy[1]}) rotate(${-80 * tip} 0 60) scale(${Math.min(1, k)})`}>
      <path d="M -80 60 L -90 -90 Q 0 -120 90 -90 L 80 60 Z" fill="#e8dcc0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-78} y={60 - 140 * fill} width={156} height={140 * fill} fill={DUST} opacity={0.75} />
      <Txt x={0} y={-30} size={46} fill={INK}>DUST</Txt>
    </g>
  );
};

const Arrow: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([-62, 6]);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0] + 210} ${xy[1] - 60 + 40 * k})`} opacity={Math.min(1, k)}>
      <path d="M -24 -60 L 24 -60 L 24 0 L 50 0 L 0 60 L -50 0 L -24 0 Z" fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

const Gap: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([-17, 15]), b = at([-48, -1]);
  if (!a || !b || k <= 0) return null;
  return <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * Math.min(1, k)} y2={a[1] + (b[1] - a[1]) * Math.min(1, k)} stroke="#ffffff" strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />;
};

const Settle: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([8, 21]);
  if (!xy || k <= 0) return null;
  return <g opacity={1 - 0.5 * Math.min(1, k)}>{Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={xy[0] - 90 + i * 26} cy={xy[1] - 80 + 80 * Math.min(1, k) + Math.sin(t / 5 + i) * 3} r={9} fill={DUST} stroke={INK} strokeWidth={2} />)}</g>;
};

const Less: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tu = m.at("turn", 2), gr = m.at("green", 14), st = m.at("stays", 36), wo = m.at("worlds", 56), rf = m.at("rainforest", 70), lo = m.at("lose", 86), fe = m.at("fertilisers", 100), gd = m.at("ground", 46), hf = m.at("half", 80);
  const glide = m.lerp([wo - 4, wo + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <Africa center={[-30 - 26 * glide - 3 * m.lerp([lo - 4, lo + 12], [0, 1]), 2 - 4 * glide - 4 * m.lerp([lo - 4, lo + 12], [0, 1])]} scale={480 + 420 * glide + 500 * m.lerp([lo - 4, lo + 12], [0, 1])}
          colors={saharaColors(m.lerp([tu, tu + 16], [0, 1]), 1, { Brazil: { fill: "#3f9a4c", k: 1 - 0.4 * m.lerp([lo, lo + 14], [0, 1]) } })}>
          <Plume k={1} t={m.t} thin={m.lerp([st, st + 12], [0, 1])} />
          <g opacity={1 - 0.4 * m.lerp([gr, gr + 10], [0, 1])} />
          <Forest k={1} grow={1 - 0.6 * m.lerp([lo, lo + 16], [0, 1])} sway={1 + m.pulse(rf + 4, 10) * 2} t={m.t} />
          <Name at={[-56, -15]} text="AMAZON" k={m.lerp([wo, wo + 10], [0, 1])} size={60} />
          <Sack k={m.pop(lo - 6, 12)} empty={m.lerp([lo, lo + 14], [0, 1])} tip={m.lerp([fe, fe + 10], [0, 1])} />
          <Arrow k={m.pop(fe + 2, 12)} />
          <Gap k={m.lerp([hf, hf + 14], [0, 1])} />
          <Settle k={m.lerp([gd, gd + 12], [0, 1])} t={m.t} />
        </Africa>
      </View>
    </Stage>
  );
};

export default Less;
