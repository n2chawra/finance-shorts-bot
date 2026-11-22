// Turn: "So is he any closer to her now? Not even close."
// A playground seesaw in a city park: Brian Niccol sits on one end, slammed to the ground, on "closer"; the barista
// climbs onto the other end, high in the air, on "her"; a sack of cash drops onto his end on "Not"; her end jolts even
// higher on "close".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Barista, GREEN, Niccol } from "./props";

const Seesaw: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const closer = m.at("closer", 0), her = m.at("her", 10), not = m.at("not", 28), close = m.at("close", 40);
  const on = m.pop(her, 10);
  const sack = m.lerp([not - 8, not], [0, 1], (x) => x * x);
  const jolt = m.pulse(close + 2, 8);
  const ang = -14 - 6 * Math.min(1, sack) - 6 * jolt; // degrees: his (left) end down
  const zoom = m.t < not ? 1.0 : m.t < close ? m.lerp([not, not + 8], [1.0, 1.12]) : m.lerp([close, close + 8], [1.12, 1.26]);
  const cx = m.t < close ? 540 : m.lerp([close, close + 8], [540, 640]);
  const cy = m.t < close ? 980 : m.lerp([close, close + 8], [980, 820]);
  const L = 420;
  const end = (side: -1 | 1): [number, number] => [540 + side * L * Math.cos((ang * Math.PI) / 180), 1150 + side * L * Math.sin((ang * Math.PI) / 180)];
  const [lx, ly] = end(-1), [rx, ry] = end(1);
  return (
    <Stage p={p} bg="#bfe6ff" vignette={0.25}>
      <View zoom={zoom} cx={cx + m.wave(110, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1700} fill="#bfe6ff" />
        <Glow x={850} y={300} r={200} color="#fff4c2" o={0.7} />
        <circle cx={850} cy={300} r={70} fill="#fff1b8" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-200 + i * 300} y={700 - (i % 3) * 120} width={180} height={600} fill="#9fb7cf" />)}
        {[0, 1, 2].map((i) => <g key={i}><rect x={-100 + i * 520} y={980} width={30} height={240} fill="#6b4329" /><Ball x={-85 + i * 520} y={940} r={110} fill="#5aa55a" /></g>)}
        <rect x={-400} y={1200} width={1880} height={1300} fill="#7cc36b" />
        <path d="M 480 1210 L 540 1140 L 600 1210 Z" fill="#c8102e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <Limb a={[lx, ly]} b={[rx, ry]} w={34} color="#f2cc4f" />
        <Niccol x={lx + 30} y={ly + 20} s={150} m={m} sit armL={[70, 60]} armR={[70, 60]} />
        {on > 0 ? <g opacity={Math.min(1, on * 1.5)}><Barista x={rx - 20} y={ry + 30 - jolt * 30} s={150} m={m} face={m.t >= not ? "shock" : "worried"} look={[-0.6, 0.4]} armL={[150, 160]} armR={[150, 160]} /></g> : null}
        {sack > 0 ? (
          <g transform={`translate(${lx + 230} ${ly - 70 - (1 - sack) * 600}) scale(0.8)`}>
            <path d="M -90 -100 Q -110 40 0 60 Q 110 40 90 -100 Q 40 -150 0 -110 Q -40 -150 -90 -100 Z" fill="#c9a36b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <Txt x={0} y={-10} size={64} fill={GREEN}>CASH</Txt>
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Seesaw;
