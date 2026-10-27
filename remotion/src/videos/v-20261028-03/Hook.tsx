/**
 * Hook: "A {fee_fee_pct} fee. Guess what it costs in {a40_years} years."
 * A gold vault: Rohan and Priya each beside a big jar of coins, the same size. On "fee" a little
 * green leech lands on Rohan's jar with the fee tag, on "guess" a purple guess card spins in over
 * the middle, on "years" the leech starts sipping and Rohan's jar begins to leak.
 *
 * params: { fee: "{fee_fee_pct}", years: "{a40_years}" }, events: fee, guess, years
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Jar = props.jar!, Leech = props.leech!, Guess = props.guesscard!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fee?: string; years?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tFee = at(p, "fee", 0.4), tGuess = at(p, "guess", 1.2), tYears = at(p, "years", 2.4);
  const kFee = sp(tFee, 9), kGuess = sp(tGuess, 10), kYears = clamp((t - tYears) / 1.0);
  const Vault = SETS.vault!;
  const push = 1.04 + 0.025 * t;
  const gy = h * 0.82;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 65%" }}>
        <Vault.back w={w} h={h} t={t} seed={`${p.beat.id}v`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.3},${gy})`}><Jar s={h * 0.24} t={t} k={0.75 - 0.15 * kYears} state={t > tYears ? "leak" : undefined} /></g>
          <g transform={`translate(${w * 0.72},${gy})`}><Jar s={h * 0.24} t={t} k={0.75} /></g>
          {kFee > 0 && <g transform={`translate(${w * 0.3},${gy - h * 0.25 - (1 - kFee) * h * 0.2}) scale(${kFee})`}><Leech s={h * 0.08} t={t} /></g>}
          {kGuess > 0 && <g transform={`translate(${w * 0.51},${h * 0.56}) rotate(${(1 - kGuess) * 360}) scale(${kGuess})`}><Guess s={h * 0.14} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.13, scale: 1.0, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "years", pose: "worried", expression: "shock" }] }} ground={h * 0.98} index={0} />
          <Actor p={p} spec={{ who: "priya", x: 0.88, scale: 1.0, turn: -0.4, acting: [{ sec: 0, pose: "hips", expression: "smirk" }] }} ground={h * 0.98} index={1} />
        </svg>
      </AbsoluteFill>
      {P.fee && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 170, color: "#ffd84a", WebkitTextStroke: "14px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05,
            transform: `scale(${1 + 0.2 * kFee * Math.exp(-Math.max(0, t - tFee) * 3)})` }}>{P.fee} FEE</span>
          {P.years && <div style={{ display: "inline-block", marginTop: 10, fontFamily: FONT, fontWeight: 800, fontSize: 58, color: "#fff", background: "#8a63d2", border: "6px solid #1d2433", borderRadius: 18, padding: "4px 26px",
            transform: `scale(${0.85 + 0.15 * kGuess})` }}>COST IN {P.years} YEARS?</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
