// Title (flat, the investigator's index sheet): seven lamps light one by one on the words that name each part
// (the last half minute red), then the title stamps on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ANTON, INK, MONO, moments, ramp, RED, Sheet, TypeText } from "./ui";

const PARTS: [string, string][] = [["flight", "THE FLIGHT"], ["wing", "THE WING"], ["ice", "THE ICE"], ["cue", "THE CUE"],
  ["last", "THE LAST HALF MINUTE"], ["findings", "THE FINDINGS"], ["law", "THE LAW"]];

const Title: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const title = ramp(t, e("law") + 6, 14);
  return (
    <Sheet t={t} zoom={1.02 + 0.05 * (t / Math.max(1, m.end))} cx={960} cy={520}>
      {PARTS.map(([k, name], i) => {
        const on = ramp(t, e(k), 8);
        const c = k === "last" ? RED : AMBER;
        const y = 170 + i * 98;
        return (
          <g key={k}>
            <circle cx={240} cy={y} r={28} fill="#10151b" stroke={INK} strokeWidth={4} />
            <circle cx={240} cy={y} r={20} fill={c} opacity={0.08 + 0.92 * on} />
            <text x={300} y={y + 16} fontFamily={MONO} fontWeight={700} fontSize={44} fill={INK} opacity={0.35 + 0.65 * on} letterSpacing={4}>{name}</text>
          </g>
        );
      })}
      <g opacity={title} transform={`translate(${(1 - title) * 60} 0)`}>
        <text x={1060} y={440} fontFamily={ANTON} fontSize={150} fill={INK}>COLGAN AIR</text>
        <text x={1064} y={540} fontFamily={ANTON} fontSize={80} fill={AMBER}>THE BUFFALO CRASH</text>
        <TypeText x={1066} y={610} t={t} at={e("law") + 6} text="AN INVESTIGATION" size={36} />
      </g>
    </Sheet>
  );
};

export default Title;
