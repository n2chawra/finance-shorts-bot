// Queue: "Behind him, the queue runs out the door and round the block. How many to go?"
// The pavement outside the shop at night: Rohan walks out with his bag on "Behind", gamers holding boxes fill the
// pavement on "queue", more spill out of the door on "door", the camera pulls back on "block" so the queue bends
// round the corner, the neon sign over the shop flashes a question mark on "many".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Gamer, NEON } from "./props";

const Queue: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const behind = m.at("behind", 2), queue = m.at("queue", 20), door = m.at("runs", 40), block = m.at("block", 60), many = m.at("many", m.end - 20);
  const walk = m.lerp([behind, behind + 30], [0, 1]);
  const fill = m.lerp([queue, queue + 20], [0, 1]);
  const spill = m.lerp([door, door + 16], [0, 1]);
  const q = m.pop(many, 9);
  const zoom = m.t < block ? m.lerp([0, block], [1.18, 1.22]) : m.lerp([block, block + 24], [1.22, 0.86]);
  const cx = m.t < block ? 420 : m.lerp([block, block + 24], [420, 620]);
  const cy = m.t < block ? 900 : m.lerp([block, block + 24], [900, 820]);
  // the queue: along the pavement, then round the corner and up the side street
  const spots: [number, number, number][] = [];
  for (let i = 0; i < 7; i++) spots.push([300 + i * 150, 1330, 1]);
  for (let i = 0; i < 6; i++) spots.push([1330, 1210 - i * 110, 0.8 - i * 0.05]);
  return (
    <Stage p={p} bg="#141a3a" vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(110, 5)} cy={cy}>
        <rect x={-800} y={-800} width={2880} height={3400} fill="#141a3a" />
        {/* the street: far towers, the shop front, the corner and the side street */}
        {[-500, -200, 1450, 1750].map((x, i) => (
          <Block key={x} x={x} y={200 + (i % 2) * 120} w={260} h={1100} fill={["#2e3878", "#36418a"][i % 2]!} shadow={false} />
        ))}
        <Block x={-260} y={420} w={1460} h={900} fill="#3a2a5c" />
        <rect x={-260} y={420} width={1460} height={150} fill="#251a3d" stroke={INK} strokeWidth={6} />
        <Txt x={470} y={495} size={78} fill={NEON} glow={NEON} stroke={INK}>GAMES</Txt>
        {q > 0 ? (
          <g transform={`translate(800 495) scale(${0.5 + 0.5 * q})`}>
            <circle r={62} fill="#ffc43d" stroke={INK} strokeWidth={6} />
            <Txt x={0} y={4} size={86} fill={INK}>?</Txt>
          </g>
        ) : null}
        {/* the shop window and the open door, warm light inside */}
        <Block x={-180} y={640} w={500} h={520} r={10} fill="#ffd98a" opacity={0.85} />
        <Block x={360} y={640} w={260} h={680} r={10} fill="#ffe7a3" />
        <Glow x={490} y={980} r={420} color="#ffd98a" o={0.45} />
        <Block x={700} y={640} w={440} h={520} r={10} fill="#ffd98a" opacity={0.85} />
        {/* the pavement */}
        <rect x={-800} y={1320} width={2880} height={70} fill="#8b8fa6" stroke={INK} strokeWidth={6} />
        <rect x={-800} y={1390} width={2880} height={1200} fill="#2b2d3c" />
        <rect x={1240} y={-200} width={200} height={1600} fill="#8b8fa6" opacity={0.9} />
        {/* the street lamp */}
        <rect x={-40} y={420} width={20} height={900} fill="#3a3f55" stroke={INK} strokeWidth={4} />
        <Glow x={-30} y={440} r={300} color="#ffd98a" o={0.4} />
        {/* gamers spilling out of the door */}
        {[0, 1, 2].map((i) => (spill > i / 3 ? <Gamer key={`d${i}`} x={440 + i * 60} y={1310} s={150 * spill} m={m} i={i + 7} /> : null))}
        {/* the queue */}
        {spots.map(([x, y, sc], i) => {
          const show = fill * spots.length - i;
          if (show <= 0 && !(m.t >= block && i >= 7)) return null;
          const k = i >= 7 ? m.lerp([block + (i - 7) * 3, block + (i - 7) * 3 + 10], [0, 1]) : Math.min(1, show);
          return k > 0 ? <Gamer key={i} x={x} y={y} s={190 * sc * (0.6 + 0.4 * k)} m={m} i={i} /> : null;
        })}
        {/* Rohan walking out with his bag */}
        <Char x={m.lerp([behind, behind + 30], [480, 120])} y={1500} s={300} who="rohan" face="grin" look={[-0.6, 0]} armL={[30, 20 + walk * 10]}
          holdL={([hx, hy]) => <rect x={hx - 60} y={hy - 10} width={120} height={120} rx={10} fill="#f4efe3" stroke={INK} strokeWidth={5} />} />
      </View>
    </Stage>
  );
};

export default Queue;
