// Slice: "That's about {then_per_part} a pizza. A fair deal?"
// The kitchen table under a lamp, two open pizzas: a price tag stamps onto the first on "That's", one onto the second
// on "pizza", Laszlo lifts a slice, cheese stretching, on "fair", and gives a thumbs up on "deal".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, View, motion } from "../../flat/kit";
import { BigTag, Laszlo, PizzaBox } from "./props";

type Params = { fig?: { each?: string } };

const Slice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const each = (p.beat.params as Params).fig?.each ?? "";
  const thats = m.at("thats", 2), pizza = m.at("pizza", 20), fair = m.at("fair", 36), deal = m.at("deal", m.end - 10);
  const t1 = m.pop(thats, 9), t2 = m.pop(pizza, 9);
  const lift = m.lerp([fair, fair + 14], [0, 1]);
  const zoom = m.t < fair ? m.lerp([0, fair], [1.24, 1.2]) : m.lerp([fair, fair + 14], [1.2, 1.04]);
  const cy = m.t < fair ? 900 : m.lerp([fair, fair + 14], [900, 940]);
  return (
    <Stage p={p} bg="#3a2a2a" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#c9a77a" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-700 + i * 480} y={-700} width={240} height={3300} fill="#bf9c6e" />)}
        <Glow x={540} y={500} r={600} color="#fff1c9" o={0.45} />
        <path d="M 460 160 L 620 160 L 700 300 L 380 300 Z" fill="#2c4a8a" stroke={INK} strokeWidth={6} />
        <line x1={540} y1={-100} x2={540} y2={160} stroke={INK} strokeWidth={6} />
        {/* Laszlo behind the table */}
        <Laszlo x={540} y={1300} s={280} m={m} face={m.t >= deal ? "grin" : "happy"} look={[0, 0.3]}
          armR={[60 + lift * 60, 60 + m.lerp([deal, deal + 8], [0, 80])]} armL={[50, 60]} />
        {/* the table and the two open pizzas */}
        <Block x={-100} y={1000} w={1280} h={70} fill="#7a2b3b" shadow="bottom" />
        <Block x={-100} y={1070} w={1280} h={600} fill="#5a1f2b" shadow={false} />
        <PizzaBox x={310} y={1010} w={360} m={m} open={1} />
        <PizzaBox x={770} y={1010} w={360} m={m} open={1} />
        {lift > 0 ? (
          <g transform={`translate(${740 - lift * 30} ${960 - lift * 260})`}>
            <path d="M 0 0 L 90 20 L 30 100 Z" fill="#d9442b" stroke={INK} strokeWidth={5} />
            <line x1={40} y1={100} x2={40} y2={100 + lift * 220} stroke="#ffd36b" strokeWidth={10} />
          </g>
        ) : null}
        <BigTag x={300} y={760} w={240} text={each} k={t1} size={68} rot={-8} />
        <BigTag x={760} y={760} w={240} text={each} k={t2} size={68} rot={6} />
      </View>
    </Stage>
  );
};

export default Slice;
