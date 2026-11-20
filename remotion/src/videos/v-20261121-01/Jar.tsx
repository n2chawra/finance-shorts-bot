// Build: "Uber keeps about {keep_pct} of it. So is that its profit?"
// Uber's office at night: the lights flick on behind the logo on the wall on "Uber", a few coins drop into the
// glass jar on the desk on "keeps", the jar's tag stamps the share and the pie on the screen fills to it on
// "about", a question mark pops over the jar on "profit".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { CoinStream, Jar as GlassJar, UBERGREEN } from "./props";

type Params = { fig?: { pct?: string } };

const Jar: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const uber = m.at("uber", 2), keeps = m.at("keeps", 10), about = m.at("about", 30), profit = m.at("profit", 60);
  const lights = m.lerp([uber, uber + 4], [0.2, 1]);
  const fill = m.lerp([keeps, keeps + 20], [0, 0.35]);
  const pie = m.lerp([about, about + 14], [0, 0.25], Easing.out(Easing.cubic));
  const a = pie * Math.PI * 2;
  const q = m.pop(profit, 9);
  const push = m.lerp([about - 4, about + 16], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#10152e" vignette={0.42}>
        <View zoom={1.0 + 0.18 * push} cx={540 - 40 * push} cy={820 + 60 * push}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1e2440" />
          <rect x={-500} y={-500} width={2080} height={1500} fill={lights > 0.5 ? "#2b3358" : "#1a1f38"} />
          {/* the logo on the wall */}
          <Glow x={300} y={300} r={380} color="#ffffff" o={0.25 * lights} />
          <Block x={60} y={190} w={480} h={200} r={20} fill="#ffffff" opacity={0.3 + 0.7 * lights} />
          <g transform="translate(300 330)" opacity={0.3 + 0.7 * lights}><Photo name="uber" s={120} t={m.t / 30} /></g>
          {/* the screen with the fare pie */}
          <Block x={600} y={200} w={420} h={420} r={20} fill="#0b0f14" />
          <circle cx={810} cy={400} r={150} fill="#d9d3c4" stroke={INK} strokeWidth={5} />
          {pie > 0 ? <path d={`M 810 400 L 810 250 A 150 150 0 0 1 ${810 + 150 * Math.sin(a)} ${400 - 150 * Math.cos(a)} Z`} fill={UBERGREEN} stroke={INK} strokeWidth={5} /> : null}
          <Txt x={810} y={585} size={44} fill="#ffffff" deco>EVERY FARE</Txt>
          {/* the desk and the jar */}
          <Block x={-200} y={1080} w={1480} h={120} r={10} fill="#8a5226" />
          <rect x={-200} y={1200} width={1480} height={800} fill="#6b3f1e" stroke={INK} strokeWidth={STROKE} />
          <Glow x={400} y={900} r={360} color="#ffd98a" o={0.3} />
          <GlassJar x={400} y={1085} w={330} h={400} fill={fill} />
          <CoinStream m={m} a={[400, 400]} b={[400, 960]} from={keeps - 2} n={5} gap={3} dur={10} arc={0} r={30} />
          <Tag x={600} y={800} w={300} h={130} text={f.pct ?? ""} size={84} bg="#ffc43d" k={m.pop(about, 10)} rot={-6} />
          <Txt x={750} y={980} size={48} fill="#ffffff" stroke={INK}>UBER KEEPS</Txt>
          {q > 0 ? <g transform={`translate(400 ${560 - 40 * q}) scale(${0.4 + 0.6 * q})`}><circle r={80} fill="#ffc43d" stroke={INK} strokeWidth={5} /><Txt x={0} y={4} size={110} fill={INK}>?</Txt></g> : null}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Jar;
