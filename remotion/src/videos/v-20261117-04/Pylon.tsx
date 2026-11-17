// Payoff: "Gas brings only {fact2} of the gross profit. Most of it comes from inside the store."
// The station's tall roadside sign by the highway at dusk: its top panel flips to GAS on "Gas", the share slams onto
// the sign's board on "brings", the camera pushes in on the small share on "profit", a bigger STORE panel lights up
// below on "Most", and a coffee cup glows on it on "store".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Limb, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Chips, Coffee } from "./props";

type Params = { fig?: { profit?: string } };

const Pylon: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const profit = (p.beat.params as Params).fig?.profit ?? "";
  const gas = m.at("gas", 2), brings = m.at("brings", 10), prof = m.at("profit", 40), most = m.at("most", 54), comes = m.at("comes", 64), inside = m.at("inside", 74), store = m.at("store", 84);
  const flip = m.lerp([gas - 2, gas + 8], [0, 1], Easing.out(Easing.cubic));
  const slam = m.lerp([brings - 2, brings + 8], [0, 1], Easing.out(Easing.back(1.8)));
  const push = m.lerp([prof - 4, prof + 10], [0, 1], Easing.inOut(Easing.cubic));
  const lit = m.t >= most ? m.pop(most, 10) : 0;
  const cup = m.t >= comes ? m.pop(comes, 10) : 0, chip = m.t >= inside ? m.pop(inside, 10) : 0, flash = m.pulse(store + 3, 10);
  const back = m.lerp([most - 4, most + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.2 * push - 0.18 * back;
  const cy = 760 - 160 * push + 220 * back;
  return (
    <Stage p={p} bg="#3a2a5a" vignette={0.4}>
      <View zoom={zoom} cx={540 + m.wave(40, 14)} cy={(cy) + m.wave(56, 10)}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#3a2a5a" />
        <Glow x={540} y={1250} r={900} ry={300} color="#ff8a4a" o={0.5} />
        <rect x={-400} y={1300} width={1880} height={900} fill="#2a2f3d" />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-400 + ((i * 360 + m.t * 6) % 1880)} y={1680} width={180} height={16} fill="#ffd34a" opacity={0.7} />)}
        <Limb a={[540, 700]} b={[540, 1320]} w={60} color="#9aa3b5" />
        {/* the GAS panel */}
        <Block x={210} y={200} w={660} h={460} r={20} fill="#162033" />
        <g transform={`scale(1 ${0.2 + 0.8 * flip})`} style={{ transformOrigin: "540px 260px" }}>
          <Block x={240} y={220} w={600} h={110} r={12} fill="#e9473b" shadow={false} />
          <Txt x={540} y={300} size={70} fill="#ffffff">GAS</Txt>
        </g>
        <Txt x={540} y={395} size={46} fill="#bfe3ff">SHARE OF GROSS PROFIT</Txt>
        <g opacity={slam > 0 ? 1 : 0} transform={`translate(540 520) scale(${0.4 + 0.6 * slam}) translate(-540 -520)`}>
          <Txt x={540} y={580} size={160} fill="#ffd34a" glow="#ff9a3a">{profit}</Txt>
        </g>
        {/* the STORE panel, bigger */}
        <Glow x={540} y={1000} r={500} color="#4dff9a" o={0.45 * lit + 0.4 * flash} />
        <Block x={140} y={760} w={800} h={420} r={20} fill={lit > 0.5 ? "#1f8f6a" : "#1c3a32"} />
        <Txt x={540} y={860} size={80} fill={lit > 0.5 ? "#ffffff" : "#6b8a80"}>STORE</Txt>
        {lit > 0 ? <Tag x={340} y={900} w={400} h={100} text="MOST OF IT" size={56} bg="#ffd34a" fg="#1d1a2b" k={lit} /> : null}
        <g opacity={cup}><Coffee x={260} y={1150} s={0.6 + 0.3 * cup} t={m.t} /></g>
        <g opacity={chip}><Chips x={820} y={1150} s={0.6 + 0.3 * chip} rot={8} /></g>
        <Block x={-260} y={1100} w={300} h={200} fill="#b5553a" />
        <Block x={-260} y={1130} w={140} h={110} fill="#ffe9a8" shadow={false} />
        <Block x={1040} y={1080} w={320} h={220} fill="#f4f1e8" />
        <rect x={1040} y={1080} width={320} height={30} fill="#e9473b" />
      </View>
    </Stage>
  );
};

export default Pylon;
