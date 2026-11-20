// "And one country still can't share one clock: the sun sets over Tokyo just as London wakes up." A big
// clock stands on the one-colour world; the day line sweeps across the map; the sun sinks over Tokyo while
// dusk covers the east; London sits in early morning light, and on "wakes" a little man there sits up in
// bed and stretches.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { LONDON, Spot, TOKYO, World } from "./props";

const Sun: React.FC<{ k: number; sink: number }> = ({ k, sink }) => {
  const xy = useAt()(TOKYO);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <circle cx={Math.min(860, xy[0])} cy={xy[1] - 220 + 160 * sink} r={70} fill="#ffb347" stroke={INK} strokeWidth={6} />
    </g>
  );
};

const Sleeper: React.FC<{ k: number; up: number; t: number }> = ({ k, up, t }) => {
  // the bed in a bubble tied to London: the man there wakes as Tokyo's sun sets
  const xy = useAt()(LONDON);
  if (!xy || k <= 0) return null;
  const x = 300, y = 1180;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <path d={`M${xy[0]},${xy[1]} L${x},${y - 140}`} stroke={INK} strokeWidth={5} strokeDasharray="14 10" />
      <ellipse cx={x} cy={y - 40} rx={200} ry={150} fill="#fff6dc" stroke={INK} strokeWidth={6} />
      <Block x={x - 120} y={y - 30} w={240} h={70} fill="#c8553d" r={10} sw={5} />
      <g transform={`rotate(${-80 * (1 - up)} ${x - 40} ${y})`}>
        <Char x={x - 40} y={y + 10} s={60} face={up > 0.5 ? "happy" : "neutral"} blink={up < 0.5} armL={[150 * up, 20]} armR={[150 * up + Math.sin(t / 5) * 10 * up, 20]} sit />
      </g>
      <Block x={x - 120} y={y + 20} w={240} h={40} fill="#f4efe4" r={8} sw={5} />
    </g>
  );
};

const Clocks: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sh = m.at("share", 2), zo = m.at("zones", 100);
  const cl = m.at("clock", 4), su = m.at("sun", 25), se = m.at("sets", 35), to = m.at("tokyo", 45), lo = m.at("london", 60), wa = m.at("wakes", 75);
  const line = m.lerp([su, m.end], [420, 620], (x) => x);
  const hand = m.t / 4;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + 0.05 * m.lerp([wa - 4, wa + 12], [0, 1]) + m.wave(70, 0.01)}>
        <World center={[68, 42]} scale={300} merge={() => 1}>
          <Sun k={m.pop(su, 12)} sink={m.lerp([se, to + 20], [0, 1])} />
          <Spot at={TOKYO} name="TOKYO" k={m.pop(to, 12) * (1 - m.lerp([wa - 6, wa], [0, 1]))} left />
          <Spot at={LONDON} name="LONDON" k={Math.max(0.6, m.pop(lo, 12))} />
          <Sleeper k={Math.max(0.6, m.pop(lo, 12))} up={m.lerp([wa, wa + 14], [0, 1])} t={m.t} />
        </World>
        <rect x={line} y={-200} width={1400} height={2400} fill="#0e1b36" opacity={0.35 * m.lerp([su, su + 12], [0, 1])} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={60 + i * 130} y={-200} width={6} height={2400 * m.lerp([zo + i, zo + i + 10], [0, 1])} fill="#ffffff" opacity={0.6} />)}
      </View>
      {m.t >= 0 ? (
        <g transform={`translate(540 ${400 + 30 * m.pulse(cl + 4, 6)}) rotate(${8 * Math.sin(m.t / 2) * m.pulse(sh + 8, 10)})`}>
          <Ball x={0} y={0} r={140} fill="#ffffff" sw={8} />
          <Limb a={[0, 0]} b={[Math.sin(hand) * 100, -Math.cos(hand) * 100]} w={12} color={INK} sw={2} />
          <Limb a={[0, 0]} b={[Math.sin(hand / 12) * 70, -Math.cos(hand / 12) * 70]} w={16} color="#d9483b" sw={2} />
        </g>
      ) : null}
    </Stage>
  );
};

export default Clocks;
