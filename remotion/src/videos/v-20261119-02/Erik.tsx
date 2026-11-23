// "So who named it Greenland? Over a thousand years ago, Erik the Red, a Viking sailing from Iceland, picked
// the name, supposedly to tempt settlers." The map turns sepia and the name rubs out on "named"; a year dial
// spins back on "thousand"; a longship with a red-bearded sailor appears off Iceland on "Erik", its striped
// sail fills on "Viking", it sails west on "Iceland" and lands at the south-west fjords on "picked", where the
// name GREENLAND paints back on; turf farm huts pop up along the fjords on "settlers".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { Atlantic, ERIKSFJORD, GOLD, Hut, ICELAND, SailShip } from "./props";

const ROUTE: [number, number][] = [[-22.5, 64.0], [-30, 63.2], [-40, 60.6], ERIKSFJORD];
const HUTS: [number, number][] = [[-45.6, 61.3], [-46.6, 61.0], [-44.9, 60.8], [-48.6, 62.0]];

const Viking: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Limb a={[0, 0]} b={[0, -40]} w={22} color="#4b6b8a" sw={3} />
    <Ball x={0} y={-58} r={20} fill="#e8b88a" shadow={false} sw={3} />
    <path d="M -18 -52 Q 0 -10 18 -52 Z" fill="#c4442c" stroke={INK} strokeWidth={3} />
    <path d="M -22 -64 Q 0 -96 22 -64 Z" fill="#9aa0ad" stroke={INK} strokeWidth={3} />
    <path d="M -20 -70 L -32 -88 M 20 -70 L 32 -88" stroke="#f4efe4" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Dial: React.FC<{ k: number; spin: number }> = ({ k, spin }) => k <= 0 ? null : (
  <g transform={`translate(820 430) scale(${Math.min(1, k)})`}>
    <circle r={110} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-92} x2={0} y2={-78} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-80} stroke="#c4442c" strokeWidth={9} strokeLinecap="round" transform={`rotate(${-spin * 1440})`} />
    <line x1={0} y1={0} x2={0} y2={-52} stroke={INK} strokeWidth={11} strokeLinecap="round" transform={`rotate(${-spin * 120})`} />
    <circle r={10} fill={INK} />
    <Txt x={0} y={150} size={46} fill="#ffffff" stroke={INK}>LONG AGO</Txt>
  </g>
);

const Ships: React.FC<{ k: number; sail: number; t: number; viking: number }> = ({ k, sail, t, viking }) => {
  return (
    <g>
      <MapRoute via={ROUTE} k={Math.max(0.02, k)} color="#f4e3bd" width={8} mover={(x, y, a) => (
        <g transform={`translate(0 ${Math.sin(t / 7) * 4})`}>
          <SailShip x={x} y={y - 6} s={150} angle={a} kind="viking" fill={sail} />
          {viking > 0 ? <Viking x={x + (Math.abs(a) > 90 ? -40 : 40)} y={y - 16} s={70 * Math.min(1, viking)} /> : null}
        </g>
      )} />
    </g>
  );
};

const Huts: React.FC<{ k: number[] }> = ({ k }) => {
  const at = useAt();
  return <g>{HUTS.map((h, i) => { const xy = at(h); return xy ? <Hut key={i} x={xy[0]} y={xy[1]} s={95} k={k[i] ?? 0} /> : null; })}</g>;
};

const Erik: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const named = m.at("named", 6), thou = m.at("thousand", 22), erik = m.at("erik", 40), vik = m.at("viking", 54), ice = m.at("iceland", 68), picked = m.at("picked", 90), set = m.at("settlers", 116);
  const sep = m.lerp([named, named + 10], [0, 1]);
  const push = m.lerp([picked - 6, picked + 16], [0, 1]);
  const rub = m.lerp([named, named + 12], [1, 0]);
  const repaint = m.lerp([picked, picked + 16], [0, 1]);
  return (
    <Stage p={p} bg="#6f9a9e" vignette={0.45}>
      <View zoom={1.0 + 0.12 * push + m.wave(90, 0.008)}>
        <Atlantic center={[-34 - 8 * push, 64 - 2 * push]} scale={1300 + 500 * push} near land={sep > 0.5 ? "#dcc391" : undefined} political={0.55 * (1 - sep) + 0.15}>
          <MapLabel at={[-42, 67]} text="GREENLAND" size={64} type={m.t < picked ? rub : repaint} fill={m.t < picked ? "#ffffff" : "#7fd36b"} />
          <MapLabel at={[-20.5, 67.6]} text="ICELAND" size={52} type={m.lerp([erik - 6, erik + 6], [0, 1]) * (1 - m.lerp([ice + 6, ice + 14], [0, 1]))} />
          {m.t >= erik ? <Ships k={m.lerp([ice, picked], [0.04, 1])} sail={m.lerp([vik, vik + 10], [0, 1])} t={m.t} viking={m.pop(erik + 2, 12)} /> : null}
          <Huts k={HUTS.map((_, i) => m.pop(set + i * 4, 12))} />
          <MapLabel at={[-30, 61.2]} text="ERIK THE RED" size={50} fill={GOLD} type={m.lerp([vik, vik + 10], [0, 1]) * (1 - push)} />
        </Atlantic>
        <Dial k={m.pop(thou, 12) * (1 - m.lerp([erik + 10, erik + 20], [0, 1]))} spin={m.lerp([thou, erik + 10], [0, 1])} />
      </View>
    </Stage>
  );
};

export default Erik;
