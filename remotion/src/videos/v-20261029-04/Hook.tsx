/**
 * Hook: "I pay one bill before rent. Myself."
 * From frame 0: Sharma big in his penthouse with his pay stub, the front door with its rent notice
 * waiting on one side and a small safe on the other. The pay sits on a plate at the top. On "bill"
 * a green slice of the pay pie lifts out; on "rent" the door's notice flaps and dims; on "myself"
 * the slice flies into the safe and its share lands on a gold tag.
 *
 * params: { pay: "{pay_amount}", first: "{pay_per_period}" }, events: bill, rent, myself
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Slice = props.payslice!, Safe = props.safebox!, Door = props.frontdoor!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { pay?: string; first?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tBill = at(p, "bill", 0.6), tRent = at(p, "rent", 1.2), tMe = at(p, "myself", 1.9);
  const kSlice = clamp((t - tBill) / 0.5), kRent = sp(tRent, 12), kFly = clamp((t - tMe) / 0.5), kTag = sp(tMe, 8);
  const Pent = SETS.penthouse!;
  const push = 1.04 + 0.03 * t;
  const pieX = w * 0.5, pieY = h * 0.5, safeX = w * 0.8, safeY = h * 0.6;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 55%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.16},${h * 0.6})`} opacity={1 - 0.4 * kRent}><Door s={h * 0.2} t={t * (1 + 3 * kRent)} /></g>
          <g transform={`translate(${safeX},${safeY}) scale(${1 + 0.15 * kTag})`}><Safe s={h * 0.1} t={t} /></g>
          <g transform={`translate(${pieX + (safeX - pieX) * kFly},${pieY + (safeY - h * 0.08 - pieY) * kFly}) scale(${1 - 0.5 * kFly})`}><Slice s={h * 0.16} t={t} k={kSlice} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.42, scale: 1.9, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "myself", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.92} index={0} />
        </svg>
      </AbsoluteFill>
      {P.pay && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 92, color: "#1d2433", background: "#ffd84a", borderRadius: 26, padding: "4px 34px",
            border: "8px solid #1d2433", boxShadow: "0 12px 0 rgba(0,0,0,0.45)" }}>{P.pay}</span>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", marginTop: 8, textShadow: "0 4px 0 #1d2433" }}>PAYDAY</div>
        </div>
      )}
      {P.first && kTag > 0 && (
        <div style={{ position: "absolute", left: safeX - 200, width: 400, top: h * 0.33, textAlign: "center", transform: `scale(${Math.min(1, kTag * 1.2)})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", background: "#1f9d63", borderRadius: 22, padding: "2px 24px",
            border: "6px solid #1d2433" }}>{P.first}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
