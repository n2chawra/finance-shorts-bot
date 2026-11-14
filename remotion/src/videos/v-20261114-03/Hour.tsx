// Promise: "How big does that get? Every hour, about $1M."
// The cashier's cage: the cashier flips an hourglass on "big", sand pours and chips start stacking on "get";
// on "Every" the camera pulls back as the chip tower climbs past the cashier, and the hourly figure stamps on
// a sign on the tower's top on "hour".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chip } from "./props";

type Params = { fig?: { hour?: string } };

const Hour: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.hour ?? "";
  const big = m.at("big", 4), get = m.at("get", 20), every = m.at("every", 40), hour = m.at("hour", 52);
  const flip = m.lerp([big - 2, big + 10], [180, 0], Easing.out(Easing.back(1.4)));
  const sand = m.lerp([big + 10, m.end], [0, 1]);
  const pull = m.lerp([every - 4, every + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.6 - 0.62 * pull, cx = 330 + 210 * pull, cy = 900 - 80 * pull;
  const n = Math.round(m.lerp([get, hour + 4], [0, 22]));
  const cols = ["#e8432f", "#2a2f3d", "#3d6fd1", "#2bb673"];
  const top = 1090 - n * 26;
  return (
    <Stage p={p} bg="#2b1c3f" vignette={0.45}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-500} y={-500} width={2080} height={2600} fill="#3b2654" />
        <Glow x={540} y={300} r={600} color="#ffcf5c" o={0.25} />
        <Block x={-200} y={180} w={1480} h={110} fill="#8a5a2b" />
        <Txt x={540} y={235} size={60} fill="#ffd23f" glow="#ffb35c">CASHIER</Txt>
        <Char x={330} y={1130} s={210} skin="#e0b48a" top="#2a2f3d" hair="side" outfit="suit" face={m.t > hour ? "smirk" : "neutral"} look={[1, 0]}
          armR={m.t > big - 4 && m.t < big + 8 ? [100, 120] : [30, 40]} />
        {Array.from({ length: 16 }).map((_, i) => <Limb key={i} a={[-200 + i * 100, 290]} b={[-200 + i * 100, 860]} w={10} color="#c9a24a" sw={3} />)}
        <Block x={-200} y={860} w={1480} h={60} fill="#c9a24a" shadow={false} />
        <Block x={-200} y={920} w={1480} h={180} fill="#6b3f1f" shadow="bottom" />
        <rect x={-500} y={1100} width={2080} height={1200} fill="#4a2d23" />
        {/* the hourglass */}
        <g transform={`rotate(${flip} 200 800)`}>
          <rect x={130} y={680} width={140} height={20} rx={6} fill="#8a5a2b" stroke={INK} strokeWidth={4} />
          <rect x={130} y={900} width={140} height={20} rx={6} fill="#8a5a2b" stroke={INK} strokeWidth={4} />
          <path d="M 145 700 L 255 700 L 210 800 L 255 900 L 145 900 L 190 800 Z" fill="#dff3ff" opacity={0.7} stroke={INK} strokeWidth={4} />
          <path d={`M ${150 + 40 * sand} ${700 + 90 * sand} L ${250 - 40 * sand} ${700 + 90 * sand} L 200 800 Z`} fill="#ffcf5c" />
          <path d={`M 150 900 L 250 900 L ${250 - 40 * (1 - sand)} ${900 - 60 * sand} L ${150 + 40 * (1 - sand)} ${900 - 60 * sand} Z`} fill="#ffcf5c" />
          {sand > 0 && sand < 1 ? <line x1={200} y1={800} x2={200} y2={895} stroke="#ffcf5c" strokeWidth={4} /> : null}
        </g>
        {/* the chip tower */}
        {Array.from({ length: n }).map((_, i) => <Chip key={i} x={640 + Math.sin(i * 1.7) * 6} y={1080 - i * 26} r={80} color={cols[i % 4]!} flat />)}
        <Tag x={500} y={top - 150} w={290} h={120} text={v} size={76} k={m.pop(hour, 9)} />
        <Txt x={645} y={top - 185} size={54} fill="#ffffff" stroke={INK}>{m.t > hour ? "PER HOUR" : ""}</Txt>
        <rect x={-500} y={1100} width={2080} height={8} fill={INK} stroke={INK} strokeWidth={STROKE} />
      </View>
    </Stage>
  );
};

export default Hour;
