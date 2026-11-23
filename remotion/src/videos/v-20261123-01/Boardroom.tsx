// Build: "Add it all up, and the world's airlines expect to keep {fact1} this year."
// An airline boardroom high above the runways at night: tiny coins stream in through the window from the runway
// lights on "add", pile on the long table on "all", the wall screen lights up a globe of flight paths on "airlines",
// and its counter counts up to the figure on "expect" while a boss in a suit points at it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Display, Glow, Stage, View, countText, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CoinFlight, Jet } from "./props";

type Params = { fig?: { total?: string } };

const Boardroom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const total = (p.beat.params as Params).fig?.total ?? "";
  const add = m.at("stays", 2), all = m.at("all", 14), airlines = m.at("airlines", 30), expect = m.at("expect", 48);
  const stream = m.lerp([add, add + 26], [0, 1]);
  const pile = m.lerp([all, all + 30], [0, 1]);
  const screen = m.lerp([airlines, airlines + 12], [0, 1]);
  const count = m.lerp([expect - 4, expect + 24], [0, 1]);
  const keepF = m.pulse(m.at("keep", expect + 10), 8);
  const r = rng("boardroom-pile");
  const coins = Array.from({ length: 40 }).map(() => [r(), r()] as [number, number]);
  const zoom = m.t < airlines ? m.lerp([0, airlines], [1.0, 1.04]) : m.t < expect ? m.lerp([airlines, airlines + 14], [1.04, 1.12]) : m.lerp([expect, expect + 14], [1.12, 1.15]);
  const cy = m.t < airlines ? 960 : m.t < expect ? m.lerp([airlines, airlines + 14], [960, 820]) : m.lerp([expect, expect + 14], [820, 700]);
  return (
    <Stage p={p} bg="#141a33" vignette={0.42}>
      <View zoom={zoom} cx={540 + m.wave(120, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#2b2f4a" />
        {/* the night window over the runways */}
        <rect x={-200} y={1000} width={1480} height={260} fill="#0d1240" stroke="#1d1a2b" strokeWidth={6} />
        {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={-160 + i * 105} cy={1200} r={6} fill={i % 2 ? "#ffd36b" : "#7dff9e"} opacity={0.6 + 0.4 * Math.sin(m.t / 5 + i)} />)}
        <g opacity={0.8}><Jet x={(m.t * 4) % 1600 - 200} y={1080} w={220} windows={false} /></g>
        <CoinFlight a={[1100, 1150]} b={[600, 1330]} k={stream} n={7} r={18} arc={120} />
        <CoinFlight a={[-100, 1150]} b={[460, 1330]} k={stream * 0.95} n={6} r={18} arc={120} />
        {/* the wall screen */}
        <rect x={108} y={288} width={864} height={624} rx={24} fill="#ffd36b" opacity={keepF} />
        <Block x={120} y={300} w={840} h={600} r={18} fill="#0b0e15" shadow={false} />
        <Glow x={540} y={560} r={420} color="#5fb4ff" o={0.35 * screen} />
        <g opacity={screen}>
          <circle cx={540} cy={510} r={150} fill="#163a6b" stroke="#5fb4ff" strokeWidth={5} />
          <ellipse cx={540} cy={510} rx={150} ry={50} fill="none" stroke="#5fb4ff" strokeWidth={3} />
          <ellipse cx={540} cy={510} rx={60} ry={150} fill="none" stroke="#5fb4ff" strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + m.t / 40;
            return <path key={i} d={`M ${540 + Math.cos(a) * 140} ${510 + Math.sin(a) * 60} Q 540 ${330 - i * 6} ${540 + Math.cos(a + 2) * 140} ${510 + Math.sin(a + 2) * 60}`} fill="none" stroke="#ffd36b" strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-m.t * 2} />;
          })}
        </g>
        <Display x={220} y={690} w={640} h={190} label="AIRLINES EXPECT TO KEEP" value={count > 0 ? countText(total, count) : "..."} color="#7dff9e" k={screen > 0 ? 1 : 0.6} />
        {/* the long table and the pile */}
        <Block x={-60} y={1290} w={1200} h={70} r={20} fill="#5a3a26" shadow="bottom" />
        {coins.map(([a, b], i) => {
          const k = Math.max(0, Math.min(1, pile * 1.5 - (i / coins.length) * 0.5));
          if (k <= 0) return null;
          return <Ball key={i} x={380 + a * 320} y={1285 - b * 110 * k * (1 - Math.abs(a - 0.5))} r={22} fill="#f5c542" sw={3} shadow={false} />;
        })}
        {pile > 0.3 ? <Coin x={540} y={1180 - 20 * pile} r={30} spin={Math.abs(Math.cos(m.t / 5))} /> : null}
        <Char x={900} y={1480} s={190} outfit="suit" top="#26324a" skin="#c58c5c" hair="side" hairColor="#2b2b2b" face={m.t >= expect ? "grin" : "smirk"}
          look={[-0.6, -0.5]} armL={[m.t >= expect ? 150 : 30, m.t >= expect ? 160 : 20]} armR={[15, 10]} />
      </View>
    </Stage>
  );
};

export default Boardroom;
