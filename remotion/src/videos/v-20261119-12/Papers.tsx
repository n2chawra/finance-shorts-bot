// Payoff: "Netflix's own papers valued Squid Game at {fact1}, about {gap_ratio} what it cost."
// A desk under a lamp: a document folder slides into the lamp light on "own", its pages flip open on "papers", the
// value stamps across the page in red on "valued", a big multiplier tag slaps onto the corner on "about", and the
// camera pulls back to the small cost tag beside it on "cost".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Flash, Glow, Stage, Tag, Txt, View, motion } from "../../flat/kit";

type Params = { fig?: { value?: string; ratio?: string; cost?: string } };

const Papers: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const own = m.at("own", 2), papers = m.at("papers", 10), valued = m.at("valued", 20), game = m.at("game", 30), thats = m.at("thats", 45), about = m.at("about", 50), what = m.at("what", 60), cost = m.at("cost", 70);
  const slide = m.lerp([own - 4, own + 8], [0, 1], Easing.out(Easing.cubic));
  const open = m.lerp([papers - 2, papers + 10], [0, 1]);
  const stamp = m.pop(game, 8);
  const shake = m.pulse(thats + 3, 6) * 10;
  const glowLine = m.lerp([valued - 2, valued + 6], [0, 1]);
  const ratio = m.pop(about, 8) * (1 + 0.1 * m.pulse(what + 3, 6));
  const small = m.pop(cost - 2, 10);
  const back = m.lerp([thats - 2, cost + 10], [0, 1], Easing.inOut(Easing.cubic));
  const punch = m.lerp([Math.round(3.4 * m.fps) - 4, Math.round(3.4 * m.fps) + 6], [0, 1], Easing.inOut(Easing.cubic)) * (1 - back);
  const fx = 140 + (1 - slide) * -700;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#17120e" vignette={0.5}>
        <View zoom={1.16 - 0.16 * back + 0.12 * punch} cx={540 + m.wave(60, 6)} cy={820 + 60 * back + 160 * punch + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#2a1e16" />
          <Glow x={540} y={760} r={620} color="#ffe2a0" o={0.55} />
          {/* the lamp */}
          <path d="M 420 120 L 660 120 L 720 260 L 360 260 Z" fill="#2f7a5a" stroke="#1d1a2b" strokeWidth={6} />
          <Block x={530} y={-300} w={20} h={420} fill="#3a3a48" shadow={false} />
          {/* the folder and its page */}
          <g transform={`translate(${fx - 140} 0)`}>
            <Block x={140} y={380} w={800} h={820} r={16} fill="#d9a35a" />
            <Block x={180} y={420 - 30 * open} w={720} h={760} r={8} fill="#fffaf0" />
            <Txt x={540} y={500 - 30 * open} size={52} fill="#1d1a2b">NETFLIX</Txt>
            <Txt x={540} y={570 - 30 * open} size={44} fill="#6b6880">INTERNAL</Txt>
            {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={240} y={640 + i * 46 - 30 * open} width={600 * (i % 2 ? 0.7 : 0.95)} height={16} rx={7} fill="#d0d0dc" />)}
            <rect x={260} y={895 - 30 * open} width={560} height={70} rx={12} fill="#ffe08a" opacity={glowLine} />
            <Txt x={540} y={930 - 30 * open} size={48} fill="#1d1a2b">IMPACT VALUE</Txt>
          </g>
          {stamp > 0 ? <Tag x={230} y={970} w={620} h={160} text={fig.value ?? ""} size={100} bg="#e9473b" fg="#ffffff" rot={-5 + shake} k={stamp} /> : null}
          {ratio > 0 ? <Tag x={640} y={300} w={300} h={150} text={fig.ratio ?? ""} size={96} bg="#ffd34a" rot={8 + 6 * m.pulse(what + 3, 6)} k={Math.min(1, ratio)} /> : null}
          {small > 0 ? (
            <Tag x={90} y={1150} w={500} h={100} text={`${fig.cost ?? ""} TO MAKE`} size={54} bg="#ffffff" rot={-4} k={small} />
          ) : null}
        </View>
        {/* a press-camera flash over the stamped value, 3.4 s into the beat */}
        <Flash k={m.pulse(Math.round(3.4 * m.fps), 5) * 0.7} />
      </Stage>
    </AbsoluteFill>
  );
};

export default Papers;
