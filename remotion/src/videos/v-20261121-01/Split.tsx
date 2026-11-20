// Build: "Most of it goes on to the driver, or to the restaurant and the courier."
// The kerb outside a busy restaurant. Coins pour out of the big fare receipt on "Most"; most of them fly in
// through the car window to the driver on "driver", who grins; a stream flies into the restaurant door on
// "restaurant" and its sign lights; the courier on the bike catches coins in his food box on "courier".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CoinStream, Receipt, UBERGREEN, UberCar } from "./props";

const Split: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const most = m.at("most", 4), driver = m.at("driver", 24), rest = m.at("restaurant", 50), cour = m.at("courier", 70);
  const sign = m.lerp([rest, rest + 6], [0, 1]);
  const pan = m.lerp([rest - 8, rest + 14], [0, 1], Easing.inOut(Easing.cubic));
  const src: [number, number] = [290, 430];
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1a1d3e" vignette={0.42}>
        <View zoom={1.0 + 0.05 * pan} cx={540} cy={860}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1f2450" />
          {/* the restaurant */}
          <Block x={540} y={300} w={500} h={950} fill="#b8452f" />
          <Block x={570} y={330} w={440} h={120} r={14} fill={sign > 0.5 ? "#ffd34d" : "#6a3a2a"} />
          <Glow x={790} y={390} r={300} color="#ffd34d" o={0.5 * sign} />
          <Txt x={790} y={392} size={58} fill={INK}>RESTAURANT</Txt>
          <path d="M 540 470 L 1040 470 L 1010 560 L 570 560 Z" fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
          {[590, 690, 790, 890].map((x, i) => <rect key={x} x={x} y={470} width={50} height={90} fill={i % 2 ? "#b8452f" : "#f4f1e8"} />)}
          <Block x={660} y={700} w={200} h={550} r={10} fill="#3a2a2a" />
          <Glow x={760} y={900} r={200} color="#ffd98a" o={0.3 + 0.4 * sign} />
          <Block x={850} y={680} w={160} h={240} r={10} fill="#ffd98a" />
          {/* pavement and road */}
          <rect x={-500} y={1240} width={2080} height={60} fill="#8b8fa6" stroke={INK} strokeWidth={STROKE} />
          <rect x={-500} y={1300} width={2080} height={1000} fill="#2b2d3c" />
          {/* the Uber car with its driver */}
          <UberCar x={290} y={1260} s={0.6} m={m} driver={
            <Char x={110} y={-120} s={70} sit skin="#a8683a" top="#2c6bd6" hair="side" outfit="tee" face={m.t >= driver ? "grin" : "neutral"} look={[-0.5, -0.3]} armR={[60, 100]} armL={[20, 20]} />
          } />
          {/* the courier on the bike */}
          <g transform={`translate(${m.lerp([cour - 14, cour], [1200, 900])} 1250)`}>
            <Ball x={-80} y={-40} r={40} fill="#2a2a32" /><Ball x={80} y={-40} r={40} fill="#2a2a32" />
            <line x1={-80} y1={-40} x2={80} y2={-40} stroke={INK} strokeWidth={10} />
            <Char x={0} y={-50} s={110} sit top={UBERGREEN} hair="cap" hat={UBERGREEN} outfit="tee" face={m.t >= cour ? "grin" : "happy"} armR={[80, 90]} armL={[80, 90]} />
            <Block x={-150} y={-300} w={120} h={120} r={10} fill={UBERGREEN} />
          </g>
          {/* the fare receipt pouring coins */}
          <Receipt x={src[0]} y={src[1]} w={380} h={420} m={m} label="YOUR FARE" rot={2} />
          <CoinStream m={m} a={src} b={[350, 1110]} from={driver - 6} n={12} gap={2} dur={16} arc={160} r={32} />
          <CoinStream m={m} a={src} b={[760, 980]} from={rest - 4} n={6} gap={3} dur={14} arc={140} r={28} />
          <CoinStream m={m} a={src} b={[870, 980]} from={cour - 4} n={5} gap={3} dur={14} arc={180} r={28} />
          {m.t >= most && m.t < driver ? <CoinStream m={m} a={src} b={[540, 700]} from={most} n={5} gap={3} dur={12} arc={-60} r={28} /> : null}
          <Txt x={290} y={960} size={52} fill="#ffffff" stroke={INK}>DRIVER</Txt>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Split;
