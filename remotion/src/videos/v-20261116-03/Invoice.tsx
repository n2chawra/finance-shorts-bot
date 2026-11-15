// Turn: "But the buyer paid more than the winning bid."
// The auction house's back office: a clerk pulls the invoice off the printer on "buyer", the bid line prints on
// "paid", a second line pushes the total further down the page on "more" as the camera closes in, and on "winning" the
// clerk circles the gap between the two in red.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { bid?: string; total?: string } };

const Invoice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const buyer = m.at("buyer", 2), paid = m.at("paid", 10), more = m.at("more", 20), win = m.at("winning", 30);
  const close = m.lerp([more - 4, more + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.2 + 0.25 * close, cx = 560, cy = 760 - 40 * close;
  const pull = m.lerp([buyer - 2, buyer + 12], [0, 1], Easing.out(Easing.cubic));
  const l1 = Math.max(0.25, m.pop(paid, 10)), l2 = Math.max(0.25, m.pop(more, 10)), l3 = Math.max(0.25, m.pop(more + 6, 10));
  const circ = m.lerp([win - 2, win + 14], [0, 1]);
  return (
    <Stage p={p} bg="#1a1a24" vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(80, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#3a3a52" />
        {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 14 }).map((__, i) => <rect key={`b${r}-${i}`} x={-380 + i * 140} y={-200 + r * 260} width={110} height={200} rx={6} fill={["#4a4a6a", "#52527a", "#44445e"][(i + r) % 3]} stroke="#1d1a2b" strokeWidth={3} />))}
        <rect x={-400} y={1300} width={1880} height={900} fill="#2a2a38" />
        <Glow x={540} y={300} r={600} color="#fff1c9" o={0.3} />
        {/* the printer */}
        <Block x={300} y={180} w={480} h={150} r={14} fill="#d9d6d0" />
        <rect x={340} y={300} width={400} height={18} fill="#1d1a2b" />
        {/* the invoice */}
        <g transform={`translate(0 ${(1 - pull) * -500})`}>
          <rect x={250} y={320} width={580} height={860} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
          <Txt x={540} y={400} size={56} fill={INK}>INVOICE</Txt>
          <line x1={290} y1={450} x2={790} y2={450} stroke="#c9c4d8" strokeWidth={4} />
          <g opacity={l1}><Txt x={300} y={540} size={46} fill="#6b6880" anchor="start">BID</Txt><Txt x={780} y={540} size={56} fill={INK} anchor="end">{F.bid ?? ""}</Txt></g>
          <g opacity={l2}><Txt x={300} y={660} size={46} fill="#6b6880" anchor="start">FEES</Txt><Txt x={780} y={660} size={56} fill="#e0352b" anchor="end">+ ?</Txt></g>
          <line x1={290} y1={740} x2={790} y2={740} stroke={INK} strokeWidth={5} opacity={l3} />
          <g opacity={l3}><Txt x={300} y={830} size={46} fill="#6b6880" anchor="start">TOTAL</Txt><Txt x={780} y={830} size={60} fill={INK} anchor="end">{F.total ?? ""}</Txt></g>
          {circ > 0 ? <ellipse cx={680} cy={660} rx={150} ry={62} fill="none" stroke="#e0352b" strokeWidth={10} strokeDasharray={`${circ * 700} 900`} /> : null}
        </g>
        {/* the clerk */}
        <Char x={860} y={1580} s={200} outfit="shirt" top="#3a4a6a" hair="bun" hairColor="#2f2836" skin="#c98652" face={m.t >= win ? "smirk" : "neutral"} look={[-0.9, -0.4]} armL={[130, 120]} armR={[20, 10]} />
        <Block x={-400} y={1180} w={1880} h={140} fill="#6b4a2e" shadow="bottom" />
      </View>
    </Stage>
  );
};

export default Invoice;
