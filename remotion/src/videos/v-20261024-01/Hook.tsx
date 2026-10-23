/**
 * Custom hook for "why can't a billionaire just pay a 5% tax": a penthouse at night, a giant tax
 * bill hanging over the skyline with its figure, Rohan big on the left shrugging at it, and a tall
 * gold tower of share certificates beside a tiny wallet of cash. On "pay" the bill swings; on
 * "bill" a red DUE stamp slams onto it. Built only from the studio kit (motion-direction skill).
 *
 * params: { question, bill, billLabel }, events: why, pay, bill
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Certificates: React.FC<{ x: number; ground: number; n: number; t: number }> = ({ x, ground, n, t }) => (
  <g>
    <ellipse cx={x} cy={ground + 6} rx={150} ry={22} fill="#000" opacity={0.3} />
    {Array.from({ length: n }, (_, i) => {
      const y = ground - (i + 1) * 34;
      const sway = Math.sin(t * 1.6 + i * 0.4) * (i * 0.35);
      return (
        <g key={i} transform={`translate(${sway},0)`}>
          <rect x={x - 120} y={y} width={240} height={30} rx={4} fill={i % 2 ? "#f3d27a" : "#e9c25c"} stroke="#7a5a12" strokeWidth={2.5} />
          <rect x={x - 100} y={y + 9} width={200} height={3} fill="#7a5a12" opacity={0.45} />
          <circle cx={x + 90} cy={y + 15} r={8} fill="#c92a2a" opacity={0.8} />
        </g>
      );
    })}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { question?: string; bill?: string; billLabel?: string };
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tPay = at(p, "pay", 1.0), tBill = at(p, "bill", 2.0);
  const kBill = sp(-0.25, 11), kStamp = sp(tBill, 8);
  const Pent = SETS.penthouse!;
  const ground = h * 0.9;
  const swing = Math.sin(t * 1.8) * 2.5 + (t > tPay ? Math.sin((t - tPay) * 12) * 7 * Math.exp(-(t - tPay) * 2.5) : 0);
  const grow = 10 + Math.min(14, Math.floor(t * 9));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 + 0.02 * t})`, transformOrigin: "50% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}b`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(60,20,90,0.45), rgba(60,20,90,0.05) 50%, rgba(255,200,110,0.12))" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <Certificates x={w * 0.78} ground={ground} n={grow} t={t} />
        {/* a tiny wallet of cash at the foot of the tower */}
        <g transform={`translate(${w * 0.56},${ground - 70})`}>
          <rect x={-60} y={0} width={120} height={70} rx={14} fill="#5c3b1e" stroke="#2b1a0b" strokeWidth={4} />
          <rect x={-46} y={-14} width={92} height={24} rx={4} fill="#8fd18f" stroke="#2f6b2f" strokeWidth={3} />
        </g>
        <Actor p={p} spec={{ who: "rohan", x: 0.3, scale: 2.0, turn: 0.35, acting: [
          { sec: 0, pose: "shrug", expression: "confused" }, { at: "pay", pose: "point", expression: "laugh" }, { at: "bill", pose: "facepalm", expression: "shock" } ] }} ground={ground} index={0} />
      </svg>
      {/* the giant tax bill hanging over the skyline */}
      <div style={{ position: "absolute", left: w * 0.47, top: h * 0.2, width: 500, transform: `translateY(${(1 - kBill) * -700}px) rotate(${swing}deg)`, transformOrigin: "50% -80px",
        background: "#fffdf5", borderRadius: 18, border: "7px solid #2b2f3a", textAlign: "center", padding: "18px 14px 26px", fontFamily: FONT, boxShadow: "0 22px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ fontWeight: 800, fontSize: 52, color: "#495057", letterSpacing: 2 }}>{(P.billLabel ?? "").toUpperCase()}</div>
        <div style={{ height: 6, background: "#dee2e6", margin: "10px 30px" }} />
        <div style={{ fontWeight: 900, fontSize: 112, color: "#c92a2a", lineHeight: 1.1 }}>{P.bill ?? ""}</div>
        <div style={{ height: 6, background: "#dee2e6", margin: "10px 30px 0" }} />
      </div>
      <div style={{ position: "absolute", left: w * 0.47 + 250, top: h * 0.4, transform: `translate(-50%,0) scale(${2.3 - 1.3 * kStamp}) rotate(-10deg)`, opacity: clamp(kStamp * 3) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, color: "#fff", background: "#c92a2a", padding: "0 40px", borderRadius: 20, border: "8px solid #fff" }}>DUE</div>
      </div>
      {/* the question, painted over the night sky */}
      <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.07, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 88,
        color: "#ffd43b", textShadow: "0 6px 0 rgba(0,0,0,0.55)", lineHeight: 1.1 }}>{P.question ?? ""}</div>
      {t > tBill && <AbsoluteFill style={{ background: `rgba(255,80,80,${0.2 * Math.exp(-(t - tBill) * 5)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
