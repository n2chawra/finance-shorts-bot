// Promise: "In one single day, it grew by another {diff}."
// A night street under a giant debt billboard. On "single" the street clock's hands whirl a full day (the
// sky flashes day and back), Rohan walks in with a coffee on "day", the billboard pulses and extends a new
// panel on "grew", the day's rise stamps on it on "another" and his coffee drops.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { DebtClock } from "./props";

type Params = { fig?: { total?: string; diff?: string } };

const Billboard: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const single = m.at("single", 6), day = m.at("day", 18), grew = m.at("grew", 32), another = m.at("another", 44);
  const spin = m.lerp([single, day + 6], [0, 360], Easing.inOut(Easing.cubic));
  const dayLight = Math.sin((spin / 360) * Math.PI);
  const panel = m.lerp([grew, grew + 12], [0, 1], Easing.out(Easing.back(1.4)));
  const stamp = m.pop(another + 2, 9);
  const walk = m.lerp([0, day], [-260, 0], Easing.out(Easing.quad));
  const drop = m.lerp([another + 2, another + 14], [0, 1], Easing.in(Easing.quad));
  const r = rng("d01-bill");
  const zoom = m.lerp([0, grew], [1.12, 1.0]) + m.lerp([another - 4, another + 18], [0, 0.3], Easing.inOut(Easing.cubic));
  return (
    <Stage p={p} bg="#141633" vignette={0.42}>
      <View zoom={zoom} cx={540} cy={m.lerp([another - 4, another + 18], [960, 720])}>
        <rect x={-300} y={-300} width={1680} height={1900} fill="#1b1f4a" />
        <rect x={-300} y={-300} width={1680} height={1900} fill="#7cc4ff" opacity={dayLight * 0.85} />
        {/* buildings with lit windows */}
        {[[-120, 300, 300], [160, 520, 200], [820, 260, 340], [1080, 420, 260]].map(([x, y, w], i) => (
          <g key={i}>
            <Block x={x!} y={y!} w={w!} h={1500} fill={["#2d3366", "#3a2f6b", "#273055", "#352a5a"][i]!} />
            {Array.from({ length: 24 }).map((_, j) => (
              <rect key={j} x={x! + 26 + (j % 3) * (w! / 3.4)} y={y! + 40 + Math.floor(j / 3) * 110} width={w! / 6} height={60}
                fill={r() > 0.35 ? "#ffd86b" : "#1a1f40"} opacity={0.85 - dayLight * 0.5} />
            ))}
          </g>
        ))}
        {/* the billboard and its new panel */}
        <DebtClock x={130} y={380} w={820} h={300} label="US DEBT" value={f.total ?? ""} glow={1 + 0.5 * m.pulse(grew + 2, 10)} />
        <g transform={`translate(540 760) scale(${panel}) translate(-540 -760)`} opacity={panel > 0.02 ? 1 : 0}>
          <Block x={220} y={700} w={640} h={190} r={16} fill="#2a2f3d" />
          <rect x={236} y={716} width={608} height={158} rx={10} fill="#0b0f14" stroke={INK} strokeWidth={4} />
          <Txt x={540} y={748} size={44} fill="#9affc4" weight={700} glow="#4dff9a">IN ONE DAY</Txt>
          {stamp > 0 ? <Txt x={540} y={822} size={84} fill="#4dff9a" glow="#4dff9a">{`+${f.diff ?? ""}`}</Txt> : null}
        </g>
        <Glow x={540} y={790} r={420} color="#4dff9a" o={0.3 * stamp} />
        {/* the street clock: a full day whirls by */}
        <Block x={890} y={1000} w={24} h={420} fill="#2a2f3d" shadow={false} />
        <Ball x={902} y={980} r={92} fill="#f4f1e8" />
        <line x1={902} y1={980} x2={902 + Math.sin((spin * 2 * Math.PI) / 360) * 60} y2={980 - Math.cos((spin * 2 * Math.PI) / 360) * 60} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={902} y1={980} x2={902 + Math.sin((spin * Math.PI) / 360) * 40} y2={980 - Math.cos((spin * Math.PI) / 360) * 40} stroke="#d8433a" strokeWidth={10} strokeLinecap="round" />
        {/* the street */}
        <rect x={-300} y={1420} width={1680} height={700} fill="#3a3d52" />
        <line x1={-300} y1={1420} x2={1380} y2={1420} stroke={INK} strokeWidth={STROKE} />
        {[80, 480].map((x) => (
          <g key={x}><Block x={x} y={1060} w={18} h={360} fill="#2a2f3d" shadow={false} /><Ball x={x + 9} y={1050} r={26} fill="#ffe7a0" /><Glow x={x + 9} y={1080} r={180} color="#ffe7a0" o={0.35} /></g>
        ))}
        <g transform={`translate(${walk} 0)`}>
          <Char x={420} y={1560 + m.wave(30, 4)} s={250} who="rohan" outfit="tee" face={m.t > another ? "shock" : "neutral"} look={[0.4, -0.9]}
            armL={[20, 10]} armR={[m.t > another ? 120 : 40, m.t > another ? 140 : 100]} />
          {/* the coffee cup: in his hand, then it falls */}
          <g transform={`translate(${520 + drop * 20} ${1270 + drop * 260}) rotate(${drop * 120})`}>
            <polygon points="-24,-40 24,-40 18,30 -18,30" fill="#f4f1e8" stroke={INK} strokeWidth={4} />
            <rect x={-28} y={-50} width={56} height={14} rx={4} fill="#8a5226" stroke={INK} strokeWidth={3} />
          </g>
        </g>
      </View>
    </Stage>
  );
};

export default Billboard;
