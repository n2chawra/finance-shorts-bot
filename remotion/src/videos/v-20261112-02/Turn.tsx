/**
 * The turn: "Earning that on his salary would take {stake_years} years."
 * A night city. Header ON HIS SALARY from frame 0, a single paycheck on the left and the gold
 * Amazon-slice pie far up on the right. On "earning" paychecks start stacking into a tower; on
 * "salary" the hourglass flips and its sand runs; on "take" the tower races up but stays tiny beside
 * the pie; on "years" the figure {stake_years} slams in with YEARS under it.
 *
 * params: { header, figure, unit, stake }, events: earning, salary, take, years
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.paytower!, Glass = props.hourglass!, Pie = props.stakepie!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; figure?: string; unit?: string; stake?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 130, mass: 0.85 } }));
  const tE = at(p, "earning", 0.2), tS = at(p, "salary", 0.9), tK = at(p, "take", 1.6), tY = at(p, "take", 1.6);
  const kE = sp(tE, 14), kS = sp(tS, 12), kY = sp(tY, 9);
  const grow = clamp((t - tK) / 1.6);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, maxW, { upper: true }));
  const fig = P.figure ?? "";
  const fSize = Math.max(min, fitLine(fig, 210, maxW * 0.9));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 60, maxW * 0.8, { upper: true }));
  const g = h * 0.7;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t + 0.04 * kY})`, transformOrigin: "50% 60%" }}>
        <World kind="night" tint="#1d1a3e" w={w} h={h} t={t} seed="turn-bezos-years" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.2},${g}) scale(${0.4 + 0.6 * kE})`}><Tower s={h * 0.32} t={t} k={0.05 + 0.95 * grow} /></g>
          <g transform={`translate(${w * 0.46},${g}) rotate(${kS * 180} 0 ${-h * 0.07})`}><Glass s={h * 0.14} t={t} k={clamp((t - tS) / 3)} /></g>
          <g transform={`translate(${w * 0.78},${g})`}><Pie s={h * 0.2} t={t} k={0.08} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#f08c3a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
      {P.stake && (
        <div style={{ position: "absolute", left: w * 0.58, width: w * 0.4, top: g - h * 0.26, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.stake), color: INK, background: "#ffd84a", padding: "4px 14px", borderRadius: 10 }}>{P.stake}</span>
        </div>
      )}
      {kY > 0 && fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.18, textAlign: "center", transform: `scale(${1.6 - 0.6 * kY})`, opacity: clamp(kY * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{fig}</div>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.unit ?? ""), color: "#fff", background: INK, padding: "4px 18px", borderRadius: 10 }}>{(P.unit ?? "").toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
