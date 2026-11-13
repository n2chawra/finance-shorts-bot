// Reference directed beat: "Split the money that way, and each member pays about $139 a year."
// We arrive through Rohan's window: his phone buzzes on "Split", twelve monthly charges fly out of it and
// stack into a tower, and the yearly figure stamps on top on "year". He follows it up, worried.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Card, CityWindow, Glow, INK, STROKE, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { year?: string } };

const Charges: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const split = m.at("split", 8), member = m.at("member", 50), said = m.at("year", m.end - 20);
  const step = Math.max(3, (said - member) / 12);
  const camY = m.lerp([member, said], [1080, 900]);
  const buzz = m.t > split && m.t < split + 28 ? Math.sin(m.t * 2.4) * 6 : 0;
  const phone: [number, number] = [430, 1230];
  return (
    <Stage p={p} bg="#3f4392" vignette={0.42}>
      <View zoom={m.lerp([0, 20], [1.35, 1.0], Easing.out(Easing.cubic)) * m.lerp([member, said], [1.0, 0.96])} cx={540} cy={camY}>
        <rect x={-200} y={-300} width={1480} height={1760} fill="#4b4f9e" />
        <rect x={-200} y={1460} width={1480} height={700} fill="#8a5c3c" />
        <line x1={-200} y1={1460} x2={1280} y2={1460} stroke={INK} strokeWidth={STROKE} />
        <polygon points="120,1560 980,1560 1080,1920 0,1920" fill="#b8324a" />
        <CityWindow x={80} y={250} w={300} h={340} seed="nfx-room" />
        <Block x={100} y={760} w={320} h={22} fill="#8a5226" />
        <Block x={140} y={680} w={56} h={80} fill="#e0a53a" />
        <Ball x={168} y={660} r={44} fill="#3fae5a" />
        <Glow x={600} y={200} r={300} color="#ffb35c" o={0.35} />
        <Block x={-60} y={1070} w={700} h={320} r={50} fill="#d69a30" shadow="bottom" />
        <Block x={-60} y={1300} w={700} h={190} r={30} fill="#e0a53a" shadow="bottom" />
        <Block x={560} y={1220} w={120} h={270} r={30} fill="#d69a30" />
        <g transform={`rotate(${buzz * 0.3} 300 1400)`}>
          <Char x={300} y={1640} s={300} sit who="rohan" hair="spiky" outfit="tee" face={m.t > said ? "shock" : "worried"} look={[1, m.lerp([member, said], [0, -1])]}
            phone="R" armR={[20, -150]} armL={[20, -30]} tilt={m.lerp([member, said], [0, 9])} />
        </g>
        {buzz ? (
          <g stroke="#ffd23f" strokeWidth={6} strokeLinecap="round">
            <line x1={phone[0] + 40} y1={phone[1] - 60} x2={phone[0] + 70} y2={phone[1] - 80} />
            <line x1={phone[0] + 45} y1={phone[1] - 30} x2={phone[0] + 80} y2={phone[1] - 30} />
          </g>
        ) : null}
        {/* twelve monthly charges fly out of the phone and stack into a year */}
        {Array.from({ length: 12 }).map((_, i) => {
          const from = member + i * step;
          if (m.t < from) return null;
          const k = m.pop(from, 14);
          const tx = 630 + Math.sin(i * 1.7) * 14, ty = 1640 - i * 98;
          const x = phone[0] + (tx - phone[0]) * k, y = phone[1] + (ty - phone[1]) * k - Math.sin(Math.min(1, k) * Math.PI) * 120;
          return <g key={i} transform={`translate(${x - tx} ${y - ty})`}><Card x={tx} y={ty} title="Netflix" sub="Monthly charge" rot={Math.sin(i * 2.3) * 3} /></g>;
        })}
        <Tag x={620} y={1640 - 12 * 98 - 10} w={420} h={110} text={`${year} / YEAR`} rot={-3} k={m.pop(said, 9)} />
        <Glow x={500} y={1300} r={700} color="#5fa8ff" o={0.22} />
      </View>
    </Stage>
  );
};

export default Charges;
