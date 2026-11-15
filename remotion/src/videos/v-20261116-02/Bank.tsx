// Build: "A loan against them is not a sale. The shares stay his."
// A bank lobby: the banker pushes a bag of cash across the counter on "loan", the certificates slide into a glass
// case on "against", a big NO SALE stamp hits the case on "not" as the camera closes in, the case's padlock
// clicks on "stay", and a gold name tag swings on the case on "his".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Banker, CashBag, Certificate, Padlock } from "./props";

const Bank: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const loan = m.at("loan", 2), against = m.at("against", 12), not = m.at("not", 26), stay = m.at("stay", 46), his = m.at("his", 56);
  const close = m.lerp([not - 4, not + 8], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([stay - 2, his + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.05 + 0.4 * close - 0.35 * back, cx = 540 + 120 * close - 100 * back, cy = 900 + 40 * close - 20 * back;
  const push = m.lerp([loan - 2, loan + 14], [0, 1], Easing.out(Easing.cubic));
  const slide = m.lerp([against - 2, against + 12], [0, 1], Easing.out(Easing.cubic));
  const st = m.pop(not, 9);
  const tag = m.pop(his - 2, 8);
  return (
    <Stage p={p} bg="#1f2a24" vignette={0.42}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#2f4a3e" />
        {[-200, 120, 440, 760, 1080].map((x) => <g key={x}><rect x={x} y={-400} width={80} height={1740} fill="#e8dcb8" stroke={INK} strokeWidth={4} /><rect x={x - 20} y={180} width={120} height={40} fill="#d4c49a" stroke={INK} strokeWidth={3} /></g>)}
        <rect x={-400} y={1340} width={1880} height={900} fill="#5a4a3a" />
        <Glow x={540} y={150} r={600} color="#ffe6a0" o={0.35} />
        {/* the banker behind the counter */}
        <Banker x={240} y={1260} s={240} face="smirk" armR={[90 - 30 * push, 60]} armL={[20, 10]} look={[0.6, 0]} />
        <Block x={-200} y={1060} w={1500} h={300} fill="#7a4a2e" shadow="bottom" />
        <rect x={-210} y={1040} width={1520} height={30} fill="#a8724a" stroke={INK} strokeWidth={4} />
        <g transform={`translate(${340 + push * 200} 1040)`}><CashBag x={0} y={0} s={1.3} /></g>
        {/* the glass case */}
        <rect x={600} y={560} width={380} height={480} rx={10} fill="#bfe6ff" opacity={0.35} stroke={INK} strokeWidth={STROKE} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${(1 - slide) * -500} 0)`}><Certificate x={630} y={940 - i * 120 - 120} w={320} rot={(i - 1) * 3} /></g>)}
        <line x1={620} y1={580} x2={680} y2={1020} stroke="#ffffff" strokeWidth={6} opacity={0.5} />
        <Padlock x={790} y={1000} s={0.9} shut={m.t < stay ? 0 : m.pop(stay, 10)} />
        {/* NO SALE */}
        {m.t >= not ? (
          <g transform={`translate(790 760) rotate(-12) scale(${1 + (1 - st) * 1.5})`} opacity={Math.min(1, st * 1.5)}>
            <rect x={-200} y={-60} width={400} height={120} rx={12} fill="none" stroke="#e0352b" strokeWidth={14} />
            <Txt x={0} y={4} size={82} fill="#e0352b">NO SALE</Txt>
          </g>
        ) : null}
        {/* the name tag */}
        <g transform={`rotate(${m.t >= his ? Math.sin((m.t - his) / 3) * 18 * Math.max(0, 1 - (m.t - his) / 30) : 0} 790 520)`} opacity={tag > 0.02 ? 1 : 0}>
          <line x1={790} y1={520} x2={790} y2={560} stroke={INK} strokeWidth={5} />
          <rect x={620} y={420} width={340} height={100} rx={14} fill="#d4af37" stroke={INK} strokeWidth={5} />
          <Txt x={790} y={472} size={56} fill={INK}>ELLISON</Txt>
        </g>
      </View>
    </Stage>
  );
};

export default Bank;
