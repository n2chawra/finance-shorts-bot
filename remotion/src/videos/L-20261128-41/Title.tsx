// Title (doc, the investigator's desk): the case file's index tabs light one by one on the words that name each
// part (the last day red), then the title stamps on: Fire Ball.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, LookBackground, Texture } from "../../disaster/index";
import { ANTON, INK, MONO, moments, ramp, RECIPE, RED, TypeText } from "./ui";

const PARTS: [string, string][] = [["ride", "THE RIDE"], ["swing", "THE SWING"], ["hollow", "THE HOLLOW ARM"], ["inspections", "THE INSPECTIONS"],
  ["last", "THE LAST DAY"], ["findings", "THE FINDINGS"], ["changed", "WHAT CHANGED"]];

const Title: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const title = ramp(t, e("changed") + 6, 14);
  const z = 1.02 + 0.05 * (t / Math.max(1, m.end));
  return (
    <DisasterLookProvider value={RECIPE}>
      <AbsoluteFill>
        <LookBackground />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
            <rect x={196} y={96} width={1560} height={900} fill="rgba(0,0,0,0.28)" />
            <rect x={180} y={80} width={1560} height={900} rx={14} fill="#d9b77a" />
            <rect x={180} y={80} width={1560} height={60} rx={14} fill="#c9a362" />
            {PARTS.map(([k, name], i) => {
              const on = ramp(t, e(k), 8);
              const c = k === "last" ? RED : "#1f3a6b";
              const y = 190 + i * 108;
              return (
                <g key={k} transform={`translate(${-30 * (1 - on)} 0)`}>
                  <rect x={250} y={y - 50} width={620} height={84} rx={8} fill="#f6f1e4" stroke={INK} strokeWidth={3} opacity={0.45 + 0.55 * on} />
                  <rect x={250} y={y - 50} width={22} height={84} fill={c} opacity={0.15 + 0.85 * on} />
                  <text x={300} y={y + 8} fontFamily={MONO} fontWeight={700} fontSize={44} fill={INK} opacity={0.35 + 0.65 * on} letterSpacing={4}>{name}</text>
                </g>
              );
            })}
            <g opacity={title} transform={`translate(${(1 - title) * 60} 0)`}>
              <text x={1000} y={520} fontFamily={ANTON} fontSize={180} fill={INK}>FIRE BALL</text>
              <TypeText x={1006} y={600} t={t} at={e("changed") + 6} text="OHIO STATE FAIR · CASE FILE" size={34} />
              <rect x={1000} y={640} width={560} height={14} fill={RED} />
            </g>
          </g>
        </svg>
        <Texture t={t} />
      </AbsoluteFill>
    </DisasterLookProvider>
  );
};

export default Title;
