/**
 * The payoff: "Basketball paid a salary. Owning paid a fortune. Which pays you?"
 * A penthouse at night split in two: a hoop on the left, the open fortune vault on the right,
 * Sharma standing small at the right edge. The paycheck waits by the hoop; on "Basketball" it pops
 * up with the per-season figure and A SEASON; on "salary" the paycheck hops; on "Owning" the vault
 * glows; on "fortune" gold bars stack into it and the fortune figure slams in with OWNING; on "you"
 * WHICH PAYS YOU? stamps in across the middle.
 *
 * params: { salary, salaryLabel, fortune, fortuneLabel, ask }, events: court, salary, owning, fortune, you
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Hoop = props.hoop!, Check = props.paycheck!, Vault = props.fortunevault!, Trophy = props.trophy!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { salary?: string; salaryLabel?: string; fortune?: string; fortuneLabel?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCourt = at(p, "court", 0.2), tSal = at(p, "salary", 1.0), tOwn = at(p, "owning", 1.6), tFort = at(p, "fortune", 2.4), tYou = at(p, "you", 3.6);
  const kCourt = 0.6 + 0.4 * sp(tCourt, 12), kSal = sp(tSal, 8), kOwn = sp(tOwn, 12), kFort = sp(tFort, 9), kYou = sp(tYou, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const half = (box.x1 - box.x0) / 2 - 20;
  const lab = (s: string, base0 = 50) => Math.max(min, fitLine(s.toUpperCase(), base0, half, { upper: true }));
  const fig = (s: string, base0 = 96) => Math.max(min, fitLine(s, base0, half));
  const g = h * 0.62, lx = w * 0.27, rx = w * 0.6;
  const zoom = 1.04 - 0.04 * kYou;
  const hopS = kSal * Math.abs(Math.sin((t - tSal) * 7)) * (t < tSal + 0.6 ? 1 : 0);
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 96, box.x1 - box.x0 - 40, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 55%" }}>
        <World kind="night" tint="#2a1f55" w={w} h={h} t={t} seed="payoff-court-vault" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <line x1={w * 0.46} y1={h * 0.3} x2={w * 0.46} y2={g + h * 0.04} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={6} strokeDasharray="20 16" />
          <g transform={`translate(${lx},${g})`}><Hoop s={h * 0.22} t={t} /></g>
          {kCourt > 0 && (
            <g transform={`translate(${lx},${g + h * 0.02 - kCourt * h * 0.02 - hopS * h * 0.04}) scale(${kCourt})`}><Check s={h * 0.14} t={t} /></g>
          )}
          <ellipse cx={rx} cy={g - h * 0.08} rx={w * 0.2} ry={h * 0.1} fill="#ffd84a" opacity={0.2 * kOwn} />
          <g transform={`translate(${rx},${g})`}><Vault s={h * 0.2} t={t} k={0.2 + 0.8 * kFort} /></g>
          <g transform={`translate(${rx - w * 0.14},${g + h * 0.02})`} opacity={clamp(kFort * 2)}><Trophy s={h * 0.07} t={t} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.8, scale: 0.68, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "you", pose: "point", expression: "happy" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {kCourt > 0 && P.salary && (
        <div style={{ position: "absolute", left: box.x0 + 10, width: half, top: h * 0.15, textAlign: "center", opacity: clamp(kCourt * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.salary, 84), color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.salary}</div>
          {P.salaryLabel && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.salaryLabel), color: "#c9b2ff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.salaryLabel.toUpperCase()}</div>}
        </div>
      )}
      {kFort > 0 && P.fortune && (
        <div style={{ position: "absolute", left: box.x0 + 10 + half + 20, width: half, top: h * 0.17, textAlign: "center", opacity: clamp(kFort * 2), transform: `scale(${1.6 - 0.6 * kFort})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.fortune, 120), color: "#ffd84a", WebkitTextStroke: "11px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.fortune}</div>
          {P.fortuneLabel && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.fortuneLabel, 60), color: "#fff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.fortuneLabel.toUpperCase()}</div>}
        </div>
      )}
      {kYou > 0 && ask && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.33, textAlign: "center", transform: `rotate(-4deg) scale(${1.6 - 0.6 * kYou})`, opacity: clamp(kYou * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#1d2433", background: "#ffd84a", padding: `${aSize * 0.12}px ${aSize * 0.4}px`,
            border: "7px solid #1d2433", borderRadius: 16 }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
