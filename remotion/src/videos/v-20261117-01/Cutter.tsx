// Payoff: "So the biggest jackpot ever paid him 49% of its own headline, before any tax."
// A print shop with a giant paper guillotine: the giant cheque slides under the blade on "So", the blade slams
// down and cuts it on "paid", the kept piece lifts up with the share stamped on it on "headline", and on "tax" the
// camera pulls back over the cut-off half lying on the floor.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { Castro, Cheque } from "./props";

type Params = { fig?: { pct?: string } };

const Cutter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pct = (p.beat.params as Params).fig?.pct ?? "";
  const so = m.at("so", 2), paid = m.at("paid", 24), headline = m.at("headline", 46), tax = m.at("tax", 64);
  const slide = m.lerp([so - 2, so + 14], [0, 1], Easing.out(Easing.cubic));
  const blade = m.t < paid - 3 ? 0 : m.t < paid + 2 ? m.lerp([paid - 3, paid], [0, 1], Easing.in(Easing.quad)) : m.lerp([paid + 6, paid + 16], [1, 0]);
  const cut = m.t >= paid;
  const lift = m.lerp([headline - 2, headline + 10], [0, 1], Easing.out(Easing.back(1.4)));
  const fall = m.lerp([paid, paid + 14], [0, 1], Easing.in(Easing.quad));
  const close = m.lerp([paid - 4, paid + 6], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([tax - 4, tax + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.12 * close - 0.17 * back;
  const cy = 820 - 40 * close + 140 * back;
  const shake = m.pulse(paid + 1, 5) * 12;
  const W = 760, X = 160, Y = 620;
  return (
    <Stage p={p} bg="#2d2a3e" vignette={0.42}>
      <View zoom={zoom} cx={540 + m.wave(80, 4)} cy={cy + Math.sin(m.t * 2.3) * shake}>
        <rect x={-400} y={-400} width={1880} height={2400} fill="#3a3550" />
        {Array.from({ length: 7 }).map((_, i) => <Block key={i} x={-200 + i * 220} y={160} w={160} h={60} fill="#504a6a" sw={3} shadow={false} />)}
        <Glow x={540} y={300} r={460} color="#fff2c4" o={0.35} />
        {/* shelves of paper and print rolls on the back wall */}
        {[0, 1].map((r) => <Block key={r} x={-200} y={380 + r * 200} w={1480} h={24} fill="#6a5a4a" shadow={false} />)}
        {Array.from({ length: 16 }).map((_, i) => <Block key={`p${i}`} x={-160 + (i % 8) * 170} y={300 + Math.floor(i / 8) * 200} w={120} h={80} r={6} fill={["#f4f1e8", "#9fd3ff", "#ffcf4a", "#f4a3a3"][i % 4]!} sw={3} shadow={false} />)}
        {/* the guillotine's table and frame */}
        <Block x={60} y={1000} w={960} h={60} fill="#7a7f92" />
        <Block x={120} y={1060} w={60} h={300} fill="#5a5f73" shadow={false} />
        <Block x={900} y={1060} w={60} h={300} fill="#5a5f73" shadow={false} />
        <Limb a={[500, 240]} b={[500, 1000]} w={30} color="#5a5f73" />
        <Limb a={[620, 240]} b={[620, 1000]} w={30} color="#5a5f73" />
        <Block x={460} y={200} w={200} h={60} r={8} fill="#e0352b" />
        {/* the cheque: whole, then cut */}
        {!cut ? (
          <g transform={`translate(${-900 + 900 * slide} 0)`}><Cheque x={X} y={Y} w={W} amount="" box={false} t={m.t / 30} /></g>
        ) : (
          <g>
            <defs>
              <clipPath id="cas-keep"><rect x={X - 20} y={0} width={W * 0.49 + 20} height={2000} /></clipPath>
              <clipPath id="cas-lost"><rect x={X + W * 0.49} y={0} width={W} height={2000} /></clipPath>
            </defs>
            <g clipPath="url(#cas-lost)" transform={`translate(${-20 * fall} ${330 * fall}) rotate(${-8 * fall} 720 800)`} opacity={1}>
              <Cheque x={X} y={Y} w={W} amount="" box={false} t={m.t / 30} />
            </g>
            <g clipPath="url(#cas-keep)" transform={`translate(0 ${-200 * lift})`}>
              <Cheque x={X} y={Y} w={W} amount="" box={false} t={m.t / 30} />
            </g>
          </g>
        )}
        {/* the blade */}
        <g transform={`translate(0 ${-200 + 520 * blade})`}>
          <path d="M 470 300 L 650 300 L 650 420 L 470 470 Z" fill="#cfd6e2" stroke={INK} strokeWidth={6} />
        </g>
        {/* Castro watches his cheque go under the blade */}
        <Castro x={880} y={1460 + m.wave(50, 3)} s={175} face={m.t >= paid ? "shock" : "worried"} armL={m.t >= headline ? [100, 110] : [20, 10]} armR={[20, 10]} look={[-1, -0.3]} />
        <Tag x={170} y={720 - 200 * lift} w={360} h={170} size={120} text={pct} rot={-6} k={m.t < headline ? 0 : lift} bg="#ffcf4a" />
        <Glow x={350} y={800 - 200 * lift} r={260} color="#ffcf4a" o={0.5 * m.pulse(headline + 6, 12)} />
      </View>
    </Stage>
  );
};

export default Cutter;
