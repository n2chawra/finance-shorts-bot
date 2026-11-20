// "It keeps that going for {fact3} hours, until the top lake is nearly empty." Close over Marchlyn Mawr:
// its shoreline shrinks; a clock sign on the dam starts turning on "going" and counts the hours; on "top"
// the camera rises over the lake; on "empty" mud shows on its bed with a little boat sitting on it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, SourceLine, Stage, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Lake, MARCHLYN, Mountain, Sign, Tunnel, Valley } from "./props";

type Params = { fig?: { hours?: string } };

const Clock: React.FC<{ k: number; turn: number; text: string }> = ({ k, turn, text }) => {
  const xy = useAt()(MARCHLYN);
  if (!xy || k <= 0) return null;
  const x = Math.max(300, Math.min(560, xy[0] - 200)), y = Math.max(560, xy[1] - 330);
  const a = turn * 360 * 6;
  return (
    <g>
      <Sign x={x} y={y} w={420} label="HOURS" value={text} k={k} />
      <g transform={`translate(${x + 330} ${y - 130}) scale(${Math.min(1, k)})`}>
        <Ball x={0} y={0} r={80} fill="#ffffff" sw={6} />
        <Limb a={[0, 0]} b={[Math.sin((a * Math.PI) / 180) * 60, -Math.cos((a * Math.PI) / 180) * 60]} w={10} color={INK} sw={2} />
        <Limb a={[0, 0]} b={[Math.sin((a / 12 * Math.PI) / 180) * 40, -Math.cos((a / 12 * Math.PI) / 180) * 40]} w={12} color="#d9483b" sw={2} />
      </g>
    </g>
  );
};

const Boat: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(MARCHLYN);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)} transform={`translate(${xy[0] + 40} ${xy[1] + 10}) rotate(${-12 + Math.sin(t / 12) * 2})`}>
      <path d="M -70 0 L 70 0 L 50 30 L -50 30 Z" fill="#c8553d" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Limb a={[0, 0]} b={[0, -80]} w={8} color="#7a5230" sw={3} />
      <path d="M 4 -76 L 54 -20 L 4 -20 Z" fill="#f4efe4" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const Hours: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hrs = (p.beat.params as Params).fig?.hours ?? "";
  const ke = m.at("keeps", 2), go = m.at("going", 20), hr = m.at("hours", 40), tp = m.at("top", 65), em = m.at("empty", 90);
  const rise = m.lerp([tp - 4, tp + 20], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <Valley center={[-4.07 - 0.012 * rise, 53.142 - 0.008 * rise]} scale={1500000 * (1 - 0.45 * rise)}>
          <Mountain />
          <Lake at={MARCHLYN} rx={170} ry={100} level={m.lerp([ke, em + 10], [1, 0.25])} seed={2} rot={-0.3} t={m.t} />
          <Tunnel k={1} flow={1 - m.lerp([em, em + 10], [0, 1])} t={m.t} />
          <Boat k={m.lerp([em, em + 10], [0, 1])} t={m.t} />
          <Clock k={m.pop(go, 12)} turn={m.lerp([go, m.end], [0, 1])} text={countText(hrs, m.lerp([hr - 6, hr + 14], [0, 1]))} />
        </Valley>
      </View>
      <SourceLine p={p} />
    </Stage>
  );
};

export default Hours;
