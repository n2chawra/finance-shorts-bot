/**
 * The payoff: "{life_years} years for one, a dinner for all. Still want it split?"
 * A penthouse over the night city. Left: the money mountain big behind one small worker, with the
 * years chip FOR ONE; right: a crowd of people in front of one dinner plate, the per-person chip FOR
 * EVERYONE. On "years" the mountain glows; on "dinner" the plate pops in front of the crowd; on
 * "split" the knife hovers over the mountain, a STILL SPLIT IT? chip drops and the camera pulls wide.
 *
 * params: { big, bigLabel, small, smallLabel, ask }, events: endless, dinner, split
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pile = props.moneymountain!, Worker = props.worker!, Crowd = props.crowd!, Plate = props.dinnerplate!, Knife = props.knife!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { big?: string; bigLabel?: string; small?: string; smallLabel?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tBig = at(p, "endless", 0.4), tDin = at(p, "dinner", 1.6), tSplit = at(p, "split", 2.8);
  const kBig = sp(tBig, 9), kDin = sp(tDin, 9), kSplit = sp(tSplit, 12);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const colW = (box.x1 - box.x0) * 0.47;
  const lab = (s: string, b = 50) => Math.max(min, fitLine(s.toUpperCase(), b, colW, { upper: true }));
  const g = h * 0.62, lx = w * 0.28, rx = w * 0.74;
  const zoom = 1.08 - 0.08 * kSplit;
  const chip = (top: string, bottom: string, bg: string, x: number, k: number) => (
    <div style={{ position: "absolute", left: x - colW / 2, width: colW, top: h * 0.2, textAlign: "center", opacity: clamp(k * 2), transform: `scale(${1.4 - 0.4 * k})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(top, 76, colW)), color: "#ffd84a", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{top}</div>
      <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: lab(bottom), color: "#1d2433", background: bg, padding: "4px 16px", borderRadius: 12, border: `4px solid ${INK}` }}>{bottom.toUpperCase()}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="city" tint="#1e2e5e" w={w} h={h} t={t} seed="payoff-split-city" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={lx} cy={g - h * 0.1} rx={w * 0.2} ry={h * 0.1} fill="#ffd27a" opacity={0.08 + 0.16 * kBig} />
          <g transform={`translate(${lx},${g}) scale(${1 + 0.08 * kBig})`}><Pile s={h * 0.2} t={t} /></g>
          <g transform={`translate(${lx + w * 0.12},${g + h * 0.02})`}><Worker s={h * 0.08} t={t} /></g>
          <g transform={`translate(${rx},${g})`}><Crowd s={h * 0.14} t={t} /></g>
          {kDin > 0 && <g transform={`translate(${rx},${g + h * 0.04}) scale(${kDin})`}><Plate s={h * 0.08} t={t} /></g>}
          {kSplit > 0 && <g transform={`translate(${lx + w * 0.02},${g - h * 0.26 - (1 - kSplit) * h * 0.1})`} opacity={clamp(kSplit * 2)}><Knife s={h * 0.12} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.5, scale: 0.7, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "split", pose: "shrug", expression: "smirk" }] }}
            ground={h * 0.84} index={0} />
        </svg>
      </AbsoluteFill>
      {P.big && chip(P.big, P.bigLabel ?? "", "#ffd84a", lx, kBig)}
      {P.small && chip(P.small, P.smallLabel ?? "", "#8fd19e", rx, kDin)}
      {kSplit > 0 && P.ask && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.36, textAlign: "center", opacity: clamp(kSplit * 2), transform: `translate(0,${(1 - kSplit) * -40}px)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.ask.toUpperCase(), 70, (box.x1 - box.x0) * 0.85, { upper: true })), color: "#fff", background: "#3d7bf5", padding: "8px 26px", borderRadius: 16, border: `6px solid ${INK}` }}>{P.ask.toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
