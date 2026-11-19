// Build: "And while he owned it, those TV deals got far bigger."
// A city square at night: a basketball game plays on a small screen over the square on "owned", the screen starts to
// grow as the crowd looks up on "deals", stretches past the buildings on "far", and fills the skyline on "bigger".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, SourceLine, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Hoopball, TEAL } from "./props";

const Square: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const owned = m.at("owned", 6), deals = m.at("deals", 30), far = m.at("far", 45), bigger = m.at("bigger", 55);
  const grow = m.lerp([deals, bigger + 10], [0.55, 1.25], Easing.inOut(Easing.cubic));
  const on = m.t >= owned ? 1 : 0.2;
  const wide = m.lerp([bigger - 4, bigger + 12], [0, 1], Easing.inOut(Easing.cubic));
  const sw = 800 * grow, sh = 480 * grow;
  const bx = 540 + Math.sin(m.t / 6) * sw * 0.3;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0e1230" vignette={0.42}>
        <View zoom={1.1 - 0.12 * wide} cx={540 + m.wave(60, 6)} cy={820 + m.wave(70, 5)}>
          <rect x={-500} y={-600} width={2080} height={3200} fill="#141a40" />
          {[-300, -60, 820, 1040].map((x, i) => (
            <g key={x}>
              <Block x={x} y={300 + (i % 2) * 140} w={220} h={1100} fill="#2a2f5a" />
              {Array.from({ length: 8 }).map((_, r) => <rect key={r} x={x + 30} y={340 + (i % 2) * 140 + r * 120} width={60} height={60} fill="#ffd98a" opacity={(r + i) % 3 ? 0.2 : 0.8} />)}
            </g>
          ))}
          {/* the giant screen */}
          <Glow x={540} y={640} r={sw * 0.7} color="#5ab4ff" o={0.35 * on} />
          <Block x={540 - sw / 2} y={640 - sh / 2} w={sw} h={sh} r={14} fill="#0b0f14" />
          <rect x={540 - sw / 2 + 14} y={640 - sh / 2 + 14} width={sw - 28} height={sh - 28} rx={8} fill="#c98a4a" opacity={on} />
          <rect x={540 - 6} y={640 - sh / 2 + 14} width={12} height={sh - 28} fill="#ffffff" opacity={0.7 * on} />
          <Hoopball x={bx} y={640 + Math.abs(Math.sin(m.t / 5)) * -sh * 0.25} r={30 * grow} spin={m.t * 10} />
          <rect x={-500} y={1200} width={2080} height={1300} fill="#3a3f52" />
          {/* the crowd */}
          {[120, 300, 480, 660, 840].map((x, i) => (
            <Char key={x} x={x} y={1500 + (i % 2) * 40} s={150} top={[TEAL, "#e23b3b", "#f0a020", "#3fb07a", "#8a6ad6"][i]!} skin={["#c98652", "#8a5a3c", "#e2b48f", "#5a3a2a", "#c98652"][i]!}
              face={m.t >= far ? "shock" : "happy"} look={[0, -1]} back={false} />
          ))}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Square;
