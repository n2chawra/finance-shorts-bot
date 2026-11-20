// Build: "Rohan's ride home is the average trip: about {trip_per_part}."
// Inside the car from behind the driver: Rohan in the back seat taps his phone on "Rohan's", the city lights
// stream past on "ride", the dashboard phone's fare counts up from "average" and lands on "trip", where a
// receipt prints out of it.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Limb, STROKE, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { UBERGREEN } from "./props";

type Params = { fig?: { fare?: string } };

const Meter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const rohan = m.at("rohan", 2), ride = m.at("ride", 12), avg = m.at("average", 30), trip = m.at("trip", 50);
  const count = m.lerp([avg, trip], [0.05, 1], Easing.out(Easing.cubic));
  const print = m.lerp([trip, trip + 16], [0, 1], Easing.out(Easing.back(1.4)));
  const speed = m.lerp([ride - 4, ride + 8], [3, 16]);
  const push = m.lerp([avg - 6, avg + 18], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0e1230" vignette={0.45}>
        <View zoom={1.0 + 0.2 * push} cx={540} cy={900 - 200 * push}>
          <rect x={-400} y={-400} width={1880} height={2800} fill="#14172a" />
          {/* the windscreen with the night road ahead */}
          <path d="M -100 120 L 1180 120 L 1080 720 L 0 720 Z" fill="#1d2552" stroke={INK} strokeWidth={STROKE} />
          {Array.from({ length: 8 }).map((_, i) => {
            const k = ((i / 8 + (m.t * speed) / 2400) % 1);
            return <rect key={i} x={540 - 8 - 30 * k} y={420 + 300 * k} width={16 + 60 * k} height={20 + 60 * k} fill="#f4f1e8" opacity={0.7} />;
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = ((i * 230 - m.t * speed) % 1400 + 1400) % 1400 - 160;
            return <Glow key={i} x={x} y={300 + (i % 2) * 90} r={60} color={["#ffd98a", "#ff8a5a", "#9fd0ff"][i % 3]!} o={0.8} />;
          })}
          {/* dashboard */}
          <Block x={-200} y={700} w={1480} h={260} r={40} fill="#2a2e44" />
          {/* the driver's hands on the wheel */}
          <circle cx={260} cy={830} r={150} fill="none" stroke="#111318" strokeWidth={34} />
          <Ball x={140} y={790} r={34} fill="#a8683a" /><Ball x={380} y={790} r={34} fill="#a8683a" />
          {/* the dashboard phone with the fare */}
          <Limb a={[560, 940]} b={[560, 860]} w={20} color="#3a3f55" />
          <g transform="translate(560 560)">
            <Glow x={0} y={0} r={360} color={UBERGREEN} o={0.25 + 0.3 * m.pulse(trip, 8)} />
            <rect x={-200} y={-300} width={400} height={600} rx={44} fill="#111318" stroke={INK} strokeWidth={STROKE} />
            <rect x={-178} y={-276} width={356} height={552} rx={30} fill="#ffffff" />
            <g transform="translate(0 -200)"><Photo name="uber" s={60} t={0} /></g>
            <Txt x={0} y={-110} size={46} fill={INK}>THIS TRIP</Txt>
            <Txt x={0} y={10} size={120} fill={INK}>{countText(f.fare ?? "", count)}</Txt>
            <rect x={-130} y={110} width={260} height={70} rx={35} fill={UBERGREEN} stroke={INK} strokeWidth={4} />
            <Txt x={0} y={146} size={46} fill="#ffffff">PAY</Txt>
          </g>
          {/* the receipt printing out of the phone */}
          {print > 0 ? (
            <g transform={`translate(560 ${860 + 120 * print})`}>
              <rect x={-150} y={-20} width={300} height={140 * print} fill="#fffdf6" stroke={INK} strokeWidth={5} />
              {[30, 70, 110, 150].map((y) => (y < 120 * print ? <rect key={y} x={-110} y={y} width={220} height={10} rx={5} fill="#d9d3c4" /> : null))}
            </g>
          ) : null}
          {/* Rohan in the back seat, between the front seats */}
          <Char x={850} y={1560 + m.wave(50, 4)} s={260} sit who="rohan" hair="spiky" outfit="tee" face={m.t >= trip ? "worried" : "happy"} look={[-0.7, -0.4]}
            phone="R" armR={[40, m.lerp([rohan, rohan + 8], [60, 110])]} armL={[20, -20]} light="#9fd0ff" />
          <Block x={-120} y={1080} w={520} h={460} r={60} fill="#3a2e2a" />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Meter;
