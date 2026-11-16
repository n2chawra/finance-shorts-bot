// Turn: "From each sales dollar, the cloud keeps {awsm_pct}. Amazon overall keeps {allm_pct}." An
// accountant's cutting table under a desk lamp: two giant dollar bills slide in on "dollar", a cloud
// stamp lands on the first on "cloud", the guillotine chops a thick slice off it on "keeps" (its margin on
// a tag), then the second bill slides under the blade and only a thin sliver is cut on "overall".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { cloud?: string; all?: string } };

const Bill: React.FC<{ x: number; y: number; w: number; h: number; cloud?: boolean; stampK?: number }> = ({ x, y, w, h, cloud, stampK = 0 }) => (
  <g>
    <rect x={x + 8} y={y + 10} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#8fd19e" stroke={INK} strokeWidth={STROKE} />
    <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={8} fill="none" stroke="#2f7d4a" strokeWidth={5} />
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={h * 0.32} ry={h * 0.36} fill="#cfeed6" stroke="#2f7d4a" strokeWidth={5} />
    <Txt x={x + w / 2} y={y + h / 2} size={h * 0.4} fill="#2f7d4a" weight={900} deco>$</Txt>
    {stampK > 0 && cloud ? (
      <g transform={`translate(${x + w * 0.2} ${y + h * 0.3}) scale(${1 + (1 - Math.min(1, stampK)) * 1.2})`} opacity={Math.min(1, stampK * 2)}>
        <Ball x={-30} y={10} r={34} fill="#4dd8ff" sw={4} shadow={false} />
        <Ball x={10} y={-8} r={44} fill="#4dd8ff" sw={4} shadow={false} />
        <Ball x={52} y={12} r={30} fill="#4dd8ff" sw={4} shadow={false} />
        <rect x={-50} y={10} width={120} height={34} fill="#4dd8ff" />
      </g>
    ) : null}
  </g>
);

const Cutter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const P = p.beat.params as Params;
  const dollar = m.at("dollar", 10), cloud = m.at("cloud", 22), keeps = m.at("keeps", 30), overall = m.at("overall", 52);
  const slideA = m.lerp([dollar - 8, dollar + 6], [-900, 0], Easing.out(Easing.cubic));
  const slideB = m.lerp([overall - 10, overall], [900, 0], Easing.out(Easing.cubic));
  const chop = (at: number) => (m.t < at - 3 ? 0 : m.t < at ? m.lerp([at - 3, at], [0, 1], Easing.in(Easing.cubic)) : m.lerp([at + 4, at + 14], [1, 0]));
  const bladeY = 520 + 520 * Math.max(chop(keeps), chop(overall));
  const shake = m.pulse(keeps, 6) * 8 + m.pulse(overall, 6) * 8;
  const sliceA = m.lerp([keeps, keeps + 14], [0, 1]);
  const sliceB = m.lerp([overall, overall + 14], [0, 1]);
  const zoom = m.t < keeps ? m.lerp([0, keeps], [1.0, 1.06]) : m.t < overall ? m.lerp([keeps, keeps + 8], [1.06, 1.28]) : m.lerp([overall, overall + 10], [1.28, 1.5]);
  const cy = m.t < overall ? m.lerp([keeps, keeps + 8], [960, 880]) : m.lerp([overall, overall + 10], [880, 980]);
  const cx = m.t < overall ? 540 : m.lerp([overall, overall + 10], [540, 620]);
  // the first bill: 0..1 width; the cloud's slice (its margin) is the left third, the rest stays
  const W = 640, H = 300, X = 200;
  return (
    <Stage p={p} bg="#2a2030" vignette={0.5}>
      <View zoom={zoom} cx={cx + Math.sin(m.t * 3) * shake} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={2400} fill="#3a2c40" />
        <rect x={-300} y={300} width={1680} height={50} fill="#4d3b52" />
        {/* the lamp */}
        <path d="M 820 -40 L 820 160" stroke="#2a2f3d" strokeWidth={10} />
        <path d="M 700 160 L 940 160 L 880 80 L 760 80 Z" fill="#2bb673" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <Glow x={600} y={900} r={700} color="#ffe7a8" o={0.45 + m.wave(40, 0.03)} />
        <Char x={720} y={1000 + m.wave(60, 3)} s={200} who="sharma" face={m.t >= overall ? "worried" : m.t >= keeps ? "grin" : "neutral"} look={[-0.8, -0.3]}
          armL={[80, m.lerp([keeps - 6, keeps], [60, 110])]} armR={[20, 20]} />
        {/* the table */}
        <Block x={-200} y={660} w={1480} h={700} r={10} fill="#a8794a" />
        <rect x={60} y={720} width={960} height={600} fill="#2f5f4a" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={60 + i * 120} y1={720} x2={60 + i * 120} y2={1320} stroke="#5d8f75" strokeWidth={2} />)}
        {/* the guillotine blade over the cutting line */}
        <rect x={X + W * 0.35 - 10} y={-200} width={20} height={720} fill="#6b7280" opacity={0.5} />
        {/* the cloud's bill */}
        {m.t < overall - 10 ? (
          <g transform={`translate(${slideA} 0)`}>
            <g transform={`translate(${-sliceA * 120} ${sliceA * 30}) rotate(${-sliceA * 8} ${X} 1000)`}>
              <svg x={X} y={820} width={W * 0.35} height={H + 20} overflow="hidden"><Bill x={0} y={0} w={W} h={H} cloud stampK={m.pop(cloud, 10)} /></svg>
            </g>
            <svg x={X + W * 0.35} y={820} width={W * 0.65 + 20} height={H + 20} overflow="hidden"><Bill x={-W * 0.35} y={0} w={W} h={H} /></svg>
          </g>
        ) : (
          <g transform={`translate(${slideB} 0)`}>
            <g transform={`translate(${-sliceB * 60} ${sliceB * 20})`}>
              <svg x={X + W * 0.24} y={820} width={W * 0.11} height={H + 20} overflow="hidden"><Bill x={-W * 0.24} y={0} w={W} h={H} /></svg>
            </g>
            <svg x={X + W * 0.35} y={820} width={W * 0.65 + 20} height={H + 20} overflow="hidden"><Bill x={-W * 0.35} y={0} w={W} h={H} /></svg>
          </g>
        )}
        <g transform={`translate(0 ${bladeY - 520})`}>
          <Block x={X + W * 0.35 - 260} y={460} w={300} h={80} r={6} fill="#c9ced8" />
          <rect x={X + W * 0.35 - 30} y={540} width={30} height={160} fill="#e8ecf2" stroke={INK} strokeWidth={4} />
          <rect x={X + W * 0.35 - 300} y={480} width={60} height={40} rx={12} fill="#e0352b" stroke={INK} strokeWidth={4} />
        </g>
        {m.t >= keeps && m.t < overall - 10 ? <Tag x={140} y={530} w={340} h={150} text={P.fig?.cloud ?? ""} size={104} k={m.pop(keeps + 2, 10)} rot={-6} bg="#4dd8ff" /> : null}
        {m.t >= overall ? <Tag x={330} y={570} w={300} h={140} text={P.fig?.all ?? ""} size={96} k={m.pop(overall + 2, 10)} rot={5} bg="#ffc43d" /> : null}
        {m.t >= overall ? <Txt x={480} y={760} size={48} fill="#ffffff" stroke={INK}>ALL OF AMAZON</Txt> : m.t >= keeps ? <Txt x={310} y={720} size={48} fill="#ffffff" stroke={INK}>THE CLOUD</Txt> : null}
      </View>
    </Stage>
  );
};

export default Cutter;
