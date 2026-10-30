/**
 * The turn: "And I love that night. A win is what brings him back next Saturday. The edge never sleeps."
 * Sharma holds a fishing rod over the casino; the bait on the line is Rohan's trophy. On "win"
 * the trophy shines, on "back" Rohan slides in after it, on "edge" the edge figure slams down with
 * its label and the clock behind races.
 *
 * params: { edge: "{spin_fee_pct}", label: "Every bet" }, events: love, win, back, edge, sleeps
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Trophy = props.trophy!, Clock = props.clock!, Casino = props.casino!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { edge?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tWin = at(p, "win", 1.0), tBack = at(p, "back", 2.2), tEdge = at(p, "edge", 3.4);
  const kWin = sp(tWin, 9), kEdge = sp(tEdge, 8);
  const slide = ease((t - tBack) / 1.2);
  const sway = Math.sin(t * 2.2) * 30;
  const Pent = SETS.penthouse!;
  const rodTip: [number, number] = [w * 0.62 + sway * 0.3, h * 0.36];
  const bait: [number, number] = [rodTip[0] + sway, h * 0.6];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 - 0.1 * clamp((t - tBack) / 0.8)})`, transformOrigin: "50% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "rgba(40,0,60,0.35)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.82},${h * 0.5})`}><Clock s={h * 0.1} t={t} k={t > tEdge ? 1 : 0.3} /></g>
          <g transform={`translate(${w * 0.5},${h * 0.86})`} opacity={0.8}><Casino s={h * 0.16} t={t} /></g>
          {/* the rod and line */}
          <line x1={w * 0.3} y1={h * 0.6} x2={rodTip[0]} y2={rodTip[1]} stroke="#8a5a2b" strokeWidth={14} strokeLinecap="round" />
          <path d={`M${rodTip[0]},${rodTip[1]} Q${(rodTip[0] + bait[0]) / 2 + 20},${(rodTip[1] + bait[1]) / 2} ${bait[0]},${bait[1] - h * 0.11}`} fill="none" stroke={INK} strokeWidth={4} />
          <g transform={`translate(${bait[0]},${bait[1]}) scale(${1 + 0.2 * kWin * (1 + Math.sin(t * 8) * 0.1)})`}>
            {kWin > 0 && <circle cx={0} cy={-h * 0.05} r={h * 0.07 * kWin} fill="#ffe27a" opacity={0.35} />}
            <Trophy s={h * 0.1} t={t} />
          </g>
          <Actor p={p} spec={{ who: "sharma", x: 0.24, scale: 0.9, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "edge", pose: "hips", expression: "proud" }] }} ground={h * 0.74} index={0} />
          {t > tBack - 0.1 && <Actor p={p} spec={{ who: "rohan", x: 0.9 - 0.14 * slide, scale: 0.9, acting: [{ sec: 0, pose: "point", expression: "happy" }] }} ground={h * 1.04} index={1} />}
        </svg>
      </AbsoluteFill>
      {P.edge && kEdge > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `scale(${2 - kEdge})`, opacity: clamp(kEdge * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 140, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{P.edge}</div>
          {P.label && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", background: "#1d2433", borderRadius: 18, padding: "4px 26px" }}>{P.label}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
