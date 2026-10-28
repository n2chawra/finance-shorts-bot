/**
 * The payoff: "Level five isn't luck. It's level four, left alone long enough."
 * The penthouse at golden hour. On "luck" a coin-flip shimmer is crossed out; on "four" the
 * sprout appears beside Sharma; from "alone" it grows into a full tree of notes while the ladder
 * behind lights to the top; on "enough" the beach chair slides in under the top rung and the
 * words land.
 *
 * params: { word: "Left alone" }, events: luck, four, alone, enough
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Sprout = props.sprout!, Ladder = props.ladder!, Chair = props.beachchair!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { word?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tLuck = at(p, "luck", 0.6), tFour = at(p, "four", 1.4), tAlone = at(p, "alone", 2.0), tEnough = at(p, "enough", 2.8);
  const kLuck = sp(tLuck, 9), kCross = clamp((t - tLuck - 0.3) / 0.3), kFour = sp(tFour), kGrow = clamp((t - tAlone) / 1.4), kChair = sp(tEnough, 9);
  const Pent = SETS.penthouse!;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
      <AbsoluteFill style={{ background: `rgba(255,190,90,${0.08 + 0.12 * kGrow})` }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.8},${h * 0.66})`}><Ladder s={h * 0.4} t={t} k={0.6 + 0.4 * kGrow} /></g>
        {kChair > 0 && <g transform={`translate(${w * 0.8 + (1 - kChair) * w * 0.3},${h * 0.27})`}><Chair s={h * 0.08} t={t} /></g>}
        {kLuck > 0 && kCross < 1 && <g transform={`translate(${w * 0.25},${h * 0.32}) scale(${kLuck})`} opacity={1 - kCross * 0.6}>
          <circle r={h * 0.05} fill="#f2b631" stroke="#1d2433" strokeWidth={8} />
          <path d={`M${-h * 0.06},${-h * 0.06} L${h * 0.06},${h * 0.06} M${h * 0.06},${-h * 0.06} L${-h * 0.06},${h * 0.06}`} stroke="#e5484d" strokeWidth={14} strokeLinecap="round"
            strokeDasharray={300} strokeDashoffset={300 * (1 - kCross)} />
        </g>}
        {kFour > 0 && <g transform={`translate(${w * 0.56},${h * 0.66}) scale(${kFour})`}><Sprout s={h * 0.24} t={t} k={0.15 + 0.85 * kGrow} /></g>}
        <Actor p={p} spec={{ who: "sharma", x: 0.28, scale: 0.85, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "alone", pose: "point", expression: "proud" }, { at: "enough", pose: "thumbsUp", expression: "laugh" }] }} ground={h * 0.66} index={0} />
      </svg>
      {P.word && kChair > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `scale(${Math.min(1, kChair * 1.2)})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 100, color: "#1d2433", background: "#ffd84a", border: "8px solid #1d2433", borderRadius: 26,
            padding: "4px 32px", boxShadow: "0 12px 0 rgba(0,0,0,0.4)", textTransform: "uppercase" }}>{P.word}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
