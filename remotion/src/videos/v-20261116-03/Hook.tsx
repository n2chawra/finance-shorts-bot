// Hook: "Salvator Mundi once sold as a copy, for £45."
// A bare storeroom: the painting stands on an easel under a hanging lamp, its left half brown with overpaint, its
// title plate under it (frame 0); the plate catches the light on "Salvator", a paper price tag drops onto the frame's
// corner on "sold", and a red COPY stamp thumps onto the brown half on "copy" as the camera closes in.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { HangLamp, Painting, PaperTag, Plate } from "./props";

type Params = { fig?: { old?: string } };

export const BackRoom: React.FC<{ m: ReturnType<typeof motion>; old: string; tag: number; stamp: number; plate: number; }> = ({ m, old, tag, stamp, plate }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={1800} fill="#4a3a2e" />
    {Array.from({ length: 43 }).map((_, i) => <rect key={i} x={-400 + i * 44} y={-400} width={44} height={1800} fill={i % 2 ? "#3a2c22" : "#5e4a38"} />)}
    {Array.from({ length: 22 }).map((_, i) => Array.from({ length: 9 }).map((__, j) => <rect key={`k${i}-${j}`} x={-370 + i * 88 + (j % 2) * 20} y={-300 + j * 190 + (i % 3) * 40} width={14} height={14} rx={7} fill="#3a2c22" />))}
    <rect x={-400} y={1300} width={1880} height={900} fill="#2e241c" />
    {Array.from({ length: 20 }).map((_, i) => <rect key={`f${i}`} x={-400} y={1300 + i * 40} width={1880} height={20} fill="#55402e" />)}
    {/* clutter: frames and crates */}
    <Block x={-120} y={900} w={260} h={400} fill="#6b4a2e" />
    <Block x={-60} y={760} w={180} h={140} fill="#8a6a3a" />
    {[0, 1, 2].map((i) => <rect key={i} x={860 + i * 30} y={760 + i * 40} width={240} height={300} fill="none" stroke="#b8892e" strokeWidth={22} />)}
    <Block x={830} y={1080} w={320} h={220} fill="#6b4a2e" />
    <HangLamp x={560} y={140} sway={m.wave(80, 2)} />
    {/* the easel and the painting */}
    <line x1={400} y1={1300} x2={480} y2={420} stroke="#6b4a2e" strokeWidth={22} />
    <line x1={720} y1={1300} x2={640} y2={420} stroke="#6b4a2e" strokeWidth={22} />
    <Painting x={250} y={200} w={560} split />
    <Glow x={530} y={1030} r={260} color="#ffe6a0" o={0.5 * m.pulse(plate, 14)} />
    <Plate x={300} y={990} w={460} text="SALVATOR MUNDI" />
    {stamp > 0 ? (
      <g transform={`translate(390 580) rotate(-18) scale(${1 + (1 - stamp) * 1.6})`} opacity={Math.min(1, stamp * 1.6)}>
        <rect x={-150} y={-62} width={300} height={124} rx={10} fill="none" stroke="#e0352b" strokeWidth={14} />
        <Txt x={0} y={4} size={96} fill="#e0352b">COPY</Txt>
      </g>
    ) : null}
    {/* the paper tag on the frame's corner */}
    <g transform={`translate(0 ${(1 - tag) * -300})`} opacity={tag > 0.02 ? 1 : 0}>
      <PaperTag x={760} y={330} text={old} rot={8 + m.wave(40, 4)} s={0.95} />
    </g>
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const old = (p.beat.params as Params).fig?.old ?? "";
  const sal = m.at("salvator", 2), sold = m.at("sold", 20), copy = m.at("copy", 40);
  const close = m.lerp([copy - 4, copy + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.08 + 0.03 * m.lerp([0, copy], [0, 1]) + 0.18 * close, cx = 530 - 30 * close, cy = 760 - 40 * close;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2e241c" vignette={0.5}>
        <View zoom={zoom} cx={cx + m.wave(70, 4)} cy={cy}>
          <BackRoom m={m} old={old} tag={m.t < sold - 2 ? 0.98 : m.pop(sold - 2, 9)} stamp={m.t < copy ? 0 : m.pop(copy, 9)} plate={sal} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
