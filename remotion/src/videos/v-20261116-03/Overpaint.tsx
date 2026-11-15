// Build: "Back then, its face was painted over, and buyers took it for a copy."
// A sepia studio wall long ago: the picture tints sepia like an old photograph on "Back", the camera holds on the face
// on "face", a hand with a brush slops brown paint over it on "painted", and on "buyers" the camera pulls back on the
// painting leaning among dusty canvases while a hand-written COPY label is pinned on its frame on "took".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Painting } from "./props";

const Overpaint: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const back = m.at("back", 2), face = m.at("face", 14), painted = m.at("painted", 28), buyers = m.at("buyers", 50), took = m.at("took", 62);
  const wide = m.lerp([buyers - 4, buyers + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 2.2 - 1.2 * wide, cx = 560 - 20 * wide, cy = 640 + 300 * wide;
  const paint = m.lerp([painted - 2, painted + 16], [0, 0.62]);
  const sepia = m.lerp([back - 2, back + 8], [0, 1]);
  const brushX = 470 + Math.sin(m.t / 3) * 60, brushY = 470 + 330 * Math.min(1, paint / 0.62);
  const label = m.pop(took - 2, 9);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a2e22" vignette={0.55}>
        <View zoom={zoom} cx={cx + m.wave(70, 4)} cy={cy}>
          <rect x={-400} y={-400} width={1880} height={1800} fill="#6a5a44" />
          <rect x={-400} y={1300} width={1880} height={900} fill="#3a2e22" />
          {/* dusty canvases leaning */}
          {[[-80, 760, -6], [60, 820, 4], [820, 740, 6], [950, 800, -4]].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x! + 130} ${y! + 250})`}><Block x={x!} y={y!} w={260} h={500} fill={["#8a7a5a", "#7a6a4a", "#9a8a6a", "#6a5a3a"][i]!} /></g>
          ))}
          <Painting x={340} y={330} w={440} paint={paint} />
          {/* the hand with the brush */}
          {m.t >= painted - 4 && m.t < buyers + 4 ? (
            <g>
              <Limb a={[brushX + 260, brushY + 220]} b={[brushX + 40, brushY + 20]} w={26} color="#d9a77a" />
              <Limb a={[brushX + 40, brushY + 20]} b={[brushX - 30, brushY - 40]} w={12} color="#8a5a36" />
              <path d={`M ${brushX - 30} ${brushY - 40} l -30 -30 l 22 -8 Z`} fill="#4a321a" stroke={INK} strokeWidth={3} />
            </g>
          ) : null}
          {/* the COPY label */}
          {label > 0.02 ? (
            <g transform={`translate(560 1020) rotate(${-6 + (1 - label) * 30}) scale(${0.5 + 0.5 * label})`}>
              <rect x={-150} y={-50} width={300} height={100} fill="#f2e6c4" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={-40} r={9} fill="#e0352b" stroke={INK} strokeWidth={3} />
              <Txt x={0} y={8} size={72} fill="#5a3a22">COPY</Txt>
            </g>
          ) : null}
        </View>
      </Stage>
      <AbsoluteFill style={{ background: "#8a6a3a", mixBlendMode: "color", opacity: 0.55 * sepia }} />
    </AbsoluteFill>
  );
};

export default Overpaint;
