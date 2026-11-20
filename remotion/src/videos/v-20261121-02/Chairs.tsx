// Promise: "And Danny DeVito and the director took nothing too."
// The film set: the camera slides along to three director's chairs; the middle name back flips to DEVITO on
// "DeVito", the third to REITMAN on "director" with a megaphone on its seat, and three empty pay envelopes drop
// onto the seats on "nothing".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { DirChair, Envelope } from "./props";

const Chairs: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const and = m.at("and", 0), dv = m.at("devito", 14), dir = m.at("director", 30), no = m.at("salary", 44);
  const slide = m.lerp([and, and + 18], [-260, 0], Easing.out(Easing.cubic));
  const flip = (at: number) => (m.t < at ? 1 : Math.abs(Math.cos(Math.min(1, (m.t - at) / 8) * Math.PI)));
  const name = (at: number, before: string, after: string) => (m.t < at + 4 ? before : after);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1c1a2e" vignette={0.42}>
        <View zoom={1.0 + 0.08 * m.lerp([no - 4, no + 10], [0, 1])} cx={540 + slide} cy={880}>
          <rect x={-800} y={-500} width={2680} height={2900} fill="#2a2440" />
          <rect x={-300} y={120} width={1680} height={1080} fill="#e07a4a" />
          <rect x={-300} y={120} width={1680} height={500} fill="#c2417a" />
          <circle cx={760} cy={520} r={110} fill="#ffe9b0" />
          {[-260, -40, 180, 640, 900, 1120].map((x, i) => (
            <g key={x}>
              <Block x={x} y={560 + (i % 3) * 70} w={190} h={700} fill={["#5a3d8a", "#6a4a9a", "#4a3478"][i % 3]!} />
              {[0, 1, 2, 3, 4].map((r) => <rect key={r} x={x + 40} y={620 + (i % 3) * 70 + r * 90} width={110} height={40} rx={4} fill="#ffd98a" opacity={0.7} />)}
            </g>
          ))}
          <rect x={-300} y={120} width={1680} height={1080} fill="none" stroke={INK} strokeWidth={STROKE} />
          {[-300, 200, 700, 1200].map((x) => <Glow key={x} x={x} y={300} r={360} color="#fff1c9" o={0.3} />)}
          <rect x={-800} y={1200} width={2680} height={1200} fill="#4a4458" />
          <line x1={-800} y1={1200} x2={1880} y2={1200} stroke={INK} strokeWidth={STROKE} />
          {[-200, 1280].map((x, i) => (
            <g key={x}>
              <line x1={x} y1={1200} x2={x} y2={420} stroke="#3a3f55" strokeWidth={14} />
              <rect x={x - 80} y={340} width={160} height={110} rx={12} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} transform={`rotate(${i ? -20 : 20} ${x} 395)`} />
              <Glow x={x + (i ? -160 : 160)} y={460} r={320} color="#fff1c9" o={0.45} />
            </g>
          ))}
          <g transform="translate(540 560)">
            <rect x={-150} y={-90} width={300} height={180} rx={16} fill="#1f2230" stroke={INK} strokeWidth={STROKE} />
            <circle cx={-60} cy={-130} r={60} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} transform={`rotate(${m.t * 5} -60 -130)`} />
            <circle cx={70} cy={-130} r={60} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} />
            <rect x={150} y={-40} width={110} height={80} rx={8} fill="#3a3f55" stroke={INK} strokeWidth={STROKE} />
            <line x1={0} y1={90} x2={-80} y2={330} stroke="#3a3f55" strokeWidth={12} />
            <line x1={0} y1={90} x2={80} y2={330} stroke="#3a3f55" strokeWidth={12} />
          </g>
          <g transform="translate(540 1240) scale(1.12) translate(-540 -1240)">
            <DirChair x={250} y={1240} name="ARNOLD" />
            <DirChair x={540} y={1240} name={name(dv, "", "DEVITO")} k={flip(dv)} />
            <DirChair x={830} y={1240} name={name(dir, "", "REITMAN")} k={flip(dir)} />
          {m.t >= dir ? (
            <g transform={`translate(830 ${985 - 20 * m.pop(dir)})`}>
              <path d="M -60 -20 L 50 -50 L 50 50 L -60 20 Z" fill="#ffc43d" stroke={INK} strokeWidth={5} />
              <rect x={-90} y={-22} width={34} height={44} rx={6} fill="#3a3f55" stroke={INK} strokeWidth={4} />
            </g>
          ) : null}
          {[250, 540, 830].map((x, i) => {
            const d = m.lerp([no - 4 + i * 3, no + 6 + i * 3], [0, 1], Easing.bounce);
            return d > 0 ? <g key={x} transform={`translate(0 ${(1 - d) * -600})`}><Envelope x={x} y={940} s={1.2} /></g> : null;
          })}
          </g>
          {/* a crew member with the pay envelopes, tossing them on "salary" */}
          <Char x={m.lerp([and, and + 16], [-200, 150])} y={1480 + m.wave(44, 4)} s={190} skin="#a8683a" top="#2a2f3d" hair="beanie" hat="#2bb673" outfit="tee"
            face={m.t >= no ? "grin" : "happy"} look={[0.8, -0.3]} armR={[m.t >= no ? 150 : 70, m.t >= no ? 170 : 100]} armL={[40, 60]}
            holdR={m.t < no ? (h) => <Envelope x={h[0]} y={h[1] - 20} s={0.8} /> : undefined} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Chairs;
