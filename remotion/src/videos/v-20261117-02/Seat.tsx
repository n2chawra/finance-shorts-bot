// Payoff: "So the food costs AMC just 18% of what you pay for it."
// Rohan's seat in the dark cinema: he lifts his giant tub in the screen's glow on "So", the tub turns see-through
// on "food", its price tag swings on "costs", the real cost fills only the bottom of the tub on "pay", and on "it"
// the line on the tub lights up with the share.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Tub } from "./props";

type Params = { fig?: { pct?: string } };

const Seat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pct = (p.beat.params as Params).fig?.pct ?? "";
  const so = m.at("so", 1), food = m.at("food", 8), costs = m.at("costs", 16), pay = m.at("pay", 40), it = m.at("it", 50);
  const lift = m.lerp([so - 2, so + 12], [0, 1], Easing.out(Easing.back(1.3)));
  const see = m.lerp([food - 2, food + 10], [0, 1]);
  const fill = m.lerp([pay - 2, pay + 14], [1, 0.18], Easing.inOut(Easing.cubic));
  const swing = m.t >= costs ? Math.sin((m.t - costs) / 3) * 18 * Math.max(0, 1 - (m.t - costs) / 40) : 0;
  const close = m.lerp([costs - 4, costs + 10], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([it - 4, it + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.02 + 0.13 * close - 0.08 * back;
  const cy = 900 - 100 * close + 40 * back;
  const flick = 0.7 + 0.15 * Math.sin(m.t / 4) + 0.1 * Math.sin(m.t / 1.7);
  const tubY = 1180 - 120 * lift;
  return (
    <Stage p={p} bg="#0d0a1a" vignette={0.5}>
      <View zoom={zoom} cx={540 + m.wave(90, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#120c22" />
        {/* the screen */}
        <rect x={-200} y={60} width={1480} height={380} fill="#cfe4ff" opacity={flick} />
        <Glow x={540} y={300} r={900} color="#bcd8ff" o={0.4 * flick} ry={500} />
        {/* rows of seats */}
        {[0, 1].map((r) => Array.from({ length: 8 }).map((_, i) => (
          <g key={`${r}-${i}`}>
            <Block x={-280 + i * 220 + r * 110} y={1040 + r * 230} w={180} h={200} r={30} fill={r ? "#6a1a2a" : "#7a2234"} />
          </g>
        )))}
        {/* Rohan in his seat with the giant tub */}
        <Char x={400} y={1440} s={190} who="rohan" sit face={m.t >= pay ? "shock" : "happy"} light="#9fc8ff"
          armR={[30, 20]} armL={[60 + 60 * lift, 120]} look={[1, -0.5]} />
        <Tub x={700} y={tubY} w={280} see={see} fill={fill} />
        <Block x={200} y={1260} w={420} h={200} r={30} fill="#7a2234" />
        {/* the fill line and its share */}
        {m.t >= pay ? <line x1={530} y1={tubY - 350 * 0.18} x2={870} y2={tubY - 350 * 0.18} stroke="#ffcf4a" strokeWidth={8} strokeDasharray="20 12" /> : null}
        <g transform={`rotate(${swing} 560 ${tubY - 330})`}>
          <line x1={560} y1={tubY - 330} x2={460} y2={tubY - 520} stroke={INK} strokeWidth={4} />
          <Tag x={290} y={tubY - 650} w={250} h={130} size={90} text={m.t >= costs ? pct : "?"} rot={8} k={1} bg={m.t >= costs ? "#ffcf4a" : "#ffffff"} />
        </g>
        <Glow x={415} y={tubY - 585} r={200} color="#ffcf4a" o={0.6 * m.pulse(costs + 3, 10) + 0.5 * m.pulse(it + 3, 10)} />
      </View>
    </Stage>
  );
};

export default Seat;
