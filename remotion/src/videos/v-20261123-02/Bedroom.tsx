// Build: "Spread over every hour of the year, even while he sleeps, he makes {ty_per_part} an hour."
// Niccol's bedroom at night: the big wall clock spins its hands on "Spread", chimes and coins tumble out of it on
// "hour", Brian Niccol snores under a green blanket on "sleeps", and the glowing meter on the nightstand ticks up to
// the figure on "makes".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Display, Glow, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { PhotoHead } from "../../studio/photo";
import { GREEN } from "./props";

type Params = { fig?: { hour?: string } };

const Bedroom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hour = (p.beat.params as Params).fig?.hour ?? "";
  const spread = m.at("spread", 0), hr = m.at("hour", 18), sleeps = m.at("sleeps", 40), makes = m.at("makes", 54);
  const spin = m.lerp([spread, hr + 10], [0, 1]) * 720 + m.t * 0.5;
  const coins = m.lerp([hr, hr + 24], [0, 1]);
  const snore = m.t >= sleeps ? (m.t - sleeps) % 40 : -1;
  const count = m.lerp([makes - 4, makes + 22], [0, 1]);
  const anF = m.pulse(m.at("an", m.end - 8) + 2, 7);
  const riffle = m.lerp([m.at("year", 10), m.at("year", 10) + 14], [0, 1]);
  const zoom = m.t < sleeps ? 1.05 : m.t < makes ? m.lerp([sleeps, sleeps + 10], [1.05, 1.22]) : m.lerp([makes, makes + 12], [1.22, 1.1]);
  const cy = m.t < sleeps ? 820 : m.t < makes ? m.lerp([sleeps, sleeps + 10], [820, 1000]) : m.lerp([makes, makes + 12], [1000, 900]);
  return (
    <Stage p={p} bg="#141838" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(120, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#262c5a" />
        <rect x={-400} y={1250} width={1880} height={1200} fill="#1e2347" />
        {/* the window with the moon */}
        <rect x={640} y={200} width={360} height={420} fill="#0d1240" stroke="#e8e1d4" strokeWidth={14} />
        <circle cx={860} cy={320} r={60} fill="#fff3c4" />
        <Glow x={860} y={320} r={160} color="#fff3c4" o={0.4} />
        {/* the wall clock */}
        <Ball x={300} y={420} r={170} fill="#f4efe2" />
        {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={300 + Math.sin((i / 12) * Math.PI * 2) * 140} cy={420 - Math.cos((i / 12) * Math.PI * 2) * 140} r={8} fill={INK} />)}
        <Limb a={[300, 420]} b={[300 + Math.sin((spin * Math.PI) / 180) * 120, 420 - Math.cos((spin * Math.PI) / 180) * 120]} w={10} color={INK} sw={0} />
        <Limb a={[300, 420]} b={[300 + Math.sin((spin / 12 * Math.PI) / 180) * 80, 420 - Math.cos((spin / 12 * Math.PI) / 180) * 80]} w={14} color={INK} sw={0} />
        {coins > 0 && coins < 1 ? [0, 1, 2, 3, 4, 5].map((i) => <Coin key={i} x={260 + i * 40} y={600 + coins * (500 + i * 30)} r={24} spin={Math.abs(Math.cos(m.t / 3 + i))} />) : null}
        {/* the bed with Niccol asleep */}
        <Block x={120} y={1020} w={760} h={220} r={30} fill="#6b4329" />
        <Block x={140} y={960} w={700} h={140} r={40} fill="#f4efe2" />
        <g transform="translate(250 930) rotate(-70)"><PhotoHead name="niccol" r={95} /></g>
        <path d="M 340 980 Q 600 900 860 990 L 860 1120 L 340 1120 Z" fill={GREEN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {snore >= 0 ? <Txt x={320 + snore * 2} y={760 - snore * 3} size={56} fill="#ffffff" weight={800}>Z</Txt> : null}
        {/* nightstand meter */}
        <Block x={880} y={1030} w={160} h={220} r={10} fill="#5a3a26" />
        <Display x={560} y={640} w={440} h={200} label="HE MAKES / HOUR" value={count > 0 ? countText(hour, count) : "..."} color="#7dff9e" />
        {anF > 0 ? <rect x={550} y={630} width={460} height={220} rx={16} fill="#7dff9e" opacity={0.35 * anF} /> : null}
        {anF > 0 ? <Coin x={960} y={600 - 80 * anF} r={30} /> : null}
        <Block x={640} y={660} w={0} h={0} fill="#ffffff" shadow={false} sw={0} />
        <g transform={`translate(480 150) scale(0.8)`}><Block x={0} y={0} w={150} h={170} r={8} fill="#ffffff" /><rect x={0} y={0} width={150} height={40} fill="#c8102e" />{[0, 1, 2].map((i) => <rect key={i} x={20} y={60 + i * 32 - (riffle > 0 && riffle < 1 ? Math.sin(m.t * 1.5 + i) * 8 : 0)} width={110} height={14} rx={6} fill="#c4cad6" />)}</g>
        <Limb a={[960, 1030]} b={[860, 840]} w={8} color="#2a2f3e" />
      </View>
    </Stage>
  );
};

export default Bedroom;
