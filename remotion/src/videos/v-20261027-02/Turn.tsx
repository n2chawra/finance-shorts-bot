/**
 * The turn: "So that TV never really cost {r30_amount}. It cost Rohan {r30_final}."
 * The dead TV sits in Rohan's flat with its price tag swinging; on "never" the tag's old price is
 * struck through, on "rohan" a red stamp with the invested figure slams onto it and the screen
 * shakes; Priya points at it.
 *
 * params: { paid: "{r30_amount}", real: "{r30_final}" }, events: never, cost, rohan
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Tv = props.tv!, Bin = props.bin!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { paid?: string; real?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tNever = at(p, "never", 0.5), tCost = at(p, "cost", 1.6), tRohan = at(p, "rohan", 2.4);
  const kStrike = clamp((t - tNever) / 0.4), kStamp = sp(tRohan, 8), kTag = sp(0, 12);
  const quake = t >= tRohan && t < tRohan + 0.5 ? Math.sin((t - tRohan) * 70) * 18 * (1 - (t - tRohan) / 0.5) : 0;
  const Flat = SETS.flat!;
  const zoom = 1.25 - 0.2 * clamp((t - tCost) / 0.8);
  const swing = Math.sin(t * 2.4) * 6;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", transform: `translate(${quake}px,${quake * 0.5}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>
        <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
        <AbsoluteFill style={{ background: `rgba(160,0,20,${0.12 + 0.18 * clamp(kStamp)})` }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.6},${h * 0.7})`}><Tv s={h * 0.2} t={t} state="dead" /></g>
          <g transform={`translate(${w * 0.88},${h * 0.86})`}><Bin s={h * 0.11} t={t} /></g>
          <Actor p={p} spec={{ who: "priya", x: 0.24, scale: 1.0, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "cost", pose: "point", expression: "smirk" }] }} ground={h * 0.95} index={0} />
        </svg>
      </AbsoluteFill>
      {/* the price tag, hanging from the top */}
      <div style={{ position: "absolute", left: w * 0.5, top: h * 0.1, transform: `translate(-50%,0) rotate(${swing}deg) scale(${kTag})`, transformOrigin: "50% 0%",
        background: "#ffd34d", border: "8px solid #1d2433", borderRadius: 26, padding: "18px 40px", textAlign: "center", boxShadow: "0 14px 0 rgba(0,0,0,0.4)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#1d2433" }}>THE TV COST</div>
        {P.paid && <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#1d2433", lineHeight: 1.05 }}>
          {P.paid}
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 14, background: "#e5484d", transform: `scaleX(${kStrike})`, transformOrigin: "0 50%", borderRadius: 7 }} />
        </div>}
        {P.real && kStamp > 0 && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, color: "#fff", background: "#e5484d", borderRadius: 20, padding: "0 24px", marginTop: 10,
          transform: `scale(${2.2 - 1.2 * kStamp}) rotate(-4deg)`, opacity: clamp(kStamp * 3), border: "6px solid #1d2433" }}>{P.real}</div>}
      </div>
    </AbsoluteFill>
  );
};

export default Turn;
