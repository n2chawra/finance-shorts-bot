// Promise: "Even the shop that sold his ticket got a cheque for $1M. So where did Castro's go?"
// A small gas station shop at night: the LOTTO neon flickers on in the window on "shop", the ticket printer on
// the counter spits out a ticket on "sold", the clerk holds it to the light on "ticket", a giant cheque with the
// bonus slides onto the counter on "got", and on "Castro's" an empty cheque outline with a question mark pops up.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Cheque } from "./props";

type Params = { fig?: { bonus?: string } };

const Shop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bonus = (p.beat.params as Params).fig?.bonus ?? "";
  const shop = m.at("shop", 4), sold = m.at("sold", 14), ticket = m.at("ticket", 22), got = m.at("got", 32), castro = m.at("where", 62);
  const neon = m.t < shop ? 0.15 : (Math.floor(m.t / 2) % 7 === 0 ? 0.55 : 1);
  const tk = m.lerp([sold, sold + 10], [0, 1]);
  const raise = m.lerp([ticket - 2, ticket + 8], [0, 1]);
  const slide = m.lerp([got - 4, got + 10], [0, 1], Easing.out(Easing.back(1.2)));
  const q = m.pop(castro, 10);
  const mid = m.lerp([ticket - 4, ticket + 12], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([got - 2, got + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.1 * mid + 0.1 * close;
  return (
    <Stage p={p} bg="#18172e" vignette={0.42}>
      <View zoom={zoom} cx={540 + m.wave(100, 5)} cy={860 - 40 * close}>
        <rect x={-300} y={-300} width={1680} height={2400} fill="#2a2846" />
        {/* the window onto the forecourt, the neon */}
        <Block x={40} y={230} w={1000} h={420} fill="#101833" shadow={false} />
        <rect x={60} y={250} width={960} height={380} fill="#0d1a3a" />
        <Block x={910} y={430} w={90} h={200} fill="#e0352b" />
        <Block x={926} y={450} w={58} h={50} fill="#ffe28a" sw={3} />
        <Glow x={300} y={420} r={300} color="#ff4fa3" o={0.6 * neon} />
        <Txt x={300} y={420} size={110} fill={neon > 0.5 ? "#ff7cc0" : "#7a3a5c"} glow={neon > 0.5 ? "#ff4fa3" : undefined}>LOTTO</Txt>
        {/* shelves */}
        {[0, 1].map((r) => <Block key={r} x={-200} y={700 + r * 120} w={1480} h={20} fill="#6a5a4a" shadow={false} />)}
        {Array.from({ length: 22 }).map((_, i) => <Block key={i} x={-180 + (i % 11) * 130} y={620 + Math.floor(i / 11) * 120} w={90} h={80} r={6} fill={["#e8a33a", "#3fb6a0", "#e0352b", "#7a8cff"][i % 4]!} sw={3} shadow={false} />)}
        {/* the clerk behind the counter */}
        <Char x={810} y={1420} s={200} outfit="shirt" top="#3a8a5a" pants="#2a2f3d" hair="side" hairColor="#3a2a2a" skin="#d8a07a"
          face={m.t >= got ? "grin" : "happy"} armL={m.t >= m.at("cheque", 40) ? [160, 175] : [20, 10]} armR={[30 + 120 * raise, 40 + 130 * raise]} />
        {raise > 0 ? <g transform={`translate(${910 - 40 * raise} ${930 - 180 * raise}) rotate(-8)`}>
          <rect x={-50} y={-70} width={100} height={140} fill="#fffdf4" stroke={INK} strokeWidth={4} />
          <rect x={-50} y={-70} width={100} height={30} fill="#d7262b" />
        </g> : null}
        {/* the counter and the ticket printer */}
        <Block x={-200} y={1080} w={1480} h={300} fill="#8a5a3a" shadow="bottom" />
        <Block x={140} y={960} w={240} h={130} r={10} fill="#3a3f52" />
        <rect x={190} y={960 - 90 * tk} width={140} height={90 * tk} fill="#fffdf4" stroke={INK} strokeWidth={3} />
        {/* the bonus cheque slides in; Castro's empty one */}
        <g transform={`translate(${-900 + 900 * slide} 0)`}><Cheque x={60} y={660} w={560} amount={bonus} name="THE SHOP" logo t={m.t / 30} /></g>
        {q > 0 ? <g opacity={q}>
          <rect x={640} y={250} width={240} height={190} rx={12} fill="none" stroke="#ffcf4a" strokeWidth={8} strokeDasharray="22 14" />
          <Txt x={760} y={345} size={130 * q} fill="#ffcf4a">?</Txt>
        </g> : null}
      </View>
    </Stage>
  );
};

export default Shop;
