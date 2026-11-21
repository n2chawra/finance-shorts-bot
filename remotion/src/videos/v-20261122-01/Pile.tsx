// Pile: "To reach {std_total}, the boxes pile past the roof. How high does it go?"
// The street outside the shop: the billboard over the shop flips to the forecast on "reach", game boxes start
// dropping and stacking on the pavement on "boxes", the stack shoots up past the shop roof on "roof" while the camera
// tilts up after it on "high", and its top disappears into the clouds on "go".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Stage, View, countText, motion } from "../../flat/kit";
import { GameBox, NEON } from "./props";

type Params = { fig?: { low?: string } };

const Pile: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const low = (p.beat.params as Params).fig?.low ?? "";
  const reach = m.at("reach", 2), boxes = m.at("boxes", 30), roof = m.at("roof", 50), go = m.at("clouds", m.end - 20);
  const flip = m.lerp([reach, reach + 16], [0, 1]);
  // stack height in boxes: a few on "boxes", shooting up on "roof", into the clouds on "go"
  const n = m.t < roof ? m.lerp([boxes, roof], [0, 5]) : m.t < go ? m.lerp([roof, roof + 20], [5, 18]) : m.lerp([go, go + 20], [18, 30]);
  const rows = Math.floor(n);
  const boxH = 120;
  // the camera: medium on the shop and billboard, then wide and climbing with the stack
  const cy = m.t < roof ? 880 : m.lerp([roof, m.end], [880, -900]);
  const zoom = m.t < roof ? m.lerp([0, roof], [0.95, 1.02]) : m.lerp([roof, roof + 16], [1.02, 0.95]);
  return (
    <Stage p={p} bg="#0d1240" vignette={0.4}>
      <View zoom={zoom} cx={540 + m.wave(120, 6)} cy={cy}>
        {/* the sky getting darker as we climb, clouds high up */}
        <rect x={-800} y={-4200} width={2880} height={6800} fill="#141a3a" />
        <rect x={-800} y={-4200} width={2880} height={2600} fill="#0a0d2a" />
        {/* the shop */}
        <Block x={-200} y={700} w={1480} h={640} fill="#3a2a5c" />
        <rect x={-200} y={700} width={1480} height={36} fill={NEON} opacity={0.8} />
        <Block x={-150} y={860} w={420} h={380} r={10} fill="#ffd98a" opacity={0.8} />
        <Block x={810} y={860} w={420} h={380} r={10} fill="#ffd98a" opacity={0.8} />
        {/* the billboard on the roof */}
        <rect x={250} y={540} width={20} height={170} fill="#3a3f55" /><rect x={810} y={540} width={20} height={170} fill="#3a3f55" />
        <g transform={`translate(540 440) scale(1 ${Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)))})`}>
          <Display x={-330} y={-130} w={660} h={260} label={flip > 0.5 ? "TO REACH" : "FORECAST"} value={flip > 0.5 ? countText(low, m.lerp([reach + 8, reach + 30], [0.2, 1])) : "TAKE-TWO"} color="#ffc43d" k={1} />
        </g>
        <rect x={-800} y={1330} width={2880} height={1000} fill="#2b2d3c" />
        <Glow x={540} y={1300} r={500} color="#ffd98a" o={0.25} />
        {/* the stack of game boxes in front of the shop */}
        {Array.from({ length: rows + 1 }).map((_, r) => {
          const k = r < rows ? 1 : n - rows;
          if (k <= 0) return null;
          const y = 1340 - r * boxH - (1 - k) * 300;
          return (
            <g key={r} opacity={Math.min(1, k * 2)}>
              {[-1, 0, 1].map((c) => (
                <GameBox key={c} x={540 + c * 100 + ((r * 37) % 20) - 10} y={y} w={92} label={false} tilt={((r + c) % 3) - 1} />
              ))}
            </g>
          );
        })}
        {[-1500, -1700, -1450].map((y, i) => (
          <ellipse key={i} cx={180 + i * 360} cy={y} rx={420} ry={110} fill="#c9cfe6" opacity={0.85} stroke={INK} strokeWidth={5} />
        ))}
      </View>
    </Stage>
  );
};

export default Pile;
