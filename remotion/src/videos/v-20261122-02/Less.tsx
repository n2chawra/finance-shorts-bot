// Less: "Lately, it's down to {fact2}. So is the jet the big bill?"
// SpaceX's hangar: a mechanic flips his clipboard to the newest invoice on "Lately", its smaller amount stamps on
// "down", the camera pulls back across the hangar on "So", and a question mark lights over the parked jet on "big".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Invoice, Jet } from "./props";
import { Mark } from "./Hook";

type Params = { fig?: { bill25?: string } };

const Less: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const amount = (p.beat.params as Params).fig?.bill25 ?? "";
  const lately = m.at("last", 2), down = m.at("down", 20), so = m.at("so", 50), big = m.at("big", m.end - 18);
  const flip = m.lerp([lately, lately + 10], [0, 1]);
  const stamp = m.pop(down, 9);
  const mark = m.pop(big, 9);
  const zoom = m.t < down ? m.lerp([0, down], [1.0, 1.1]) : m.t < so ? m.lerp([down, down + 12], [1.1, 1.28]) : m.lerp([so, so + 20], [1.28, 0.95]);
  const cx = m.t < so ? m.lerp([0, down + 12], [600, 640]) : m.lerp([so, so + 20], [640, 540]);
  const cy = m.t < so ? m.lerp([0, down + 12], [900, 760]) : m.lerp([so, so + 20], [760, 860]);
  return (
    <Stage p={p} bg="#2a3044" vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(110, 5)} cy={cy}>
        <rect x={-700} y={-700} width={2480} height={3300} fill="#2a3044" />
        {/* the hangar arch, its lights and floor */}
        <path d="M -300 1250 L -300 500 Q 540 -150 1380 500 L 1380 1250 Z" fill="#3a4260" stroke={INK} strokeWidth={8} />
        {[-100, 200, 540, 880, 1180].map((x, i) => (
          <g key={x}><rect x={x - 40} y={300 + Math.abs(540 - x) * 0.35} width={80} height={16} rx={6} fill="#fff6d8" /><Glow x={x} y={320 + Math.abs(540 - x) * 0.35} r={170} color="#fff6d8" o={0.25 + 0.05 * Math.sin(m.t / 8 + i)} /></g>
        ))}
        <rect x={-700} y={1250} width={2480} height={1400} fill="#555c72" />
        <rect x={-700} y={1250} width={2480} height={16} fill="#3a4060" />
        <g transform="translate(330 1060) scale(0.62)"><Jet x={0} y={0} m={m} steps={0} /></g>
        <Mark x={330} y={830} k={mark} r={70} color="#ffb020" />
        {/* the mechanic with the clipboard */}
        <Char x={900} y={1560} s={300} who="rohan" outfit="tee" top="#e0702b" hair="cap" hat="#2c4a8a" face={m.t >= down ? "happy" : "neutral"} look={[-0.6, -0.3]}
          armL={[60, 70]} />
        <g transform={`translate(560 520) rotate(${-4 + (1 - flip) * 30} 160 200)`}>
          <rect x={-20} y={-30} width={360} height={500} rx={16} fill="#8a6f4a" stroke={INK} strokeWidth={6} />
          <rect x={120} y={-50} width={80} height={40} rx={8} fill="#9aa0b4" stroke={INK} strokeWidth={4} />
          <Invoice x={10} y={0} w={300} logo="spacex" amount={amount} k={stamp} to="TO: TESLA" />
        </g>
      </View>
    </Stage>
  );
};

export default Less;
