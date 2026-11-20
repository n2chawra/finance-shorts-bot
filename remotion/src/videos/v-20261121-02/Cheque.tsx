// Payoff: "Arnold says it paid him over {fact2}, more than {deal_ratio} what the whole film cost."
// Arnold's study at night: he leans back grinning on "Arnold", a giant cheque slides up on the desk on "paid",
// its amount stamps on "over", a small card with the whole film's budget drops beside it on "whole", and the
// times tag stamps between them on "cost".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Arnold, Cheque as PayCheque } from "./props";

type Params = { fig?: { pay?: string; budget?: string; times?: string } };

const Cheque: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const arn = m.at("arnold", 2), paid = m.at("paid", 12), over = m.at("over", 20), more = m.at("more", 32), whole = m.at("whole", 40), cost = m.at("cost", 52);
  const up = 0.55 + 0.45 * m.lerp([paid - 2, paid + 10], [0, 1], Easing.out(Easing.back(1.4)));
  const stamp = m.pop(over, 10);
  const card = m.lerp([whole - 4, whole + 6], [0, 1], Easing.bounce);
  const push = m.lerp([over - 4, over + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0e1124" vignette={0.5}>
        <View zoom={1.0 + 0.12 * push} cx={540} cy={820 + 40 * push}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1d2240" />
          <Block x={600} y={140} w={360} h={440} r={14} fill="#0d1240" />
          <Block x={40} y={140} w={480} h={880} r={10} fill="#5a3418" />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={60} y={330 + r * 200} width={440} height={18} fill="#8a5226" stroke={INK} strokeWidth={4} />
              {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={75 + i * 52} y={230 + r * 200 + (i % 3) * 10} width={40} height={100 - (i % 3) * 10} rx={4} fill={["#c0392b", "#2c6bd6", "#3fae5a", "#e0a53a"][(i + r) % 4]!} stroke={INK} strokeWidth={3} />)}
            </g>
          ))}
          <path d="M 860 1020 L 880 900 L 900 1020 Z" fill="#ffc43d" stroke={INK} strokeWidth={4} />
          <circle cx={800} cy={260} r={50} fill="#ffe9b0" />
          <Glow x={300} y={700} r={600} color="#ffd98a" o={0.35 + 0.4 * m.pulse(more, 10)} />
          <Arnold x={820} y={1200 + m.wave(60, 3)} s={230} face={m.t >= arn ? "grin" : "smirk"} tilt={m.lerp([arn, arn + 10], [0, -6])} armL={[30, 20]} armR={[m.lerp([more - 2, more + 6], [120, 165]), 150]} look={[-0.6, 0]} />
          <Block x={-200} y={1020} w={1480} h={110} r={10} fill="#8a5226" />
          <rect x={-200} y={1130} width={1480} height={900} fill="#4a2a12" stroke={INK} strokeWidth={STROKE} />
          {up > 0 ? (
            <g transform={`translate(0 ${(1 - up) * 600})`}>
              <PayCheque x={440} y={760} w={640} label="PAID TO ARNOLD" value={stamp > 0 ? `over ${f.pay ?? ""}` : ""} rot={-3} big={100} />
            </g>
          ) : null}
          {card > 0 ? (
            <g transform={`translate(0 ${(1 - card) * -500})`}>
              <Block x={80} y={340} w={330} h={190} r={12} fill="#f4f1e8" />
              <Txt x={245} y={390} size={44} fill={INK}>FILM COST</Txt>
              <Txt x={245} y={470} size={70} fill={INK}>{f.budget ?? ""}</Txt>
            </g>
          ) : null}
          <Tag x={430} y={420} w={220} h={110} text={f.times ?? ""} size={76} bg="#ffc43d" k={m.pop(cost, 10)} rot={8} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Cheque;
