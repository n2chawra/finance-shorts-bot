/**
 * The payoff: "Invested every month at an assumed {grow_rate} for {grow_years} years, that little
 * pile becomes {grow_final}."
 * A green field at dawn: the piggy bank drops a coin into a pot on "invested", a sapling grows into
 * a tree full of green notes while the years bar fills on "years", and on "becomes" the final
 * figure lands over the tree with the rate it assumes.
 *
 * params: { final: "{grow_final}", rate: "{grow_rate}", years: "{grow_years}" }, events: invested, years, becomes
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Piggy = props.piggy!, Sapling = props.sapling!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { final?: string; rate?: string; years?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tInv = at(p, "invested", 0.5), tYears = at(p, "years", 2.2), tBecomes = at(p, "becomes", 3.6);
  const grow = ease((t - tInv) / Math.max(1, tBecomes - tInv + 0.6));
  const kFinal = sp(tBecomes, 9), kRate = sp(tInv + 0.3, 12);
  const bar = clamp((t - tYears) / Math.max(0.8, tBecomes - tYears));
  const gy = h * 0.8;
  const coin = clamp(((t - tInv) * 1.2) % 1);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 - 0.1 * grow})`, transformOrigin: "50% 75%" }}>
        <World kind="field" tint="#2fb37a" w={w} h={h} t={t} seed="payoff-field" props={props} horizon={[{ prop: "apartment", x: 0.9, size: 0.1 }, { prop: "car", x: 0.12, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.55},${gy})`}><Sapling s={h * (0.2 + 0.3 * grow)} t={t} k={0.1 + 0.9 * grow} /></g>
          <g transform={`translate(${w * 0.24},${gy})`}><Piggy s={h * 0.12} t={t} k={0.5} /></g>
          {t > tInv && <circle cx={w * (0.26 + 0.27 * coin)} cy={gy - h * 0.14 - Math.sin(coin * Math.PI) * h * 0.1} r={22} fill="#f2b631" stroke="#1d2433" strokeWidth={5} />}
          <Actor p={p} spec={{ who: "priya", x: 0.85, scale: 0.85, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "becomes", pose: "celebrate", expression: "laugh" }] }} ground={h * 1.0} index={0} />
          {/* the years bar */}
          <rect x={w * 0.12} y={h * 0.88} width={w * 0.76} height={26} rx={13} fill="rgba(0,0,0,0.35)" stroke="#1d2433" strokeWidth={5} />
          <rect x={w * 0.12} y={h * 0.88} width={w * 0.76 * bar} height={26} rx={13} fill="#ffd34d" />
        </svg>
      </AbsoluteFill>
      {P.rate && P.years && kRate > 0 && (
        <div style={{ position: "absolute", left: w * 0.06, top: h * 0.1, transform: `scale(${kRate}) rotate(-3deg)`, transformOrigin: "0 0",
          fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#1d2433", background: "#fff", border: "6px solid #1d2433", borderRadius: 18, padding: "6px 22px" }}>
          assumed {P.rate} a year · {P.years} years
        </div>
      )}
      {P.final && kFinal > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", transform: `scale(${kFinal})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{P.final}</div>
          <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff", background: "#1f8f55", borderRadius: 18, padding: "4px 26px", border: "6px solid #1d2433" }}>THE LEFTOVER, GROWN</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
