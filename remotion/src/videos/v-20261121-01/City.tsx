// Promise: "And Uber does that {fact2} times in three months, rides and deliveries."
// The city at night from above, car lights streaming along the avenues. A rooftop billboard with the Uber logo
// pops up on "does" and its counter lands on the trip count on "times"; a car with a passenger zooms past on
// "rides", a delivery bike with a food box the other way on "deliveries".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, INK, STROKE, SourceLine, Stage, Txt, View, countText, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { UBERGREEN } from "./props";

type Params = { fig?: { trips?: string } };

const City: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const does = m.at("does", 10), times = m.at("times", 40), rides = m.at("rides", 70), deliv = m.at("deliveries", 85);
  const board = m.pop(does, 12);
  const r = rng("uber-city");
  const blocks = Array.from({ length: 24 }).map((_, i) => ({ x: (i % 6) * 230 - 160, y: Math.floor(i / 6) * 330 + 120, h: 60 + r() * 120, c: r() }));
  const pull = m.lerp([0, m.at("and", 0) + 30], [1.2, 1.0], Easing.out(Easing.cubic));
  const car = m.lerp([rides - 4, rides + 26], [-400, 1500]);
  const bike = m.lerp([deliv - 4, deliv + 26], [1500, -400]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0c1030" vignette={0.45}>
        <View zoom={pull} cx={540 + m.wave(100, 10)} cy={820}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#141a3a" />
          {/* avenues with streaming car lights */}
          {[0, 1, 2, 3].map((row) => (
            <g key={row}>
              <rect x={-500} y={row * 330 + 40} width={2080} height={70} fill="#23284a" />
              {Array.from({ length: 14 }).map((_, i) => {
                const x = (((i * 160 + (row % 2 ? -1 : 1) * m.t * 9) % 2080) + 2080) % 2080 - 500;
                return <rect key={i} x={x} y={row * 330 + 62 + (i % 2) * 16} width={34} height={10} rx={5} fill={i % 2 ? "#ff6a4a" : "#fff1c9"} />;
              })}
            </g>
          ))}
          {blocks.map((b, i) => (
            <g key={i}>
              <Block x={b.x} y={b.y} w={190} h={190} r={8} fill={b.c > 0.5 ? "#2e3878" : "#3a4590"} />
              {[0, 1, 2].map((k) => <rect key={k} x={b.x + 25 + k * 55} y={b.y + 40} width={30} height={30} rx={4} fill="#ffd98a" opacity={0.4 + 0.5 * Math.abs(Math.sin(m.t / 11 + i + k))} />)}
            </g>
          ))}
          {/* the rooftop billboard */}
          <g transform={`translate(540 ${620 + (1 - board) * 500}) scale(${0.6 + 0.4 * board})`} opacity={Math.min(1, board * 2)}>
            <rect x={-20} y={60} width={40} height={300} fill="#3a3f55" stroke={INK} strokeWidth={STROKE} />
            <Glow x={0} y={-40} r={560} color={UBERGREEN} o={0.3} />
            <Block x={-400} y={-330} w={800} h={130} r={16} fill="#ffffff" />
            <g transform="translate(0 -220)"><Photo name="uber" s={84} t={0} /></g>
            <Display x={-400} y={-190} w={800} h={260} label="TRIPS IN THREE MONTHS" value={countText(f.trips ?? "", m.lerp([does, times], [0.1, 1], Easing.out(Easing.cubic)))} color={UBERGREEN} />
          </g>
          {/* the car with a passenger, then the delivery bike */}
          <g transform={`translate(${car} 1180)`}>
            <Block x={-170} y={-110} w={340} h={110} r={40} fill="#1c1d24" />
            <Block x={-100} y={-180} w={190} h={80} r={30} fill="#7fb8ff" />
            <Ball x={-10} y={-150} r={26} fill="#e2b48f" />
            <Ball x={-100} y={0} r={36} fill="#2a2a32" /><Ball x={100} y={0} r={36} fill="#2a2a32" />
            <Txt x={0} y={-240} size={48} fill="#ffffff" stroke={INK}>RIDE</Txt>
          </g>
          <g transform={`translate(${bike} 1220)`}>
            <Ball x={-90} y={0} r={42} fill="#2a2a32" /><Ball x={90} y={0} r={42} fill="#2a2a32" />
            <line x1={-90} y1={0} x2={90} y2={0} stroke={INK} strokeWidth={10} />
            <Char x={0} y={-10} s={110} sit top={UBERGREEN} hair="cap" hat={UBERGREEN} outfit="tee" face="happy" armR={[80, 90]} armL={[80, 90]} />
            <Block x={-150} y={-260} w={120} h={120} r={10} fill={UBERGREEN} />
            <Txt x={0} y={-330} size={48} fill="#ffffff" stroke={INK}>DELIVERY</Txt>
          </g>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default City;
