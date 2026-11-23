// Loop: "Your seat or your coffee at the gate: which pays them more? Ask the world's airlines."
// The departure gate café: a boarding pass floats up on the left on "seat", a coffee cup on the right on "coffee",
// Rohan sits at the gate café with both on "gate", a question mark pops between them on "which", and on "airlines" the
// camera rises to the terminal's departures board as a jet lifts off: the hook's opening frame, so the Short loops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { DepBoard, Jet, Rohan } from "./props";
import { Terminal } from "./Hook";

export const Cup: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => <path key={i} d={`M ${-20 + i * 40} -110 q ${10 * Math.sin(t / 8 + i)} -30 0 -60`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.5} />)}
    <path d="M -70 -90 L 70 -90 L 55 60 L -55 60 Z" fill="#f4f1e8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-66} y={-40} width={132} height={44} fill="#8a5a3b" />
    <rect x={-80} y={-112} width={160} height={26} rx={8} fill="#5b3a26" stroke={INK} strokeWidth={6} />
  </g>
);

const FuelCan: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -80 -120 L 50 -120 L 80 -90 L 80 100 L -80 100 Z" fill="#c8102e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-40} y={-160} width={50} height={44} rx={8} fill="#2a2f3e" stroke={INK} strokeWidth={5} />
    <path d="M -50 -60 L 50 60 M 50 -60 L -50 60" stroke="#8a0b20" strokeWidth={12} />
    <Txt x={0} y={0} size={44} fill="#ffffff">FUEL</Txt>
  </g>
);

const Gate: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const seat = m.at("fuel", 2), coffee = m.at("plane", 12), gate = m.at("eats", 24), which = m.at("fare", 34), airlines = m.at("airlines", m.end - 26);
  const kSeat = m.pop(seat, 10), kCup = m.pop(coffee, 10), q = m.pop(which, 8);
  const sit = m.lerp([gate, gate + 12], [0, 1]);
  const rise = m.lerp([airlines - 2, m.end], [0, 1]);
  const zoom = m.t < which ? 1.1 : m.t < airlines ? m.lerp([which, which + 10], [1.1, 1.22]) : m.lerp([airlines - 2, m.end], [1.22, 1.0]);
  const cy = m.t < airlines ? 1180 : m.lerp([airlines - 2, m.end], [1180, 900]);
  return (
    <Stage p={p} bg="#e9e2d4" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(120, 4)} cy={cy}>
        <Terminal t={m.t} lift={rise * 0.9 + 0.05} />
        <Block x={300} y={70} w={480} h={96} r={12} fill="#26324a" shadow={false} />
        <Txt x={540} y={118} size={54} fill="#ffd36b">ALL AIRLINES</Txt>
        <DepBoard x={150} y={210} w={780} h={760} m={m} flip={1} label="PASSENGERS THIS YEAR" value={(p.beat.params as { fig?: { people?: string } }).fig?.people ?? "..."} rows={["LONDON", "DUBAI", "MUMBAI", "NEW YORK", "TOKYO", "LAGOS"]} />
        {/* the café counter */}
        <Block x={-100} y={1240} w={1280} h={60} r={14} fill="#8a5a3b" shadow="bottom" />
        <Block x={-60} y={1300} w={1200} h={300} fill="#6b4329" shadow={false} />
        <Rohan x={540} y={1560 - 20 * sit} s={210} m={m} sit face={q > 0.5 ? "grin" : "neutral"} look={[q > 0.5 ? 0.6 : -0.5, -0.3]} armR={[60, 60]} armL={[60, 60]} />
        {kSeat > 0 ? <g transform={`translate(0 ${(1 - kSeat) * 80})`} opacity={Math.min(1, kSeat * 1.5)}><FuelCan x={290} y={1120 - 60 * (1 - sit)} /></g> : null}
        {kCup > 0 ? <g transform={`translate(0 ${(1 - kCup) * 80})`} opacity={Math.min(1, kCup * 1.5)}><Jet x={790} y={1080 - 60 * (1 - sit)} w={300} tilt={-8} /></g> : null}
        {q > 0 ? (
          <g transform={`translate(545 1010) scale(${q})`}>
            <Glow x={0} y={0} r={140} color="#ffd36b" o={0.5} />
            <circle r={80} fill="#ffd36b" stroke={INK} strokeWidth={6} />
            <Txt x={0} y={6} size={110} fill={INK}>?</Txt>
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Gate;
