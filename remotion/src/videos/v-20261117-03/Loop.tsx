// Loop: "Quiet day or busy day: which would you buy? And ask again:"
// Back at the Disneyland gate: a pale quiet-day ticket appears on the left on "Quiet", a gold busy-day ticket on
// the right on "busy", Rohan looks from one to the other on "buy", the bear waves on "ask", and on "again" the
// camera settles on the hook's first frame.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Gate } from "./Hook";
import { ParkTicket } from "./props";

type Params = { fig?: { low?: string; top?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = (p.beat.params as Params).fig ?? {};
  const quiet = m.at("quiet", 1), busy = m.at("busy", 12), buy = m.at("buy", 30), ask = m.at("ask", 40), again = m.at("again", 50);
  const q = m.pop(quiet, 10), b = m.pop(busy, 10);
  const fade = 1 - m.lerp([again - 2, again + 10], [0, 1]);
  const look: [number, number] = m.t < buy ? [1, -0.3] : (Math.floor((m.t - buy) / 9) % 2 ? [1, -0.3] : [-1, -0.3]);
  const settle = m.lerp([again - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <Stage p={p} bg="#9fd8ff" vignette={0.24}>
      <View zoom={1.0 + 0.08 * settle} cx={540 + m.wave(90, 4)} cy={920 - 20 * settle}>
        <Gate m={m} sign={1} wave={m.t >= ask ? 0.6 + 0.4 * Math.sin((m.t - ask) / 3) : 0} clock={0}>
          <g opacity={fade}>
            <g transform={`translate(0 ${-40 * q})`} opacity={q}><ParkTicket x={70} y={720} w={320} price={P.low ?? ""} rot={-6} color="#9aa3b5" label="QUIET DAY" /></g>
            <g transform={`translate(0 ${-40 * b})`} opacity={b}><ParkTicket x={580} y={720} w={320} price={P.top ?? ""} rot={6} color="#d4af37" label="BUSY DAY" /></g>
            <Char x={340} y={1520 + m.wave(60, 3)} s={160} who="rohan" face="worried" look={look} armR={[40, 110]} armL={[20, 10]} />
          </g>
        </Gate>
      </View>
    </Stage>
  );
};

export default Loop;
