// Turn: "But the pumps sell the most, so they must keep the most. They don't."
// The gas station from above at dawn: the pump island lights up gold on "pumps", a queue of cars rolls up to every
// pump on "most", a fat moneybag rises over the pumps on "keep", and on "don't" it deflates while the light swings
// over to the shop's roof.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { MoneyBag } from "./props";

const CarTop: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g>
    <Block x={x - 50} y={y - 90} w={100} h={180} r={30} fill={color} />
    <Block x={x - 38} y={y - 50} w={76} h={60} r={12} fill="#bfe3ff" shadow={false} />
  </g>
);

const Above: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pumps = m.at("pumps", 6), most = m.at("most", 18), keep = m.at("keep", 40), dont = m.at("don't", 60);
  const gold = m.t >= pumps ? m.pop(pumps, 10) : 0;
  const queue = m.lerp([most - 2, most + 16], [0, 1], Easing.out(Easing.cubic));
  const rise = m.lerp([keep - 2, keep + 12], [0, 1], Easing.out(Easing.back(1.4)));
  const flop = m.lerp([dont - 2, dont + 10], [0, 1], Easing.out(Easing.cubic));
  const push = m.lerp([keep - 4, keep + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([dont - 2, dont + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.12 * push + 0.12 * close;
  const cx = 540 + 0 * push, cy = 820 + 60 * push - 120 * close;
  const colors = ["#e0352b", "#3d5af1", "#ffc23d", "#3a9d5d"];
  return (
    <Stage p={p} bg="#a7c7a0" vignette={0.32}>
      <View zoom={zoom} cx={cx + m.wave(40, 14)} cy={(cy) + m.wave(56, 10)}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#a7c7a0" />
        <rect x={-400} y={1180} width={1880} height={260} fill="#5a5f6e" />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-380 + i * 240} y={1300} width={120} height={16} fill="#f4f1e8" />)}
        <rect x={60} y={420} width={960} height={760} fill="#7a808f" />
        {/* the shop's roof */}
        <Block x={200} y={260} w={680} h={230} fill="#b5553a" />
        <Glow x={540} y={375} r={420} color="#ffd34a" o={0.6 * close} />
        <Txt x={540} y={395} size={64} fill="#ffffff">SHOP</Txt>
        {/* the canopy over the pumps */}
        <Glow x={540} y={830} r={460} color="#ffd34a" o={0.55 * gold * (1 - 0.8 * close)} />
        <Block x={120} y={640} w={840} h={380} fill="#f4f1e8" opacity={0.92} />
        {[0, 1, 2, 3].map((i) => <Block key={i} x={190 + i * 200} y={790} w={100} h={80} r={10} fill="#e9473b" />)}
        <Txt x={540} y={720} size={56} fill="#e0352b">PUMPS</Txt>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <CarTop x={240 + i * 200} y={1100 + 300 * (1 - queue)} color={colors[i]!} />
            <CarTop x={240 + i * 200} y={1320 + 400 * (1 - queue)} color={colors[(i + 2) % 4]!} />
          </g>
        ))}
        {rise > 0 ? <MoneyBag x={540} y={820 - 220 * rise + 60 * flop} s={1.3 * rise} fill={1 - 0.75 * flop} /> : null}
      </View>
    </Stage>
  );
};

export default Above;
