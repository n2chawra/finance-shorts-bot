// Build: "Netflix sold no tickets for it. So how does a show pay Netflix back?"
// An empty cinema box office on a rainy street: the shutter rattles down on "sold", a NO TICKETS sign flips over in
// the window on "tickets", the camera pulls back down the street on "So", Rohan walks past under an umbrella looking
// at his phone on "show", and his phone screen glows pink and green on "back".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Limb, Stage, Txt, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";

const BoxOffice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sold = m.at("sold", 2), tickets = m.at("tickets", 12), so = m.at("so", 30), show = m.at("show", 40), back = m.at("back", 55);
  const shutter = m.lerp([sold - 2, sold + 8], [0, 1], Easing.bounce);
  const sign = m.lerp([tickets - 2, tickets + 6], [0, 1]);
  const pull = m.lerp([so - 4, so + 14], [0, 1], Easing.inOut(Easing.cubic));
  const walk = m.lerp([show - 10, m.end], [0, 1]);
  const phone = m.pop(back - 1);
  const r = rng("rain");
  const drops = Array.from({ length: 60 }).map(() => [r() * 1680 - 300, r() * 2200, r()] as const);
  const rx = 900 - 520 * walk;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a3048" vignette={0.42}>
        <View zoom={1.22 - 0.22 * pull + 0.1 * phone} cx={540 - 40 * pull + m.wave(60, 6)} cy={820 + 100 * pull + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#2a3048" />
          {/* the cinema front */}
          <Block x={60} y={200} w={960} h={1080} fill="#6a2a3a" />
          <Block x={100} y={240} w={880} h={150} r={12} fill="#1d1a2b" />
          {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={130 + i * 55} cy={255} r={9} fill={(Math.floor(m.t / 4) + i) % 2 ? "#ffe08a" : "#806040"} />)}
          <Txt x={540} y={330} size={70} fill="#ffe08a">CINEMA</Txt>
          {/* the box office window */}
          <Block x={300} y={500} w={480} h={420} r={14} fill="#f5e6c8" />
          <rect x={340} y={540} width={400} height={300} fill="#24324a" />
          <rect x={340} y={540} width={400} height={300 * shutter} fill="#9aa3b5" />
          {Array.from({ length: Math.floor(10 * shutter) }).map((_, i) => <rect key={i} x={340} y={540 + i * 30} width={400} height={4} fill="#6c7385" />)}
          {sign > 0 ? (
            <g transform={`translate(540 690) scale(1 ${Math.max(0.05, Math.abs(Math.cos((1 - sign) * Math.PI / 2)))}) translate(-540 -690)`}>
              <Block x={360} y={630} w={360} h={120} r={10} fill="#e9473b" />
              <Txt x={540} y={690} size={52} fill="#ffffff">NO TICKETS</Txt>
            </g>
          ) : null}
          <rect x={-400} y={1280} width={1880} height={900} fill="#3a3f52" />
          <Glow x={rx} y={1000} r={260} color="#f07aa8" o={0.5 * phone} />
          {/* Rohan under his umbrella with his phone */}
          <Char x={rx} y={1340 + Math.abs(m.wave(12, 6))} s={150} who="rohan" face={phone > 0 ? "happy" : "neutral"} look={[-0.3, 0.5]} phone="R"
            light={phone > 0 ? "#f07aa8" : undefined} armL={[150, 170]} />
          <path d={`M ${rx - 210} ${880} Q ${rx - 60} ${740} ${rx + 90} ${880} Z`} fill="#2f7bd8" stroke="#1d1a2b" strokeWidth={6} />
          <Limb a={[rx - 60, 810]} b={[rx - 60, 990]} w={8} color="#1d1a2b" sw={0} />
          {drops.map(([x, y, a], i) => {
            const yy = ((y + m.t * (30 + a * 20)) % 2200) - 300;
            return <line key={i} x1={x} y1={yy} x2={x - 8} y2={yy + 40} stroke="#9fd4ff" strokeWidth={3} opacity={0.5} />;
          })}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default BoxOffice;
