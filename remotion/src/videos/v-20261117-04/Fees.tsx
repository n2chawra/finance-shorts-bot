// Promise: "Rohan taps his card, and the card company takes about {fee_per_part} a year from every store."
// Close on the pump's card reader: Rohan's card taps it on "taps" and it beeps green; on "company" the shot whips
// along the wire to a card company's glass tower downtown; coins pour from a tiny gas station up a chute into the
// tower on "takes"; the billboard counts from "about", coins shower on it on "a", it lands on "year"; the little station sags on "store".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Display, Flash, Glow, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BankCard, Canopy, Car, Pump, Shop } from "./props";

type Params = { fig?: { fee?: string } };

const Fees: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fee = (p.beat.params as Params).fig?.fee ?? "";
  const taps = m.at("taps", 14), company = m.at("company", 40), cut = m.at("takes", 52), about = m.at("about", 66), aa = m.at("a", 74), year = m.at("year", 80), store = m.at("store", 96);
  const tap = m.lerp([taps - 8, taps], [0, 1], Easing.out(Easing.cubic));
  const beep = m.t >= taps ? 1 : 0;
  if (m.t < company - 2) {
    return (
      <Stage p={p} bg="#141a33" vignette={0.4}>
        <View zoom={m.lerp([0, company], [1.05, 1.15])} cx={540 + m.wave(40, 14)} cy={(860) + m.wave(56, 10)}>
          <rect x={-200} y={-200} width={1480} height={2400} fill="#141a33" />
          <rect x={-200} y={1150} width={1480} height={1000} fill="#3a3f52" />
          <Block x={-200} y={150} w={1480} h={70} fill="#f4f1e8" />
          <Glow x={540} y={260} r={600} ry={140} color="#fff3c4" o={0.35} />
          <Block x={120} y={300} w={640} h={1000} r={40} fill="#e9473b" />
          <Block x={200} y={880} w={480} h={110} r={14} fill="#2a2f3d" shadow={false} />
          <Txt x={440} y={950} size={50} fill="#ffd34a">PAY AT PUMP</Txt>
          {Array.from({ length: 9 }).map((_, i) => <Block key={i} x={250 + (i % 3) * 130} y={1030 + Math.floor(i / 3) * 70} w={100} h={50} r={8} fill="#f4f1e8" shadow={false} />)}
          <Block x={180} y={420} w={520} h={380} r={24} fill="#162033" shadow={false} />
          <Glow x={440} y={610} r={300} color={beep ? "#4dff9a" : "#3a6aff"} o={0.4 + 0.3 * m.pulse(taps + 2, 8)} />
          <Txt x={440} y={580} size={60} fill={beep ? "#4dff9a" : "#bfe3ff"}>{beep ? "APPROVED" : "TAP CARD"}</Txt>
          <Ball x={440} y={700} r={44} fill={beep ? "#4dff9a" : "#2a3a52"} sw={4} shadow={false} />
          <Char x={880} y={1560} s={230} who="rohan" face="happy" look={[-1, -0.3]} armR={[15, 10]} armL={[140 - 10 * tap, 100]} />
          <BankCard x={560 - 90 * tap} y={760 - 60 * tap} w={260} rot={-12} />
        </View>
      </Stage>
    );
  }
  const go = m.lerp([company - 2, company + 14], [0, 1], Easing.inOut(Easing.cubic));
  const pour = m.lerp([cut, cut + 30], [0, 1]);
  const count = m.lerp([about, year + 4], [0, 1], Easing.out(Easing.cubic));
  const sag = m.lerp([store - 2, store + 10], [0, 1], Easing.out(Easing.cubic));
  return (
    <Stage p={p} bg="#0f1530" vignette={0.42}>
      <View zoom={1.2 - 0.12 * go} cx={540 + 40 * (1 - go) + m.wave(40, 14)} cy={(880 + 80 * (1 - go)) + m.wave(56, 10)}>
        <rect x={-300} y={-300} width={1680} height={2400} fill="#0f1530" />
        {Array.from({ length: 7 }).map((_, i) => <Block key={i} x={-260 + i * 210} y={760 + ((i * 97) % 200)} w={170} h={700} fill="#1c2448" shadow={false} />)}
        {/* the card company's glass tower */}
        <Glow x={640} y={520} r={460} color="#3a6aff" o={0.35 + 0.3 * m.pulse(aa + 4, 10)} />
        <Block x={420} y={200} w={440} h={1180} fill="#2a4ad8" />
        {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={450 + (i % 5) * 80} y={560 + Math.floor(i / 5) * 120} width={56} height={80} fill="#bfe3ff" opacity={0.35 + 0.4 * (((i * 7) % 5) / 5)} />)}
        <g transform="translate(520 250)"><BankCard x={0} y={0} w={240} /></g>
        <Display x={350} y={420} w={580} h={120} label="AVERAGE FEE PER STORE A YEAR" value={countText(fee, count)} color="#ffd34a" k={m.t >= about ? 1 : 0.3} />
        {m.t >= aa ? Array.from({ length: 8 }).map((_, i) => {
          const k = m.lerp([aa + i * 2, aa + i * 2 + 18], [0, 1], Easing.in(Easing.quad));
          return k > 0 && k < 1 ? <Coin key={`s${i}`} x={400 + i * 70} y={300 + 300 * k} r={24} spin={(m.t / 5 + i) % 1} /> : null;
        }) : null}
        {/* the chute from the little station */}
        <Limb a={[200, 1130]} b={[440, 900]} w={34} color="#9aa3b5" />
        {Array.from({ length: 6 }).map((_, i) => {
          const k = (pour * 3 + i / 6) % 1;
          return pour > 0 ? <Coin key={i} x={200 + 240 * k} y={1130 - 230 * k} r={26} spin={(m.t / 6 + i) % 1} /> : null;
        })}
        <rect x={-300} y={1300} width={1680} height={900} fill="#2a2f3d" />
        <g transform={`translate(20 ${1000 + 30 * sag}) scale(0.34 ${0.34 * (1 - 0.15 * sag)})`}>
          <rect x={-120} y={880} width={1320} height={120} fill="#3a3f52" />
          <Shop x={250} y={300} w={580} lit={1 - 0.7 * sag} small />
          <Canopy y={80} sign={1 - 0.6 * sag} small />
          <Car x={-60} y={880} w={460} />
          <Pump x={640} y={480} w={200} />
        </g>
      </View>
      <Flash k={m.pulse(company - 2, 5) * 0.8} />
    </Stage>
  );
};

export default Fees;
