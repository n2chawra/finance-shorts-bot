/**
 * The payoff: "The rich don't save what's left. They spend what's left."
 * Sharma in his penthouse beside a tall oak. On "rich" the first plate ("Save what's left") drops
 * in and on "save" a red line strikes it; on "spend" the second plate ("Spend what's left") slams
 * in green under it and a pay slice flies into the safe.
 *
 * params: { a: "Save what's left", b: "Spend what's left" }, events: rich, save, spend
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Oak = props.oak!, Safe = props.safebox!, Slice = props.payslice!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { a?: string; b?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tRich = at(p, "rich", 0.3), tSave = at(p, "save", 1.0), tSpend = at(p, "spend", 2.0);
  const kA = sp(tRich), kStrike = clamp((t - tSave - 0.2) / 0.3), kB = sp(tSpend, 8), kFly = clamp((t - tSpend) / 0.6);
  const Pent = SETS.penthouse!;
  const plate = (text: string, bg: string, k: number, top: number, strike = 0) => (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${Math.min(1, k * 1.2)})` }}>
      <span style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 76, color: "#fff", background: bg, border: "8px solid #1d2433",
        borderRadius: 24, padding: "2px 28px", boxShadow: "0 10px 0 rgba(0,0,0,0.4)" }}>
        {text}
        {strike > 0 && <span style={{ position: "absolute", left: -10, right: -10, top: "48%", height: 14, background: "#ffd84a", transform: `scaleX(${strike})`, transformOrigin: "0 50%", borderRadius: 7 }} />}
      </span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.76},${h * 0.64})`}><Oak s={h * 0.3} t={t} k={1} /></g>
        <g transform={`translate(${w * 0.56},${h * 0.64})`}><Safe s={h * 0.07} t={t} /></g>
        {kFly > 0 && kFly < 1 && <g transform={`translate(${w * (0.2 + 0.36 * kFly)},${h * (0.45 + 0.12 * kFly)}) scale(${1 - 0.6 * kFly})`}><Slice s={h * 0.1} t={t} k={1} /></g>}
        <Actor p={p} spec={{ who: "sharma", x: 0.3, scale: 0.85, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "save", pose: "shrug", expression: "neutral" }, { at: "spend", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.65} index={0} />
      </svg>
      {P.a && kA > 0 && plate(P.a, "#c9303a", kA, h * 0.1, kStrike)}
      {P.b && kB > 0 && plate(P.b, "#1f9d63", kB, h * 0.19)}
    </AbsoluteFill>
  );
};

export default Payoff;
