/**
 * Custom hook for the no-cost EMI trap: Rohan in a festive night market, thrilled with a new phone,
 * a swinging shop tag selling it as "No-cost EMI, {small} a month". On "been" the frame jolts, the
 * tag is slashed, notes fly out of his phone and a long red receipt slams down with what it could have been.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { tag, small, per, big, stamp }, events: emi, been
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import { MoneyFlow, type Cur } from "../../studio/money";

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { tag?: string; small?: string; per?: string; big?: string; stamp?: string };
  const cur = (p.tl.currency ?? "INR") as Cur;
  const sp = (start: number, damping = 12) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const tEmi = at(p, "emi", 0.6), tCost = at(p, "been", 1.2);
  const kTag = sp(-0.6, 10);   // already hanging in frame 0
  const kSlash = clamp((t - tCost) / 0.25);
  const kBill = sp(tCost + 0.1, 9);
  const kPulse = sp(tEmi, 8);
  // the camera: a slow push, and a hard jolt when the real cost lands
  const jolt = t > tCost ? Math.exp(-(t - tCost) * 6) * Math.sin((t - tCost) * 60) * 18 : 0;
  const zoom = 1.04 + 0.04 * t;
  const Market = SETS.market!;
  const ground = h * 0.93;
  const swing = Math.sin(t * 2.2) * 4 * (1 - kSlash * 0.6);
  const tagX = w * 0.66, tagY = h * 0.16, tagW = w * 0.52;
  const billW = w * 0.8, billX = w * 0.5, billTop = h * 0.36;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${jolt}px, ${jolt * 0.4}px) scale(${zoom})`, transformOrigin: "40% 60%" }}>
        <AbsoluteFill style={{ transform: "scale(1.25)", transformOrigin: "50% 65%" }}>
          <Market.back w={w} h={h} t={t} seed={`${p.beat.id}m`} />
        </AbsoluteFill>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Actor p={p} spec={{ who: "rohan", x: 0.32, scale: 1.75, turn: 0.25, acting: [
            { sec: 0, pose: "phone", prop: "phone", expression: "happy" },
            { at: "emi", pose: "celebrate", expression: "laugh" },
            { at: "been", pose: "worried", expression: "shock" } ] }} ground={ground} index={0} />
          <MoneyFlow from={[w * 0.36, h * 0.6]} to={[billX, billTop + h * 0.1]} t={t} start={tCost} dur={2.2} n={14} cur={cur} nw={240} lift={220} seed={`${p.beat.id}f`} />
        </svg>
        {/* the warm festive light turns red once the cost lands */}
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(255,40,40,0) 30%, rgba(160,0,0,${0.38 * clamp((t - tCost) / 0.4)}) 100%)` }} />
      </AbsoluteFill>
      {/* the shop's tag, swinging on its string */}
      <div style={{ position: "absolute", left: tagX - tagW / 2, top: tagY, width: tagW, transformOrigin: "50% -60px",
        transform: `rotate(${swing}deg) translateY(${(1 - kTag) * -400}px) scale(${1 + 0.06 * kPulse * Math.exp(-(t - tEmi) * 3)})` }}>
        <div style={{ position: "absolute", left: tagW / 2 - 3, top: -70, width: 6, height: 70, background: "#f5e6b8" }} />
        <div style={{ background: "#ffd43b", borderRadius: 30, border: "8px solid #fff", padding: "22px 20px 26px", textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.45)", fontFamily: FONT, color: "#1d2130", position: "relative" }}>
          <div style={{ fontWeight: 900, fontSize: 60, letterSpacing: 1 }}>{P.tag ?? ""}</div>
          <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 1.05, color: "#c92a2a" }}>{P.small ?? ""}</div>
          <div style={{ fontWeight: 700, fontSize: 52 }}>{P.per ?? ""}</div>
          {/* the slash */}
          <div style={{ position: "absolute", left: "4%", top: "48%", height: 18, width: `${92 * kSlash}%`, background: "#e03131",
            borderRadius: 9, transform: "rotate(-14deg)", transformOrigin: "0 50%", boxShadow: "0 4px 0 rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      {/* the real bill slams down */}
      {kBill > 0 && (
        <div style={{ position: "absolute", left: billX - billW / 2, top: billTop, width: billW, opacity: clamp(kBill * 3),
          transform: `translateY(${(1 - kBill) * -260}px) scale(${1.5 - 0.5 * kBill}) rotate(${-3 + 1 * kBill}deg)` }}>
          <div style={{ background: "#fffdf6", borderRadius: 18, padding: "20px 30px 26px", textAlign: "center", fontFamily: FONT,
            boxShadow: "0 26px 50px rgba(0,0,0,0.55)", borderBottom: "14px dashed #e9e2c3" }}>
            <div style={{ fontWeight: 900, fontSize: 64, color: "#fff", background: "#e03131", borderRadius: 16, display: "inline-block", padding: "2px 30px" }}>{P.stamp ?? ""}</div>
            <div style={{ fontWeight: 900, fontSize: 170, lineHeight: 1.1, color: "#c92a2a" }}>{P.big ?? ""}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
