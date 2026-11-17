// Hook: "At gas stations with a shop, gas is {fact1} of sales. Their cut?"
// A gas station forecourt at night: Rohan squeezes the nozzle on "Gas" and the pump's fuel bar runs, the camera
// pulls back to the whole station on "station's", a tag with the fuel share swings down from the canopy and the GAS
// sign flares on "sales", a cut lands close on the pump's screen on "what's" and its question mark pops on "cut".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Flash, Glow, SourceLine, Stage, Tag, Txt, View, motion, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Canopy, Car, Coffee, Pump, Shop } from "./props";

type Params = { fig?: { share?: string } };

/** The forecourt, shared with the loop. */
export const Forecourt: React.FC<{ m: Motion; flow: number; sign: number; tag: number; share: string; coffee?: number; face?: "neutral" | "shock" | "worried" | "happy" | "grin"; look?: [number, number] }> = ({ m, flow, sign, tag, share, coffee = 0, face = "neutral", look }) => (
  <g>
    <rect x={-500} y={-500} width={2080} height={1800} fill="#141a33" />
    {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={-300 + ((i * 197) % 1700)} cy={-200 + ((i * 131) % 600)} r={4} fill="#ffffff" opacity={0.5 + 0.3 * Math.sin(m.t / 10 + i)} />)}
    <rect x={-500} y={1200} width={2080} height={1100} fill="#3a3f52" />
    <Shop x={250} y={620} w={580} lit={0.6 + 0.4 * sign} />
    <Canopy y={330} sign={sign} />
    <Car x={-10} y={1200} w={520} />
    <Pump x={640} y={720} w={220} flow={flow} t={m.t} nozzle={[470, 1010]} />
    <Char x={560} y={1220 + m.wave(60, 3)} s={150} who="rohan" face={face} look={look} armL={[60, 40]} armR={[70 - 30 * coffee, 60 - 40 * coffee]}
      holdR={coffee > 0 ? (h) => <Coffee x={h[0]} y={h[1] + 20} s={0.55} t={m.t} /> : undefined} />
    <g transform={`rotate(${(1 - tag) * -30 + Math.sin(m.t / 9) * 3 * tag} 760 420)`} opacity={tag > 0 ? 1 : 0}>
      <Block x={755} y={420} w={10} h={60 * tag} fill="#d9dde6" shadow={false} />
      {tag > 0 ? <Tag x={560} y={480} w={400} h={120} text={`${share} OF SALES`} size={50} bg="#ffd34a" fg="#1d1a2b" k={tag} /> : null}
    </g>
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const gas = m.at("at", 1), station = m.at("shop", 20), every = m.at("sales", 36), sells = m.at("gas", 28), cut = m.at("cut", 60), tank = cut - 3;
  const flow = m.t < gas ? 0.3 : 1;
  const tag = m.lerp([every - 2, every + 10], [0, 1], Easing.out(Easing.back(1.6)));
  const sign = m.t < sells ? 0.75 : 0.6 + 0.4 * m.pop(sells, 8);
  const wide = m.lerp([station - 4, station + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.18 - 0.18 * wide;
  const cx = 600 - 60 * wide, cy = 820 + 60 * wide;
  const closeShot = m.t >= tank - 3;
  return (
    <AbsoluteFill>
      {!closeShot ? (
        <Stage p={p} bg="#141a33" vignette={0.42}>
          <View zoom={zoom} cx={cx + m.wave(40, 14)} cy={(cy) + m.wave(56, 10)}>
            <Forecourt m={m} flow={flow} sign={sign} tag={tag} share={share} face={m.t >= every ? "shock" : "neutral"} look={m.t >= every ? [1, -0.6] : [0.6, 0]} />
          </View>
        </Stage>
      ) : (
        <Stage p={p} bg="#0e1424" vignette={0.4}>
          <View zoom={m.lerp([tank - 3, m.end], [1.0, 1.12])} cx={540 + m.wave(40, 14)} cy={(820) + m.wave(56, 10)}>
            <rect x={-200} y={-200} width={1480} height={2400} fill="#0e1424" />
            <Glow x={540} y={760} r={600} color="#4dff9a" o={0.18} />
            <Block x={110} y={360} w={860} h={980} r={40} fill="#e9473b" />
            <Block x={170} y={430} w={740} h={460} r={24} fill="#162033" shadow={false} />
            <Txt x={540} y={540} size={56} fill="#4dff9a">THE STATION KEEPS</Txt>
            <g transform={`translate(540 720) scale(${m.t >= cut ? 0.6 + 0.4 * m.pop(cut, 8) : 0.6}) translate(-540 -720)`}><Txt x={540} y={790} size={220} fill="#ffd34a" glow="#ff9a3a">?</Txt></g>
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={200 + i * 86} y={960} width={70} height={60} rx={8} fill={i < Math.floor((m.t * 0.4) % 9) ? "#4dff9a" : "#2a3a52"} />
            ))}
            <Txt x={540} y={1160} size={48} fill="#ffffff">ON YOUR TANK</Txt>
          </View>
          <Flash k={m.pulse(tank - 3, 6)} />
        </Stage>
      )}
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
