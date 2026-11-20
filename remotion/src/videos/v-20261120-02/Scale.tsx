// Turn: "One day of his pay, about {day_per_part}, beats the crew member's whole year."
// The fry station after closing, a giant balance scale on the counter. One calendar page drops onto the left pan on
// "day", the CEO's day figure stamps on it on "pay", a stack of pay slips lands on the right pan on "beats" and the
// scale slams down on the CEO's side, the crew member stares up on "whole", and the year tag flickers on "year".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Limb, SourceLine, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { Crew, GOLD, RED } from "./props";

type Params = { fig?: { day?: string; year?: string } };

const Scale: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const day = m.at("day", 4), pay = m.at("pay", 14), beats = m.at("beats", 70), whole = m.at("whole", 85), year = m.at("year", 100);
  const about = m.at("about", 30);
  const page = m.lerp([day - 4, day + 6], [0, 1], Easing.bounce);
  const stamp = m.pop(pay - 1, 10);
  const slips = m.lerp([beats - 6, beats + 2], [0, 1], Easing.in(Easing.quad));
  const slam = m.lerp([beats, beats + 10], [0, 1], Easing.out(Easing.back(2.5)));
  const ang = 6 - 22 * slam;           // degrees; negative = the left (CEO) pan down
  const wide = m.lerp([beats - 4, beats + 12], [0, 1], Easing.inOut(Easing.cubic));
  const cx = 540, cy = 520, arm = 290;
  const rad = (ang * Math.PI) / 180;
  const L: [number, number] = [cx - arm * Math.cos(rad), cy - arm * Math.sin(rad) * -1];
  const Rr: [number, number] = [cx + arm * Math.cos(rad), cy + arm * Math.sin(rad) * -1];
  const ly = L[1] + 200, ry = Rr[1] + 200;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2d3138" vignette={0.4}>
        <View zoom={1.1 - 0.04 * m.lerp([about + 36, about + 48], [0, 1]) - 0.06 * wide} cx={540 + m.wave(60, 6)} cy={760 + 60 * wide + m.wave(70, 5)}>
          <rect x={-500} y={-500} width={2080} height={3000} fill="#9aa5ae" />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-500 + i * 180} y={-500} width={6} height={1700} fill="#b8c2ca" />)}
          {/* fryers */}
          <Block x={-200} y={1050} w={1480} h={500} fill="#c8ced4" />
          {[60, 400, 740].map((x) => <Block key={x} x={x} y={980} w={280} h={90} r={8} fill="#5a5f66" />)}
          <Glow x={540} y={1000} r={500} color={GOLD} o={0.12} />
          {/* the scale */}
          <Block x={cx - 30} y={cy} w={60} h={560} fill="#8a6a3a" />
          <Block x={cx - 160} y={cy + 540} w={320} h={60} r={10} fill="#6b4a2c" />
          <Limb a={L} b={Rr} w={30} color="#b88a3a" />
          <circle cx={cx} cy={cy} r={34} fill={GOLD} stroke="#1d1a2b" strokeWidth={6} />
          <Limb a={L} b={[L[0], ly]} w={8} color="#1d1a2b" sw={2} />
          <Limb a={Rr} b={[Rr[0], ry]} w={8} color="#1d1a2b" sw={2} />
          <path d={`M ${L[0] - 160} ${ly} L ${L[0] + 160} ${ly} L ${L[0] + 115} ${ly + 50} L ${L[0] - 115} ${ly + 50} Z`} fill="#d4a34a" stroke="#1d1a2b" strokeWidth={6} />
          <path d={`M ${Rr[0] - 160} ${ry} L ${Rr[0] + 160} ${ry} L ${Rr[0] + 115} ${ry + 50} L ${Rr[0] - 115} ${ry + 50} Z`} fill="#d4a34a" stroke="#1d1a2b" strokeWidth={6} />
          <Glow x={L[0]} y={ly - 150} r={260} color={GOLD} o={0.8 * m.pulse(about + 40, 10)} />
          {/* the CEO's one calendar page */}
          {page > 0 ? (
            <g transform={`translate(${L[0]} ${ly - 400 * (1 - page)})`}>
              <Block x={-150} y={-290} w={300} h={290} r={10} fill="#ffffff" />
              <rect x={-147} y={-287} width={294} height={74} rx={8} fill={RED} />
              <Txt x={0} y={-250} size={46} fill="#ffffff">ONE DAY</Txt>
              {stamp > 0 ? <g transform={`translate(0 -120) scale(${0.6 + 0.4 * stamp})`}><Txt x={0} y={0} size={60} fill="#1d1a2b">{countText(f.day ?? "", m.lerp([about, about + 30], [0.05, 1]))}</Txt></g> : null}
            </g>
          ) : null}
          {/* the crew member's year of pay slips */}
          {slips > 0 ? (
            <g transform={`translate(${Rr[0]} ${ry - 500 * (1 - slips)})`}>
              {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-130 + (i % 2) * 8} y={-30 - i * 22} width={260} height={30} rx={4} fill="#fffaf0" stroke="#1d1a2b" strokeWidth={4} />)}
            </g>
          ) : null}
          {slips >= 1 ? <Tag x={Rr[0] - 150} y={ry - 290} w={300} h={100} text={f.year ?? ""} size={56} bg="#fffaf0" k={1 - 0.15 * m.pulse(year, 4)} /> : null}
          {slips >= 1 ? <Txt x={Rr[0]} y={ry - 330} size={46} fill="#1d1a2b">A YEAR</Txt> : null}
          <Crew x={850} y={1500 + m.wave(50, 3)} s={190} face={m.t >= whole ? "shock" : "worried"} look={[-0.6, -1]} armL={[40, 30]} armR={[20, 10]} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Scale;
