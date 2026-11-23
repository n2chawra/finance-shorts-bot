// Build: "And most of it came as Starbucks shares, not a pay cheque."
// The Starbucks boardroom: board members slide the giant cheque across the table on "most", it splits into a tall stack
// of green share certificates on "shares", a small cheque slip flutters off the top on "not", and the camera pushes in
// on the share stack towering over the little cheque on "cheque".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Cheque, GREEN } from "./props";

type Params = { fig?: { now?: string } };

const Cut: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const most = m.at("most", 0), shares = m.at("shares", 14), not = m.at("not", 30), cheque = m.at("cheque", 40);
  const slide = m.lerp([most, most + 12], [0, 1]);
  const split = m.lerp([shares, shares + 16], [0, 1]);
  const slip = m.lerp([not, not + 20], [0, 1]);
  const zoom = m.t < cheque ? 1.0 : m.lerp([cheque, cheque + 12], [1.0, 1.2]);
  const cy = m.t < cheque ? 900 : m.lerp([cheque, cheque + 12], [900, 800]);
  const n = Math.round(12 * split);
  return (
    <Stage p={p} bg="#1f2a26" vignette={0.38}>
      <View zoom={zoom} cx={540 + m.wave(110, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#e7e1d3" />
        <rect x={-400} y={-400} width={1880} height={560} fill="#cfc6b4" />
        <Block x={260} y={190} w={560} h={120} r={16} fill={GREEN} shadow={false} />
        <Txt x={540} y={250} size={64} fill="#ffffff">STARBUCKS HQ</Txt>
        <rect x={-260} y={360} width={420} height={520} fill="#9fd3ff" stroke="#1d1a2b" strokeWidth={6} />
        {[0, 1, 2].map((i) => <rect key={i} x={-230 + i * 130} y={560 - i * 70} width={100} height={320 + i * 70} fill="#6d88a8" />)}
        <rect x={920} y={360} width={420} height={520} fill="#9fd3ff" stroke="#1d1a2b" strokeWidth={6} />
        {[0, 1, 2].map((i) => <rect key={i} x={950 + i * 130} y={600 - i * 50} width={100} height={280 + i * 50} fill="#6d88a8" />)}
        <Block x={200} y={360} w={680} h={40} r={8} fill="#5a3a26" shadow={false} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={230 + i * 130} y={320} width={60} height={40} rx={6} fill={["#c8102e", "#f2cc4f", GREEN, "#3d6fd1", "#e07a5f"][i]!} />)}
        {[0, 1].map((i) => (
          <Char key={`l${i}`} x={120 + i * 175} y={1260} s={150} outfit="suit" top={["#2b2b3a", "#4b4f8c"][i]!} hair={i % 2 ? "bun" : "side"} face={m.t >= shares ? "grin" : "neutral"} look={[0.6, -0.4]} armR={[i === 1 ? 70 + 20 * slide : 20, i === 1 ? 80 : 20]} armL={[20, 20]} />
        ))}
        {[0, 1].map((i) => (
          <Char key={`r${i}`} x={785 + i * 175} y={1260} s={150} outfit="suit" top={["#3d405b", "#26324a"][i]!} hair={i % 2 ? "side" : "bun"} face={m.t >= shares ? "shock" : "neutral"} look={[-0.6, -0.4]} armR={[20, 20]} armL={[20, 20]} />
        ))}
        <Block x={-100} y={1080} w={1280} h={80} r={20} fill="#3a2a1f" shadow="bottom" />
        {split < 0.5 ? (
          <g opacity={1 - split * 2}><Cheque x={540} y={1010 + 40 * (1 - slide)} w={380} amount={f.now ?? ""} rot={-2} /></g>
        ) : null}
        {/* the share stack */}
        {Array.from({ length: n }).map((_, i) => (
          <g key={i}>
            <rect x={370 + (i % 2) * 8} y={1040 - i * 44} width={340} height={40} rx={6} fill="#eaf6ee" stroke="#1d1a2b" strokeWidth={4} />
            <rect x={380 + (i % 2) * 8} y={1048 - i * 44} width={60} height={24} rx={4} fill={GREEN} />
          </g>
        ))}
        {n >= 10 ? <g><Block x={330} y={420} w={420} h={100} r={14} fill={GREEN} shadow={false} /><Txt x={540} y={470} size={56} fill="#ffffff">SHARES</Txt></g> : null}
        {slip > 0 ? (
          <g transform={`translate(${780 + 80 * slip} ${560 + 420 * slip}) rotate(${slip * 200})`}>
            <rect x={-80} y={-36} width={160} height={72} rx={8} fill="#ffffff" stroke="#1d1a2b" strokeWidth={4} />
            <Txt x={0} y={0} size={44} fill="#1d1a2b">PAY</Txt>
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Cut;
