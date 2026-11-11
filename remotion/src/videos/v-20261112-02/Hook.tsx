/**
 * Hook (question): "Jeff Bezos takes just {sal_total} a year from Amazon. His security and travel cost it {sec_total}."
 * An Amazon warehouse at dusk: a giant parcel labelled AMAZON in the middle, a tiny paycheck on the
 * left, a black armoured SUV and a private jet on the right. Frame 0 reads JEFF BEZOS' SALARY over
 * {sal_total}. On "takes" the paycheck pops out of the parcel; on "security" the SUV rolls in with its
 * light flashing; on "travel" the jet glides in; on "cost" the second figure {sec_total} slams under
 * them and dwarfs the first.
 *
 * params: { line, pay, payLabel, cost, costLabel, label }, events: bezos, takes, security, travel, cost
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Parcel = props.parcel!, Pay = props.paycheck!, Car = props.armoredcar!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; pay?: string; payLabel?: string; cost?: string; costLabel?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tB = at(p, "bezos", 0.1), tT = at(p, "takes", 0.6), tS = at(p, "security", 2.4), tC = at(p, "cost", 3.3);
  const kB = sp(tB, 8), kT = sp(tT, 10), kS = sp(tS, 14), kC = sp(tC, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 96, maxW, { upper: true }));
  const pay = P.pay ?? "", cost = P.cost ?? "";
  const pSize = Math.max(min, fitLine(pay, 170, maxW * 0.9));
  const cSize = Math.max(min, fitLine(cost, 200, maxW * 0.9));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 54, maxW * 0.9, { upper: true }));
  const label = (P.label ?? "").toUpperCase();
  const g = h * 0.74;
  const hop = t > tB && t < tB + 0.5 ? Math.sin((t - tB) * Math.PI * 2) * h * 0.015 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.04 * kC})`, transformOrigin: "50% 65%" }}>
        <World kind="city" tint="#3a2a1e" w={w} h={h} t={t} seed="hook-bezos-amazon" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.64},${g - hop}) scale(${1 + 0.04 * kB})`}><Parcel s={h * 0.26} t={t} /></g>
          {kT > 0 && <g transform={`translate(${w * 0.36 + (1 - kT) * w * 0.25},${g - h * 0.18 - (1 - kT) * h * 0.05}) scale(${kT})`}><Pay s={h * 0.11} t={t} /></g>}
          {kS > 0 && <g transform={`translate(${w * 0.8 + (1 - kS) * w * 0.5},${g + h * 0.02})`}><Car s={h * 0.12} t={t} /></g>}
          <Actor p={p} spec={{ who: "photo:bezos", x: 0.2, scale: 1.15, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "takes", pose: "shrug", expression: "happy" }] }} ground={g + h * 0.02} index={0} />
        </svg>
        {label && (
          <div style={{ position: "absolute", left: w * 0.64 - w * 0.2, width: w * 0.4, top: g - h * 0.17, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(label), color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{label}</span>
          </div>
        )}
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: "#fff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", transform: "rotate(-2deg)" }}>{line}</span>
        </div>
      )}
      {pay && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.13, textAlign: "center", transform: `scale(${1 - 0.25 * kC})`, transformOrigin: "50% 0%" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: pSize, lineHeight: 1, color: "#9ff0b4", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{pay}</span>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.payLabel ?? ""), color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.payLabel ?? "").toUpperCase()}</span></div>
        </div>
      )}
      {kC > 0 && cost && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.3, textAlign: "center", transform: `scale(${1.6 - 0.6 * kC})`, opacity: clamp(kC * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{cost}</span>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.costLabel ?? ""), color: INK, background: "#ffd84a", padding: "4px 16px", borderRadius: 10, border: `5px solid ${INK}` }}>{(P.costLabel ?? "").toUpperCase()}</span></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
