// Build: "And its online world kept running, so players kept coming back. So who is cashing in?"
// A sunny coastal city seen from a hilltop at sunset: the city's lights blink on block by block on "online",
// cars stream along the highway on "running", player pins drop all over the city on "players" and rain down on
// "back" while the rider on the hill punches the air, and on "cashing" the camera tilts up to the tallest tower,
// a giant gold coin spinning on its roof.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Glow, INK, STROKE, Stage, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Palm } from "./props";

const Pin: React.FC<{ x: number; y: number; k: number; c: string }> = ({ x, y, k, c }) => {
  if (k <= 0) return null;
  const dy = (1 - Math.min(1, k)) * -500;
  return (
    <g transform={`translate(${x} ${y + dy})`}>
      <path d="M 0 0 L -22 -40 A 26 26 0 1 1 22 -40 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={0} cy={-52} r={10} fill="#fff" />
    </g>
  );
};

const Online: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const online = m.at("online", 4), run = m.at("running", 20), players = m.at("players", 40), back = m.at("back", 56), cash = m.at("cashing", 78);
  const mid = m.lerp([players - 2, players + 14], [0, 1], Easing.inOut(Easing.cubic));
  const up = m.lerp([cash - 4, cash + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.25 * mid - 0.1 * up;
  const cx = 540 + 40 * mid + 60 * up, cy = 1000 - 40 * mid - 380 * up;
  const r = rng("gta-city");
  const towers = Array.from({ length: 13 }).map((_, i) => ({ x: -160 + i * 105, w: 80 + r() * 40, h: 220 + r() * 380 + (i === 7 ? 260 : 0), c: ["#4a3a7a", "#5a3f86", "#3f3f7a", "#634a8a"][i % 4]! }));
  const horizon = 1020;
  const pinC = ["#ff5a5a", "#5fb6ff", "#ffd23f", "#59e36d", "#ff8a3d"];
  const pinR = rng("gta-pins");
  const pins = Array.from({ length: 26 }).map((_, i) => ({ x: -100 + pinR() * 1200, y: horizon - 40 - pinR() * 380, t: i < 9 ? players + i * 1.5 : back + (i - 9) * 1.2 }));
  return (
    <Stage p={p} bg="#2a1a4e" vignette={0.4}
      defs={<linearGradient id="gta-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a1f6e" /><stop offset="0.6" stopColor="#e0457b" /><stop offset="1" stopColor="#ffb35c" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(90, 8)} cy={cy}>
        <rect x={-400} y={-900} width={1880} height={1940} fill="url(#gta-sky)" />
        <circle cx={760} cy={760 + m.lerp([0, m.end], [0, 40])} r={110} fill="#ffe08a" />
        <Glow x={760} y={780} r={420} color="#ffd08a" o={0.45} />
        {towers.map((t, i) => {
          const lit = m.t > online + i * 1.4;
          return (
            <g key={i}>
              <Block x={t.x} y={horizon - t.h} w={t.w} h={t.h} fill={t.c} sw={4} />
              {Array.from({ length: Math.floor(t.h / 50) }).map((_, k) => <rect key={k} x={t.x + 14} y={horizon - t.h + 20 + k * 50} width={t.w - 28} height={16} fill={lit ? (k % 3 ? "#ffd27a" : "#9fdcff") : "#2a2050"} />)}
            </g>
          );
        })}
        {/* the tallest tower's roof: the coin */}
        <Coin x={towers[7]!.x + towers[7]!.w / 2} y={horizon - towers[7]!.h - 90} r={70 * m.pop(cash - 2, 9)} spin={Math.abs(Math.cos(m.t / 6))} />
        <Glow x={towers[7]!.x + towers[7]!.w / 2} y={horizon - towers[7]!.h - 90} r={260} color="#ffd23f" o={0.5 * m.pop(cash - 2, 9)} />
        {/* the bay */}
        <rect x={-400} y={horizon} width={1880} height={200} fill="#2f7fa8" />
        {[0, 1, 2].map((i) => <line key={i} x1={-400} y1={horizon + 40 + i * 50} x2={1480} y2={horizon + 40 + i * 50} stroke="#7fd0f0" strokeWidth={4} strokeDasharray="60 50" strokeDashoffset={m.t * (2 + i)} />)}
        {pins.map((q, i) => <Pin key={i} x={q.x} y={q.y} k={m.pop(q.t, 10)} c={pinC[i % 5]!} />)}
        {/* the highway along the shore */}
        <path d="M -400 1260 Q 300 1160 1480 1230" stroke="#2b2b3a" strokeWidth={70} fill="none" />
        <path d="M -400 1260 Q 300 1160 1480 1230" stroke="#ffd23f" strokeWidth={5} fill="none" strokeDasharray="40 40" />
        {Array.from({ length: 8 }).map((_, i) => {
          const f = ((m.t - run) * 0.012 + i / 8) % 1;
          if (m.t < run && i > 1) return null;
          const x = -400 + f * 1880, y = 1260 - Math.sin(f * Math.PI) * 70 - 20;
          return <rect key={i} x={x} y={y} width={70} height={30} rx={10} fill={pinC[i % 5]} stroke={INK} strokeWidth={3} />;
        })}
        {/* the hilltop, the rider */}
        <path d="M -400 1340 Q 200 1240 700 1320 Q 1100 1380 1480 1340 L 1480 2200 L -400 2200 Z" fill="#3a2a4a" stroke={INK} strokeWidth={STROKE} />
        <Palm x={-20} y={1330} h={420} sway={m.wave(50, 10)} color="#22162e" />
        <Palm x={1010} y={1350} h={360} sway={m.wave(57, 10, 1)} color="#22162e" />
        <g>
          <Ball x={240} y={1380} r={46} fill="#2b2b33" />
          <Ball x={440} y={1380} r={46} fill="#2b2b33" />
          <path d="M 230 1360 L 300 1300 L 420 1300 L 450 1360 Z" fill="#e0352b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Char x={340} y={1380} s={150} back hair="spiky" top="#2a5bd7" face="grin" armR={m.t >= back ? [175, 180] : [120, 110]} armL={[120, 110]} />
        </g>
      </View>
    </Stage>
  );
};

export default Online;
