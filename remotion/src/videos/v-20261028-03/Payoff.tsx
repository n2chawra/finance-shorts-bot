/**
 * The payoff: "So that {fee_fee_pct} fee cost {gap40_diff}. Was your guess anywhere close?"
 * The vault again, a big balance in the middle: the no-fee jar on the heavy side, the fee jar on
 * the light side. On "cost" the balance tips hard and the gap figure slams in over it, on "guess"
 * the purple guess card flips over beside Priya.
 *
 * params: { gap: "{gap40_diff}", a: "{a40_final}", b: "{b40_final}" }, events: fee, cost, guess
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Balance = props.balance!, Jar = props.jar!, Guess = props.guesscard!, Leech = props.leech!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { gap?: string; a?: string; b?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tCost = at(p, "cost", 1.2), tGuess = at(p, "guess", 2.6);
  const tip = clamp((t - tCost) / 0.8), kGap = sp(tCost, 9), kGuess = sp(tGuess, 10);
  const Vault = SETS.vault!;
  const gy = h * 0.64;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 - 0.06 * tip})`, transformOrigin: "50% 70%" }}>
        <Vault.back w={w} h={h} t={t} seed={`${p.beat.id}v`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.42},${gy})`}><Balance s={h * 0.34} t={t} k={0.5 - 0.35 * tip} /></g>
          <g transform={`translate(${w * 0.16},${gy})`}><Jar s={h * 0.16} t={t} k={0.9} /></g>
          <g transform={`translate(${w * 0.68},${gy})`}><Jar s={h * 0.16} t={t} k={0.65} state="leak" /></g>
          <g transform={`translate(${w * 0.68},${gy - h * 0.17})`}><Leech s={h * 0.05} t={t} /></g>
          {kGuess > 0 && <g transform={`translate(${w * 0.13},${h * 0.38}) scale(${Math.abs(Math.cos((1 - kGuess) * Math.PI))},1)`}><Guess s={h * 0.1} t={t} /></g>}
          <Actor p={p} spec={{ who: "priya", x: 0.86, scale: 0.85, turn: -0.6, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "guess", pose: "point", expression: "happy" }] }} ground={h * 0.66} index={0} />
        </svg>
      </AbsoluteFill>
      {P.a && P.b && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, display: "flex", justifyContent: "space-around", fontFamily: FONT, fontWeight: 900, fontSize: 52 }}>
          <span style={{ color: "#fff", background: "#1f8f55", border: "6px solid #1d2433", borderRadius: 16, padding: "2px 18px" }}>NO FEE {P.a}</span>
          <span style={{ color: "#fff", background: "#e5484d", border: "6px solid #1d2433", borderRadius: 16, padding: "2px 18px" }}>FEE {P.b}</span>
        </div>
      )}
      {P.gap && kGap > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", transform: `scale(${kGap})` }}>
          <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", background: "#1d2433", borderRadius: 16, padding: "4px 24px" }}>THE FEE COST</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.1 }}>{P.gap}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
