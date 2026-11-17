// Build: "So where's the money? Rohan walks in for a coffee and some chips."
// Inside the station's shop: the sliding door opens with a bell on "where's", Rohan steps in past the snack aisle on
// "walks", the coffee machine pours a steaming cup into his hand on "coffee", and a bag of chips drops off the shelf
// into his other hand on "chips" as the camera closes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chips, Coffee } from "./props";

const Store: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const where = m.at("where's", 2), walks = m.at("walks", 26), inside = m.at("in", 30), coffee = m.at("coffee", 50), chips = m.at("chips", 70);
  const door = m.lerp([where - 2, where + 12], [0, 1], Easing.out(Easing.cubic));
  const step = m.lerp([walks - 2, walks + 18], [0, 1], Easing.inOut(Easing.cubic));
  const pour = m.lerp([coffee - 4, coffee + 6], [0, 1]);
  const drop = m.lerp([chips - 6, chips + 4], [0, 1], Easing.in(Easing.quad));
  const mid = m.lerp([inside, inside + 16], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([chips - 4, chips + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.12 * mid + 0.12 * close;
  const rx = 180 + 400 * step;
  return (
    <Stage p={p} bg="#f3e6c8" vignette={0.3}>
      <View zoom={zoom} cx={460 + 120 * mid + m.wave(40, 14)} cy={(860 - 30 * close) + m.wave(56, 10)}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#f3e6c8" />
        <rect x={-400} y={1220} width={1880} height={1000} fill="#d9d2c0" />
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-400 + i * 200} y={1220} width={4} height={1000} fill="#bfb8a6" />)}
        {Array.from({ length: 4 }).map((_, i) => <Glow key={i} x={60 + i * 320} y={140} r={200} color="#ffffff" o={0.5} />)}
        {/* the sliding door on the left */}
        <Block x={-300} y={500} w={360} h={720} fill="#9aa3b5" />
        <Block x={-280 - 160 * door} y={520} w={160} h={700} fill="#bfe3ff" opacity={0.8} shadow={false} />
        <Block x={-110 + 160 * door} y={520} w={160} h={700} fill="#bfe3ff" opacity={0.8} shadow={false} />
        {/* the coffee bar */}
        <Block x={150} y={420} w={340} h={130} r={12} fill="#5a3a2a" />
        <Txt x={320} y={505} size={56} fill="#ffe9a8">COFFEE</Txt>
        <Block x={180} y={600} w={280} h={360} r={20} fill="#2a2f3d" />
        <Glow x={320} y={760} r={140} color="#ffb04a" o={0.3 + 0.4 * pour} />
        <rect x={312} y={820} width={16} height={110 * pour} fill="#7a4a2a" opacity={pour > 0 && pour < 1 ? 1 : 0} />
        <Block x={120} y={960} w={400} h={260} fill="#8a5a3a" />
        {/* the snack aisle */}
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <Block x={600} y={520 + r * 220} w={520} h={24} fill="#9aa3b5" shadow={false} />
            {Array.from({ length: 6 }).map((_, i) => (
              r === 1 && i === 1 ? null : <Chips key={i} x={650 + i * 82} y={515 + r * 220} s={0.55} />
            ))}
          </g>
        ))}
        <Block x={590} y={1180} w={540} h={40} fill="#7a808f" />
        <Txt x={860} y={470} size={52} fill="#e0352b">SNACKS</Txt>
        {/* Rohan */}
        <Char x={rx} y={1460 + m.wave(60, 3)} s={190} who="rohan" face={m.t >= coffee ? "happy" : "neutral"} look={m.t >= chips ? [1, -0.3] : [-0.6, -0.2]}
          armL={[m.t >= coffee ? 60 : 12, m.t >= coffee ? 100 : 8]} armR={[m.t >= chips ? 70 : 12, m.t >= chips ? 110 : 8]}
          holdL={m.t >= coffee ? (h) => <Coffee x={h[0]} y={h[1] + 30} s={0.6} t={m.t} /> : undefined}
          holdR={m.t >= chips ? (h) => <Chips x={h[0]} y={h[1] + 30} s={0.6} /> : undefined} />
        {m.t >= chips - 6 && m.t < chips ? <Chips x={732 + (rx + 140 - 732) * drop} y={735 + 400 * drop} s={0.55} rot={40 * drop} /> : null}
      </View>
    </Stage>
  );
};

export default Store;
