/**
 * The payoff: "So it isn't a paycheck. It's a bet on Tesla. Would you take it?"
 * A penthouse at night over the city. A paycheck floats in the middle with PAYCHECK over it; on
 * "paycheck" the word is struck through in red and the cheque drops away; on "bet" a big gold
 * lockbox rises in its place with a stack of poker chips beside it and an A BET stamp; on "Tesla" a
 * rocket lifts off behind the box towards the target figure; on "take" the camera pulls wide and
 * Rohan, small on the left, scratches his head.
 *
 * params: { cross, stamp, goal, goalLabel }, events: paycheck, bet, tesla, take
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Check = props.paycheck!, Lock = props.lockbox!, Rocket = props.rocket!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { cross?: string; stamp?: string; goal?: string; goalLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPay = at(p, "paycheck", 0.6), tBet = at(p, "bet", 1.4), tTesla = at(p, "tesla", 1.9), tTake = at(p, "take", 2.6);
  const kPay = sp(tPay, 9), kBet = sp(tBet, 9), kTesla = clamp((t - tTesla) * 0.7), kTake = sp(tTake, 14);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const lab = (s: string, max: number, b = 52) => Math.max(min, fitLine(s.toUpperCase(), b, max, { upper: true }));
  const g = h * 0.64, cx = w * 0.54;
  const zoom = 1.12 - 0.12 * kTake;
  const cross = (P.cross ?? "").toUpperCase();
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 130, (box.x1 - box.x0) * 0.7, { upper: true }));
  const chips = Array.from({ length: 6 }, (_, i) => (
    <g key={i} transform={`translate(${cx + w * 0.22},${g - i * h * 0.014 * clamp(kBet * 2 - i * 0.15)})`} opacity={clamp(kBet * 3 - i * 0.3)}>
      <ellipse cx={0} cy={0} rx={h * 0.04} ry={h * 0.013} fill={i % 2 ? "#e5484d" : "#3d7bf5"} stroke={INK} strokeWidth={4} />
    </g>
  ));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="city" tint="#1e2a5e" w={w} h={h} t={t} seed="payoff-penthouse-bet" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kTesla > 0 && <g transform={`translate(${cx + w * 0.28},${g - h * 0.18 - kTesla * h * 0.12})`}><Rocket s={h * 0.13} t={t} /></g>}
          <ellipse cx={cx} cy={g - h * 0.1} rx={w * 0.26} ry={h * 0.11} fill="#ffd27a" opacity={0.08 + 0.14 * kBet} />
          <g transform={`translate(${cx},${g - h * 0.06 + kPay * h * 0.3})`} opacity={1 - clamp(kPay * 1.4)}><Check s={h * 0.2} t={t} /></g>
          {kBet > 0 && <g transform={`translate(${cx},${g + (1 - kBet) * h * 0.2}) scale(${0.5 + 0.5 * kBet})`}><Lock s={h * 0.22} t={t} state="gold" /></g>}
          {chips}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 0.85, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "bet", pose: "shrug", expression: "shock" }, { at: "take", pose: "point", expression: "smirk" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", opacity: 1 - 0.5 * kBet }}>
          <span style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(cross, w * 0.6, 110), color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill" }}>
            {cross}
            <span style={{ position: "absolute", left: -10, right: -10, top: "48%", height: 18, background: "#e5484d", transform: `scaleX(${kPay}) rotate(-6deg)`, transformOrigin: "left" }} />
          </span>
        </div>
      )}
      {kBet > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", transform: `rotate(-7deg) scale(${1.6 - 0.6 * kBet})`, opacity: clamp(kBet * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#1d2433", background: "#ffd84a", padding: `${sSize * 0.12}px ${sSize * 0.4}px`, border: "8px solid #1d2433", borderRadius: 16 }}>{stamp}</span>
        </div>
      )}
      {kTesla > 0 && P.goal && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.33, textAlign: "center", opacity: clamp(kTesla * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(`${P.goalLabel ?? ""} ${P.goal}`, (box.x1 - box.x0) * 0.85, 52), color: "#1d2433", background: "#8fd19e", padding: "6px 20px", borderRadius: 14, border: `5px solid ${INK}` }}>
            {`${(P.goalLabel ?? "").toUpperCase()} ${P.goal}`}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
