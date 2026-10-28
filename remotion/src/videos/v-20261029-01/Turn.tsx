/**
 * The turn: "But the pay isn't the real gap. The real gap opens at midnight."
 * Priya in Rohan's flat while the day runs out: a giant stopwatch sweeps round, the window light
 * fades from gold to deep blue. On "pay" the month's pay packet slides in and is crossed out; on
 * "gap" the stopwatch grows; on "midnight" the room goes dark, the watch rings and the word drops.
 *
 * params: { word: "Midnight" }, events: pay, real, gap, midnight
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Watch = props.stopwatch!, Pay = props.monthpay!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { word?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPay = at(p, "pay", 0.4), tGap = at(p, "gap", 1.4), tMid = at(p, "midnight", 2.8);
  const kPay = sp(tPay), kCross = clamp((t - tPay - 0.4) / 0.3), kGap = sp(tGap, 9), kMid = sp(tMid, 8);
  const dark = clamp(t / Math.max(0.5, tMid));
  const ring = t >= tMid && t < tMid + 0.8 ? Math.sin((t - tMid) * 60) * 6 : 0;
  const Flat = SETS.flat!;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 - 0.1 * dark})`, transformOrigin: "50% 60%" }}>
        <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
        <AbsoluteFill style={{ background: `rgba(${Math.round(240 - 220 * dark)},${Math.round(170 - 140 * dark)},${Math.round(60 + 40 * dark)},${0.15 + 0.4 * dark})` }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.72},${h * 0.6}) scale(${0.8 + 0.3 * kGap}) rotate(${ring})`}><Watch s={h * 0.22} t={t} k={clamp(t / Math.max(0.5, tMid))} /></g>
          {kPay > 0 && <g transform={`translate(${w * 0.5 - (1 - kPay) * w * 0.7},${h * 0.32}) rotate(-6)`}>
            <Pay s={h * 0.12} t={t} />
            <path d={`M${-h * 0.07},${-h * 0.09} L${h * 0.07},${-h * 0.01} M${h * 0.07},${-h * 0.09} L${-h * 0.07},${-h * 0.01}`} stroke="#e5484d" strokeWidth={14} strokeLinecap="round"
              strokeDasharray={400} strokeDashoffset={400 * (1 - kCross)} />
          </g>}
          <Actor p={p} spec={{ who: "priya", x: 0.3, scale: 0.85, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "gap", pose: "point", expression: "smirk" }, { at: "midnight", pose: "pointUp", expression: "shock" }] }} ground={h * 0.64} index={0} />
        </svg>
      </AbsoluteFill>
      {P.word && kMid > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.14, textAlign: "center", transform: `scale(${2 - kMid}) rotate(-3deg)`, opacity: clamp(kMid * 3) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "#9fc3ff", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", textTransform: "uppercase" }}>{P.word}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
