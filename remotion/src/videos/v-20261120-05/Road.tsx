// "Here's the catch: one country means one set of road rules. Britain, India and Japan drive on the left, so
// millions of drivers switch sides overnight." The light turns to evening over the one-colour world; a big
// KEEP LEFT sign drops on the map on "rules"; Britain, India and Japan trace and fill on their words, cars on
// the left of each; arrows point left; more cars fill the roads; on "switch" every car swerves to the right
// and the sign flips to KEEP RIGHT.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Char } from "../../flat/cast";
import { Car, World } from "./props";

const LEFTIES: { name: string; at: [number, number]; flag: string }[] = [
  { name: "United Kingdom", at: [-2, 53], flag: "United Kingdom" }, { name: "India", at: [79, 22], flag: "India" }, { name: "Japan", at: [138, 36.5], flag: "Japan" },
];

const Cars: React.FC<{ show: (i: number) => number; many: number; swap: number; t: number }> = ({ show, many, swap, t }) => {
  const at = useAt();
  return (
    <g>
      {LEFTIES.map((c, i) => {
        const xy = at(c.at);
        const k = show(i);
        if (!xy || k <= 0) return null;
        const n = 1 + Math.round(2 * many);
        return (
          <g key={c.name} opacity={Math.min(1, k * 2)}>
            <rect x={xy[0] - 40} y={xy[1] - 150} width={80} height={300} rx={10} fill="#4a4f5c" stroke={INK} strokeWidth={4} />
            <Limb a={[xy[0], xy[1] - 140]} b={[xy[0], xy[1] + 140]} w={3} color="#f4efe4" sw={0} />
            {Array.from({ length: n }, (_, j) => {
              const y = xy[1] + 120 - ((t * 3 + j * 80) % 250);
              return <Car key={j} x={xy[0] - 20 + 40 * swap} y={y} s={52} angle={-90 + 30 * Math.sin(swap * Math.PI)} color={["#d9483b", "#3b7dd8", "#f2b134"][j % 3]} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

const RoadSign: React.FC<{ k: number; right: number }> = ({ k, right }) => {
  if (k <= 0) return null;
  const flip = Math.abs(Math.cos(right * Math.PI));
  return (
    <g transform={`translate(540 ${360 - (1 - Math.min(1, k)) * 300})`}>
      <Limb a={[0, 60]} b={[0, 200]} w={16} color="#9aa0ad" sw={4} />
      <g transform={`scale(${Math.max(0.1, flip)} 1)`}>
        <Block x={-230} y={-90} w={460} h={160} fill={right > 0.5 ? "#3a9d5d" : "#3b6fb5"} r={20} />
        <Txt x={0} y={-10} size={64} fill="#ffffff">{right > 0.5 ? "KEEP RIGHT" : "KEEP LEFT"}</Txt>
      </g>
    </g>
  );
};

const SignAtUK: React.FC<{ k: number; right: number; shock: boolean }> = ({ k, right, shock }) => {
  const xy = useAt()(LEFTIES[0]!.at);
  if (!xy) return null;
  return (
    <g>
      {k > 0 ? <Limb a={[Math.max(250, xy[0]), xy[1] - 330]} b={[xy[0], xy[1] - 10]} w={14} color="#9aa0ad" sw={4} /> : null}
      <g transform={`translate(${Math.max(250, xy[0]) - 540} ${xy[1] - 400 - 360})`}>
        <RoadSign k={k} right={right} />
      </g>
      {k > 0 ? <Char x={xy[0] + 110} y={xy[1] + 40} s={70} face={shock ? "shock" : "neutral"} armR={[150, 20]} armL={[20, 10]} /> : null}
    </g>
  );
};

const Road: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const cy = m.at("country", 20), sd = m.at("sides", 170);
  const ca = m.at("catch", 4), ru = m.at("rules", 40), br = m.at("britain", 70), in_ = m.at("india", 80), ja = m.at("japan", 90), le = m.at("left", 110), mi = m.at("millions", 130), sw = m.at("switch", 150);
  const fr = [br, in_, ja];
  const extra: Record<string, { fill: string; k: number; trace: number; flag: string }> = {};
  LEFTIES.forEach((c, i) => { extra[c.name] = { fill: "#e8453c", k: m.lerp([fr[i]!, fr[i]! + 10], [0, 1]), trace: m.lerp([fr[i]!, fr[i]! + 20], [0.001, 1]), flag: c.flag }; });
  const close = m.lerp([br - 4, br + 14], [0, 1]) * (1 - m.lerp([mi - 4, mi + 14], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + 0.15 * close + m.wave(70, 0.01)} cx={540 - 140 * close} cy={960 - 40 * close}>
        <World center={[68, 36]} scale={320} merge={() => 1} extra={extra}>
          <Cars show={() => 1} many={m.lerp([mi, mi + 10], [0, 1])} swap={m.lerp([sw, sw + 14], [0, 1]) + 0.15 * m.pulse(sd + 4, 6)} t={m.t} />
          {LEFTIES.map((c, i) => <Arrow key={c.name} at={c.at} k={m.pop(le + i * 3, 12)} />)}
          <SignAtUK k={m.pop(ru, 12)} right={m.lerp([sw, sw + 12], [0, 1])} shock={m.t > sw} />
        </World>
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#fff3c4" opacity={0.3 * m.pulse(cy + 5, 8)} />
      <rect x={0} y={0} width={1080} height={1920} fill="#ff8a3d" opacity={0.16 * m.lerp([ca, ca + 14], [0, 1])} />
      
    </Stage>
  );
};

const Arrow: React.FC<{ at: [number, number]; k: number }> = ({ at, k }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return <Txt x={Math.max(110, Math.min(900, xy[0] - 10))} y={xy[1] - 200} size={90 * Math.min(1, k)} fill="#ffffff" stroke={INK}>←</Txt>;
};

export default Road;
