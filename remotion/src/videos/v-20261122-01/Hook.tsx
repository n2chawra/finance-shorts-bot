// Hook: "Take-Two's New Year forecast: how many GTA Six copies is it?"
// The game shop at night: the GTA VI box big on the shelf under a spotlight, the Take-Two logo on the shelf sign
// from frame 0. The logo jumps on "Take-Two's", the spotlight snaps on on "forecast", the price tag swings in on
// "GTA", copies slide out along the shelf on "copies", Rohan's hand reaches in on "it" (a close push on the box).
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, type Motion, SourceLine, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { GameBox, SHOPBG, ShopWall } from "./props";

type Params = { fig?: { price?: string } };

/** The GTA VI shelf in the game shop; shared by the hook, the promise and the loop. */
export const Shelf: React.FC<{ m: Motion; price: string; spot: number; tag: number; copies: number; logo: number; swing?: number }> = ({ m, price, spot, tag, copies, logo, swing = 0 }) => (
  <g>
    <ShopWall m={m} />
    {/* the shelf sign with the real Take-Two logo */}
    <rect x={300} y={215} width={480} height={190} rx={22} fill="#ffffff" stroke={INK} strokeWidth={6} />
    <g transform={`translate(540 ${392 - logo * 14}) scale(${1 + logo * 0.12})`}><Photo name="taketwo" s={160} t={m.t / 30} /></g>
    {/* copies sliding out along the shelf */}
    {[-1, 1].map((side) =>
      [1, 2].map((n) => {
        const k = Math.max(0, Math.min(1, copies * 2 - (n - 1)));
        return k > 0 ? <GameBox key={`${side}-${n}`} x={540 + side * (150 + n * 120) * k} y={1080} w={210} label={false} tilt={side * 3} /> : null;
      }),
    )}
    <Glow x={540} y={760} r={420} color="#fff1c9" o={0.15 + 0.45 * spot} />
    <path d={`M 470 160 L 610 160 L ${760 + spot * 60} 1080 L ${320 - spot * 60} 1080 Z`} fill="#fff6d8" opacity={0.12 * spot} />
    <GameBox x={540} y={1080} w={360} />
    <Tag x={600} y={560} w={300} h={110} text={price} rot={8 + swing * Math.sin(m.t / 6) * 6} size={62} k={tag} />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.price ?? "";
  const gta = m.at("forecast", 12), costs = m.at("gta", 30), copies = m.at("copies", 45), counting = m.at("take-twos", 2), year = m.at("it", m.end - 20);
  const spot = Math.max(0.35, m.lerp([gta, gta + 6], [0.35, 1]));
  const tag = m.pop(costs, 10);
  const slide = m.lerp([copies, copies + 24], [0, 1], Easing.out(Easing.cubic));
  const logo = m.pulse(counting + 6, 10);
  const reach = m.lerp([year, year + 16], [0, 1]);
  // medium on the box -> wide on "copies" -> close on "Year"
  const zoom = m.t < copies ? m.lerp([0, copies], [1.12, 1.16]) : m.t < year ? m.lerp([copies, copies + 18], [1.16, 1.0]) : m.lerp([year, year + 18], [1.0, 1.28]);
  const cy = m.t < year ? m.lerp([copies, copies + 18], [740, 800]) : m.lerp([year, year + 18], [800, 760]);
  return (
    <AbsoluteFill>
    <Stage p={p} bg={SHOPBG} vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(110, 6)} cy={cy}>
        <Shelf m={m} price={price} spot={spot} tag={tag} copies={slide} logo={logo} swing={1} />
        {/* Rohan reaching in from the left */}
        <Char x={120 + reach * 60} y={1560} s={300} who="rohan" face={reach > 0.3 ? "grin" : "happy"} look={[0.8, -0.3]}
          armR={[60 + reach * 40, 40 + reach * 30]} />
        {m.t >= copies ? (
          <Txt x={540} y={470 + (1 - m.pop(copies, 9)) * 20} size={46} fill="#ffffff" stroke={INK}>HOW MANY?</Txt>
        ) : null}
      </View>
    </Stage>
    <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
