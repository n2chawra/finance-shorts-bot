// Hook: "The Las Vegas Strip keeps $16,772 from gamblers every minute."
// The Strip at night: the casino towers flicker on along the Strip on "Vegas", the giant slot machine's reels
// spin on "Strip", the jackpot screen flashes on the figure and coins burst on "keeps" as the camera pushes in,
// a gambler's chip flies into the machine on "gamblers", and the clock's second hand ticks round on "minute".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Coin, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chip, Clock, GiantSlot, NightStrip } from "./props";

type Params = { fig?: { min?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.min ?? "";
  const vegas = m.at("vegas", 4), strip = m.at("strip", 10), keeps = m.at("keeps", 18), gamblers = m.at("gamblers", 60), minute = m.at("minute", 80);
  const lit = m.lerp([0, vegas + 10], [0.4, 1]);
  const spin = m.t >= strip && m.t < keeps ? 1 : 0;
  const push = m.lerp([keeps - 2, keeps + 12], [0, 1], Easing.inOut(Easing.cubic));
  const ease = m.lerp([minute - 4, minute + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.05 + 0.15 * push - 0.1 * ease, cx = 540, cy = 900 - 160 * push + 140 * ease;
  const flash = m.pulse(keeps, 8);
  const chipK = m.lerp([gamblers, gamblers + 14], [0, 1], Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#140f33" vignette={0.45}
        defs={<linearGradient id="lv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0a2e" /><stop offset="1" stopColor="#4a1f6b" /></linearGradient>}>
        <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
          <rect x={-500} y={-500} width={2080} height={1760} fill="url(#lv-sky)" />
          <NightStrip base={1260} lit={lit} flash={flash} />
          <rect x={-500} y={1250} width={2080} height={1000} fill="#2a2440" />
          <GiantSlot x={290} y={360} w={500} value={v} spin={spin} t={m.t} lever={m.lerp([strip - 2, strip + 6], [0, 1]) * (1 - m.lerp([strip + 8, strip + 20], [0, 1]))} />
          {m.t >= keeps ? Array.from({ length: 12 }).map((_, i) => {
            const k = m.lerp([keeps + i * 0.6, keeps + 26 + i * 0.6], [0, 1], Easing.out(Easing.quad));
            const a = (i / 12) * Math.PI * 2;
            return k < 1 ? <Coin key={i} x={540 + Math.cos(a) * 420 * k} y={560 + Math.sin(a) * 300 * k + k * k * 300} r={30} spin={Math.abs(Math.cos(m.t / 3 + i))} /> : null;
          }) : null}
          <Clock x={250} y={760} r={85} sec={m.lerp([minute - 6, minute + 24], [0, 60])} />
          <Txt x={250} y={875} size={40} fill="#ffffff" deco>ONE MINUTE</Txt>
        <Txt x={540} y={235} size={90} fill="#ff6fc0" glow="#ff3fa4" stroke="#2a0a3a">LAS VEGAS</Txt>
          <Char x={900} y={1520} s={190} who="rohan" hair="side" outfit="shirt" face={m.t > keeps ? "shock" : "happy"} look={[-1, -0.6]}
            armR={m.t > gamblers - 6 && m.t < gamblers + 4 ? [-120, -100] : [15, 10]} armL={m.t > keeps ? [140, 160] : [15, 10]} />
          {chipK > 0 && chipK < 1 ? <Chip x={800 + (560 - 800) * chipK} y={1060 - Math.sin(chipK * Math.PI) * 200} r={30} /> : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
