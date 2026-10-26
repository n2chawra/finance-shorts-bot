/**
 * The payoff: "Poor people buy the thing. Rich people buy a piece of the people selling it."
 * Two halves again: on "poor" the left lights up, the TV drops into the bin on "thing"; on "rich"
 * the right lights up with the factory and shops, and on "piece" the index fund certificate lands
 * on them while a money tree grows. Sharma stands on the line between them.
 *
 * params: { poor: "Poor", rich: "Rich" }, events: poor, thing, rich, piece
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Tv = props.tv!, Bin = props.bin!, Factory = props.factory!, Fund = props.fund!, Tree = props.tree!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { poor?: string; rich?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tPoor = at(p, "poor", 0.2), tThing = at(p, "thing", 1.0), tRich = at(p, "rich", 1.6), tPiece = at(p, "piece", 2.4);
  const kPoor = sp(tPoor), kDrop = clamp((t - tThing) / 0.5), kRich = sp(tRich), kFund = sp(tPiece, 9);
  const Pent = SETS.penthouse!;
  const ground = h * 0.66;
  const dropY = kDrop * kDrop * h * 0.12;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(150,20,30,${0.15 + 0.25 * kPoor}) 0 50%, rgba(20,120,70,${0.1 + 0.3 * kRich}) 50% 100%)` }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w / 2} x2={w / 2} y1={h * 0.08} y2={h * 0.8} stroke="#fff" strokeWidth={8} strokeDasharray="30 20" opacity={0.7} />
        <g transform={`translate(${w * 0.25},${ground})`}><Bin s={h * 0.13} t={t} /></g>
        {kDrop < 1 && <g transform={`translate(${w * 0.25},${ground - h * 0.14 + dropY}) rotate(${kDrop * 25}) scale(${1 - kDrop * 0.4})`}><Tv s={h * 0.1} t={t} state="dead" /></g>}
        <g transform={`translate(${w * 0.78},${ground}) scale(${0.6 + 0.4 * kRich})`} opacity={0.4 + 0.6 * kRich}><Factory s={h * 0.14} t={t} /></g>
        <g transform={`translate(${w * 0.62},${ground})`}><Tree s={h * 0.2} t={t} k={0.3 + 0.7 * kFund} /></g>
        {kFund > 0 && <g transform={`translate(${w * 0.8},${ground - h * 0.18 - (1 - kFund) * 400})`}><Fund s={h * 0.1} t={t} /></g>}
        <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 1.15, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "rich", pose: "pointUp", expression: "proud" }] }} ground={h * 1.07} index={0} />
      </svg>
      {[P.poor, P.rich].map((word, i) => word ? (
        <div key={i} style={{ position: "absolute", top: h * 0.14, left: i ? w / 2 : 0, width: w / 2, textAlign: "center", transform: `scale(${i ? kRich : kPoor})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, textTransform: "uppercase", color: i ? "#7cf0b2" : "#ff8a8a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{word}</span>
        </div>
      ) : null)}
    </AbsoluteFill>
  );
};

export default Payoff;
