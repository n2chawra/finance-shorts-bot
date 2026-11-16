// Build: "But the ticket price moves with the date. The quietest day costs $104."
// The ticket booth beside a giant wall calendar: the booth's price board flickers on "price", the calendar's days
// light up in different colours on "moves", Rohan taps a pale quiet day on "date", the board spins down on
// "quietest", and on "costs" it stops on the quiet-day price.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Stage, Txt, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { low?: string } };

const COLS = ["#d4af37", "#ff9a5a", "#7cc4ff", "#cfd6e2"];

const Booth: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const low = (p.beat.params as Params).fig?.low ?? "";
  const price = m.at("price", 6), moves = m.at("moves", 14), date = m.at("date", 26), quiet = m.at("quietest", 36), costs = m.at("costs", 48);
  const flick = m.t >= price && m.t < moves ? (Math.floor(m.t / 2) % 2 ? 0.4 : 1) : 1;
  const lit = m.lerp([moves, moves + 14], [0, 35], Easing.linear);
  const spin = m.t >= quiet && m.t < costs;
  const r = rng("dl-cal");
  const days = Array.from({ length: 35 }).map(() => COLS[Math.floor(r() * 4)]!);
  days[17] = "#cfd6e2";
  const tap = m.lerp([date - 2, date + 6], [0, 1]);
  const mid = m.lerp([date - 4, date + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([costs - 4, costs + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.08 * mid + 0.1 * close;
  const cx = 540, cy = 860 - 40 * mid - 80 * close;
  return (
    <Stage p={p} bg="#dff4ff" vignette={0.22}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={2600} fill="#cfeaff" />
        {/* the booth with its price board */}
        <Block x={560} y={330} w={400} h={980} fill="#ff7cc0" />
        <path d="M 540 330 L 760 220 L 980 330 Z" fill="#3a6ad5" stroke={INK} strokeWidth={6} />
        <Block x={600} y={760} w={320} h={260} r={14} fill="#bfe6ff" />
        <g opacity={flick}>
          <Display x={590} y={400} w={340} h={200} label="ONE DAY" value={spin ? ["▲", "▼", "▲"][Math.floor(m.t / 2) % 3]! : m.t >= costs ? low : "?"} color="#ffcf4a" />
        </g>
        <Glow x={760} y={500} r={260} color="#ffcf4a" o={0.5 * m.pulse(costs + 2, 10)} />
        {/* the giant calendar */}
        <Block x={60} y={330} w={460} h={560} r={12} fill="#ffffff" />
        <rect x={60} y={330} width={460} height={80} fill="#d7262b" stroke={INK} strokeWidth={5} />
        <Txt x={290} y={370} size={48} fill="#ffffff">DATES</Txt>
        {days.map((c, i) => (
          <rect key={i} x={80 + (i % 7) * 62} y={430 + Math.floor(i / 7) * 88} width={52} height={74} rx={6}
            fill={i < lit ? c : "#f4f1e8"} stroke={i === 17 && m.t >= date ? "#3a6ad5" : INK} strokeWidth={i === 17 && m.t >= date ? 8 : 2} />
        ))}
        <rect x={-500} y={1300} width={2080} height={900} fill="#c9b48a" />
        {/* Rohan taps the quiet day */}
        <Char x={330} y={1500 + m.wave(60, 3)} s={175} who="rohan" face={m.t >= costs ? "happy" : "neutral"} look={[-0.2, -1]}
          armR={[150 - 20 * tap, 175 - 10 * tap]} armL={[20, 10]} />
      </View>
    </Stage>
  );
};

export default Booth;
