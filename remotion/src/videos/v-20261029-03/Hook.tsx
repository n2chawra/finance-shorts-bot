/**
 * Hook: "Five money levels. Which one are you on?"
 * From frame 0: a tall glowing ladder in an office at dusk, Rohan stuck at the foot of it with an
 * empty tip jar, Sharma lounging in a beach chair on the very top. The question sits on a plate at
 * the top. On "money" the rungs light up one by one from the bottom; on "levels" the ladder pulses;
 * on "which" the question plate punches in and Rohan looks up.
 *
 * params: { q: "Which level?" }, events: money, levels, which
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Ladder = props.ladder!, Jar = props.tipjar!, Chair = props.beachchair!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { q?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tMoney = at(p, "money", 0.2), tLevels = at(p, "levels", 0.8), tWhich = at(p, "which", 1.5);
  const kRungs = clamp((t - tMoney) / 1.0), kPulse = sp(tLevels, 6), kQ = sp(tWhich, 8);
  const Office = SETS.office!;
  const push = 1.05 + 0.03 * t;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "60% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,200,80,0.18), rgba(30,20,60,0.25))" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.66},${h * 0.9}) scale(${1 + 0.04 * kPulse * Math.sin(t * 12)})`}><Ladder s={h * 0.62} t={t} k={kRungs} /></g>
          <g transform={`translate(${w * 0.82},${h * 0.37})`}><Chair s={h * 0.1} t={t} /></g>
          <g transform={`translate(${w * 0.46},${h * 0.93})`}><Jar s={h * 0.09} t={t} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.66, scale: 0.6, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "which", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.37} index={1} />
          <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 2.0, acting: [{ sec: 0, pose: "worried", expression: "worried" }, { at: "which", pose: "think", expression: "confused" }] }} ground={h * 1.0} index={0} />
        </svg>
      </AbsoluteFill>
      {P.q && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `scale(${0.9 + 0.1 * kQ}) rotate(${-2 + 2 * kQ}deg)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 104, color: "#1d2433", background: "#ffd84a", borderRadius: 28, padding: "6px 40px",
            border: "8px solid #1d2433", boxShadow: "0 14px 0 rgba(0,0,0,0.45)", textTransform: "uppercase" }}>{P.q}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
