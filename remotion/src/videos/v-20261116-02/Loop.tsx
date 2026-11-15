// Loop: "Would you borrow against your shares, or sell them?"
// Back in Oracle's payroll office at night: the padlocked tower glows on "borrow", a SELL sign flickers on at the
// right on "sell", and on "them" the camera pushes in to the hook's first framing, the pay slip on the board, so the
// replay runs straight on.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Office } from "./Hook";

type Params = { fig?: { salary?: string; shares?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const borrow = m.at("borrow", 6), sell = m.at("sell", 30), them = m.at("them", 40);
  const k = m.lerp([sell, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.95 + 0.1 * k, cx = 540 - 20 * k, cy = 860 - 100 * k;
  const on = m.t >= sell ? (Math.floor(m.t / 3) % 3 ? 1 : 0.5) : 0;
  return (
    <Stage p={p} bg="#14203a" vignette={0.46}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <Office m={m} salary={P.salary ?? ""} shares={P.shares ?? ""} stamp={0.85} tag={0.45} shut={1} n={40} />
        <Glow x={780} y={900} r={360} color="#ffd23f" o={0.45 * m.pop(borrow, 12) * (1 - m.lerp([them, m.end], [0, 1]))} />
        <g opacity={on * (1 - m.lerp([them, m.end], [0, 1]))}>
          <Txt x={790} y={160} size={80} fill="#ff6a5a" glow="#ff6a5a">SELL</Txt>
        </g>
      </View>
    </Stage>
  );
};

export default Loop;
