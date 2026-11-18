// Hook: "Split Elon Musk's money, and every billionaire's, with everyone. Your cut?"
// A rocket launch pad at dusk: a rocket marked ELON MUSK beside a mountain of gold coins (frame 0). The pile swells
// and a MUSK flag pops on "Musk's", more gold mountains rise along the horizon on "every", then a cut on "everyone"
// to a square packed with people seen from above, hands going up, and Rohan holding out an empty cup with a
// YOUR CUT? tag on "cut".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Flash, Glow, Stage, Tag, Txt, View, motion, rng, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GoldPile, Rocket, Topdown } from "./props";

/** The launch pad at dusk, shared with the loop. */
export const Pad: React.FC<{ m: Motion; swell: number; flag: number; others: number; children?: React.ReactNode }> = ({ m, swell, flag, others, children }) => (
  <g>
    <defs>
      <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2350" /><stop offset="0.6" stopColor="#c85a5a" /><stop offset="1" stopColor="#f2a65a" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={1880} height={1700} fill="url(#dusk)" />
    <Glow x={760} y={1000} r={420} color="#ffd08a" o={0.5} />
    {/* the other billionaires' mountains on the horizon */}
    {[[-160, 0.0], [700, 0.25], [900, 0.5], [-40, 0.7]].map(([x, d], i) => (
      <g key={i} opacity={others > d! ? 1 : 0}>
        <GoldPile x={x!} y={1000} w={360} k={Math.min(1, Math.max(0, (others - d!) * 3))} t={m.t} seed={`o${i}`} />
      </g>
    ))}
    <rect x={-400} y={1000} width={1880} height={900} fill="#5b4a5e" />
    <rect x={-400} y={1250} width={1880} height={700} fill="#463848" />
    <Rocket x={150} y={1260} h={940} label="ELON MUSK" t={m.t} fire={0.6} />
    <GoldPile x={430} y={1260} w={600} k={0.82 + 0.18 * swell} t={m.t} seed="musk" />
    {/* falling coins */}
    {Array.from({ length: 6 }).map((_, i) => {
      const ph = (m.t * 6 + i * 37) % 200;
      return <Coin key={i} x={560 + i * 60} y={760 + ph * 2.4} r={20} spin={Math.abs(Math.cos(m.t / 5 + i))} />;
    })}
    {/* the MUSK flag on top of the pile */}
    <g transform={`translate(730 ${1260 - 600 * 0.62 * (0.82 + 0.18 * swell)}) scale(${flag}) translate(-730 0)`} opacity={flag > 0 ? 1 : 0}>
      <Block x={726} y={-250} w={10} h={250} fill="#6c7385" shadow={false} />
      <Tag x={736} y={-250} w={240} h={100} text="MUSK" size={60} bg="#ffffff" fg="#c0392b" k={flag} />
    </g>
    {children}
  </g>
);

const Square: React.FC<{ m: Motion; up: number; ask: number }> = ({ m, up, ask }) => {
  const r = rng("crowd");
  const colors = ["#e9473b", "#2f7bd8", "#4fb36a", "#f5c542", "#9b59b6", "#e67e22", "#1abc9c"];
  const people = Array.from({ length: 90 }).map((_, i) => ({ x: -120 + (i % 10) * 140 + r() * 50, y: 150 + Math.floor(i / 10) * 135 + r() * 40, c: colors[Math.floor(r() * colors.length)]!, d: r() }));
  return (
    <g>
      <rect x={-400} y={-400} width={1880} height={2700} fill="#cfc3a8" />
      {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-400} y={-300 + i * 160} width={1880} height={6} fill="#b8ab8e" />)}
      {people.map((q, i) => <Topdown key={i} x={q.x} y={q.y + m.wave(30, 4, q.d * 6)} s={46} color={q.c} up={Math.min(1, Math.max(0, up * 1.6 - q.d * 0.6))} />)}
      <Glow x={540} y={1050} r={380} color="#fff2c0" o={0.5} />
      <Char x={540} y={1330 + m.wave(50, 4)} s={170} who="rohan" face={ask > 0 ? "worried" : "happy"} look={[0, -1]}
        armR={[140, 150]} armL={[30, 20]}
        holdR={(h) => (
          <g>
            <path d={`M ${h[0] - 46} ${h[1] - 80} L ${h[0] + 46} ${h[1] - 80} L ${h[0] + 34} ${h[1] + 10} L ${h[0] - 34} ${h[1] + 10} Z`} fill="#ffffff" stroke="#1d1a2b" strokeWidth={6} />
          </g>
        )} />
      {ask > 0 ? <Tag x={520} y={560} w={400} h={130} text="YOUR CUT?" size={66} bg="#ffd34a" rot={-6} k={ask} /> : null}
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const musk = m.at("musks", 8), every = m.at("every", 22), hand = m.at("everyone", 34), yours = m.at("cut", 60), alive = hand + 6;
  const swell = m.lerp([musk - 2, musk + 14], [0, 1], Easing.out(Easing.back(1.4)));
  const flag = m.pop(musk + 2);
  const others = m.lerp([every - 2, hand - 4], [0, 1]);
  const ask = m.pop(yours - 1);
  const up = m.lerp([alive - 4, alive + 10], [0, 1]);
  const shot2 = m.t >= hand - 1;
  const wide = m.lerp([every - 4, every + 14], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      {!shot2 ? (
        <Stage p={p} bg="#2b2350" vignette={0.38}>
          <View zoom={1.12 - 0.12 * wide} cx={560 + m.wave(50, 10)} cy={880 + 60 * wide + m.wave(64, 8)}>
            <Pad m={m} swell={swell} flag={flag} others={others} />
          </View>
        </Stage>
      ) : (
        <Stage p={p} bg="#cfc3a8" vignette={0.36}>
          <View zoom={m.lerp([hand, yours + 8], [1.0, 1.12])} cx={540 + m.wave(44, 8)} cy={m.lerp([hand, yours + 8], [820, 920])}>
            <Square m={m} up={up} ask={ask} />
          </View>
          <Flash k={m.pulse(hand, 6)} />
        </Stage>
      )}
      {!shot2 ? (
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Txt x={540} y={330} size={64} fill="#ffffff" stroke="#1d1a2b">ALL BILLIONAIRES</Txt>
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export default Hook;
