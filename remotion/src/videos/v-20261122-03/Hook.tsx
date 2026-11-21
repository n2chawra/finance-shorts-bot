// Hook: "Laszlo Hanyecz paid for {fact2} pizzas with bitcoin. So what did they really cost him?"
// The hallway by the front door at night: Laszlo opens the door to a Papa John's driver with two steaming boxes (sent
// by the stranger he paid) on "Laszlo"; on "paid" the chat window on his laptop sends coins to a stranger's avatar;
// the boxes slide into his arms on "pizzas"; a big bitcoin coin spins up over the laptop on "bitcoin"; a price tag
// with a question mark drops onto the boxes on "cost" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, type Motion, Stage, Txt, View, motion } from "../../flat/kit";
import { BigTag, BtcCoin, Driver, HALLBG, Hall, Laptop, Laszlo, PizzaBox } from "./props";

/** The chat window on the laptop: the offer line, the stranger's avatar, coins flying across on `send` 0..1. */
export const Chat: React.FC<{ send: number }> = ({ send }) => (
  <g>
    <rect x={-195} y={-258} width={390} height={40} fill="#3f6fd8" />
    <Txt x={0} y={-238} size={24} fill="#ffffff" deco>PIZZA FOR BITCOIN</Txt>
    <rect x={-180} y={-205} width={240} height={50} rx={12} fill="#ffffff" stroke={INK} strokeWidth={3} />
    <Txt x={-60} y={-180} size={22} fill={INK} deco>two pizzas?</Txt>
    <circle cx={150} cy={-110} r={36} fill="#7ad36b" stroke={INK} strokeWidth={4} />
    <circle cx={150} cy={-120} r={14} fill="#ffffff" />
    {send > 0 && send < 1 ? [0, 1, 2].map((i) => {
      const k = Math.max(0, Math.min(1, send * 1.4 - i * 0.2));
      return <circle key={i} cx={-150 + 300 * k} cy={-90 - Math.sin(k * Math.PI) * 60} r={16} fill="#f7931a" stroke={INK} strokeWidth={3} />;
    }) : null}
  </g>
);

export const HallTable: React.FC<{ m: Motion; send: number; glow?: number }> = ({ m, send, glow = 0.6 }) => (
  <g>
    <Block x={-40} y={1000} w={480} h={40} fill="#6b4329" shadow="bottom" />
    <rect x={0} y={1040} width={24} height={260} fill="#6b4329" /><rect x={380} y={1040} width={24} height={260} fill="#6b4329" />
    <Laptop x={200} y={990} s={0.8} glow={glow + 0.1 * Math.sin(m.t / 5)} screen={<Chat send={send} />} />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const laszlo = m.at("laszlo", 0), paid = m.at("paid", 14), pizzas = m.at("pizzas", 30), bitcoin = m.at("bitcoin", 48), cost = m.at("cost", m.end - 16);
  const door = m.lerp([laszlo, laszlo + 10], [0.55, 1]);
  const send = m.lerp([paid, paid + 18], [0, 1]);
  const hand = m.lerp([pizzas, pizzas + 12], [0, 1]);
  const coin = m.pop(bitcoin, 10);
  const tag = m.pop(cost, 9);
  const zoom = m.t < bitcoin ? m.lerp([0, bitcoin], [1.1, 1.14]) : m.t < cost ? m.lerp([bitcoin, bitcoin + 14], [1.14, 1.0]) : m.lerp([cost, cost + 8], [1.0, 1.18]);
  const cx = m.t < cost ? 520 : m.lerp([cost, cost + 8], [520, 540]);
  const cy = m.t < cost ? 950 : m.lerp([cost, cost + 8], [950, 900]);
  const bx = m.lerp([pizzas, pizzas + 12], [800, 600]);
  return (
    <Stage p={p} bg={HALLBG} vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(110, 5)} cy={cy}>
        <Hall m={m} door={door} />
        <HallTable m={m} send={send} />
        <Driver x={880} y={1330} s={250} m={m} armR={[75 + hand * 20, 85]} armL={[75 + hand * 20, 85]} />
        <Laszlo x={470} y={1450} s={290} m={m} face={m.t >= cost ? "worried" : "grin"} look={[0.7, -0.2]} armR={[50 + hand * 40, 70]} armL={[20, 10]} />
        <PizzaBox x={bx} y={1000} w={300} m={m} />
        <PizzaBox x={bx} y={935} w={300} m={m} steam={false} />
        {coin > 0 ? <g transform={`translate(0 ${(1 - coin) * 60})`} opacity={Math.min(1, coin * 1.5)}><BtcCoin x={200} y={660} r={95 * coin} spin={Math.abs(Math.cos(m.t / 7))} /></g> : null}
        <BigTag x={bx + 90} y={650} w={140} text="?" k={tag} size={96} />
      </View>
    </Stage>
  );
};

export default Hook;
