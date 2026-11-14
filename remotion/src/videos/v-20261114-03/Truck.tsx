// Build: "Every day, an armored truck's worth: $24.2M."
// Outside a casino at sunrise: the sun comes up behind the casino on "Every", the armored truck pulls up on
// "day", its back doors swing open on "armored", guards wheel cash bags up the ramp on "truck's", and the
// daily figure stamps on the truck's side on "worth" as the camera pushes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { day?: string } };

const Sack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -45 0 Q -55 -70 -20 -85 L 20 -85 Q 55 -70 45 0 Z" fill="#c9a26a" stroke={INK} strokeWidth={5} />
    <rect x={-22} y={-100} width={44} height={18} rx={6} fill="#8a5a2b" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-40} r={18} fill="none" stroke="#6b4520" strokeWidth={6} />
  </g>
);

const Truck: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.day ?? "";
  const every = m.at("every", 2), day = m.at("day", 14), arm = m.at("armoured", 26), truck = m.at("truck", 36), worth = m.at("worth", 50);
  const sun = m.lerp([every - 2, day + 20], [1400, 900], Easing.out(Easing.quad));
  const drive = m.lerp([day - 10, day + 8], [700, 0], Easing.out(Easing.back(1.1)));
  const door = m.lerp([arm, arm + 10], [0, 1]);
  const mid = m.lerp([truck - 4, truck + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([worth - 4, worth + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1 + 0.18 * mid + 0.4 * close, cx = 540 + 60 * mid + 120 * close, cy = 900 + 80 * mid + 60 * close;
  const bags = Math.max(0, Math.min(5, Math.floor((m.t - truck) / 5)));
  return (
    <Stage p={p} bg="#ff9a5c" vignette={0.3}
      defs={<linearGradient id="lv-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3a8a" /><stop offset="0.6" stopColor="#ff7a6b" /><stop offset="1" stopColor="#ffcf5c" /></linearGradient>}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-500} y={-500} width={2080} height={1760} fill="url(#lv-dawn)" />
        <Ball x={760} y={sun} r={130} fill="#fff1a8" sw={0} shadow={false} />
        <Glow x={760} y={sun} r={460} color="#ffe08a" o={0.5} />
        {/* the casino front */}
        <Block x={-200} y={280} w={720} h={980} fill="#e8c9a0" />
        {Array.from({ length: 5 }).map((_, r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-140 + c * 150} y={440 + r * 140} width={90} height={90} fill="#8fb4d9" stroke={INK} strokeWidth={4} />))}
        <Block x={-120} y={300} w={560} h={110} r={14} fill="#c62a6b" />
        <Txt x={160} y={355} size={70} fill="#ffd23f">CASINO</Txt>
        <Block x={300} y={1080} w={220} h={180} fill="#5b3a28" shadow={false} />
        <rect x={-500} y={1250} width={2080} height={1000} fill="#6b6e7a" />
        <line x1={-500} y1={1250} x2={1580} y2={1250} stroke={INK} strokeWidth={STROKE} />
        {/* the truck, back doors facing the casino */}
        <g transform={`translate(${drive} 0)`}>
          <Block x={500} y={860} w={460} h={330} r={16} fill="#7d8597" />
          <Block x={960} y={960} w={150} h={230} r={20} fill="#5f6779" />
          <rect x={990} y={985} width={90} height={80} rx={10} fill="#9fdcff" stroke={INK} strokeWidth={4} />
          {[580, 1030].map((x) => <Ball key={x} x={x} y={1200} r={52} fill="#2a2f3d" />)}
          <Block x={500 - 120 * door} y={870} w={60} h={310} fill="#6b7385" shadow={false} sw={4} />
          {door > 0 ? <rect x={505} y={880} width={50} height={290} fill="#2a2f3d" /> : null}
          {Array.from({ length: bags }).map((_, i) => <Sack key={i} x={540 + (i % 3) * 40} y={1170 - Math.floor(i / 3) * 70} s={0.6} />)}
          <Tag x={560} y={930} w={360} h={140} text={v} size={84} rot={-3} k={m.pop(worth, 9)} />
          {m.t > worth ? <Txt x={740} y={1120} size={44} fill="#ffffff" stroke={INK}>EVERY DAY</Txt> : null}
        </g>
        <polygon points={`420,1250 ${500},${1180} 500,1250`} fill="#8a8d97" stroke={INK} strokeWidth={4} opacity={door} />
        <Char x={m.lerp([truck - 4, truck + 30], [200, 380])} y={1260} s={170} skin="#8d5a3b" top="#2a2f3d" hair="cap" hat="#2a2f3d" outfit="shirt"
          face="neutral" look={[1, 0]} armR={[60, 70]} holdR={(h) => (m.t > truck - 4 ? <Sack x={h[0] + 20} y={h[1] + 60} s={0.7} /> : null)} />
        <Char x={120} y={1270} s={170} skin="#e0b48a" top="#2a2f3d" hair="cap" hat="#2a2f3d" outfit="shirt" face="neutral" look={[1, 0]}
          armL={[40, 60]} holdL={(h) => <Sack x={h[0]} y={h[1] + 60} s={0.7} />} />
      </View>
    </Stage>
  );
};

export default Truck;
