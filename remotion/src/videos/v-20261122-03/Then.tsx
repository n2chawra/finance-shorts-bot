// Then: "Back then, all those coins were worth about {fact3}."
// An old desk with a boxy monitor: the wall calendar flips back to May on "Back", the coins pile into a glass jar on
// "all" and fill it on "coins", and the monitor's price page lands on the figure on "worth" (a close push).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Laszlo } from "./props";

type Params = { fig?: { then?: string } };

const Then: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const then = (p.beat.params as Params).fig?.then ?? "";
  const back = m.at("back", 2), all = m.at("all", 14), coins = m.at("coins", 26), worth = m.at("worth", m.end - 24);
  const flip = m.lerp([back, back + 12], [0, 1]);
  const fill = m.lerp([all, coins + 14], [0, 1]);
  const price = m.lerp([worth - 10, worth], [0, 1]);
  const zoom = m.t < worth ? m.lerp([0, worth], [1.04, 1.1]) : m.lerp([worth, worth + 14], [1.1, 1.1]);
  const cx = 540;
  const cy = m.t < worth ? 900 : m.lerp([worth, worth + 14], [900, 760]);
  return (
    <Stage p={p} bg="#3b2f4a" vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#6a5a7a" />
        <rect x={-700} y={1200} width={2480} height={1400} fill="#4a3b2a" />
        {/* the wall calendar */}
        <g transform="translate(520 150)">
          <rect x={0} y={0} width={240} height={280} rx={10} fill="#fbf8f0" stroke={INK} strokeWidth={5} />
          <rect x={0} y={0} width={240} height={70} rx={10} fill="#e0352b" />
          <g transform={`translate(120 160) scale(1 ${Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))})`}>
            <Txt x={0} y={0} size={70} fill={INK}>{flip > 0.5 ? "MAY" : "NOV"}</Txt>
          </g>
        </g>
        {/* Laszlo behind the desk, tipping coins into the jar */}
        <Laszlo x={235} y={1330} s={210} m={m} face={price > 0.5 ? "happy" : "neutral"} look={[0.6, 0.2]} armR={[70 + Math.sin(m.t / 4) * 10, 40]} />
        {/* the desk */}
        <Block x={-100} y={1080} w={1280} h={60} fill="#8a6f4a" shadow="bottom" />
        {/* the boxy monitor with the price page */}
        <Glow x={690} y={760} r={360} color="#9fd0ff" o={0.35} />
        <Block x={460} y={480} w={460} h={480} r={30} fill="#d7d0bf" />
        <rect x={490} y={520} width={400} height={360} rx={14} fill="#0f2a1a" stroke={INK} strokeWidth={STROKE} />
        <Txt x={690} y={580} size={44} fill="#7cff9a">ALL THE COINS</Txt>
        <Txt x={690} y={730} size={104} fill="#7cff9a" glow="#7cff9a">{price > 0 ? countText(then, price) : "..."}</Txt>
        <rect x={630} y={960} width={120} height={60} fill="#b8b0a0" stroke={INK} strokeWidth={5} />
        <rect x={530} y={1020} width={320} height={60} rx={10} fill="#b8b0a0" stroke={INK} strokeWidth={5} />
        {/* the glass jar filling with coins */}
        <g transform="translate(425 1080) scale(0.5)">
          <rect x={-120} y={-360} width={240} height={360} rx={30} fill="#bfe6ff" opacity={0.35} stroke="#e8f6ff" strokeWidth={6} />
          {Array.from({ length: Math.floor(fill * 18) }).map((_, i) => (
            <circle key={i} cx={-80 + (i % 4) * 54 + (Math.floor(i / 4) % 2) * 26} cy={-30 - Math.floor(i / 4) * 54} r={26} fill="#f7931a" stroke={INK} strokeWidth={3} />
          ))}
          <rect x={-130} y={-390} width={260} height={40} rx={10} fill="#c9a24a" stroke={INK} strokeWidth={5} />
        </g>
      </View>
    </Stage>
  );
};

export default Then;
