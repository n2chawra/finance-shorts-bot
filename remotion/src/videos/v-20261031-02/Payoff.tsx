/**
 * The payoff: "That's why the rich love debt: the car shrinks, the building grows. But if what they
 * buy stops growing, the loan still has to be paid."
 * A split city street: on the left Rohan's car, greying and shrinking under a red arrow; on the
 * right an office block climbing under a green arrow. On "stops" the block's lights freeze and the
 * arrow falls away, and on "paid" the loan contract slams down between them with a STILL OWED tag.
 *
 * params: { left: "Shrinks", right: "Grows", warn: "Still owed" }, events: rich, car, building, stops, loan, paid
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Sedan = props.sedan!, Offices = props.offices!, Down = props.downarrow!, Up = props.uparrow!, Contract = props.contract!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { left?: string; right?: string; warn?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tCar = at(p, "car", 1.4), tBuild = at(p, "building", 2.2), tStops = at(p, "stops", 4.0), tPaid = at(p, "paid", 6.0);
  const kCar = sp(tCar, 9), kBuild = sp(tBuild, 9), kPaid = sp(tPaid, 8);
  const carScale = 1 - 0.35 * clamp((t - tCar) / 1.5);
  const grow = 1 + 0.35 * clamp((t - tBuild) / 1.5) * (t > tStops ? 0.8 : 1);
  const box = safeBox(w, h);
  const chip = (text: string, color: string) => {
    const size = Math.max(minText(w, h), fitLine(text.toUpperCase(), 54, w * 0.36, { upper: true }));
    return <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#fff", background: color, borderRadius: 18, padding: "2px 22px", border: "5px solid #1d2433", whiteSpace: "nowrap" }}>{text.toUpperCase()}</span>;
  };
  const ground = h * 0.64;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <World kind="city" tint="#3d7bf5" w={w} h={h} t={t} seed="payoff-city2" props={props} horizon={[{ prop: "shop", x: 0.5, size: 0.05 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w * 0.5} y1={h * 0.28} x2={w * 0.5} y2={ground} stroke="#ffffff" strokeWidth={6} strokeDasharray="20 16" opacity={0.6} />
        <g transform={`translate(${w * 0.27},${ground}) scale(${carScale})`}><Sedan s={h * 0.13} t={t} state={t > tCar ? "old" : undefined} /></g>
        {kCar > 0 && <g transform={`translate(${w * 0.27},${h * 0.44}) scale(${kCar})`}><Down s={h * 0.08} t={t} /></g>}
        <g transform={`translate(${w * 0.73},${ground}) scale(${grow})`}><Offices s={h * 0.14} t={t} k={t > tStops ? 0.3 : clamp((t - tBuild) / 1.2)} /></g>
        {kBuild > 0 && t < tStops + 0.6 && <g transform={`translate(${w * 0.73},${h * 0.32 + (t > tStops ? (t - tStops) * h * 0.3 : 0)}) scale(${kBuild})`} opacity={t > tStops ? clamp(1 - (t - tStops) / 0.6) : 1}><Up s={h * 0.08} t={t} /></g>}
        {kPaid > 0 && <g transform={`translate(${w * 0.5},${ground - h * 0.02 + (1 - kPaid) * -h * 0.2})`}><Contract s={h * 0.12} t={t} k={1} /></g>}
      </svg>
      <div style={{ position: "absolute", left: box.x0, width: w * 0.45 - box.x0, top: h * 0.2, textAlign: "center", transform: `scale(${kCar})` }}>{P.left && chip(P.left, "#e5484d")}</div>
      <div style={{ position: "absolute", left: w * 0.52, width: box.x1 - w * 0.52, top: h * 0.2, textAlign: "center", transform: `scale(${kBuild})` }}>{P.right && chip(P.right, "#1f8f55")}</div>
      {P.warn && kPaid > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", transform: `scale(${kPaid}) rotate(-4deg)` }}>{chip(P.warn, "#1d2433")}</div>}
    </AbsoluteFill>
  );
};

export default Payoff;
