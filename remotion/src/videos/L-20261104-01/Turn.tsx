/**
 * The turn: "Here's the twist. Starting late, Rohan saves only {investdiff_diff} less in total. But at
 * the end, he's {wait_diff} behind."
 * A field at sunset split in two: on the left the early money tree, on the right the late one, both
 * saplings at first. On "saves" a small pile of coins drops under each tree, almost the same height,
 * with the small gap tag between them; on "end" both trees grow, the early one huge and the late one
 * small; on "behind" a red gap bracket opens between their tops with the big figure, and the stamp
 * lands. Rohan stands small at the centre, looking from one to the other.
 *
 * params: { earlyLabel, lateLabel, savedGap, endGap, stamp }
 * events: twist, late, saves, less, end, behind
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Tree = props.moneytree!, Jar = props.growjar!;

const Pill: React.FC<{ x: number; y: number; text: string; bg: string; k: number; size: number; maxW: number; min: number }> = ({ x, y, text, bg, k, size, maxW, min }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), fontFamily: FONT, fontWeight: 900,
    fontSize: Math.max(min, fitLine(text, size, maxW)), color: "#fff", background: bg, border: "6px solid #fff", borderRadius: 20, padding: "4px 24px",
    whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>{text}</div>
);

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { earlyLabel?: string; lateLabel?: string; savedGap?: string; endGap?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.6), tLate = at(p, "late", 1.6), tSaves = at(p, "saves", 2.4), tEnd = at(p, "end", 4.4), tBehind = at(p, "behind", 5.6);
  const kLabels = sp(tLate), kSaves = sp(tSaves), kGrow = clamp((t - tEnd) / 1.4), kGap = sp(tBehind, 9), kStamp = sp(tBehind + 0.5, 9), kTwist = sp(tTwist, 10);
  const mt = minText(w, h);
  const ground = h * 0.8;
  const xs = [w * 0.27, w * 0.73];
  const grow = [0.15 + 0.85 * kGrow, 0.15 + 0.35 * kGrow];
  const treeS = h * 0.62;
  const tops = grow.map((g) => ground - treeS * (0.35 + 0.65 * g) * 1.17);
  const push = 1 + 0.05 * clamp((t - tBehind) / 0.8);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        <World kind="field" tint={kGap > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="turn-trees" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {xs.map((x, i) => (
            <g key={i}>
              <g transform={`translate(${x},${ground})`}><Tree s={treeS} t={t + i} k={grow[i]!} /></g>
              {kSaves > 0 && <g transform={`translate(${x + (i ? -1 : 1) * w * 0.12},${ground}) scale(${kSaves})`}><Jar s={h * 0.16} t={t} k={i ? 0.55 : 0.75} /></g>}
            </g>
          ))}
          {kGap > 0 && (
            <g opacity={kGap}>
              <line x1={w * 0.5} y1={tops[0]!} x2={w * 0.5} y2={tops[0]! + (tops[1]! - tops[0]!) * kGap} stroke="#e5484d" strokeWidth={12} strokeLinecap="round" />
              <line x1={w * 0.46} y1={tops[0]!} x2={w * 0.54} y2={tops[0]!} stroke="#e5484d" strokeWidth={10} strokeLinecap="round" />
              <line x1={w * 0.46} y1={tops[1]!} x2={w * 0.54} y2={tops[1]!} stroke="#e5484d" strokeWidth={10} strokeLinecap="round" opacity={kGap} />
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.5, scale: 0.6, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "late", pose: "shrug", expression: "confused", turn: 0.5 },
            { at: "end", pose: "point", expression: "shock", turn: -0.5 }, { at: "behind", pose: "facepalm", expression: "shock" }] }} ground={h * 0.97} index={0} />
        </svg>
        {P.earlyLabel && <Pill x={xs[0]!} y={h * 0.14} text={P.earlyLabel} bg="#1f8f55" k={kLabels} size={50} maxW={w * 0.3} min={mt} />}
        {P.lateLabel && <Pill x={xs[1]!} y={h * 0.14} text={P.lateLabel} bg="#5b6475" k={kLabels} size={50} maxW={w * 0.3} min={mt} />}
        {P.savedGap && <Pill x={w * 0.5} y={ground - h * 0.2} text={P.savedGap} bg="#3d7bf5" k={kSaves * (1 - 0.6 * kGrow)} size={52} maxW={w * 0.26} min={mt} />}
        {P.endGap && <Pill x={w * 0.5} y={(tops[0]! + tops[1]!) / 2 - h * 0.04} text={P.endGap} bg="#c92a2a" k={kGap} size={76} maxW={w * 0.3} min={mt} />}
      </AbsoluteFill>
      {kTwist > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.04, transform: `translate(-50%,0) scale(${kTwist})`, fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine("THE TWIST", 60, w * 0.3, { upper: true })), color: "#ffd34d", whiteSpace: "nowrap", textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>THE TWIST</div>
      )}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.6, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(P.stamp, 70, w * 0.34, { upper: true })), color: "#fff", background: "#c92a2a",
            padding: "8px 30px", whiteSpace: "nowrap", borderRadius: 24, border: "8px solid #fff", textTransform: "uppercase", boxShadow: "0 14px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
