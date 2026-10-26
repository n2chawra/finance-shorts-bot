/**
 * Hook: "Rohan and Priya sign a loan on the same day. Five years later, one is richer. One is broke."
 * A split frame: both sign at the same desk-line; on "later" the halves age, Rohan's car rusts and
 * shrinks, Priya's house grows a floor and fills with light; RICHER and BROKE stamp in.
 *
 * events: sign, later, richer, broke
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Car = props.car!, House = props.house!;

const Stamp: React.FC<{ text: string; bg: string; k: number; x: number; y: number; rot: number }> = ({ text, bg, k, x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${2.2 - 1.2 * k}) rotate(${rot}deg)`, opacity: clamp(k * 3) }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, color: "#fff", background: bg, padding: "4px 34px", borderRadius: 22,
      border: "7px solid #fff", boxShadow: "0 12px 0 rgba(0,0,0,0.45)", textTransform: "uppercase" }}>{text}</div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tLater = at(p, "later", 1.8), kRich = sp(at(p, "richer", 2.6), 9), kBroke = sp(at(p, "broke", 3.4), 9);
  const age = clamp((t - tLater) / 0.9);
  const ground = h * 0.86;
  const half = (left: boolean, node: React.ReactNode) => (
    <AbsoluteFill style={{ clipPath: left ? "polygon(0 0, 52% 0, 48% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 48% 100%)" }}>{node}</AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${1.02 + 0.02 * t})` }}>
      {half(true, <>
        <World kind="street" tint={age > 0.5 ? "dark" : undefined} w={w} h={h} t={t} seed="hook-l" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.3},${ground}) scale(${1 - 0.35 * age}) rotate(${age * -6})`} style={{ filter: `saturate(${1 - age * 0.8})` }}><Car s={h * 0.3} t={t} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.12, scale: 1.0, acting: [{ sec: 0, pose: "thumbsUp", expression: "happy" }, { at: "later", pose: "worried", expression: "sad" }] }} ground={ground} index={0} />
        </svg>
      </>)}
      {half(false, <>
        <World kind="field" tint={age > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="hook-r" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.7},${ground}) scale(${1 + 0.35 * age})`}><House s={h * 0.32} t={t} /></g>
          <Actor p={p} spec={{ who: "priya", x: 0.88, scale: 1.0, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "later", pose: "thumbsUp", expression: "proud" }] }} ground={ground} index={1} />
        </svg>
      </>)}
      <svg width={w} height={h} style={{ position: "absolute" }}><line x1={w * 0.52} y1={0} x2={w * 0.48} y2={h} stroke="#fff" strokeWidth={12} /></svg>
      {age > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", opacity: age }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", background: "rgba(10,12,24,0.7)", padding: "6px 30px", borderRadius: 999 }}>Five years later</span>
      </div>}
      <Stamp text="Broke" bg="#a3171c" k={kBroke} x={w * 0.25} y={h * 0.22} rot={-5} />
      <Stamp text="Richer" bg="#1f9d55" k={kRich} x={w * 0.75} y={h * 0.22} rot={4} />
    </AbsoluteFill>
  );
};

export default Hook;
