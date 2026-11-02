/**
 * The payoff: "That's the gap. A salary adds one hundred thousand dollars a year, while a big fortune
 * can move by more than that in a single minute."
 * A purple city night. On the left a single pay envelope with a year's salary on its card, crawling
 * up a short bar; on the right the billion tower. On "salary" the salary card lands; on "fortune"
 * the tower glows; on "move" it lurches up and down like a market screen; on "minute" a clock face
 * spins one full lap over it and the tower jumps.
 *
 * params: { salary, salaryLabel, fortuneLabel }, events: gap, salary, adds, fortune, move, minute
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Env = props.payenvelope!, Tower = props.billiontower!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { salary?: string; salaryLabel?: string; fortuneLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tGap = at(p, "gap", 0.4), tSal = at(p, "salary", 1.0), tFort = at(p, "fortune", 3.4), tMove = at(p, "move", 4.2), tMin = at(p, "minute", 5.4);
  const kGap = sp(tGap, 9), kSal = sp(tSal, 9), kFort = sp(tFort, 9), kMin = clamp((t - tMin) / 1.0);
  const min = minText(w, h);
  const g = h * 0.64;
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 48, max, { upper: true }));
  const wobble = t > tMove ? Math.sin((t - tMove) * 9) * 0.08 : 0;
  const jump = 1 + 0.15 * sp(tMin, 7);
  const sal = P.salary ?? "";
  const salSize = Math.max(min, fitLine(sal, 70, w * 0.36));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.006 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="night" tint="#8a63d2" w={w} h={h} t={t} seed="payoff-city3" props={props} horizon={[{ prop: "pyramid", x: 0.9, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kGap > 0 && <line x1={w * 0.5} x2={w * 0.5} y1={h * 0.28} y2={g} stroke="#ffd34d" strokeWidth={8} strokeDasharray="22 16" opacity={kGap} />}
          <g transform={`translate(${w * 0.27},${g}) scale(${1 + 0.1 * kSal * Math.abs(Math.sin(t * 3))})`}><Env s={h * 0.12} t={t} /></g>
          <g transform={`translate(${w * 0.73},${g}) scale(${(1 + wobble) * jump},${(1 + wobble) * jump})`} opacity={0.6 + 0.4 * kFort}><Tower s={h * 0.34} t={t} /></g>
          {P.salaryLabel && <text x={w * 0.27} y={g + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.salaryLabel, w * 0.42)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.salaryLabel.toUpperCase()}</text>}
          {P.fortuneLabel && <text x={w * 0.73} y={g + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.fortuneLabel, w * 0.42)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.fortuneLabel.toUpperCase()}</text>}
          {kSal > 0 && sal && (
            <g transform={`translate(${w * 0.27},${h * 0.4}) scale(${kSal})`}>
              <rect x={-salSize * sal.length * 0.33 - 24} y={-salSize * 0.8} width={salSize * sal.length * 0.66 + 48} height={salSize * 1.5} rx={16} fill="#fff" stroke="#1f8f55" strokeWidth={6} />
              <text y={salSize * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={salSize} fill="#1f8f55">{sal}</text>
            </g>
          )}
          {(
            <g transform={`translate(${w * 0.73},${h * 0.2}) scale(${1 + 0.2 * sp(tMin, 7)})`}>
              <circle r={h * 0.065} fill="#fff6d6" stroke={INK} strokeWidth={9} />
              <line x1={0} y1={0} x2={Math.sin((t * 0.4 + kMin) * Math.PI * 2) * h * 0.052} y2={-Math.cos((t * 0.4 + kMin) * Math.PI * 2) * h * 0.052} stroke="#e5484d" strokeWidth={8} strokeLinecap="round" />
              <circle r={8} fill={INK} />
            </g>
          )}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Payoff;
