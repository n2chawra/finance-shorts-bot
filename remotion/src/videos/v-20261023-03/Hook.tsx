/**
 * Custom hook for the Black Friday minimum-due trap: Rohan's rented flat buried in shopping bags
 * under a flickering neon BLACK FRIDAY sign, a credit card spinning above the pile. On "haul" the
 * price tag drops onto the bags; on "minimum" a receipt starts to unroll from the card; on "costs"
 * it lands with the real total stamped in red and the room jolts. Built only from the studio kit.
 *
 * params: { sign, cartLabel, cart, realLabel, real }, events: haul, minimum, costs
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const BAG_COLORS = ["#e03131", "#f08c00", "#7048e8", "#1c7ed6", "#d6336c", "#2f9e44"];

const Bag: React.FC<{ x: number; y: number; s: number; color: string; rot: number }> = ({ x, y, s, color, rot }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -45 -60 Q 0 -120 45 -60" fill="none" stroke="#212529" strokeWidth={9} />
    <rect x={-70} y={-60} width={140} height={130} rx={10} fill={color} stroke="#fff" strokeWidth={6} />
    <rect x={-70} y={-60} width={140} height={22} fill="rgba(0,0,0,0.18)" />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { sign?: string; cartLabel?: string; cart?: string; realLabel?: string; real?: string };
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tHaul = at(p, "haul", 0.6), tMin = at(p, "minimum", 2.2), tCost = at(p, "costs", 3.2);
  const kTag = sp(-0.4, 12), kRoll = clamp((t - tMin) / Math.max(0.3, tCost - tMin)), kStamp = sp(tCost, 8);
  const Flat = SETS.flat!;
  const ground = h * 0.9;
  const neon = 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 3.1);
  const shake = t > tCost ? Math.sin((t - tCost) * 42) * 12 * Math.exp(-(t - tCost) * 5) : 0;
  const bagIn = (i: number) => clamp((t + 0.6 - i * 0.12) / 0.35) + (t > tHaul ? 0.08 * Math.exp(-(t - tHaul) * 4) * Math.sin((t - tHaul) * 20) : 0);
  const bags = [[0.1, 0.0, -8], [0.24, 0.0, 6], [0.38, 0.0, -4], [0.17, -0.09, 10], [0.31, -0.09, -9], [0.24, -0.18, 4]] as const;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${shake}px) scale(${1.2 + 0.03 * t})`, transformOrigin: "50% 60%" }}>
        <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 12%, rgba(255,60,160,0.28), rgba(5,5,25,0.5) 65%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {bags.map(([bx, dy, rot], i) => (
          <Bag key={i} x={w * bx} y={ground - 70 + h * dy} s={1.25 * bagIn(i)} color={BAG_COLORS[i]!} rot={rot} />
        ))}
        <Actor p={p} spec={{ who: "rohan", x: 0.73, scale: 2.0, turn: -0.3, acting: [
          { sec: 0, pose: "celebrate", expression: "laugh" }, { at: "minimum", pose: "point", expression: "happy" }, { at: "costs", pose: "worried", expression: "worried" } ] }} ground={ground} index={0} />
      </svg>
      {/* the neon sign */}
      <div style={{ position: "absolute", left: w * 0.16, right: w * 0.06, top: h * 0.065, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 100,
        color: "#fff0f6", opacity: neon, textShadow: "0 0 12px #ff2d95, 0 0 34px #ff2d95, 0 0 60px #c2255c", letterSpacing: 4 }}>{(P.sign ?? "").toUpperCase()}</div>
      {/* the haul's price tag */}
      <div style={{ position: "absolute", left: w * 0.05, top: h * 0.2, width: 470, transform: `translateY(${(1 - kTag) * -500}px) rotate(-5deg)`,
        background: "#fff", borderRadius: 22, border: "7px solid #212529", textAlign: "center", padding: "8px 8px 12px", fontFamily: FONT, boxShadow: "0 16px 30px rgba(0,0,0,0.45)" }}>
        <div style={{ fontWeight: 800, fontSize: 52, color: "#495057" }}>{P.cartLabel ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 96, color: "#2b8a3e" }}>{P.cart ?? ""}</div>
      </div>
      {/* the receipt unrolling */}
      {t > tMin && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.17, width: 480, overflow: "hidden", height: 60 + 250 * kRoll, transform: "rotate(4deg)",
          background: "repeating-linear-gradient(180deg,#fff 0 46px,#f1f3f5 46px 48px)", borderRadius: 10, border: "6px solid #343a40", textAlign: "center",
          fontFamily: FONT, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 800, fontSize: 50, color: "#495057", paddingTop: 8 }}>{P.realLabel ?? ""}</div>
          <div style={{ fontWeight: 900, fontSize: 104, color: "#e03131", transform: `scale(${1.8 - 0.8 * kStamp}) rotate(-6deg)`, opacity: clamp(kStamp * 3) }}>{P.real ?? ""}</div>
        </div>
      )}
      {t > tCost && <AbsoluteFill style={{ background: `rgba(255,40,40,${0.25 * Math.exp(-(t - tCost) * 4)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
