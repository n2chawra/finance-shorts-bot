/**
 * The turn: "Here's the catch. The {left_per_period} that survives is the only money that can grow."
 * Everything the month's pay went on stands in a row, dimmed, under a SPENT stamp; on "catch" a
 * spotlight snaps onto the little piggy bank in the middle, on "survives" the leftover figure lands
 * on it, on "grow" a green sprout pushes out of the slot.
 *
 * params: { left: "{left_per_period}", spent: "{gone5_per_period}" }, events: catch, survives, grow
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const ROW = ["taxbill", "apartment", "car", "groceries", "ticket"] as const;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { left?: string; spent?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCatch = at(p, "catch", 0.6), tLeft = at(p, "survives", 1.8), tGrow = at(p, "grow", 3.0);
  const kSpent = sp(0.15, 12), kLight = clamp((t - tCatch) / 0.25), kLeft = sp(tLeft, 9), kGrow = sp(tGrow, 12);
  const Piggy = props.piggy!, Sapling = props.sapling!;
  const gy = h * 0.72;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.12 * clamp((t - tCatch) / 2.5)})`, transformOrigin: "50% 62%" }}>
        <World kind="studio" tint="#24315e" w={w} h={h} t={t} seed="turn-studio" props={props} />
        <AbsoluteFill style={{ background: `rgba(5,8,20,${0.25 + 0.4 * kLight})` }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {ROW.map((name, i) => {
            const Prop = props[name]!;
            const x = w * (0.1 + i * 0.2), y = i % 2 ? gy - h * 0.2 : gy + h * 0.02;
            return <g key={name} transform={`translate(${x},${y})`} opacity={1 - 0.55 * kLight}><Prop s={h * 0.1} t={t} /></g>;
          })}
          {kLight > 0 && <path d={`M${w * 0.42},0 L${w * 0.58},0 L${w * 0.7},${gy + 20} L${w * 0.3},${gy + 20} Z`} fill="#fff6c8" opacity={0.22 * kLight} />}
          <g transform={`translate(${w * 0.5},${gy + h * 0.02}) scale(${0.8 + 0.4 * kLight})`}>
            {kGrow > 0 && <g transform={`translate(${-w * 0.0},${-h * 0.13}) scale(${kGrow})`}><Sapling s={h * 0.16} t={t} k={0.15 + 0.2 * kGrow} /></g>}
            <Piggy s={h * 0.14} t={t} k={0.2 + 0.3 * kLeft} />
          </g>
          <Actor p={p} spec={{ who: "sharma", x: 0.82, scale: 0.85, acting: [{ sec: 0, pose: "pointUp", expression: "smirk" }, { at: "survives", pose: "point", expression: "proud" }] }} ground={h * 0.98} index={0} />
        </svg>
      </AbsoluteFill>
      {P.spent && kSpent > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", opacity: 1 - 0.5 * kLight }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", background: "#e5484d", padding: "4px 30px", borderRadius: 18,
            border: "6px solid #1d2433", transform: `rotate(-5deg) scale(${kSpent})` }}>SPENT {P.spent}</span>
        </div>
      )}
      {P.left && kLeft > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", transform: `scale(${2 - kLeft})`, opacity: clamp(kLeft * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#7cf0b2", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{P.left}</div>
          <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", background: "#1d2433", borderRadius: 18, padding: "4px 26px" }}>LEFT EACH MONTH</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
