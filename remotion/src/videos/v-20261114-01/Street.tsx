// Build: "Now split the whole debt over {parts} Americans."
// A suburban street from above: a giant debt bill hangs over it and tears into strips on "split", the strips
// fold into envelopes that rain down on "whole", drop into every mailbox (flags pop) on "over", and the
// street sign lands on the population figure on "Americans".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion, shade } from "../../flat/kit";
import { Envelope } from "./props";

type Params = { fig?: { parts?: string } };

const House: React.FC<{ x: number; y: number; c: string; flag: number }> = ({ x, y, c, flag }) => (
  <g>
    <Block x={x} y={y} w={170} h={130} fill={c} />
    <polygon points={`${x - 16},${y + 4} ${x + 85},${y - 80} ${x + 186},${y + 4}`} fill={shade(c, -0.35)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={x + 66} y={y + 60} width={38} height={70} fill="#5a3d24" stroke={INK} strokeWidth={4} />
    <rect x={x + 18} y={y + 30} width={36} height={32} fill="#ffe7a0" stroke={INK} strokeWidth={3} />
    <rect x={x + 116} y={y + 30} width={36} height={32} fill="#ffe7a0" stroke={INK} strokeWidth={3} />
    {/* mailbox with its flag */}
    <rect x={x + 186} y={y + 80} width={8} height={56} fill="#2a2f3d" />
    <rect x={x + 170} y={y + 56} width={44} height={30} rx={12} fill="#3d6fd1" stroke={INK} strokeWidth={3} />
    <g transform={`rotate(${-90 * flag} ${x + 212} ${y + 70})`}><rect x={x + 210} y={y + 66} width={26} height={8} fill="#d8433a" stroke={INK} strokeWidth={2} /></g>
  </g>
);

const Street: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const parts = (p.beat.params as Params).fig?.parts ?? "";
  const split = m.at("split", 6), whole = m.at("whole", 16), over = m.at("over", 28), amer = m.at("americans", 50);
  const tear = m.lerp([split, split + 10], [0, 1], Easing.out(Easing.cubic));
  const cols = ["#f2a65a", "#8fc9a8", "#f0d264", "#c79bd8", "#9cc3ef", "#f28b82"];
  const houses: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) houses.push([-60 + c * 300 + (r % 2) * 120, 820 + r * 230]);
  return (
    <Stage p={p} bg="#7fbf6a" vignette={0.3}>
      <View zoom={m.lerp([0, amer], [1.0, 1.12]) + 0.08 * m.pulse(amer + 4, 10)} cx={540} cy={m.lerp([0, amer], [980, 900])}>
        <rect x={-300} y={-300} width={1680} height={2400} fill="#86c46f" />
        {[930, 1160, 1390].map((y) => <rect key={y} x={-300} y={y + 140} width={1680} height={60} fill="#b0aa9c" />)}
        {houses.map(([x, y], i) => (
          <House key={i} x={x} y={y} c={cols[i % cols.length]!} flag={m.pop(over + (i % 8) * 1.5, 12)} />
        ))}
        {/* the giant bill over the street, tearing into strips */}
        {Array.from({ length: 8 }).map((_, i) => {
          const fall = m.lerp([whole + i, whole + 26 + i], [0, 1], Easing.in(Easing.quad));
          const x = 140 + i * 100;
          if (m.t < whole) {
            return (
              <g key={i} transform={`translate(${(i - 3.5) * 20 * tear} ${tear * (i % 2 ? 30 : -20)}) rotate(${tear * (i % 2 ? 6 : -6)} ${x + 50} 450)`}>
                <rect x={x} y={300} width={100} height={340} fill="#3a9d5d" stroke={INK} strokeWidth={4} />
                <rect x={x} y={420} width={100} height={60} fill="#e9f2df" />
              </g>
            );
          }
          const [hx, hy] = houses[(i * 3) % houses.length]!;
          return fall < 1 ? <g key={i}><Envelope x={x + (hx! + 170 - x) * fall} y={450 + (hy! + 40 - 450) * fall} w={110} h={66} rot={i * 13 - 30 + fall * 30} /></g> : null;
        })}
        {m.t < whole ? <Txt x={540} y={260} size={64} fill="#ffffff" stroke={INK}>THE WHOLE DEBT</Txt> : null}
        {/* the street sign with the population figure */}
        <g transform={`translate(0 ${(1 - m.pop(amer, 11)) * -500})`}>
          <Block x={270} y={260} w={540} h={210} r={18} fill="#2a6b45" />
          <rect x={288} y={278} width={504} height={174} rx={12} fill="none" stroke="#f4f1e8" strokeWidth={5} />
          <Txt x={540} y={335} size={96} fill="#ffffff">{parts}</Txt>
          <Txt x={540} y={415} size={46} fill="#e0f2e4" weight={700}>AMERICANS</Txt>
        </g>
        <Glow x={540} y={360} r={420} color="#fff4c2" o={0.35 * m.pulse(amer + 6, 14)} />
        {m.t >= amer ? <Tag x={400} y={500} w={280} h={84} text="EACH ONE?" rot={-4} k={m.pop(amer + 10, 10)} /> : null}
      </View>
    </Stage>
  );
};

export default Street;
