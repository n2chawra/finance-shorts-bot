// Title (flat, the engineer's sheet): the chapter index. Seven lamps light one by one on the words that name
// each part (the last dive red), then the title stamps on: Titan.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { ANTON, BLUE, INK, MONO, moments, ramp, RED, Sheet, TypeText } from "./ui";

const PARTS: [string, string][] = [["trip", "THE TRIP"], ["pressure", "THE PRESSURE"], ["hull", "THE HULL"], ["warnings", "THE WARNINGS"],
  ["last", "THE LAST DIVE"], ["findings", "THE FINDINGS"], ["changed", "WHAT CHANGED"]];

const Title: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const title = ramp(t, e("changed") + 6, 14);
  return (
    <Sheet t={t} zoom={1.02 + 0.05 * (t / Math.max(1, m.end))} cx={960} cy={540}>
      {PARTS.map(([k, name], i) => {
        const on = ramp(t, e(k), 8);
        const c = k === "last" ? RED : BLUE;
        const y = 180 + i * 100;
        return (
          <g key={k}>
            <circle cx={260} cy={y} r={28} fill="#ffffff" stroke={INK} strokeWidth={4} />
            <circle cx={260} cy={y} r={20} fill={c} opacity={0.08 + 0.92 * on} />
            <text x={320} y={y + 16} fontFamily={MONO} fontWeight={700} fontSize={46} fill={INK} opacity={0.35 + 0.65 * on} letterSpacing={4}>{name}</text>
          </g>
        );
      })}
      <g opacity={title} transform={`translate(${(1 - title) * 60} 0)`}>
        <text x={1020} y={500} fontFamily={ANTON} fontSize={190} fill={INK}>TITAN</text>
        <TypeText x={1024} y={580} t={t} at={e("changed") + 6} text="THE IMPLOSION · AN INVESTIGATION" size={36} />
      </g>
    </Sheet>
  );
};

export default Title;
