// Promise: "It sold over $1B in its first three days. So why does it still sell?"
// A game shop at midnight on launch night: the shutter rolls up on "sold" and the queue surges in, the clerk
// slams a box on the counter and cash flies into the till on "first", the wall calendar tears three pages off on
// "days" while the till display counts to the figure, and on "why" the camera pushes in on the clerk staring at
// an old box sitting on today's shelf.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Cash, Display, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GameBox, Spine } from "./props";

type Params = { fig?: { sold?: string } };

const Launch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.sold ?? "";
  const sold = m.at("sold", 2), first = m.at("first", 26), days = m.at("days", 44), why = m.at("why", 60);
  const shutter = m.lerp([sold - 2, sold + 14], [0, 1], Easing.out(Easing.cubic));
  const push = m.lerp([why - 2, why + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.08 * m.lerp([0, why], [0, 1]) + 0.6 * push;
  const cx = 540 + 150 * push, cy = 930 + 120 * push;
  const slam = m.pop(first - 4, 9);
  const torn = Math.floor(m.lerp([days - 3, days + 12], [0, 3]));
  return (
    <Stage p={p} bg="#1a1530" vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(80, 6)} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={1700} fill="#2f2a5c" />
        <rect x={-300} y={1340} width={1680} height={900} fill="#463c6e" />
        {/* wall shelves of boxes */}
        {[220, 330].map((y, r) => (
          <g key={y}>
            <rect x={-300} y={y + 56} width={1680} height={16} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 22 }).map((_, i) => <Spine key={i} x={-280 + i * 76} y={y} w={56} h={56} tone={i + r} />)}
          </g>
        ))}
        {/* the shop window with the queue outside, under a rolling shutter */}
        <rect x={-240} y={560} width={470} height={720} fill="#0d1030" stroke={INK} strokeWidth={STROKE} />
        <Glow x={0} y={900} r={300} color="#4a6dff" o={0.3} />
        {Array.from({ length: 6 }).map((_, i) => {
          const surge = m.lerp([sold + i * 2, sold + 20 + i * 2], [0, 1]);
          return <Char key={i} x={-200 + i * 80 + surge * 60} y={1290} s={110 + (i % 2) * 14} back={i % 3 === 0}
            top={["#ff8a3d", "#2bb673", "#e0457b", "#3fb6c9", "#ffcf4a", "#8a6cff"][i]} hair={i % 2 ? "cap" : "spiky"} face="grin" armR={[150, 170]} armL={[20, 10]} />;
        })}
        <rect x={-240} y={560} width={470} height={720 * (1 - shutter)} fill="#7d7f92" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }).map((_, i) => (560 + i * 60 < 560 + 720 * (1 - shutter) ? <line key={i} x1={-240} y1={560 + i * 60} x2={230} y2={560 + i * 60} stroke="#5d5f72" strokeWidth={6} /> : null))}
        <Txt x={540} y={500} size={48} fill="#ffd23f" glow="#ff8a3d">MIDNIGHT LAUNCH</Txt>
        {/* the wall calendar, tearing pages */}
        <rect x={790} y={560} width={140} height={190} rx={8} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
        <rect x={790} y={560} width={140} height={46} fill="#e0352b" stroke={INK} strokeWidth={4} />
        <Txt x={860} y={585} size={26} fill="#fff" deco>SEPT</Txt>
        <Txt x={860} y={680} size={28} fill={INK} deco>{["DAY ONE", "DAY TWO", "DAY THREE", "DAY FOUR"][Math.min(3, torn)]}</Txt>
        {m.t >= days - 3 ? [0, 1, 2].map((i) => {
          const f = m.lerp([days - 3 + i * 5, days + 10 + i * 5], [0, 1]);
          return f > 0 && f < 1 ? <rect key={i} x={790 + f * 120} y={610 + f * 500} width={140} height={140} fill="#f4f1e8" stroke={INK} strokeWidth={3} transform={`rotate(${f * 70} ${885 + f * 120} ${680 + f * 500})`} /> : null;
        }) : null}
        {/* the till display: the figure lives here */}
        <Display x={300} y={580} w={480} h={240} label="FIRST THREE DAYS" value={v} k={m.lerp([sold - 2, sold + 6], [0.3, 1])} color="#ffd23f" />
        {/* the clerk behind the counter */}
        <Char x={640} y={1500} s={250} hair="side" top="#2a5bd7" skin="#c98652" face={m.t >= why ? "worried" : m.t >= first ? "grin" : "happy"}
          look={m.t >= why ? [-0.8, 0.2] : [-0.4, 0]} armR={[m.t >= first ? 90 : 30, m.t >= first ? 60 : 20]} armL={[40, 40]} />
        <Block x={300} y={1180} w={760} h={200} fill="#c0392b" shadow="bottom" />
        <rect x={300} y={1170} width={760} height={24} fill="#e8e1d4" stroke={INK} strokeWidth={4} />
        <GameBox x={470} y={1170 - 200 * slam} w={160} rot={-6 + 6 * slam} />
        {m.t >= first ? [0, 1, 2, 3].map((i) => {
          const f = m.lerp([first + i * 2, first + 14 + i * 2], [0, 1], Easing.in(Easing.quad));
          return f < 1 ? <g key={i} transform={`translate(${340 + i * 70 + f * 330} ${900 - Math.sin(f * Math.PI) * 220 + f * 120})`}><Cash x={0} y={0} w={70} /></g> : null;
        }) : null}
        {/* the cash register */}
        <Block x={860} y={1060} w={170} h={120} r={10} fill="#3b3a48" />
        <rect x={880} y={1070} width={130} height={40} fill="#4dff9a" opacity={0.6} />
        {/* an old box on today's shelf, the thing the clerk stares at */}
        <rect x={180} y={1050} width={120} height={14} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
        <GameBox x={190} y={900} w={100} name={false} dusty={m.t >= why} />
      </View>
    </Stage>
  );
};

export default Launch;
