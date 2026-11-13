// Reference directed beat (the payoff): "After every bill, Netflix keeps about $34 of each member's year.
// Would you cancel?" Over Rohan's shoulder at the TV: coins drop into a piggy bank on the set on "After
// every bill", the figure stamps beside it on "keeps", the TV asks "Are you still paying?" on "Would" and the
// highlight moves to Cancel on "cancel". It ends pushing into the TV glow the video opens on (the loop).
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Glow, INK, Limb, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { kept?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const kept = (p.beat.params as Params).fig?.kept ?? "";
  const bill = m.at("bill", 16), keeps = m.at("keeps", 46), would = m.at("would", m.end - 40), cancel = m.at("cancel", m.end - 28);
  const open = m.lerp([0, keeps], [0, 1], Easing.inOut(Easing.cubic));
  const drops = [bill - 14, bill - 6, bill, keeps - 10];
  const squash = drops.reduce((s, d) => s + m.pulse(d + 10, 5) * 0.12, 0);
  const prompt = m.pop(would - 2, 12);
  const end = m.lerp([m.end - 18, m.end], [0, 1], Easing.in(Easing.cubic));
  const hand = m.lerp([would - 4, would + 12], [520, 0], Easing.out(Easing.cubic));
  return (
    <Stage p={p} bg="#232458" vignette={0.5}
      defs={<linearGradient id="nfx-tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14101f" /><stop offset="1" stopColor="#2a1530" /></linearGradient>}>
      <View zoom={(1.7 - 0.7 * open) * (1 + end * 1.8)} cx={420 + 120 * open} cy={640 + 320 * open + end * 80}>
        <rect x={-300} y={-300} width={1680} height={2520} fill="#34386f" />
        <rect x={-300} y={1440} width={1680} height={700} fill="#5a3d2c" />
        <Glow x={120} y={300} r={260} color="#6f8cff" o={0.35} />
        <Glow x={980} y={420} r={300} color="#ffb35c" o={0.3} />
        <Glow x={540} y={1030} r={720} color="#7f6cff" o={0.42 + m.wave(31, 0.05)} />
        <Block x={170} y={1300} w={740} h={170} r={10} fill="#2a2f3d" shadow="bottom" />
        <Block x={80} y={770} w={920} h={540} r={18} fill="#14141c" shadow={false} />
        <rect x={106} y={796} width={868} height={488} rx={8} fill="url(#nfx-tv)" />
        {m.t < would - 2 ? (
          <g>
            <rect x={106} y={796} width={868} height={488} rx={8} fill="#c2417a" />
            <rect x={106} y={796} width={868} height={240} rx={8} fill="#2b1a5e" />
            <circle cx={800} cy={900} r={40} fill="#ffe9b0" />
            <polygon points="180,1284 180,1050 260,1050 260,980 300,930 340,980 340,1050 560,1050 560,1284" fill="#1a1030" />
          </g>
        ) : (
          <g transform={`translate(540 1040) scale(${0.85 + 0.15 * prompt}) translate(-540 -1040)`} opacity={prompt}>
            <Txt x={540} y={960} size={64} fill="#ffffff">Are you still paying?</Txt>
            <rect x={220} y={1080} width={270} height={92} rx={12} fill="#ffffff" />
            <Txt x={355} y={1127} size={46} fill="#14101f">Keep</Txt>
            <g transform={`translate(725 1126) scale(${m.t >= cancel ? 1 + 0.06 * Math.sin(m.t / 2.5) : 1}) translate(-725 -1126)`}>
              <rect x={590} y={1080} width={270} height={92} rx={12} fill={m.t >= cancel ? "#e50914" : "none"} stroke="#e50914" strokeWidth={8} />
              <Txt x={725} y={1127} size={46} fill={m.t >= cancel ? "#ffffff" : "#ff4d57"}>Cancel</Txt>
            </g>
            <rect x={m.t >= cancel ? 576 : 206} y={1066} width={298} height={120} rx={18} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.9} />
          </g>
        )}
        {/* coins drop into the piggy bank on the TV: what Netflix keeps */}
        {drops.map((d, i) => (m.t < d - 10 || m.t > d + 10 ? null
          : <Coin key={i} x={375} y={m.lerp([d - 10, d + 10], [300, 600], Easing.in(Easing.quad))} r={28} tilt={i * 20} spin={0.35 + 0.6 * Math.abs(Math.cos(m.t / 3))} />))}
        <g transform={`translate(370 760) scale(${1 + squash} ${1 - squash}) translate(-370 -760)`}>
          <Ball x={240} y={760} r={22} fill="#ff7aa2" sw={4} />
          {[290, 330, 410, 450].map((x) => <rect key={x} x={x - 14} y={745} width={28} height={30} rx={6} fill="#ff7aa2" stroke={INK} strokeWidth={4} />)}
          <Ball x={370} y={680} r={130} ry={95} fill="#ff8fb1" sw={STROKE} />
          <polygon points="300,610 320,560 345,605" fill="#ff7aa2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={495} cy={690} rx={30} ry={38} fill="#ff7aa2" stroke={INK} strokeWidth={4} />
          <circle cx={490} cy={680} r={6} fill={INK} />
          <circle cx={500} cy={700} r={6} fill={INK} />
          <circle cx={430} cy={650} r={9} fill={INK} />
          <rect x={340} y={588} width={70} height={12} rx={6} fill={INK} />
        </g>
        <Tag x={700} y={600} w={210} h={110} text={kept} rot={4} k={m.pop(keeps + 8, 9)} />
        {/* Rohan from behind, then his hand with the remote */}
        <Char x={560} y={2980} s={520} back hair="spiky" armL={[10, 5]} armR={[10, 5]} />
        <g transform={`translate(0 ${hand}) rotate(-14 860 1690)`}>
          <Limb a={[960, 2000]} b={[860, 1720]} w={70} color="#1fa39a" />
          <rect x={834} y={1560} width={52} height={150} rx={14} fill="#22252f" stroke={INK} strokeWidth={STROKE} />
          <circle cx={860} cy={1590} r={10} fill="#e50914" />
          <Ball x={860} y={1700} r={40} fill="#c98652" />
        </g>
      </View>
    </Stage>
  );
};

export default Payoff;
