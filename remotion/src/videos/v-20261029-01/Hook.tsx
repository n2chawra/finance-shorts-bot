/**
 * Hook: "Me? {poor_day_total}. Uncle? {rich_day_total_long}."
 * A split screen from frame 0, the same Tuesday morning: on the left Rohan's rented flat, a thin
 * wallet and a little coin pile, his year's pay in a red tag; on the right Sharma's penthouse, a
 * money sack and a mountain of sacks rising behind him, his year's pay in a gold tag. On "me"
 * Rohan's coins hop; on "uncle" the mountain grows and the gold tag slams in.
 *
 * params: { poor: "{poor_day_total}", rich: "{rich_day_total_long}" }, events: me, uncle
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Wallet = props.wallet!, Coins = props.coinpile!, Sack = props.moneybag!, Mountain = props.moneymountain!, Watch = props.stopwatch!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { poor?: string; rich?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tToday = at(p, "me", 0.1), tUncle = at(p, "uncle", 1.6);
  const hop = t >= tToday && t < tToday + 0.6 ? Math.sin((t - tToday) / 0.6 * Math.PI) * h * 0.03 : 0;
  const kRich = sp(tUncle, 8), kMount = 0.55 + 0.45 * sp(tUncle, 12);
  const Flat = SETS.flat!, Pent = SETS.penthouse!;
  const half = w / 2, ground = h * 0.82;
  const push = 1.04 + 0.025 * t;
  const tag = (text: string, color: string, k: number, left: number) => (
    <div style={{ position: "absolute", top: h * 0.15, left, width: half, textAlign: "center", transform: `scale(${k})` }}>
      <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 72, color, background: "#1d2433", borderRadius: 24, padding: "4px 26px",
        border: `6px solid ${color}`, boxShadow: "0 10px 0 rgba(0,0,0,0.45)" }}>{text}</span>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "#fff", marginTop: 6, textShadow: "0 4px 0 #1d2433" }}>A YEAR</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `inset(0 ${half}px 0 0)` }}>
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "25% 60%" }}>
          <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
          <AbsoluteFill style={{ background: "rgba(120,20,30,0.2)" }} />
          <svg width={w} height={h} style={{ position: "absolute" }}>
            <g transform={`translate(${w * 0.36},${h * 0.5})`}><Watch s={h * 0.1} t={t} k={clamp(t / 3)} /></g>
            <g transform={`translate(${w * 0.38},${ground - hop})`}><Coins s={h * 0.08} t={t} /></g>
            <g transform={`translate(${w * 0.1},${ground})`}><Wallet s={h * 0.07} t={t} /></g>
            <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.05, acting: [{ sec: 0, pose: "shrug", expression: "worried" }, { at: "uncle", pose: "facepalm", expression: "shock" }] }} ground={h * 1.04} index={0} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${half}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "75% 60%" }}>
          <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
          <svg width={w} height={h} style={{ position: "absolute" }}>
            <g transform={`translate(${w * 0.86},${h * 0.7}) scale(${kMount})`}><Mountain s={h * 0.22} t={t} /></g>
            <g transform={`translate(${w * 0.62},${ground})`}><Sack s={h * 0.1} t={t} /></g>
            <Actor p={p} spec={{ who: "sharma", x: 0.78, scale: 1.05, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "uncle", pose: "present", expression: "proud" }] }} ground={h * 1.04} index={1} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: half - 5, top: 0, width: 10, height: h, background: "#fff", boxShadow: "0 0 30px rgba(0,0,0,0.6)" }} />
      {P.poor && tag(P.poor, "#ff8a8a", 1, 0)}
      {P.rich && tag(P.rich, "#ffd84a", 0.85 + 0.15 * kRich, half)}
      <AbsoluteFill style={{ background: "#fff", opacity: t >= tUncle ? clamp(0.5 - (t - tUncle) * 2) : 0 }} />
    </AbsoluteFill>
  );
};

export default Hook;
