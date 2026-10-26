/**
 * Hook: "His bonus bought a TV. Mine bought a slice of the companies selling it."
 * A split screen from frame 0: on the left Rohan's rented flat, a giant TV glowing and Rohan
 * cheering; on the right Sharma's penthouse. On "tv" the TV pops to full size, on "mine" an index
 * fund certificate rises beside Sharma, on "slice" a row of shops and a factory slides in behind
 * him with a gold slice cut out of them.
 *
 * params: { amount: "{r30_amount}" }, events: tv, mine, slice
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Tv = props.tv!, Fund = props.fund!, Factory = props.factory!, Bag = props.bag!, Envelope = props.envelope!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { amount?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tTv = at(p, "tv", 0.8), tMine = at(p, "mine", 1.4), tSlice = at(p, "slice", 2.2);
  const kTv = 0.75 + 0.25 * sp(tTv, 8), kFund = sp(tMine, 9), kShops = sp(tSlice, 12);
  const Flat = SETS.flat!, Pent = SETS.penthouse!;
  const half = w / 2, ground = h * 0.84;
  const push = 1.04 + 0.03 * t;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* the poor side */}
      <AbsoluteFill style={{ clipPath: `inset(0 ${half}px 0 0)` }}>
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "25% 60%" }}>
          <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
          <AbsoluteFill style={{ background: "rgba(120,20,30,0.18)" }} />
          <svg width={w} height={h} style={{ position: "absolute" }}>
            <g transform={`translate(${w * 0.27},${h * 0.6}) scale(${kTv})`}><Tv s={h * 0.17} t={t} /></g>
            <g transform={`translate(${w * 0.42},${ground})`}><Bag s={h * 0.07} t={t} /></g>
            <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.05, acting: [{ sec: 0, pose: "celebrate", expression: "laugh" }] }} ground={h * 1.04} index={0} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* the rich side */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${half}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "75% 60%" }}>
          <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
          <svg width={w} height={h} style={{ position: "absolute" }}>
            {kShops > 0 && <g transform={`translate(${w * 0.8 + (1 - kShops) * 300},${h * 0.56})`}>
              <Factory s={h * 0.14} t={t} />
              <path d={`M0,${-h * 0.07} L${h * 0.09},${-h * 0.14} A${h * 0.11},${h * 0.11} 0 0 1 ${h * 0.1},${-h * 0.02} Z`} fill="#ffd34d" stroke="#1d2433" strokeWidth={5} opacity={0.9} />
            </g>}
            {kFund > 0 && <g transform={`translate(${w * 0.66},${h * 0.66 - kFund * h * 0.06}) scale(${kFund})`}><Fund s={h * 0.13} t={t} /></g>}
            {kFund < 1 && <g transform={`translate(${w * 0.66},${h * 0.64})`} opacity={1 - kFund}><Envelope s={h * 0.07} t={t} /></g>}
            <Actor p={p} spec={{ who: "sharma", x: 0.8, scale: 1.05, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "mine", pose: "present", expression: "proud" }] }} ground={h * 1.04} index={1} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: half - 5, top: 0, width: 10, height: h, background: "#fff", boxShadow: "0 0 30px rgba(0,0,0,0.6)" }} />
      {["POOR", "RICH"].map((word, i) => (
        <div key={word} style={{ position: "absolute", top: h * 0.27, left: i ? half : 0, width: half, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: i ? "#7cf0b2" : "#ff8a8a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill" }}>{word}</span>
        </div>
      ))}
      {P.amount && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 100, color: "#ffd84a", background: "#1d2433", borderRadius: 28, padding: "6px 36px",
            border: "6px solid #ffd84a", boxShadow: "0 12px 0 rgba(0,0,0,0.45)" }}>{P.amount}</span>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#fff", marginTop: 8, textShadow: "0 4px 0 #1d2433" }}>BONUS EACH</div>
        </div>
      )}
      <AbsoluteFill style={{ opacity: clamp(1 - t * 3), background: "transparent" }} />
    </AbsoluteFill>
  );
};

export default Hook;
