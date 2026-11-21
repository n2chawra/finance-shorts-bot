// Bill: "When he flies for Tesla, Tesla gets the bill: {fact1} a year."
// Tesla's office: the white jet flies past the window on "When", the Tesla logo lights on the wall on "Tesla", a clerk
// turns to the big printer on "gets", an invoice from SpaceX rolls out on "bill", its amount stamps on "year".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Desk, Invoice, Jet } from "./props";

type Params = { fig?: { bill23?: string } };

const Bill: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const amount = (p.beat.params as Params).fig?.bill23 ?? "";
  const when = m.at("when", 2), tesla = m.at("tesla", 14), gets = m.at("gets", 28), bill = m.at("bill", 40), year = m.at("single", m.end - 14);
  const fly = m.lerp([when - 4, when + 40], [-700, 1700]);
  const lit = m.lerp([tesla, tesla + 8], [0.3, 1]);
  const roll = m.lerp([bill, bill + 18], [0, 1]);
  const stamp = m.pop(year, 9);
  const zoom = m.t < bill ? m.lerp([0, bill], [1.02, 1.08]) : m.t < year ? m.lerp([bill, bill + 14], [1.08, 1.28]) : m.lerp([year, year + 12], [1.28, 1.15]);
  const cy = m.t < bill ? 860 : m.lerp([bill, bill + 14], [860, 780]);
  return (
    <Stage p={p} bg="#e9e4da" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(110, 5)} cy={cy}>
        <rect x={-600} y={-600} width={2280} height={3200} fill="#e9e4da" />
        {/* the window with the sky and the jet flying past */}
        <Block x={-100} y={200} w={760} h={420} r={12} fill="#9fd8ff" />
        <g transform={`translate(${fly} 400) scale(0.25)`}><Jet x={0} y={0} m={m} steps={0} glow={1} /></g>
        <rect x={-120} y={180} width={800} height={460} rx={14} fill="none" stroke="#c9c2b2" strokeWidth={40} />
        {/* the Tesla logo on the wall */}
        <Glow x={790} y={330} r={240} color="#ff4a4a" o={0.35 * lit} />
        <g transform="translate(790 370)" opacity={lit}><Photo name="tesla" s={110} t={0} /></g>
        {/* the printer and the invoice rolling out */}
        <Desk x={380} y={1130} w={640} />
        <Block x={460} y={900} w={480} h={230} r={20} fill="#3a3f55" />
        <rect x={500} y={930} width={400} height={24} rx={8} fill="#1d1a2b" />
        <g transform={`translate(0 ${(1 - roll) * 420})`}>
          <Invoice x={510} y={480} w={380} logo="spacex" amount={amount} k={stamp} to="TO: TESLA" />
        </g>
        <Block x={460} y={900} w={480} h={60} r={10} fill="#4a5070" shadow={false} />
        {/* the clerk */}
        <Char x={200} y={1500} s={300} who="priya" face={m.t >= year ? "shock" : "neutral"} look={[m.t >= gets ? 0.8 : -0.4, -0.2]}
          armR={[m.t >= gets ? 70 : 15, m.t >= gets ? 60 : 10]} />
      </View>
    </Stage>
  );
};

export default Bill;
