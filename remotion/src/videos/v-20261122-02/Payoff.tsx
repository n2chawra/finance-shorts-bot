// Payoff: "Last year alone, that company got {fact4}: {cmp_years} times the jet bill."
// The security company's money wall: the small jet-bill stack stands on the left under its invoice on "Last", the
// security stack starts to rise on the right on "alone", shoots up as the counter over it lands on the amount on "got",
// a ratio stamp slams between the stacks on "jet", and the guards on the monitors turn to look on "bill".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Display, Glow, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { CashStack, Guard, Invoice } from "./props";

type Params = { fig?: { jet?: string; sec25?: string; ratio?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const last = m.at("last", 2), alone = m.at("alone", 14), got = m.at("got", 28), jet = m.at("jet", 70), bill = m.at("bill", m.end - 8);
  const rise = m.lerp([alone, got + 20], [0, 1]);
  const count = m.lerp([got, got + 20], [0, 1]);
  const ratio = m.pop(jet, 9);
  const look = m.t >= bill ? 1 : 0;
  const zoom = m.t < got ? m.lerp([0, got], [0.98, 1.04]) : m.t < jet ? m.lerp([got, got + 14], [1.04, 1.2]) : m.lerp([jet, jet + 14], [1.2, 1.06]);
  const cy = m.t < got ? 900 : m.t < jet ? m.lerp([got, got + 14], [900, 760]) : m.lerp([jet, jet + 14], [760, 860]);
  const ratioText = `${fig.ratio ?? ""}×`;
  return (
    <Stage p={p} bg="#141a2c" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#141a2c" />
        {/* the monitor wall behind, guards on screen */}
        {[0, 1, 2, 3].map((c) => (
          <g key={c}>
            <rect x={60 + c * 250} y={120} width={220} height={170} rx={10} fill="#0b1a2a" stroke={INK} strokeWidth={5} />
            <g transform={`translate(${170 + c * 250} 290)`}><g transform="scale(0.5)"><Guard x={0} y={0} s={140} m={m} i={c} look={[look ? (c < 2 ? 0.8 : -0.8) : 0, 0]} /></g></g>
          </g>
        ))}
        <rect x={-700} y={1300} width={2480} height={1400} fill="#2a3044" />
        <Glow x={760} y={900} r={460} color="#4dff9a" o={0.2 + 0.2 * rise} />
        {/* the jet bill: a small stack under its invoice */}
        <Invoice x={90} y={620} w={300} logo="spacex" amount={fig.jet ?? ""} k={1} to="JET BILL" rot={-4} />
        <CashStack x={240} y={1300} n={2} w={220} />
        {/* the security bill: a tall stack rising */}
        <CashStack x={760} y={1300} n={2 + rise * 12} w={240} />
        <Display x={70} y={360} w={420} h={190} label="SECURITY BILL" value={countText(fig.sec25 ?? "", count)} color="#4dff9a" k={Math.min(1, rise * 4)} />
        {ratio > 0 ? (
          <g transform={`translate(470 1040) rotate(-8) scale(${1 + (1 - Math.min(1, ratio)) * 1.2})`}>
            <circle r={110} fill="#ffc43d" stroke={INK} strokeWidth={8} />
            <Txt x={0} y={4} size={96} fill={INK}>{ratioText}</Txt>
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Payoff;
