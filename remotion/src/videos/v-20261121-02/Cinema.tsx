// Build: "Then Twins made {fact5} at the box office."
// A cinema at night with a queue round the block: the marquee lights up on "Then", TWINS writes onto it letter
// by letter on "Twins" and the queue cheers, the box office counter over the door counts up from "box", tickets
// stream out of the booth on "office".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, STROKE, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { made?: string } };

const Cinema: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const then = m.at("then", 2), tw = m.at("twins", 10), box = m.at("box", 22), off = m.at("office", 30);
  const lit = m.lerp([then, then + 4], [0, 1]);
  const letters = Math.floor(m.lerp([tw, tw + 10], [0, 5]));
  const bulbs = Array.from({ length: 16 });
  const skins = ["#e2b48f", "#a8683a", "#f1c9a5", "#6b4226", "#d9a07a"];
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#100c24" vignette={0.45}>
        <View zoom={m.lerp([0, m.end], [1.0, 1.1])} cx={540} cy={m.lerp([0, m.end], [860, 780])}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1a1436" />
          <Block x={80} y={200} w={920} h={1060} fill="#7a1f2b" />
          {/* the marquee */}
          <Glow x={540} y={380} r={560} color="#ffd98a" o={0.45 * lit} />
          <Block x={40} y={260} w={1000} h={260} r={14} fill={lit > 0.5 ? "#fff6de" : "#5a4a3a"} />
          {bulbs.map((_, i) => <circle key={i} cx={70 + i * 63} cy={248} r={12} fill={lit > 0.5 && (i + Math.floor(m.t / 4)) % 2 ? "#ffd34d" : "#8a7a5a"} stroke={INK} strokeWidth={3} />)}
          <Txt x={540} y={390} size={170} fill={INK}>{"TWINS".slice(0, letters)}</Txt>
          {/* the box office counter over the door */}
          <Display x={240} y={580} w={600} h={230} label="AT THE BOX OFFICE" value={countText(f.made ?? "", m.lerp([box, off + 10], [0.05, 1], Easing.out(Easing.cubic)))} color="#ffc43d" k={m.lerp([box - 6, box], [0, 1])} />
          <Block x={400} y={880} w={280} h={380} r={10} fill="#3a2a2a" />
          <Glow x={540} y={1050} r={240} color="#ffd98a" o={0.4} />
          {/* tickets */}
          {Array.from({ length: 6 }).map((_, i) => {
            const k = (m.t - off - i * 3) / 14;
            if (k <= 0 || k >= 1) return null;
            return <rect key={i} x={540 + (i % 2 ? 1 : -1) * k * 380 - 40} y={1000 - Math.sin(k * Math.PI) * 220} width={80} height={44} rx={6} fill="#ffc43d" stroke={INK} strokeWidth={4} transform={`rotate(${k * 200} ${540 + (i % 2 ? 1 : -1) * k * 380} ${1020})`} />;
          })}
          <rect x={-500} y={1260} width={2080} height={1200} fill="#2b2d3c" />
          <line x1={-500} y1={1260} x2={1580} y2={1260} stroke={INK} strokeWidth={STROKE} />
          {/* the queue */}
          {[90, 200, 310, 770, 880, 990].map((x, i) => (
            <Char key={x} x={x} y={1330 + m.wave(40, 3, i)} s={110} skin={skins[i % 5]!} top={["#2c6bd6", "#3fae5a", "#e0a53a", "#7a3fb8", "#e9473b", "#2bb673"][i]!}
              hair={(["spiky", "bun", "side", "cap", "side", "beanie"] as const)[i]!} outfit="tee" face={m.t >= tw ? "grin" : "happy"}
              armR={m.t >= tw ? [160, 170] : [20, 10]} armL={[20, 10]} />
          ))}
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Cinema;
