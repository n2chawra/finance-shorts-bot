// Promise: "Your fare pays for the fuel, the crew and the plane. So what stays with the airline?"
// The apron beside a parked jet at dawn: Rohan's boarding pass breaks into coins on "fare"; coins pour into the fuel
// truck's hose on "fuel", into the crew's bags as they climb the stairs on "crew"; the camera pulls back to the whole
// jet swallowing the rest on "plane"; one tiny coin is left spinning on the tarmac on "stays" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CoinFlight, FuelTruck, Jet, Pass, Rohan, SKY_DAWN } from "./props";

const Apron: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const they = m.at("every", 0), people = they + 8, fare = m.at("fare", 40), fuel = m.at("fuel", 56), crew = m.at("crew", 68), plane = m.at("plane", 80), stays = m.at("left", m.end + 1000);
  const count = (p.beat.params as { fig?: { people?: string } }).fig?.people ?? "";
  const slam = m.pop(they, 9);
  const board = m.lerp([people, people + 40], [0, 1]);
  const burst = m.lerp([fare, fare + 8], [0, 1]);
  const kFuel = m.lerp([fuel - 2, fuel + 18], [0, 1]);
  const kCrew = m.lerp([crew - 2, crew + 18], [0, 1]);
  const kPlane = m.lerp([plane - 2, plane + 22], [0, 1]);
  const climb = m.lerp([crew, crew + 30], [0, 1]);
  const lone = m.pop(stays, 10);
  const zoom = m.t < plane ? m.lerp([0, plane], [1.15, 1.18]) : m.t < stays ? m.lerp([plane, plane + 14], [1.18, 1.0]) : m.lerp([stays, stays + 12], [1.0, 1.28]);
  const cx = m.t < stays ? 560 : m.lerp([stays, stays + 12], [560, 600]);
  const cy = m.t < plane ? 1020 : m.t < stays ? m.lerp([plane, plane + 14], [1020, 900]) : m.lerp([stays, stays + 12], [900, 1180]);
  const hand: [number, number] = [430, 1190];
  return (
    <Stage p={p} bg={SKY_DAWN} vignette={0.3}>
      <View zoom={zoom} cx={cx + m.wave(110, 4)} cy={cy}>
        <defs>
          <linearGradient id="apron-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f7fc8" /><stop offset="0.6" stopColor="#f6b98a" /><stop offset="1" stopColor="#ffd9a0" /></linearGradient>
        </defs>
        <rect x={-500} y={-400} width={2100} height={1400} fill="url(#apron-sky)" />
        <Glow x={200} y={880} r={260} color="#fff1b8" o={0.7} />
        <circle cx={200} cy={880} r={70} fill="#fff1c9" />
        <rect x={-500} y={960} width={2100} height={1500} fill="#6c7383" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-400 + i * 520} y={1360} width={260} height={18} fill="#f2cc4f" />)}
        <Jet x={600} y={820} w={1100} />
        {/* the stairs to the front door */}
        <g>
          <path d="M 860 1040 L 960 1040 L 1040 770 L 990 770 Z" fill="#d6dbe4" stroke="#1d1a2b" strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={872 + i * 20} y1={1000 - i * 52} x2={962 + i * 16} y2={1000 - i * 52} stroke="#1d1a2b" strokeWidth={5} />)}
          <Limb a={[860, 1040]} b={[960, 1040]} w={14} color="#5b6275" />
        </g>
        {[0, 1].map((i) => {
          const k = Math.max(0, Math.min(1, climb - i * 0.25));
          return <Char key={i} x={900 + k * 90 - i * 50} y={1040 - k * 250 + i * 20} s={95} top={i ? "#26324a" : "#3d6fd1"} hair={i ? "bun" : "cap"} hat="#26324a" face="happy" back={k > 0.3} armR={[20, 10]} armL={[-20, -10]} />;
        })}
        {[0, 1, 2].map((i) => {
          const k = Math.max(0, Math.min(1, board * 1.4 - i * 0.2));
          return k > 0 && k < 1 ? <Char key={`pax-${i}`} x={880 + k * 120 - i * 30} y={1040 - k * 250} s={80} top={["#e07a5f", "#81b29a", "#9b72cf"][i]!} hair={i === 1 ? "bun" : "side"} face="happy" back armR={[20, 10]} armL={[-20, -10]} /> : null;
        })}
        <Tag x={300} y={700} w={420} h={150} text={count} k={slam} rot={-4} size={100} />
        <FuelTruck x={-10} y={1300} m={m} pump={kFuel} />
        {/* the hose end at the wing */}
        <Block x={-280} y={890} w={50} h={40} r={8} fill="#3a3f50" />
        <Rohan x={360} y={1500} s={200} m={m} face={m.t >= stays ? "shock" : "neutral"} look={[0.6, -0.4]} armR={[90 + 40 * burst, 40]} armL={[10, 10]} />
        {burst < 1 ? <g opacity={1 - burst}><Pass x={hand[0] + 30} y={hand[1] - 20} w={180} rot={-10} /></g> : null}
        {burst > 0 && burst < 1 ? [0, 1, 2, 3, 4].map((i) => <Coin key={i} x={hand[0] + Math.cos(i * 1.3) * 90 * burst} y={hand[1] + Math.sin(i * 1.3) * 90 * burst} r={24} />) : null}
        <CoinFlight a={hand} b={[-250, 900]} k={kFuel} n={6} arc={220} />
        <CoinFlight a={hand} b={[940, 900]} k={kCrew} n={6} arc={200} />
        <CoinFlight a={hand} b={[640, 790]} k={kPlane} n={8} arc={260} />
        {lone > 0 ? <Coin x={600} y={1330} r={18 + 6 * lone} spin={Math.abs(Math.cos(m.t / 4))} /> : null}
        {lone > 0 ? <Glow x={600} y={1330} r={90} color="#ffe08a" o={0.5 * lone} /> : null}
      </View>
    </Stage>
  );
};

export default Apron;
