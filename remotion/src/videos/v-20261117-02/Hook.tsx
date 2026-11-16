// Hook: "AMC charges $12.73 for a movie ticket. So why does it care more about your popcorn?"
// An AMC cinema lobby: the AMC logo over the box office lights up on "AMC", a ticket with its price slides out of
// the window to Rohan on "charges", the camera pulls back to the popcorn machine beside the box office on "why",
// and on "popcorn" the machine bursts over, glowing brighter than the sign.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, SourceLine, Stage, View, motion, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { PopMachine, Ticket } from "./props";

type Params = { fig?: { ticket?: string } };

/** The lobby, shared with the loop. */
export const Lobby: React.FC<{ m: Motion; price: string; sign: number; slide: number; burst: number; face?: "neutral" | "shock" | "worried" | "happy"; look?: [number, number] }> = ({ m, price, sign, slide, burst, face = "neutral", look }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2600} fill="#2a1630" />
    {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-300 + i * 200} y={-400} width={90} height={1800} fill="#33193a" />)}
    {/* the carpet */}
    <rect x={-400} y={1300} width={1880} height={900} fill="#5a1f3a" />
    {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={-300 + i * 140} cy={1400 + (i % 2) * 90} r={22} fill="#ffcf4a" opacity={0.3} />)}
    {/* the box office */}
    <Block x={60} y={480} w={520} h={820} fill="#7a2a3a" />
    <Block x={110} y={600} w={420} h={330} r={16} fill="#1d1a2b" />
    <Glow x={320} y={760} r={260} color="#ffe2a8" o={0.4} />
    <rect x={130} y={620} width={380} height={290} rx={12} fill="#ffe2a8" opacity={0.25} />
    <Block x={90} y={930} w={480} h={40} fill="#c9a36a" />
    <Glow x={320} y={400} r={330} color="#ff3a4a" o={0.55 * sign} />
    <g transform="translate(320 560)" opacity={0.4 + 0.6 * sign}><Photo name="amc" s={170} t={m.t / 30} /></g>
    {/* the popcorn machine */}
    <PopMachine x={650} y={560} w={270} burst={burst} t={m.t} />
    {/* Rohan at the window, the ticket */}
    <Char x={480} y={1490 + m.wave(60, 3)} s={170} who="rohan" face={face} look={look} armL={[40 + 60 * slide, 60 + 50 * slide]} armR={[20, 10]} />
    {slide > 0 ? <Ticket x={110} y={850 + 40 * (1 - slide)} w={330} price={price} rot={-4 * slide} /> : null}
    <rect x={-400} y={1290} width={1880} height={10} fill={INK} opacity={0.3} />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.ticket ?? "";
  const amc = m.at("amc", 6), pop = m.at("popcorn", 24), why = m.at("more", 50), charges = m.at("ticket", 80);
  const sign = m.t < amc ? 0.3 : m.pop(amc, 10);
  const slide = m.lerp([charges - 2, charges + 10], [0.5, 1], Easing.out(Easing.cubic));
  const burst = m.t < pop ? 0.15 : 1;
  const wide = m.lerp([why - 4, why + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([pop - 4, pop + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.1 - 0.1 * wide + 0.04 * close;
  const cx = 520 + 20 * wide - 60 * close, cy = 860 + 20 * wide + 40 * close;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a1630" vignette={0.44}>
        <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
          <Lobby m={m} price={price} sign={sign} slide={slide} burst={burst} face={m.t >= pop ? "shock" : "neutral"} look={m.t >= charges ? [-0.6, 0.2] : m.t >= pop ? [1, -0.3] : [-0.4, 0]} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
