// "No. One slice, Marie Byrd Land, has no flag at all: no country claims it." The camera swings to the gap between
// New Zealand's and Chile's slices; an empty white slice outlines itself; MARIE BYRD LAND writes across it; a pin
// drops in its middle; an empty flagpole rises with no flag; the neighbours' flags turn toward it; a NO CLAIM sign
// stamps on the empty slice as the camera pushes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { ClaimSlice } from "../../flat/polar";
import { ALL, AntMap, BYRD, BYRD_CAM, ClaimFlag, Floes, Frost, Name, SEA, Slices, between } from "./props";

const Pole: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-125, -82]);
  if (!xy || k <= 0) return null;
  const h = 220 * Math.min(1, k);
  return (
    <g transform={`translate(${xy[0]} ${xy[1]})`}>
      <ellipse cx={0} cy={4} rx={28} ry={10} fill="#1d1a2b" opacity={0.3} />
      <line x1={0} y1={0} x2={0} y2={-h} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-h} stroke="#d8d2c4" strokeWidth={5} strokeLinecap="round" />
      <path d={`M 4 ${-h + 6} q ${30 + Math.sin(t / 7) * 6} 10 60 0`} fill="none" stroke="#d8d2c4" strokeWidth={4} strokeDasharray="10 8" />
    </g>
  );
};
const NoSign: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([-112, -77]);
  return xy ? <Tag x={xy[0] - 190} y={xy[1] - 60} w={380} h={110} text="NO CLAIM" size={60} bg="#fff4d0" rot={-6} k={k} /> : null;
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const no = m.at("no", 2), sl = m.at("slice", 14), ma = m.at("marie", 24), la = m.at("land", 40), fl = m.at("flag", 56), co = m.at("country", 72), cl = m.at("claims", 84);
  const cam0 = between({ center: [0, -90], scale: 900 }, BYRD_CAM, m.lerp([no, sl + 18], [0, 1]));
  const cam = between(cam0, { center: [-118, -80], scale: 2000 }, m.lerp([cl, cl + 24], [0, 1]));
  const turn = m.lerp([co, co + 10], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1000}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={60} />
          <Slices s={ALL({ frost: 0.6 })} />
          <ClaimSlice from={BYRD.from} to={BYRD.to} k={m.lerp([sl, sl + 18], [0, 1])} fill="#ffffff" opacity={0.75} glow={m.pulse(sl + 16, 10)} />
          <Frost k={0.5} t={m.t} n={50} />
          <Name at={[-120, -76.5]} text="MARIE BYRD LAND" size={56} fill="#24405e" type={m.lerp([ma, ma + 18], [0, 1])} />
          <MapPin at={BYRD.at} k={m.pop(la)} r={24} />
          <Pole k={m.lerp([fl, fl + 12], [0, 1])} t={m.t} />
          <ClaimFlag id="nz" k={1} t={m.t} dx={-40 * turn} />
          <ClaimFlag id="chile" k={1} t={m.t} dx={40 * turn} />
          <NoSign k={m.pop(cl)} />
        </AntMap>
      </View>
    </Stage>
  );
};
export default Payoff;
