// "And here's the twist: the wobble comes round about every {fact2} years, so scientists expect the rains to return
// one day, thousands of years from now." (Rains drift north on "rains"; green pulses up on "day" and washes on "now".) A big dial board rises over the Mediterranean on "maybe"; the small globe's axis circles again on
// "wobble"; the dial's hand sweeps round on "repeats" and the figure stamps on it on "years"; the camera pulls
// back over Africa on "day"; green pulses up from the south on "comes" and the Sahara is green again on "own".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Africa, Dunes, GOLD, saharaColors } from "./props";

type Params = { fig?: { years?: string } };

const Dial: React.FC<{ k: number; hand: number; fig: string; stamp: number; ang: number }> = ({ k, hand: h0, fig, stamp, ang }) => {
  if (k <= 0) return null;
  const wedge = Math.min(0.999, h0);
  const hand = h0 % 1;
  return (
    <g transform={`translate(540 560) scale(${Math.min(1.05, k)})`}>
      <circle r={250} fill="#f4e3bd" stroke={INK} strokeWidth={8} />
      <path d={`M 0 0 L 0 -230 A 230 230 0 ${wedge > 0.5 ? 1 : 0} 1 ${Math.sin(wedge * Math.PI * 2) * 230} ${-Math.cos(wedge * Math.PI * 2) * 230} Z`} fill="#7cb35a" opacity={0.6} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-232} x2={0} y2={-206} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={Math.sin(hand * Math.PI * 2) * 200} y2={-Math.cos(hand * Math.PI * 2) * 200} stroke="#c4442c" strokeWidth={12} strokeLinecap="round" />
      <g transform={`translate(-150 -120) scale(0.45)`}>
        <Ball x={0} y={0} r={110} fill="#4a8fc4" shadow={false} sw={8} />
        <line x1={-Math.sin(ang) * 40} y1={150} x2={Math.sin(ang) * 40} y2={-150} stroke={GOLD} strokeWidth={14} strokeLinecap="round" />
      </g>
      <circle r={16} fill={INK} />
      {stamp > 0 ? (
        <g transform={`translate(0 120) scale(${1 + (1 - Math.min(1, stamp)) * 1.2})`}>
          <rect x={-200} y={-50} width={400} height={100} rx={14} fill={GOLD} stroke={INK} strokeWidth={6} />
          <Txt x={0} y={4} size={74} fill={INK}>{fig}</Txt>
        </g>
      ) : null}
      <Txt x={0} y={205} size={56} fill={INK} weight={800}>YEARS</Txt>
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const yrs = (p.beat.params as Params).fig?.years ?? "";
  const mb = m.at("twist", 10), wo = m.at("wobble", 24), re = m.at("round", 34), ye = m.at("years", 60), da = m.at("expect", 76), co = m.at("day", 100), ow = m.at("now", 118), th = m.at("thousands", 106), nw = m.at("rains", 88);
  const back = m.lerp([da - 4, da + 18], [0, 1]);
  const green = Math.max(m.lerp([co, ow + 12], [0, 1]), m.lerp([nw, nw + 10], [0, 0.25]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <Africa center={[15, 20 - 6 * back]} scale={1250 - 450 * back} colors={saharaColors(green)}>
          <Dunes k={1 - green} t={m.t} />
        </Africa>
        <Dial k={m.pop(mb, 12)} hand={m.lerp([re, ye + 6], [0, 1]) + (m.t > th ? (m.t - th) / 40 : 0)} fig={yrs} stamp={m.pop(ye, 12)} ang={m.t < wo ? 0 : (m.t - wo) / 10} />
      </View>
    </Stage>
  );
};

export default Payoff;
