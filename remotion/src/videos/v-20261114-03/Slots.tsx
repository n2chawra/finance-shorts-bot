// Build: "And which game earns most? Slots alone brought in $4.95B, 56% of it."
// A row of slot machines: the row lights up on "which", every lever drops at once on "earns", coins pour from
// every tray into one big bucket on "alone", the bucket's tag reads the slots figure on "brought", and on "of"
// the camera rises to the meter over the row as it fills to the share.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { GiantSlot, frac } from "./props";

type Params = { fig?: { slots?: string; pct?: string } };

const Slots: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const which = m.at("slot", 2), earns = m.at("machines", 20), alone = m.at("alone", 40), brought = m.at("brought", 50), of = m.at("that", 100);
  const lit = m.lerp([which - 2, which + 8], [0.2, 1]);
  const mid = m.lerp([alone - 4, alone + 12], [0, 1], Easing.inOut(Easing.cubic));
  const top = m.lerp([of - 14, of], [0, 1], Easing.inOut(Easing.cubic));
  const beat2 = Math.round(p.fps * 3.8);
  const punch = m.lerp([beat2, beat2 + 10], [0, 1], Easing.inOut(Easing.cubic)) * (1 - top);
  const zoom = 1 + 0.15 * mid + 0.25 * punch + 0.1 * top, cx = 540 + 60 * top, cy = 960 + 60 * mid + 120 * punch;
  const lever = m.lerp([earns - 2, earns + 5], [0, 1]) * (1 - m.lerp([earns + 8, earns + 18], [0, 1]));
  const fill = m.lerp([of - 26, of - 4], [0, frac(F.pct)]);
  return (
    <Stage p={p} bg="#1d1240" vignette={0.45}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-500} y={-500} width={2080} height={2700} fill="#25164f" />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-300 + i * 200} y={-500} width={100} height={1700} fill="#2c1b5c" />)}
        <Glow x={540} y={760} r={700} color="#ff3fa4" o={0.3 * lit} />
        {/* the meter over the row */}
        <g opacity={0.35 + 0.65 * lit}>
          {[0, 1, 2].map((i) => <GiantSlot key={i} x={40 + i * 330} y={560} w={250} value="" spin={m.t > earns && m.t < alone ? 1 : 0} t={m.t + i * 5} lever={lever} label="WIN" />)}
        </g>
        <rect x={-500} y={940} width={2080} height={1300} fill="#3a2a5e" />
        <line x1={-500} y1={940} x2={1580} y2={940} stroke={INK} strokeWidth={STROKE} />
        {/* coins pouring into the bucket */}
        {m.t > alone ? Array.from({ length: 18 }).map((_, i) => {
          const src = 165 + (i % 3) * 330;
          const k = ((m.t - alone) * 0.06 + i / 18) % 1;
          return <Coin key={i} x={src + (540 - src) * k} y={900 + 260 * k - Math.sin(k * Math.PI) * 120} r={26} spin={Math.abs(Math.cos(m.t / 3 + i))} />;
        }) : null}
        <path d="M 380 1130 L 700 1130 L 660 1330 L 420 1330 Z" fill="#c9ccd6" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        {Array.from({ length: Math.round(m.lerp([alone, of], [0, 9])) }).map((_, i) => <Coin key={i} x={430 + (i % 5) * 55} y={1120 - Math.floor(i / 5) * 30} r={30} spin={0.9} />)}
        {/* the share gauge beside the bucket */}
        <Block x={740} y={990} w={130} h={330} r={16} fill="#0b0f14" shadow={false} />
        <rect x={758} y={1302 - 294 * fill} width={94} height={294 * fill} rx={8} fill="#ffd23f" />
        <Txt x={805} y={1340} size={30} fill="#ffd23f" weight={700} deco>OF ALL KEPT</Txt>
        <Tag x={700} y={880} w={210} h={96} text={F.pct ?? ""} size={64} bg="#ffffff" k={m.pop(of - 14, 9)} />
        <Glow x={540} y={1200} r={300} color="#ffd23f" o={0.7 * m.pulse(beat2 + 4, 10)} />
        <Tag x={385} y={1180} w={310} h={120} text={F.slots ?? ""} size={76} k={m.pop(brought, 9)} />
      </View>
    </Stage>
  );
};

export default Slots;
