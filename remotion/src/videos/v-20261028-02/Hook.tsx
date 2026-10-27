/**
 * Hook: "Worth billions, and his salary is a single dollar? Why?"
 * The CEO's penthouse at night: Sharma (the billionaire) big and smug beside a tower of share
 * certificates with a crown on top. On "worth" WORTH BILLIONS stamps in gold, on "salary" a
 * salary cheque slams down with the one-dollar figure, on "why" Rohan leans in with a question mark.
 *
 * params: { one: "{one_amount}" }, events: worth, salary, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Certificate = props.certificate!, Crown = props.crown!, Cheque = props.cheque!, Yacht = props.yacht!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { one?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tWorth = at(p, "worth", 0.1), tSalary = at(p, "salary", 1.2), tWhy = at(p, "why", 2.3);
  const kWorth = 1 + 0.15 * sp(tWorth, 9) * Math.exp(-(t - tWorth) * 3), kCheque = 0.75 + 0.25 * sp(tSalary, 9), kWhy = sp(tWhy, 10);
  const Pent = SETS.penthouse!;
  const push = 1.04 + 0.025 * t;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 55%, rgba(255,200,90,0.28), rgba(20,10,0,0.4) 72%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.85},${h * 0.5})`} opacity={0.8}><Yacht s={h * 0.06} t={t} /></g>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${w * (0.72 + (i % 2) * 0.03)},${h * 0.88 - i * h * 0.075 * (0.6 + 0.4 * clamp(kWorth))}) rotate(${(i % 3) * 3 - 3})`}>
              <Certificate s={h * 0.11} t={t + i} />
            </g>
          ))}
          <g transform={`translate(${w * 0.74},${h * 0.8 - 7 * h * 0.075 * (0.6 + 0.4 * clamp(kWorth))})`}><Crown s={h * 0.07} t={t} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.24, scale: 1.35, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "salary", pose: "present", expression: "proud" }] }} ground={h * 1.09} index={0} />
          {t > tWhy - 0.05 && <Actor p={p} spec={{ who: "rohan", x: 0.92 - 0.06 * clamp(kWhy), scale: 0.9, acting: [{ sec: 0, pose: "shrug", expression: "confused", bubble: { icon: "?" } }] }} ground={h * 1.08} index={1} />}
          {kCheque > 0 && <g transform={`translate(${w * 0.4},${h * (0.5 - 0.1 * (1 - kCheque))}) scale(${0.6 + 0.4 * kCheque})`}><Cheque s={h * 0.11} t={t} /></g>}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `scale(${0.6 + 0.4 * kWorth}) rotate(-4deg)`, opacity: 1 }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#1d2433", background: "#ffd84a", padding: "4px 36px", borderRadius: 24,
          border: "8px solid #1d2433", boxShadow: "0 14px 0 #1d2433" }}>WORTH BILLIONS</span>
      </div>
      {P.one && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.22, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", textShadow: "0 4px 0 #1d2433" }}>HIS SALARY</div>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 190, color: "#7cf0b2", WebkitTextStroke: "14px #1d2433", paintOrder: "stroke fill",
            display: "inline-block", lineHeight: 1.05, transform: `scale(${kCheque * (1 + (t > tSalary ? 0.25 * Math.exp(-(t - tSalary) * 3) : 0))})` }}>{P.one}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
