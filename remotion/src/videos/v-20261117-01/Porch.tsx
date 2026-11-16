// Build: "But that $2.04B was never cash in a vault. It meant one cheque a year, for decades."
// A front porch: a tall stack of cash tagged with the jackpot fades to a ghost and gets a red cross on "never",
// the mailbox flag flips up on "meant", one envelope pops out on "cheque", the door calendar tears off a year on
// "year", and on "decades" the camera pulls back as the tree runs through the seasons and envelopes pile up.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, INK, Limb, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { CashPile, Envelope } from "./props";

type Params = { fig?: { jackpot?: string } };

const SEASONS = ["#4caf50", "#e8a33a", "#f4f1e8", "#7ccf6a"];

const Porch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const jackpot = (p.beat.params as Params).fig?.jackpot ?? "";
  const never = m.at("never", 10), meant = m.at("meant", 40), cheque = m.at("cheque", 50), year = m.at("year", 58), decades = m.at("decades", 70);
  const ghost = m.t >= never;
  const cross = m.lerp([never, never + 8], [0, 1]);
  const flag = m.lerp([meant, meant + 6], [0, 1], Easing.out(Easing.back(2)));
  const env = m.pop(cheque, 10);
  const tear = m.lerp([year, year + 10], [0, 1]);
  const yrs = m.t < decades ? 0 : Math.floor((m.t - decades) / 4);
  const leaf = SEASONS[yrs % 4]!;
  const close = m.lerp([meant - 4, meant + 8], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([decades - 4, decades + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.04 + 0.04 * close - 0.24 * back;
  const cx = 540 + 20 * close - 20 * back, cy = 880 - 40 * close + 40 * back;
  return (
    <Stage p={p} bg="#f1d9b0" vignette={0.24}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-600} y={-500} width={2280} height={2600} fill="#a8d8ff" />
        {/* the tree changing with the seasons */}
        <Limb a={[-180, 1300]} b={[-180, 700]} w={60} color="#7a4a2a" />
        <Ball x={-180} y={560} r={260} fill={leaf} />
        {/* the house wall, the door with its calendar */}
        <Block x={100} y={300} w={1300} h={1020} fill="#d9c7a6" shadow="bottom" />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={100} y1={360 + i * 100} x2={1400} y2={360 + i * 100} stroke="#c2ae8a" strokeWidth={4} />)}
        <Block x={480} y={620} w={290} h={700} fill="#4a6a9a" />
        <circle cx={735} cy={980} r={16} fill="#d4af37" stroke={INK} strokeWidth={3} />
        <g>
          <Block x={525} y={680} w={200} h={200} r={8} fill="#fffdf4" shadow={false} />
          <rect x={525} y={680} width={200} height={50} fill="#e0352b" stroke={INK} strokeWidth={4} />
          <Txt x={625} y={790} size={56} fill={INK}>YEAR</Txt>
          {tear > 0 && tear < 1 ? <g transform={`translate(${tear * 140} ${tear * 260}) rotate(${tear * 50} 625 800)`}><rect x={525} y={730} width={200} height={150} fill="#fffdf4" stroke={INK} strokeWidth={3} /></g> : null}
        </g>
        {/* the porch floor */}
        <Block x={-600} y={1300} w={2280} h={700} fill="#8a6a4a" shadow={false} />
        {/* the cash that never was */}
        <CashPile x={90} y={1300} cols={3} rows={12} bw={130} ghost={ghost} />
        <Tag x={130} y={620} w={320} h={110} text={jackpot} k={1} bg={ghost ? "#cfd6e2" : "#ffcf4a"} />
        {cross > 0 ? <g opacity={cross}>
          <line x1={60} y1={760} x2={440} y2={1290} stroke="#e0352b" strokeWidth={30} strokeLinecap="round" />
          <line x1={440} y1={760} x2={60} y2={1290} stroke="#e0352b" strokeWidth={30} strokeLinecap="round" />
        </g> : null}
        {/* the mailbox */}
        <Limb a={[890, 1300]} b={[890, 1000]} w={30} color="#6a4a2a" />
        <path d="M 790 1000 L 790 900 Q 790 840 890 840 Q 990 840 990 900 L 990 1000 Z" fill="#3a5a9a" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-90 * flag} 990 960)`}><Block x={990} y={900} w={20} h={90} fill="#e0352b" sw={3} /></g>
        {env > 0 ? <Envelope x={800 - 60 * env} y={880 - 120 * env} w={150} rot={-10} /> : null}
        {Array.from({ length: Math.min(12, yrs) }).map((_, i) => <Envelope key={i} x={760 + (i % 4) * 70} y={1280 - Math.floor(i / 4) * 60} w={120} rot={(i * 13) % 20 - 10} />)}
      </View>
    </Stage>
  );
};

export default Porch;
