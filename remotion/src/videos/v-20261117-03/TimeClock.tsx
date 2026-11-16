// Turn: "That day takes 4 hours of character pay."
// The cast break room with a punch clock: the bear punches its card in on "That", the clock's hands sweep round on
// "takes", an hour counter on the wall counts up to the figure on "hours", and on "pay" a ticket prints out of the
// clock into the bear's paw.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, INK, Stage, View, countText, motion } from "../../flat/kit";
import { Bear, ParkTicket } from "./props";

type Params = { fig?: { hours?: string } };

const TimeClock: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const hours = (p.beat.params as Params).fig?.hours ?? "";
  const that = m.at("that", 1), takes = m.at("takes", 10), hrs = m.at("hours", 24), pay = m.at("pay", 34);
  const punch = m.lerp([that - 2, that + 6], [0, 1]) * (1 - m.lerp([that + 8, that + 14], [0, 1]));
  const sweep = m.t < takes ? 0 : (m.t - takes) / 12;
  const count = m.lerp([hrs - 2, hrs + 12], [0, 1], Easing.out(Easing.cubic));
  const print = m.lerp([pay - 2, pay + 12], [0, 1], Easing.out(Easing.cubic));
  const close = m.lerp([takes - 4, takes + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.04 + 0.12 * close - 0.06 * m.lerp([pay - 4, pay + 8], [0, 1]);
  const cx = 540, cy = 860 - 80 * close;
  return (
    <Stage p={p} bg="#2f4a4a" vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={2600} fill="#3e6060" />
        {Array.from({ length: 8 }).map((_, i) => <Block key={i} x={-480 + i * 250} y={1000} w={200} h={300} fill="#c9a36a" sw={4} shadow="right" />)}
        {/* the hour counter on the wall */}
        <Display x={110} y={260} w={360} h={220} label="HOURS" value={m.t < hrs - 2 ? "" : countText(hours, count)} color="#ffcf4a" />
        {/* the punch clock */}
        <Block x={560} y={260} w={380} h={560} r={20} fill="#9aa3b5" />
        <circle cx={750} cy={430} r={130} fill="#fffaf0" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={750 + Math.sin(i * Math.PI / 6) * 110} y1={430 - Math.cos(i * Math.PI / 6) * 110} x2={750 + Math.sin(i * Math.PI / 6) * 124} y2={430 - Math.cos(i * Math.PI / 6) * 124} stroke={INK} strokeWidth={5} />)}
        <line x1={750} y1={430} x2={750 + Math.sin(sweep * 2 * Math.PI) * 100} y2={430 - Math.cos(sweep * 2 * Math.PI) * 100} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={750} y1={430} x2={750 + Math.sin(sweep * Math.PI / 6) * 70} y2={430 - Math.cos(sweep * Math.PI / 6) * 70} stroke="#d7262b" strokeWidth={12} strokeLinecap="round" />
        <Ball x={750} y={430} r={14} fill={INK} sw={0} shadow={false} />
        <Block x={650} y={620} w={200} h={40} r={8} fill={INK} />
        {/* the card going in */}
        <rect x={700} y={540 + 80 * punch} width={100} height={130} fill="#fffaf0" stroke={INK} strokeWidth={4} />
        {/* the ticket printing out */}
        {print > 0 ? <g transform={`translate(0 ${120 * print})`}><ParkTicket x={600} y={600} w={300} rot={4} label="ONE DAY" /></g> : null}
        <rect x={-500} y={1300} width={2080} height={900} fill="#2a3a3a" />
        <Bear x={420} y={1480 + m.wave(60, 3)} s={160} wave={m.t >= pay ? 0.5 : 0.1} armL={0.3} />
      </View>
    </Stage>
  );
};

export default TimeClock;
