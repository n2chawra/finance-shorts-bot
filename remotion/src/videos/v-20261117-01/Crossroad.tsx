// Loop: "A cheque every year, or all of it today: which would you pick? The man who picked today was"
// A crossroads at night under a lottery billboard: the left signpost lights up (a cheque a year) on "cheque", the
// right one (cash today) on "today", Rohan looks from one to the other on "pick", the camera rises to the billboard
// with Castro's giant cheque on "man", and on "was" it pushes into the cheque, the hook's first frame.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Flash, Glow, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Cheque } from "./props";

type Params = { fig?: { jackpot?: string } };

const Sign: React.FC<{ x: number; y: number; w: number; text: string; on: number; color: string; flip?: boolean }> = ({ x, y, w, text, on, color, flip }) => (
  <g>
    <Glow x={x + w / 2} y={y + 55} r={w * 0.7} color={color} o={0.5 * on} />
    <path d={flip ? `M ${x} ${y} L ${x + w - 40} ${y} L ${x + w} ${y + 55} L ${x + w - 40} ${y + 110} L ${x} ${y + 110} Z` : `M ${x + 40} ${y} L ${x + w} ${y} L ${x + w} ${y + 110} L ${x + 40} ${y + 110} L ${x} ${y + 55} Z`}
      fill={on > 0.5 ? color : "#4a4a5a"} stroke={INK} strokeWidth={6} />
    <Txt x={x + w / 2} y={y + 57} size={50} fill={on > 0.5 ? INK : "#9a9aaa"}>{text}</Txt>
  </g>
);

const Crossroad: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const jackpot = (p.beat.params as Params).fig?.jackpot ?? "";
  const cheque = m.at("cheque", 2), today = m.at("today", 22), pick = m.at("pick", 40), man = m.at("man", 56), was = m.at("was", 72);
  const lookR = m.lerp([pick, pick + 8], [-1, 1]) * (m.t > pick + 16 ? -1 : 1);
  const mid = m.lerp([pick - 4, pick + 10], [0, 1], Easing.inOut(Easing.cubic));
  const rise = m.lerp([man - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.96 + 0.04 * mid + 0.08 * rise;
  const cy = 1000 - 40 * mid - 600 * rise;
  return (
    <Stage p={p} bg="#0e1230" vignette={0.46}>
      <View zoom={zoom} cx={540 + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-900} width={2080} height={3000} fill="#121738" />
        {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 137) % 1300 - 100} cy={-700 + ((i * 89) % 900)} r={3 + (i % 3)} fill="#ffffff" opacity={0.6 + 0.3 * Math.sin(m.t / 9 + i)} />)}
        {/* the billboard with the giant cheque */}
        <Limb a={[300, 180]} b={[300, 700]} w={30} color="#5a5f73" />
        <Limb a={[780, 180]} b={[780, 700]} w={30} color="#5a5f73" />
        <Block x={100} y={-370} w={880} h={560} r={10} fill="#1b2350" />
        <Glow x={540} y={-90} r={520} color="#9fb6ff" o={0.3 + 0.3 * rise} />
        <Cheque x={170} y={-300} w={740} amount={rise > 0.4 ? jackpot : ""} t={m.t / 30} />
        {/* the road splitting in two */}
        <path d="M 400 2000 L 520 1080 L 560 1080 L 680 2000 Z" fill="#3a3a4a" />
        <path d="M 520 1080 L -300 900 L -300 1000 L 470 1180 Z" fill="#3a3a4a" />
        <path d="M 560 1080 L 1380 900 L 1380 1000 L 610 1180 Z" fill="#3a3a4a" />
        <rect x={-500} y={1080} width={2080} height={10} fill="#2a2a3a" />
        <g opacity={Math.max(0, 1 - 2.2 * rise)}>
        {/* the signposts */}
        <Limb a={[540, 1300]} b={[540, 800]} w={22} color="#7a5a3a" />
        <Sign x={90} y={810} w={440} text="CHEQUE A YEAR" on={m.t >= cheque ? 1 : 0} color="#7cff9a" />
        <Sign x={550} y={950} w={370} text="CASH TODAY" on={m.t >= today ? 1 : 0} color="#ffcf4a" flip />
        {/* Rohan at the fork */}
        <Char x={540} y={1530} s={170} who="rohan" face={m.t >= pick ? "worried" : "neutral"} look={[lookR, -0.6]} armR={[40, 120]} armL={[20, 10]} />
        </g>
        <Flash k={0.6 * m.pulse(was + 4, 5)} />
      </View>
    </Stage>
  );
};

export default Crossroad;
