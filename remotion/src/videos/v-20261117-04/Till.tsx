// Build: "The average store sells about {ins_per_part} a year inside the shop."
// The shop's checkout: the cashier scans Rohan's coffee on "Each" and the till beeps, its display counts up on
// "sells" and lands on the year's in-store sales per store on "year", the hot dog roller lights on "year", the
// drinks fridge glows on "drinks", and the snack rack fills behind the cashier on "snacks" as the camera pulls back.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chips, Coffee } from "./props";

type Params = { fig?: { sales?: string } };

const Till: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sales = (p.beat.params as Params).fig?.sales ?? "";
  const each = m.at("the", 1), sells = m.at("sells", 20), year = m.at("year", 50), drinks = m.at("inside", 56), snacks = m.at("shop", 68);
  const count = m.lerp([sells, year], [0, 1], Easing.out(Easing.cubic));
  const close = m.lerp([sells - 4, sells + 10], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([snacks - 4, snacks + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.05 + 0.15 * close - 0.2 * wide;
  const roll = m.t >= year ? 1 : 0, fridge = m.t >= drinks ? 1 : 0;
  const rack = m.lerp([snacks - 2, snacks + 10], [0, 1]);
  return (
    <Stage p={p} bg="#e9f0f4" vignette={0.3}>
      <View zoom={zoom} cx={560 + m.wave(40, 14)} cy={(800 + 40 * wide) + m.wave(56, 10)}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#e9f0f4" />
        <rect x={-400} y={1240} width={1880} height={1000} fill="#c9cfd6" />
        {/* the drinks fridge on the left */}
        <Block x={-200} y={300} w={300} h={940} r={14} fill="#dfe6ee" />
        <Glow x={-50} y={760} r={260} color="#7ad0ff" o={0.15 + 0.45 * fridge} />
        {[0, 1, 2, 3].map((r) => Array.from({ length: 3 }).map((_, i) => (
          <Block key={`${r}-${i}`} x={-170 + i * 85} y={360 + r * 210} w={60} h={150} r={18} fill={["#e0352b", "#3a9d5d", "#3d5af1"][(i + r) % 3]!} shadow={false} />
        )))}
        {/* the snack rack behind the cashier */}
        <Block x={560} y={260} w={480} h={560} fill="#f4f1e8" />
        {[0, 1, 2].map((r) => Array.from({ length: 4 }).map((_, i) => {
          const n = r * 4 + i;
          return n < 4 + rack * 8 ? <Chips key={`${r}-${i}`} x={620 + i * 110} y={420 + r * 170} s={0.6} /> : null;
        }))}
        {/* the cashier */}
        <Char x={900} y={1100} s={170} outfit="shirt" top="#1f8f6a" pants="#2a2f3d" hair="bun" hairColor="#3a2a2a" skin="#d8a07a" face="happy" armL={[70, 100]} armR={[20, 10]} />
        {/* the counter, the hot dog roller and the till */}
        <Block x={150} y={1000} w={1000} h={240} fill="#1f8f6a" />
        <Block x={180} y={890} w={250} h={110} r={10} fill="#9aa3b5" />
        <Glow x={305} y={930} r={170} color="#ff8a3a" o={0.5 * roll} />
        {Array.from({ length: 4 }).map((_, i) => <Block key={i} x={200} y={905 + i * 22} w={210} h={14} r={7} fill={roll ? "#c75a2a" : "#8a6a5a"} shadow={false} />)}
        <Txt x={305} y={870} size={46} fill="#e0352b">HOT DOGS</Txt>
        <Coffee x={500} y={1000} s={0.7} t={m.t} />
        <rect x={430} y={960} width={140} height={6} fill="#ff3a3a" opacity={m.t >= each ? 0.9 * (1 - m.lerp([each, each + 20], [0, 1])) : 0} />
        <Display x={120} y={440} w={520} h={220} label="SHOP SALES A YEAR" value={countText(sales, count)} color="#4dff9a" k={m.t >= each ? 1 : 0.3} />
        <Glow x={380} y={550} r={300} color="#4dff9a" o={0.4 * m.pulse(year, 10)} />
        <Char x={250} y={1520} s={190} who="rohan" back face="neutral" armL={[40, 40]} armR={[60, 60]} />
      </View>
    </Stage>
  );
};

export default Till;
