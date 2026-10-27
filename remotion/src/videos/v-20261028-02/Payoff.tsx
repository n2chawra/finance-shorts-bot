/**
 * The payoff: "So the tiny salary isn't kindness. His real pay is {g10_gains} of growth, and
 * none of it is taxed until he sells."
 * The city at golden hour, the company tower big in the middle. On "kindness" a heart balloon pops,
 * on "pay" the share chart climbs beside the tower and the growth figure lands over it, on "none"
 * the empty tax sack shrinks away and the padlock clicks shut on the shares.
 *
 * params: { gains: "{g10_gains}", label: "{g10_years} years of growth" }, events: kindness, pay, none, sells
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.tower!, Chart = props.chart!, Taxbag = props.taxbag!, Padlock = props.padlock!, Dollar = props.dollar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { gains?: string; label?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tKind = at(p, "kindness", 0.8), tPay = at(p, "pay", 1.8), tNone = at(p, "none", 3.4);
  const pop = clamp((t - tKind) / 0.3), kGains = sp(tPay, 9), kNone = sp(tNone, 10);
  const climb = ease((t - tPay) / 1.6);
  const gy = h * 0.78;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 - 0.08 * climb})`, transformOrigin: "50% 70%" }}>
        <World kind="city" tint="#f2b631" w={w} h={h} t={t} seed="payoff-city" props={props} horizon={[{ prop: "tower", x: 0.12, size: 0.12 }, { prop: "yacht", x: 0.9, size: 0.04 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.18},${gy})`}><Tower s={h * 0.4} t={t} /></g>
          <g transform={`translate(${w * 0.74},${gy - h * 0.12})`}><Chart s={h * 0.2} t={t} k={0.15 + 0.85 * climb} /></g>
          {/* the one-dollar bill floating away: the salary nobody needed */}
          <g transform={`translate(${w * (0.2 + 0.1 * Math.sin(t))},${h * (0.42 - 0.05 * t)}) scale(${1 - 0.5 * pop})`} opacity={1 - 0.7 * pop}><Dollar s={h * 0.08} t={t} /></g>
          <g transform={`translate(${w * 0.82},${gy}) scale(${1 - 0.7 * kNone})`} opacity={1 - 0.6 * kNone}><Taxbag s={h * 0.1} t={t} k={0} /></g>
          {kNone > 0 && <g transform={`translate(${w * 0.74},${gy - h * 0.1}) scale(${kNone})`}><Padlock s={h * 0.09} t={t} /></g>}
          <Actor p={p} spec={{ who: "priya", x: 0.46, scale: 1.1, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "none", pose: "thumbsUp", expression: "happy" }] }} ground={h * 0.86} index={0} />
        </svg>
      </AbsoluteFill>
      {P.gains && kGains > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", transform: `scale(${kGains})` }}>
          {P.label && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#fff", background: "#1d2433", borderRadius: 16, padding: "4px 24px" }}>{P.label}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 140, color: "#7cf0b2", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.1 }}>{P.gains}</div>
          {kNone > 0 && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#1d2433", background: "#ffd84a", border: "6px solid #1d2433", borderRadius: 16, padding: "2px 24px", transform: `scale(${kNone}) rotate(-3deg)` }}>TAX UNTIL SOLD: NONE</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
