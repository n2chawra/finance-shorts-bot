// Build: "And California's schools collected $156.3M from the run of draws."
// A sunny California school yard: the bell swings and rings on "California's", kids run out across the yard on
// "schools", the yard's scoreboard counts up to the figure on "collected", and on "draws" lottery balls roll down a
// chute into the school's money box as the camera pulls back.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { LottoBall } from "./props";

type Params = { fig?: { schools?: string } };

const School: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig?.schools ?? "";
  const cal = m.at("california's", 2), schools = m.at("schools", 10), coll = m.at("collected", 22), draws = m.at("draws", 50), runW = m.at("from", 44);
  const bus = m.lerp([runW - 2, runW + 14], [0, 1], Easing.out(Easing.cubic));
  const bell = m.t >= cal ? Math.sin((m.t - cal) / 2.2) * 24 * Math.max(0, 1 - (m.t - cal) / 40) : 0;
  const run = m.lerp([schools, schools + 50], [0, 1], Easing.linear);
  const count = m.lerp([coll, coll + 26], [0, 1], Easing.out(Easing.cubic));
  const mid = m.lerp([coll - 4, coll + 10], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([draws - 4, draws + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.15 * mid - 0.15 * back;
  const cx = 540 - 60 * mid + 60 * back, cy = 880 - 120 * mid + 120 * back;
  return (
    <Stage p={p} bg="#8fd3ff" vignette={0.2}
      defs={<linearGradient id="cas-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fb8ff" /><stop offset="1" stopColor="#d6f0ff" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(100, 4)} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={1900} fill="url(#cas-sky)" />
        <Ball x={900} y={180} r={70} fill="#ffe27a" sw={0} shadow={false} />
        <Glow x={900} y={180} r={260} color="#fff2a8" o={0.6} />
        {/* the school building */}
        <Block x={-200} y={760} w={1480} h={520} fill="#e8a36a" shadow="bottom" />
        <path d="M -240 770 L 540 560 L 1320 770 Z" fill="#b24a3a" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 6 }).map((_, i) => <Block key={i} x={-120 + i * 240} y={880} w={140} h={140} fill="#bfe6ff" sw={5} shadow={false} />)}
        <Block x={430} y={1080} w={220} h={200} fill="#6a3a2a" />
        <Block x={300} y={640} w={480} h={100} r={10} fill="#fffdf4" />
        <Txt x={540} y={690} size={64} fill={INK}>SCHOOL</Txt>
        {/* the bell */}
        <g transform={`rotate(${bell} 540 520)`}>
          <path d="M 490 520 Q 490 470 540 470 Q 590 470 590 520 L 605 580 L 475 580 Z" fill="#d4af37" stroke={INK} strokeWidth={5} />
          <circle cx={540} cy={592} r={14} fill={INK} />
        </g>
        {/* the yard and the kids */}
        <rect x={-500} y={1280} width={2080} height={700} fill="#c9b48a" />
        {[0, 1, 2, 3].map((i) => (
          <Char key={i} x={140 + i * 200 + run * (60 + i * 30)} y={1420 + (i % 2) * 40 + m.wave(10, 6, i)} s={80}
            outfit="tee" top={["#e0352b", "#3fb6a0", "#7a8cff", "#ffb03a"][i]!} hair={i % 2 ? "bun" : "spiky"} face="happy"
            armL={[60 + m.wave(12, 30, i), 40]} armR={[60 - m.wave(12, 30, i), 40]} />
        ))}
        {/* the school bus */}
        <g transform={`translate(${700 - 700 * bus} 0)`}>
          <Block x={560} y={1120} w={520} h={190} r={24} fill="#ffc21a" />
          {[0, 1, 2, 3].map((i) => <Block key={i} x={590 + i * 110} y={1145} w={80} h={70} r={6} fill="#bfe6ff" sw={4} shadow={false} />)}
          <Ball x={650} y={1320} r={38} fill="#2b2b33" />
          <Ball x={980} y={1320} r={38} fill="#2b2b33" />
        </g>
        {/* the scoreboard on its pole */}
        <Limb a={[300, 640]} b={[300, 500]} w={20} color="#5a5f73" />
        <Display x={60} y={230} w={600} h={250} label="RAISED FOR SCHOOLS" value={countText(fig, count)} color="#ffcf4a" />
        {/* the chute of lottery balls into the money box */}
        <Limb a={[1000, 120]} b={[800, 520]} w={60} color="#9fb0c8" />
        {Array.from({ length: 6 }).map((_, i) => {
          const k = ((m.t - draws) / 24 + i / 6) % 1;
          if (m.t < draws) return null;
          return <LottoBall key={i} x={1000 - 200 * k} y={120 + 400 * k} r={28} red={i % 3 === 0} />;
        })}
        <Block x={700} y={500} w={200} h={130} r={10} fill="#3a9d5d" />
        <rect x={760} y={510} width={80} height={14} rx={6} fill={INK} />
      </View>
    </Stage>
  );
};

export default School;
