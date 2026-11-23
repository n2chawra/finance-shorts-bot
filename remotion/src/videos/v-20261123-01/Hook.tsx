// Hook: "The world's airlines will fly {fact2} passengers this year. So how much of your fare do they actually keep?"
// An airport terminal hall under a giant departures board: a jet lifts off past the tall window on "airlines", the
// board's flaps run on "fly", its passenger counter rolls up to the figure on "passengers" as travellers hurry under
// it; the camera drops to Rohan at the ticket kiosk, his boarding pass prints on "fare", and a price tag with a
// question mark swings onto it on "keep" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { DepBoard, Jet, Pass, Rohan } from "./props";

type Params = { fig?: { people?: string } };

export const Terminal: React.FC<{ t: number; lift: number }> = ({ t, lift }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2800} fill="#e9e2d4" />
    {/* the tall window onto the runway */}
    <rect x={-300} y={180} width={1680} height={900} fill="#9fd3ff" />
    <rect x={-300} y={820} width={1680} height={260} fill="#8fa2b4" />
    <rect x={-300} y={900} width={1680} height={20} fill="#f4f1e8" opacity={0.7} />
    <Glow x={900} y={300} r={300} color="#fff4c2" o={0.5} />
    <Jet x={-150 + lift * 1300} y={860 - lift * 560} w={620} tilt={-14 * Math.min(1, lift * 2)} />
    <Jet x={1150 - (t % 400) * 0.3} y={960} w={360} windows={false} flip />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-300 + i * 280} y={180} width={18} height={900} fill="#5b6275" />)}
    <rect x={-300} y={170} width={1680} height={24} fill="#5b6275" />
    {/* the floor */}
    <rect x={-400} y={1080} width={1880} height={1400} fill="#cfc6b4" />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-400} y1={1140 + i * 90} x2={1480} y2={1140 + i * 90} stroke="#bdb39f" strokeWidth={4} />)}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const passengers = (p.beat.params as Params).fig?.people ?? "";
  const airlines = m.at("airlines", 0), fly = m.at("people", 12), pax = fly, fare = m.at("fare", 30), sign = m.at("they", 45), keep = m.at("keep", m.end - 18);
  const lift = m.lerp([airlines, airlines + 70], [0.05, 1]);
  const flip = m.lerp([fly, fly + 24], [0, 1]);
  const count = 1;
  const flashC = m.pulse(pax + 4, 8);
  const print = m.lerp([fare, fare + 14], [0, 1]);
  const tag = m.pop(keep, 9);
  const down = m.lerp([fare - 6, fare + 14], [0, 1]);
  const zoom = m.t < pax ? 1.0 : m.t < fare - 6 ? m.lerp([pax, pax + 14], [1.0, 1.12]) : m.t < keep ? 1.12 : m.lerp([keep, keep + 10], [1.12, 1.28]);
  const cy = m.lerp([pax, pax + 14], [900, 760]) * (1 - down) + (m.t < keep ? 1060 : m.lerp([keep, keep + 10], [1060, 1080])) * down;
  const cx = 540 + 0 * down + (m.t >= keep ? m.lerp([keep, keep + 10], [0, 60]) : 0);
  const walk = (i: number) => ((m.t * (2.2 + i * 0.4) + i * 260) % 1500) - 200;
  return (
    <Stage p={p} bg="#e9e2d4" vignette={0.3}>
      <View zoom={zoom} cx={cx + m.wave(120, 4)} cy={cy}>
        <Terminal t={m.t} lift={lift} />
        {/* the hanging sign */}
        <Block x={300} y={70} w={480} h={96} r={12} fill={m.t >= sign ? "#3d6fd1" : "#26324a"} shadow={false} />
        <Glow x={540} y={118} r={300} ry={90} color="#ffd36b" o={0.5 * m.pop(sign, 12)} />
        <Txt x={540} y={118} size={54} fill="#ffd36b">ALL AIRLINES</Txt>
        <rect x={174} y={766} width={732} height={184} rx={14} fill="#ffd36b" opacity={flashC} />
        <DepBoard x={150} y={210} w={780} h={760} m={m} flip={flip} label="PASSENGERS THIS YEAR" value={countText(passengers, count) || "..."}
          rows={["LONDON", "DUBAI", "MUMBAI", "NEW YORK", "TOKYO", "LAGOS"]} />
        {/* travellers hurrying past with suitcases */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Char x={walk(i)} y={1400 + i * 30} s={120} top={["#e07a5f", "#81b29a", "#9b72cf"][i]!} hair={i === 1 ? "bun" : "side"} face="neutral" armR={[30 + 10 * Math.sin(m.t / 6 + i), 20]} armL={[-20, -10]} />
            <Block x={walk(i) + 60} y={1310 + i * 30} w={70} h={90} r={10} fill={["#3d405b", "#c8102e", "#f2cc8f"][i]!} />
          </g>
        ))}
        {/* the ticket kiosk */}
        <Block x={620} y={1000} w={260} h={420} r={20} fill="#3d6fd1" />
        <rect x={650} y={1030} width={200} height={140} rx={10} fill="#0b0e15" />
        <Glow x={750} y={1100} r={160} color="#7fb8ff" o={0.4 + 0.1 * Math.sin(m.t / 5)} />
        <Txt x={750} y={1100} size={30} fill="#7fb8ff" deco>TICKETS</Txt>
        <rect x={680} y={1200} width={140} height={16} rx={8} fill={INK} />
        <Rohan x={500} y={1480} s={170} m={m} face={m.t >= keep ? "worried" : "neutral"} look={[0.8, -0.2]} armR={[70 + 40 * print, 60]} armL={[15, 10]} />
        {print > 0 ? <Pass x={750} y={1208 - 120 * print} w={200} rot={-6 * print} /> : null}
        <Tag x={690} y={950} w={120} h={110} text="?" k={tag} rot={12} size={84} />
      </View>
    </Stage>
  );
};

export default Hook;
