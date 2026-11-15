// Turn: "And in all those years, Rockstar made no new Grand Theft Auto. Its sequel lands this month."
// Outside a game shop at dawn: the clock spins through the years on "years" beside the old box on the board's
// ledge, the board lights up on "Rockstar", a red NONE stamps across it on "no", the camera pulls back on
// "sequel" to sealed crates behind a rope and fans waking in sleeping bags, the launch-day banner unrolls on
// "lands" and the fans punch the air on "month".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GameBox } from "./props";

const Dawn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const years = m.at("years", 4), launch = m.at("rockstar", 14), no = m.at("no", 30), seq = m.at("sequel", 66), lands = m.at("lands", 80), month = m.at("month", 90);
  const sold = years, copies = launch, hour = no;
  const close = m.lerp([copies, hour + 6], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([seq - 2, seq + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.2 + 0.3 * close - 0.6 * wide;
  const cx = 420 + 40 * close + 120 * wide, cy = 760 + 40 * close + 260 * wide;
  const stamp = m.pop(hour, 9);
  const banner = m.lerp([lands - 2, lands + 12], [0, 1], Easing.out(Easing.cubic));
  const hand = m.lerp([years, no], [0, 360 * 6]);
  return (
    <Stage p={p} bg="#f2a65e" vignette={0.36}
      defs={<linearGradient id="gta-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a7fd0" /><stop offset="0.7" stopColor="#ffb07a" /><stop offset="1" stopColor="#ffe0a0" /></linearGradient>}>
      <View zoom={zoom} cx={cx + m.wave(90, 6)} cy={cy}>
        <rect x={-500} y={-700} width={2080} height={1900} fill="url(#gta-dawn)" />
        <circle cx={1050} cy={1000 - m.lerp([0, m.end], [0, 60])} r={120} fill="#fff1b0" />
        <Glow x={1050} y={980} r={500} color="#ffe6a0" o={0.5} />
        {/* the shop front */}
        <Block x={-160} y={180} w={1100} h={1140} fill="#3a2f6e" shadow="right" />
        <rect x={-160} y={140} width={1100} height={60} fill="#2a5bd7" stroke={INK} strokeWidth={STROKE} />
        {/* the banner */}
        <g>
          <rect x={60} y={200} width={660} height={150 * banner} fill="#e0352b" stroke={INK} strokeWidth={banner > 0.05 ? STROKE : 0} />
          {banner > 0.7 ? <Txt x={390} y={275} size={64} fill="#ffffff">LAUNCH DAY</Txt> : null}
          <rect x={50} y={190} width={680} height={22} rx={10} fill="#8a5a36" stroke={INK} strokeWidth={4} />
        </g>
        {/* the record board */}
        <Glow x={390} y={620} r={420} color="#ffd23f" o={0.3 * m.pop(launch, 12)} />
        <rect x={80} y={420} width={620} height={420} rx={14} fill="#203a2c" stroke={INK} strokeWidth={STROKE} />
        <rect x={100} y={440} width={580} height={380} rx={8} fill="none" stroke="#c9b37a" strokeWidth={8} />
        <Txt x={390} y={505} size={46} fill="#f4f1e8" weight={700}>NEW GTA SINCE</Txt>
        <Txt x={390} y={640} size={110} fill="#ffd23f" glow="#ffd23f">?</Txt>
        <g transform={`translate(390 640) rotate(-8) scale(${stamp > 0 ? 1 + (1 - stamp) * 1.3 : 0})`}>
          <rect x={-220} y={-60} width={440} height={120} rx={12} fill="#e0352b" stroke={INK} strokeWidth={6} />
          <Txt x={0} y={2} size={84} fill="#fff">NONE</Txt>
        </g>
        {/* the clock */}
        <Ball x={830} y={560} r={90} fill="#f4f1e8" />
        <line x1={830} y1={560} x2={830 + Math.sin((hand * Math.PI) / 180) * 70} y2={560 - Math.cos((hand * Math.PI) / 180) * 70} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={830} y1={560} x2={830} y2={515} stroke="#e0352b" strokeWidth={8} strokeLinecap="round" />
        {/* the old box on the board's ledge */}
        <rect x={80} y={840} width={620} height={20} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
        <g transform={`translate(0 ${(1 - m.pop(sold, 10)) * -400})`} opacity={m.t >= sold - 1 ? 1 : 0}><GameBox x={570} y={850 - 175} w={140} name={false} dusty /></g>
        {/* sealed crates behind a rope, fans waking up */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Block x={-120 + i * 200} y={1000} w={180} h={300} fill="#c9a06a" />
            <line x1={-120 + i * 200} y1={1150} x2={60 + i * 200} y2={1150} stroke="#8a5a36" strokeWidth={10} />
            <GameBox x={-90 + i * 200} y={1020} w={120} name={false} sealed />
          </g>
        ))}
        {[-160, 240, 640, 1040].map((x) => <Block key={x} x={x - 10} y={1150} w={20} h={240} fill="#d4af37" sw={4} />)}
        <path d="M -150 1180 Q 40 1240 240 1180 Q 440 1240 640 1180 Q 840 1240 1040 1180" stroke="#c0392b" strokeWidth={16} fill="none" />
        <rect x={-500} y={1380} width={2080} height={800} fill="#7a6a5a" />
        {[0, 1, 2, 3].map((i) => {
          const wake = m.pop(seq + 4 + i * 4, 12);
          return (
            <g key={i}>
              <ellipse cx={-60 + i * 300} cy={1440} rx={150} ry={56} fill={["#3fb6c9", "#ff8a3d", "#8a6cff", "#59e36d"][i]} stroke={INK} strokeWidth={5} />
              <Char x={-60 + i * 300} y={1470 - wake * 40} s={120} sit hair={i % 2 ? "beanie" : "spiky"} hat="#e0352b" top="#2a2f3d"
                face={wake > 0.5 ? "grin" : "neutral"} blink={wake < 0.5} armR={m.t >= month ? [170, 175] : wake > 0.5 ? [120, 100] : [20, 10]} armL={[20, 10]} />
            </g>
          );
        })}
      </View>
    </Stage>
  );
};

export default Dawn;
