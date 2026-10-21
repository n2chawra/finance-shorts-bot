/**
 * Custom hook for the rich-vs-poor raise showcase: the same moment in two lives. The frame splits
 * down a white seam: Rohan in his rented flat on the left, Sharma Uncle in the penthouse on the
 * right; both phones light up with the same raise; POOR and RICH stamp in as the narrator names
 * them. Built only from the studio kit (motion-direction skill).
 *
 * params: { poor: label, rich: label, toast: "+{rich_amount}" }, events: poor, rich, same
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Toast: React.FC<{ x: number; y: number; text: string; k: number; w: number }> = ({ x, y, text, k, w }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * -60}px) scale(${0.8 + 0.2 * k})` }}>
    <div style={{ background: "#1d2130", borderRadius: 26, padding: "16px 22px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#3156d3", flexShrink: 0 }} />
      <div style={{ fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 700, fontSize: 46, opacity: 0.8 }}>Salary credited</div>
        <div style={{ fontWeight: 900, fontSize: 60, color: "#7cf0b2" }}>{text}</div>
      </div>
    </div>
  </div>
);

const Stamp: React.FC<{ text: string; bg: string; k: number; x: number; y: number; rot: number }> = ({ text, bg, k, x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${2.2 - 1.2 * k}) rotate(${rot}deg)`, opacity: clamp(k * 3) }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 104, color: "#fff", background: bg, padding: "6px 40px", borderRadius: 26,
      border: "8px solid #fff", boxShadow: "0 14px 0 rgba(0,0,0,0.45)", letterSpacing: 2 }}>{text}</div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { poor?: string; rich?: string; toast?: string };
  const sp = (start: number, damping = 13) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const inL = sp(0, 16), inR = sp(0.08, 16);
  const kPoor = sp(at(p, "poor", 0.2), 9), kRich = sp(at(p, "rich", 1.6), 9);
  const kToastL = sp(at(p, "poor", 0.2) + 0.25), kToastR = sp(at(p, "rich", 1.6) + 0.25);
  // the camera leans toward whoever is being talked about
  const lean = clamp((t - at(p, "rich", 1.6)) / 0.8);
  const seam = 0.5 + 0.02 * Math.sin(t * 1.3);
  const Flat = SETS.flat!, Pent = SETS.penthouse!;
  const half = (side: "L" | "R", node: React.ReactNode) => (
    <AbsoluteFill style={{ clipPath: side === "L" ? `polygon(0 0, ${seam * 100 + 4}% 0, ${seam * 100 - 4}% 100%, 0 100%)` : `polygon(${seam * 100 + 4}% 0, 100% 0, 100% 100%, ${seam * 100 - 4}% 100%)`,
      transform: `translateX(${side === "L" ? (inL - 1) * w * 0.6 : (1 - inR) * w * 0.6}px)` }}>{node}</AbsoluteFill>
  );
  const ground = h * 0.92;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", transform: `scale(${1.02 + 0.03 * t})` }}>
      {half("L", <>
        <AbsoluteFill style={{ transform: `scale(1.3) translateX(${-w * 0.16 - lean * 20}px)`, transformOrigin: "50% 60%" }}><Flat.back w={w} h={h} t={t} seed={`${p.beat.id}L`} /></AbsoluteFill>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Actor p={p} spec={{ who: "rohan", x: 0.25, scale: 1.75, acting: [{ sec: 0, pose: "phone", prop: "phone", expression: "happy" }, { at: "poor", pose: "celebrate", expression: "laugh" }] }} ground={ground} index={0} />
        </svg>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,90,90,0.12), rgba(120,0,0,0.25))" }} />
      </>)}
      {half("R", <>
        <AbsoluteFill style={{ transform: `scale(1.3) translateX(${w * 0.16 + (1 - lean) * 20}px)`, transformOrigin: "50% 60%" }}><Pent.back w={w} h={h} t={t} seed={`${p.beat.id}R`} /></AbsoluteFill>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Actor p={p} spec={{ who: "sharma", x: 0.75, scale: 1.75, turn: -0.3, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "rich", pose: "thumbsUp", expression: "proud" }] }} ground={ground} index={1} />
        </svg>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(90,255,170,0.08), rgba(0,80,40,0.22))" }} />
      </>)}
      {/* the seam */}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w * (seam + 0.04)} y1={0} x2={w * (seam - 0.04)} y2={h} stroke="#fff" strokeWidth={14}
          strokeDasharray={h * 1.1} strokeDashoffset={h * 1.1 * (1 - clamp(t / 0.5))} />
      </svg>
      <Stamp text={P.poor ?? "Poor"} bg="#c92a2a" k={kPoor} x={w * 0.3} y={h * 0.1} rot={-5} />
      <Stamp text={P.rich ?? "Rich"} bg="#1f8f55" k={kRich} x={w * 0.72} y={h * 0.1} rot={4} />
      {P.toast && <Toast x={w * 0.26} y={h * 0.25} w={w * 0.46} text={P.toast} k={kToastL} />}
      {P.toast && <Toast x={w * 0.74} y={h * 0.25} w={w * 0.46} text={P.toast} k={kToastR} />}
    </AbsoluteFill>
  );
};

export default Hook;
