// Build: "Last year, each passenger left them {fact4}. And this year?"
// A jet cabin seen down the aisle: a calendar on the bulkhead flips back on "Last", the cabin lights warm on "year",
// the attendant's trolley stops by Rohan's seat on "each", and a receipt rises out of his tray table with the figure
// on "passenger" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Receipt, Rohan } from "./props";

type Params = { fig?: { last?: string } };

const Cabin: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const last = (p.beat.params as Params).fig?.last ?? "";
  const lastW = m.at("last", 2), year = m.at("year", 10), each = m.at("each", 22), pax = m.at("passenger", 34);
  const flip = m.lerp([lastW, lastW + 10], [0, 1]);
  const warm = m.lerp([year, year + 12], [0, 1]);
  const roll = m.lerp([each - 4, each + 14], [0, 1]);
  const print = m.lerp([pax, pax + 16], [0, 1]);
  const thisW = m.at("this", m.end - 20);
  const ahead = m.lerp([thisW, thisW + 10], [0, 1]);
  const qk = m.pop(thisW, 9);
  const zoom = m.t < pax ? m.lerp([0, pax], [1.1, 1.14]) : m.lerp([pax, pax + 12], [1.14, 1.28]);
  const cy = m.t < pax ? 980 : m.lerp([pax, pax + 12], [980, 900]);
  const cx = m.t < pax ? 540 : m.lerp([pax, pax + 12], [540, 640]);
  // seat rows down the aisle, far to near
  const rows = [0, 1, 2, 3, 4];
  return (
    <Stage p={p} bg="#d9dde6" vignette={0.38}>
      <View zoom={zoom} cx={cx + m.wave(120, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#cfd4de" />
        {/* curved ceiling and overhead bins */}
        <path d="M -300 160 Q 540 -60 1380 160 L 1380 520 Q 540 360 -300 520 Z" fill="#eef1f6" stroke="#1d1a2b" strokeWidth={6} />
        <Glow x={540} y={300} r={600} color="#ffcf8a" o={0.15 + 0.35 * warm} ry={200} />
        {/* the bulkhead and its calendar */}
        <Block x={380} y={420} w={320} h={420} r={10} fill="#b8bfcc" />
        <Block x={430} y={470} w={220} h={250} r={10} fill="#ffffff" />
        <rect x={430} y={470} width={220} height={60} fill="#c8102e" />
        <g transform={`translate(540 600) scale(1 ${Math.abs(Math.cos(flip * Math.PI)) * Math.abs(Math.cos(ahead * Math.PI))})`}>
          <Txt x={0} y={0} size={48} fill="#1d1a2b">{ahead > 0.5 ? "THIS" : flip > 0.5 ? "LAST" : "THIS"}</Txt>
          <Txt x={0} y={70} size={48} fill="#1d1a2b">YEAR</Txt>
        </g>
        {/* the aisle carpet */}
        <path d="M 470 840 L 610 840 L 900 1900 L 180 1900 Z" fill="#3d4a6b" />
        {rows.map((i) => {
          const k = (i + 1) / rows.length, s = 0.35 + 0.65 * k, y = 840 + 640 * k * k;
          return [-1, 1].map((side) => (
            <g key={`${i}-${side}`} transform={`translate(${540 + side * (90 + 380 * k)} ${y}) scale(${s})`}>
              <Block x={-150} y={-360} w={300} h={360} r={40} fill="#3d6fd1" />
              <Block x={-110} y={-390} w={220} h={70} r={22} fill="#e9eef6" />
              {i < 3 ? <Char x={0} y={-60} s={110} top={["#e07a5f", "#81b29a", "#f2cc8f"][(i + (side > 0 ? 1 : 0)) % 3]!} hair={i % 2 ? "bun" : "side"} face="neutral" back armR={[10, 5]} armL={[10, 5]} /> : null}
            </g>
          ));
        })}
        {/* Rohan in the nearest right-hand seat, facing us, his tray table down */}
        <Rohan x={880} y={1560} s={180} m={m} sit face={print > 0.5 ? "shock" : "neutral"} look={[-0.3, 0.4]} armR={[60, 80]} armL={[-20, -40]} />
        <Block x={620} y={1250} w={380} h={40} r={8} fill="#5b6275" shadow="bottom" />
        {/* the trolley */}
        <g transform={`translate(${200 + 220 * roll} ${1040 + 180 * roll}) scale(${0.7 + 0.3 * roll})`}>
          <Block x={-120} y={-260} w={240} h={300} r={16} fill="#e4e8ef" />
          <rect x={-100} y={-230} width={200} height={20} fill="#c8102e" />
          <rect x={-100} y={-150} width={200} height={20} fill="#c8102e" />
          <Char x={-40} y={-240} s={95} top="#26324a" hair="bun" hairColor="#3b2a1a" face="happy" armR={[60, 60]} armL={[60, 60]} />
        </g>
        <Receipt x={620} y={1240 - 340 * print} w={280} k={print} label="PER FLYER" value={last} />
        {qk > 0 ? <Tag x={760} y={760} w={130} h={120} text="?" k={qk} rot={10} size={90} /> : null}
      </View>
    </Stage>
  );
};

export default Cabin;
