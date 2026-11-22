// Title (flat, instrument panel): the chapter index. Seven lamps on the console light one by one on the words
// that name each part (the blast lamp red), then the title stamps on: Texas City, the tower.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet } from "./elev";
import { moments } from "./ui";

const PARTS: [string, string][] = [["unit", "THE UNIT"], ["startup", "THE START-UP"], ["gauge", "THE GAUGE"], ["overflow", "THE OVERFLOW"],
  ["blast", "THE BLAST"], ["findings", "THE FINDINGS"], ["changed", "WHAT CHANGED"]];

const Inner: React.FC<{ t: number; e: (n: string) => number }> = ({ t, e }) => {
  const L = useDisasterLook();
  const title = ramp(t, e("changed") + 8, 14);
  return (
    <g>
      {PARTS.map(([k, name], i) => {
        const on = ramp(t, e(k), 8);
        const c = k === "blast" ? L.fail : L.label;
        const y = 180 + i * 100;
        return (
          <g key={k}>
            <circle cx={260} cy={y} r={28} fill="#0b0f0c" stroke={L.line} strokeOpacity={0.5} strokeWidth={4} />
            <circle cx={260} cy={y} r={20} fill={c} opacity={0.1 + 0.9 * on} />
            <text x={320} y={y + 16} fontFamily={L.fonts.mono} fontWeight={700} fontSize={46} fill={on > 0.5 ? L.ink : L.muted} letterSpacing={5}>{name}</text>
          </g>
        );
      })}
      <g opacity={title} transform={`translate(${(1 - title) * 60} 0)`}>
        <text x={1000} y={470} fontFamily={L.fonts.value} fontSize={110} fill={L.ink}>TEXAS CITY</text>
        <text x={1000} y={600} fontFamily={L.fonts.value} fontSize={110} fill={L.label}>THE TOWER</text>
        <MonoLabel x={1000} y={680} t={t} at={e("changed") + 8} text="BP REFINERY · AN INVESTIGATION" size={38} />
      </g>
    </g>
  );
};

const Title: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.04 * (t / Math.max(1, m.end))} cx={960} cy={540}>
      <Inner t={t} e={e} />
    </Sheet>
  );
};

export default Title;
