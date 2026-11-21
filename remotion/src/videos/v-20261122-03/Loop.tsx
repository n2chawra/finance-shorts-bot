// Loop: "Pizza or coins: which would you keep? He chose pizza."
// Back in the hallway at night: a pizza box floats up on the left on "Pizza", a pile of bitcoin coins on the right on
// "coins", a question mark pops between them on "keep", and on "chose" the camera settles on the hook's framing as
// Laszlo takes the boxes from the driver at the open door: the first frame again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { BtcCoin, Driver, HALLBG, Hall, Laszlo, PizzaBox } from "./props";
import { HallTable } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pz = m.at("pizza", 2), cn = m.at("coins", 14), keep = m.at("keep", 28), chose = m.at("chose", m.end - 18);
  const a = m.pop(pz, 10), b = m.pop(cn, 10), q = m.pop(keep, 9);
  const away = m.lerp([chose, chose + 12], [0, 1]);
  const zoom = m.t < chose ? 1.04 : m.lerp([chose, chose + 16], [1.04, 1.1]);
  const cy = 950;
  return (
    <Stage p={p} bg={HALLBG} vignette={0.4}>
      <View zoom={zoom} cx={520 + m.wave(110, 5)} cy={cy}>
        <Hall m={m} door={1} />
        <HallTable m={m} send={0} />
        <Driver x={880} y={1330} s={250} m={m} />
        <Laszlo x={470} y={1450} s={290} m={m} face="grin" look={[0.7, -0.2]} armR={[50 + away * 40, 70]} armL={[20, 10]} />
        {away > 0 ? (
          <g>
            <PizzaBox x={800 - away * 200} y={1000} w={300} m={m} />
            <PizzaBox x={800 - away * 200} y={935} w={300} m={m} steam={false} />
          </g>
        ) : null}
        <g opacity={1 - away}>
          {a > 0 ? <g transform={`translate(0 ${(1 - a) * 120})`}><PizzaBox x={270} y={620} w={300} m={m} /></g> : null}
          {b > 0 ? (
            <g transform={`translate(0 ${(1 - b) * 120})`}>
              {[[-60, 0], [60, 0], [0, -70], [-110, -40], [110, -40]].map(([dx, dy], i) => <BtcCoin key={i} x={790 + dx!} y={560 + dy!} r={60} />)}
            </g>
          ) : null}
          {q > 0 ? (
            <g transform={`translate(540 580) scale(${0.4 + 0.6 * q})`}>
              <circle r={70} fill="#ffc43d" stroke={INK} strokeWidth={6} />
              <Txt x={0} y={4} size={96} fill={INK}>?</Txt>
            </g>
          ) : null}
        </g>
      </View>
    </Stage>
  );
};

export default Loop;
