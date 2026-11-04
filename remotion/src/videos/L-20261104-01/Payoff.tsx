/**
 * The payoff: "So that's why the raise never moved his balance: six traps took their share first.
 * One rule for each, and Rohan finally steps off the treadmill."
 * The kitchen again, the treadmill from the hook in the middle with Rohan on it. On "raise" the belt
 * is still racing; on "six" six red trap chips line up down the right side; on "rule" each chip
 * flips green, one by one, into its rule; on "steps" the belt slows and Rohan steps off to the left
 * where the exit door swings open on light; the stamp lands on "treadmill".
 *
 * params: { rules: [6 short words], stamp }
 * events: raise, balance, six, rule, steps, treadmill
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Mill = props.treadmill!, Door = props.exitdoor!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { rules?: string[]; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tSeven = at(p, "six", 2.6), tRule = at(p, "rule", 4.6), tSteps = at(p, "steps", 6.4), tMill = at(p, "treadmill", 7.4);
  const rules = (P.rules ?? []).slice(0, 6);
  const mt = minText(w, h), box = safeBox(w, h);
  const ground = h * 0.84;
  const off = clamp((t - tSteps) / 1.2);
  const kDoor = sp(tSteps - 0.3, 12), kStamp = sp(tMill + 0.3, 9);
  const rowH = Math.min(h * 0.085, (box.y1 - h * 0.08 - box.y0) / Math.max(1, rules.length));
  const fs = Math.max(mt, Math.min(...rules.map((r) => fitLine(r, 44, w * 0.2)), 44));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <World kind="kitchen" tint={off > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="payoff-treadmill" props={props} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.18},${ground}) scale(${0.6 + 0.4 * kDoor})`}><Door s={h * 0.5} t={t} state={kDoor > 0.4 ? "open" : undefined} /></g>
        <g transform={`translate(${w * 0.5},${ground})`}><Mill s={h * 0.4} t={t} state={t < tSteps ? "fast" : undefined} k={0.0} /></g>
        <Actor p={p} spec={{ who: "rohan", x: 0.47 - 0.17 * off, scale: 1.0, acting: [{ sec: 0, pose: "worried", expression: "worried" }, { at: "seven", pose: "think", expression: "thinking" },
          { at: "rule", pose: "pointUp", expression: "proud" }, { at: "steps", pose: "wave", expression: "happy", turn: -0.4 }, { at: "treadmill", pose: "celebrate", expression: "laugh" }] }}
          ground={ground - h * 0.06 * (1 - off)} index={0} />
      </svg>
      {rules.map((r, i) => {
        const kIn = sp(tSeven + i * 0.12, 12);
        const kOk = clamp((t - (tRule + i * 0.22)) / 0.3);
        if (kIn <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: w * 0.84, top: box.y0 + h * 0.06 + i * rowH, transform: `translate(-50%,0) scale(${kIn})`,
            fontFamily: FONT, fontWeight: 900, fontSize: fs, color: "#fff", background: kOk > 0.5 ? "#1f8f55" : "#c92a2a", borderRadius: 16, padding: "0 20px",
            border: "4px solid #fff", whiteSpace: "nowrap", boxShadow: "0 6px 0 rgba(0,0,0,0.3)" }}>{(kOk > 0.5 ? "✓ " : "") + r}</div>
        );
      })}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.42, top: h * 0.12, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-4deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(P.stamp, 72, w * 0.4, { upper: true })), color: "#fff", background: "#1f8f55",
            padding: "8px 30px", whiteSpace: "nowrap", borderRadius: 24, border: "8px solid #fff", textTransform: "uppercase", boxShadow: "0 14px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
