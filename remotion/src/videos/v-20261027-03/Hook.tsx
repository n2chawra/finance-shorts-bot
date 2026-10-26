/**
 * Hook: "The casino never gambles. It wins a slice of every bet."
 * Night in the casino's penthouse: a big roulette wheel at the table, Sharma (the house) beside
 * it, the house's edge on top. On "never" a GAMBLE stamp gets crossed out, on "slice" a gold wedge
 * flies off the pile of chips to Sharma, on "spins" the wheel whirls.
 *
 * params: { edge: "{spin_fee_pct}" }, events: never, slice, wheel, spins
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Wheel = props.wheel!, Chips = props.chips!, Edge = props.edge!, Slots = props.slots!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { edge?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tNever = at(p, "never", 0.6), tSlice = at(p, "slice", 1.6), tSpins = at(p, "spins", 3.0);
  const kX = clamp((t - tNever) / 0.35), kEdge = sp(tSlice, 9);
  const fly = clamp((t - tSlice) / 0.8);
  const fast = clamp((t - tSpins) / 0.5);
  const Pent = SETS.penthouse!;
  const push = 1.05 + 0.03 * t;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "60% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 62%, rgba(255,80,200,0.25), rgba(20,0,40,0.45) 70%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {/* the green table */}
          <path d={`M${w * 0.18},${h * 0.66} L${w * 1.05},${h * 0.62} L${w * 1.05},${h * 0.8} L${w * 0.1},${h * 0.84} Z`} fill="#0f7a4a" stroke="#1d2433" strokeWidth={8} />
          <g transform={`translate(${w * 0.66},${h * 0.74})`}><Wheel s={h * 0.24} t={t} k={0.3 + 0.7 * fast} state={t > tSlice ? "zero" : undefined} /></g>
          <g transform={`translate(${w * 0.34},${h * 0.79})`}><Chips s={h * 0.09} t={t} /></g>
          <g transform={`translate(${w * 0.9},${h * 0.6})`}><Slots s={h * 0.14} t={t} /></g>
          {fly > 0 && fly < 1 && <g transform={`translate(${w * (0.34 - 0.1 * fly)},${h * (0.76 - 0.2 * Math.sin(fly * Math.PI))}) scale(${1 - 0.4 * fly})`}><Edge s={h * 0.06} t={t} /></g>}
          <Actor p={p} spec={{ who: "sharma", x: 0.2, scale: 1.25, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "slice", pose: "present", expression: "proud" }] }} ground={h * 1.04} index={0} />
        </svg>
      </AbsoluteFill>
      {/* GAMBLE, crossed out on "never" */}
      <div style={{ position: "absolute", left: w * 0.5, top: h * 0.3, transform: "translate(-50%,0) rotate(-6deg)" }}>
        <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#fff", background: "#8a63d2", padding: "6px 40px", borderRadius: 26,
          border: "8px solid #1d2433", boxShadow: "0 14px 0 #1d2433" }}>
          GAMBLE?
          {kX > 0 && <svg width={460} height={170} style={{ position: "absolute", left: -10, top: -10, overflow: "visible" }}>
            <path d="M10,150 L440,20" stroke="#e5484d" strokeWidth={24} strokeLinecap="round" strokeDasharray={480} strokeDashoffset={480 * (1 - kX)} />
          </svg>}
        </div>
      </div>
      {P.edge && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.11, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))", display: "inline-block", transform: `scale(${1 + 0.15 * kEdge * Math.exp(-(t - tSlice) * 3)})` }}>{P.edge}</span>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff", textShadow: "0 4px 0 #1d2433" }}>OF EVERY BET</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
