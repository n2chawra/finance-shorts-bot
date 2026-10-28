/**
 * The turn: "The twist? Level four doesn't need a big salary. It needs a head start."
 * Sharma in an office. On "twist" the camera kicks in; on "salary" a fat salary sack drops in and
 * gets a red cross; on "head" a tiny sprout pops up, on "start" it shoots up and the words land on a
 * green plate.
 *
 * params: { word: "Head start" }, events: twist, salary, head, start
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Sprout = props.sprout!, Bills = props.billpile!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { word?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.2), tSalary = at(p, "salary", 1.3), tHead = at(p, "head", 2.3), tStart = at(p, "start", 2.6);
  const kTwist = sp(tTwist, 8), kSal = sp(tSalary, 9), kCross = clamp((t - tSalary - 0.3) / 0.3), kHead = sp(tHead, 9), kGrow = clamp((t - tStart) / 1.2), kWord = sp(tStart, 8);
  const Office = SETS.office!;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 - 0.08 * kTwist})`, transformOrigin: "50% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kSal > 0 && <g transform={`translate(${w * 0.22},${h * 0.6 - (1 - kSal) * h * 0.3})`}>
            <Bills s={h * 0.12} t={t} />
            <path d={`M${-h * 0.08},${-h * 0.16} L${h * 0.08},${0} M${h * 0.08},${-h * 0.16} L${-h * 0.08},${0}`} stroke="#e5484d" strokeWidth={16} strokeLinecap="round"
              strokeDasharray={500} strokeDashoffset={500 * (1 - kCross)} />
          </g>}
          {kHead > 0 && <g transform={`translate(${w * 0.78},${h * 0.62}) scale(${kHead})`}><Sprout s={h * 0.2} t={t} k={0.1 + 0.9 * kGrow} /></g>}
          <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 0.85, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "salary", pose: "shrug", expression: "neutral" }, { at: "start", pose: "pointUp", expression: "proud" }] }} ground={h * 0.65} index={0} />
        </svg>
      </AbsoluteFill>
      {P.word && kWord > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", transform: `scale(${Math.min(1, kWord * 1.2)})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 104, color: "#fff", background: "#1f9d63", border: "8px solid #1d2433", borderRadius: 26,
            padding: "4px 32px", boxShadow: "0 12px 0 rgba(0,0,0,0.4)", textTransform: "uppercase" }}>{P.word}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
