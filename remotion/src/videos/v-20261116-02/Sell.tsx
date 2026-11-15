// Build: "Selling shares turns the gain into a tax bill, and the stake shrinks."
// A trading floor: a trader feeds certificates into the SELL machine on "Selling", a green arrow shoots up the
// big screen on "gain", a long tax bill spits out of the machine on "tax"/"bill" as the camera closes on it, and
// on "shrinks" the camera pulls back as the stack beside the machine drops lower.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CertStack, Certificate } from "./props";

const Sell: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const selling = m.at("selling", 2), gain = m.at("gain", 18), tax = m.at("tax", 30), bill = m.at("bill", 38), shrinks = m.at("shrinks", 60);
  const close = m.lerp([tax - 4, tax + 10], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([shrinks - 4, shrinks + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.1 + 0.35 * close - 0.5 * wide, cx = 500 + 60 * close - 20 * wide, cy = 900 + 160 * close - 160 * wide;
  const roll = m.lerp([tax, bill + 18], [0, 1], Easing.out(Easing.quad));
  const arrow = m.lerp([gain - 2, gain + 12], [0, 1], Easing.out(Easing.cubic));
  const feed = (m.t - selling) % 16 / 16;
  const n = m.lerp([shrinks - 2, shrinks + 14], [30, 14]);
  return (
    <Stage p={p} bg="#0f1a2a" vignette={0.46}>
      <View zoom={zoom} cx={cx + m.wave(70, 6)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#16263d" />
        <rect x={-400} y={1340} width={1880} height={900} fill="#2a3346" />
        {/* the big screens */}
        {[-260, 160, 580, 1000].map((x, i) => (
          <g key={i}>
            <rect x={x} y={200} width={380} height={260} rx={10} fill="#0b0f14" stroke={INK} strokeWidth={STROKE} />
            <polyline points={Array.from({ length: 8 }).map((_, k) => `${x + 20 + k * 48},${400 - (i === 1 ? arrow : 0.3) * k * 22 + m.wave(15, 6, k + i)}`).join(" ")} fill="none" stroke={i === 1 ? "#4dff9a" : "#5fb6ff"} strokeWidth={8} />
          </g>
        ))}
        {arrow > 0 ? <g opacity={arrow}><polygon points="500,250 540,190 580,250" fill="#4dff9a" stroke={INK} strokeWidth={4} /><Txt x={350} y={250} size={50} fill="#4dff9a" glow="#4dff9a">GAIN</Txt></g> : null}
        {/* the SELL machine */}
        <Block x={300} y={660} w={420} h={600} r={18} fill="#c74634" />
        <rect x={350} y={700} width={320} height={110} rx={10} fill="#1f0f0f" stroke={INK} strokeWidth={5} />
        <Txt x={510} y={758} size={84} fill="#ff6a5a" glow="#ff6a5a">SELL</Txt>
        <rect x={360} y={860} width={300} height={24} rx={12} fill="#1f0f0f" />
        <rect x={380} y={1120} width={260} height={20} rx={10} fill="#1f0f0f" />
        {/* certificates going in */}
        {m.t >= selling ? <g transform={`translate(${-feed * 40} ${-feed * 80})`} opacity={1 - feed}><Certificate x={420} y={760} w={180} rot={-10} /></g> : null}
        {/* the tax bill rolling out */}
        {roll > 0 ? (
          <g>
            <rect x={400} y={1130} width={220} height={40 + 520 * roll} fill="#ffffff" stroke={INK} strokeWidth={4} />
            {roll > 0.25 ? <Txt x={510} y={1210} size={52} fill="#c74634">TAX BILL</Txt> : null}
            {Array.from({ length: Math.floor(roll * 8) }).map((_, i) => <rect key={i} x={425} y={1250 + i * 50} width={170} height={14} fill="#c9c4d8" />)}
          </g>
        ) : null}
        <Glow x={510} y={1250} r={260} color="#ff6a5a" o={0.4 * m.pulse(tax + 2, 10)} />
        {/* the stake beside it, and the trader */}
        <CertStack x={780} y={1340} w={220} n={n} />
        <Char x={150} y={1500} s={230} outfit="shirt" top="#e8e1d4" accent="#2a5bd7" hair="spiky" skin="#c98652" face={m.t >= tax ? "worried" : "neutral"} armR={[100, 60 + 20 * Math.sin(m.t / 3)]} armL={[20, 10]} look={[0.8, -0.2]} />
      </View>
    </Stage>
  );
};

export default Sell;
