// Turn: "And the money kept coming, from video tapes too."
// A video rental shop: the neon sign buzzes on on "And", coins drop from the till into a slot on "money", a
// conveyor of coins runs out of the door on "coming", TWINS tapes fly off the shelves one by one on "video",
// and Rohan at the counter grabs the last tape on "tapes".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

const Tapes: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const and = m.at("and", 2), money = m.at("money", 10), coming = m.at("coming", 20), video = m.at("video", 30), tapes = m.at("tapes", 40);
  const neon = m.t < and ? 0 : m.t < and + 2 ? 1 : m.t < and + 4 ? 0.2 : 1;
  const gone = (i: number) => m.t >= video + i * 2;
  const wide = m.lerp([video - 4, video + 10], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#160f2a" vignette={0.42}>
        <View zoom={1.1 - 0.1 * wide} cx={540} cy={800}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#2a1f4a" />
          {/* neon sign */}
          <Glow x={540} y={260} r={420} color="#ff4fd8" o={0.45 * neon} />
          <Block x={240} y={180} w={600} h={150} r={30} fill="#1a1230" />
          <Txt x={540} y={258} size={84} fill={neon > 0.5 ? "#ff8af0" : "#5a3a6a"} glow={neon > 0.5 ? "#ff4fd8" : undefined}>VIDEO</Txt>
          {/* shelves of tapes */}
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <Block x={60} y={420 + row * 170} w={960} h={24} fill="#8a5226" shadow={false} />
              {Array.from({ length: 10 }).map((_, i) => {
                const idx = row * 10 + i;
                const g = gone(idx % 12) && idx % 3 !== 2;
                const k = g ? Math.min(1, (m.t - video - (idx % 12) * 2) / 10) : 0;
                return (
                  <g key={i} transform={`translate(${k * (i < 5 ? -500 : 500)} ${-k * 200}) rotate(${k * 90} ${110 + i * 92} ${360 + row * 170})`}>
                    <rect x={80 + i * 92} y={300 + row * 170} width={70} height={118} rx={6} fill={idx % 2 ? "#c0392b" : "#2c3e78"} stroke={INK} strokeWidth={4} />
                    <rect x={88 + i * 92} y={330 + row * 170} width={54} height={30} fill="#ffc43d" />
                  </g>
                );
              })}
            </g>
          ))}
          <Txt x={540} y={960} size={52} fill="#ffc43d" stroke={INK}>TWINS ON TAPE</Txt>
          {/* the counter with the till */}
          <Block x={-100} y={1040} w={1280} h={300} r={10} fill="#3a2a5a" />
          <Block x={620} y={900} w={260} h={150} r={12} fill="#9aa0b4" />
          <rect x={660} y={925} width={180} height={50} rx={6} fill="#4dff9a" stroke={INK} strokeWidth={4} />
          {/* coins out of the till and out of the door */}
          {Array.from({ length: 8 }).map((_, i) => {
            const k = (m.t - money - i * 3) / 18;
            if (k <= 0 || k >= 1) return null;
            return <Coin key={i} x={750 + k * 400} y={940 - Math.sin(k * Math.PI) * 200 + k * 100} r={28} spin={Math.abs(Math.cos((m.t + i * 4) / 4))} />;
          })}
          {m.t >= coming ? Array.from({ length: 6 }).map((_, i) => <Coin key={`c${i}`} x={((m.t - coming) * 14 + i * 90) % 700 + 300} y={1090} r={24} spin={0.4} />) : null}
          <Char x={300} y={1400 + m.wave(50, 3)} s={200} who="rohan" hair="spiky" outfit="tee" face={m.t >= tapes ? "grin" : "happy"} look={[0.5, -0.5]}
            armR={[m.t >= tapes ? 150 : 40, m.t >= tapes ? 170 : 40]} armL={[20, 10]}
            holdR={m.t >= tapes ? (h) => <rect x={h[0] - 35} y={h[1] - 110} width={70} height={110} rx={6} fill="#c0392b" stroke={INK} strokeWidth={4} /> : undefined} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Tapes;
