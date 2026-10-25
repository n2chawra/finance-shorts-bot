/**
 * Custom hook for "the Diwali car on EMI": a festive market at night, diyas flickering along the
 * front, a shiny new car with a big "Diwali offer" price tag and Rohan celebrating beside it. On
 * "car" the tag swings in; on "cost" a long receipt drops from the top with what the car really
 * costs once every EMI is paid, the screen flashes red and the tag gets crossed out.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { price, priceLabel, total, totalLabel }, events: car, cost
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Car: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x},${y + Math.sin(t * 3) * 2}) scale(${s})`}>
    <ellipse cx={0} cy={118} rx={300} ry={22} fill="#000" opacity={0.35} />
    <path d="M -290 60 Q -290 10 -240 0 L -150 -10 L -90 -90 Q -70 -110 -30 -110 L 110 -110 Q 150 -110 175 -80 L 230 -10 L 270 0 Q 300 10 300 60 L 300 90 L -290 90 Z" fill="#d6336c" stroke="#5c0f2e" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -70 -15 L -35 -88 Q -25 -98 -5 -98 L 50 -98 L 50 -15 Z" fill="#a5d8ff" stroke="#5c0f2e" strokeWidth={6} />
    <path d="M 66 -15 L 66 -98 L 110 -98 Q 135 -98 150 -78 L 195 -15 Z" fill="#a5d8ff" stroke="#5c0f2e" strokeWidth={6} />
    <path d="M -230 10 L 260 10" stroke="#ff8fb8" strokeWidth={8} opacity={0.6} />
    <rect x={255} y={20} width={36} height={22} rx={6} fill="#ffe066" />
    <rect x={-288} y={22} width={26} height={20} rx={5} fill="#ff6b6b" />
    {[-170, 180].map((wx) => (
      <g key={wx} transform={`translate(${wx},92)`}>
        <circle r={56} fill="#212529" />
        <circle r={28} fill="#adb5bd" />
        <circle r={10} fill="#495057" />
      </g>
    ))}
    {/* a gift bow on the roof: it's a Diwali car */}
    <path d="M 20 -110 Q -30 -170 0 -165 Q 20 -150 20 -110 Q 70 -170 40 -165 Q 20 -150 20 -110" fill="#ffd43b" stroke="#7a5a00" strokeWidth={6} />
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { price?: string; priceLabel?: string; total?: string; totalLabel?: string };
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const tCar = at(p, "car", 0.6), tCost = at(p, "cost", 1.6);
  const kTag = Math.max(0.6, sp(Math.min(0, tCar - 0.6), 9)), kBill = sp(tCost, 12), kCross = clamp((t - tCost - 0.35) / 0.3);
  const Market = SETS.market!;
  const ground = h * 0.9;
  const shake = t > tCost ? Math.sin((t - tCost) * 60) * 14 * Math.exp(-(t - tCost) * 6) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.2 + 0.03 * t}) translateX(${shake}px)`, transformOrigin: "50% 65%" }}>
        <Market.back w={w} h={h} t={t} seed={`${p.beat.id}m`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 75%, rgba(255,190,80,0.25), rgba(0,0,0,0) 60%)" }} />
      <svg width={w} height={h} style={{ position: "absolute", transform: `translateX(${shake}px)` }}>
        <Car x={w * 0.62} y={ground - 120} s={1.25} t={t} />
        <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 1.9, turn: 0.3, acting: [
          { sec: 0, pose: "celebrate", expression: "laugh" }, { at: "cost", pose: "worried", expression: "shock" } ] }} ground={ground} index={0} />
        {/* diyas along the front edge, flickering */}
        {Array.from({ length: 7 }, (_, i) => {
          const dx = w * (0.07 + i * 0.145), fl = 1 + 0.18 * Math.sin(t * 11 + i * 1.7);
          return (
            <g key={i} transform={`translate(${dx},${h * 0.965})`}>
              <ellipse cx={0} cy={-34} rx={30 * fl} ry={46 * fl} fill="#ffd43b" opacity={0.25} />
              <path d="M -9 -20 Q 0 -60 9 -20 Q 0 -12 -9 -20" fill="#ffa94d" transform={`scale(1,${fl})`} />
              <path d="M -30 -16 Q 0 18 30 -16 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      {/* the price tag hanging over the car */}
      <div style={{ position: "absolute", left: w * 0.62 - 230, top: h * 0.42, width: 460, transform: `translateY(${(1 - kTag) * -200}px) rotate(${Math.sin(t * 2.2) * 3}deg)`, transformOrigin: "50% -40px",
        background: "#fff", borderRadius: 24, border: "7px solid #1f9d61", textAlign: "center", padding: "8px 10px 12px", fontFamily: FONT, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ fontWeight: 700, fontSize: 46, color: "#495057" }}>{P.priceLabel ?? ""}</div>
        <div style={{ position: "relative", display: "inline-block", fontWeight: 900, fontSize: 84, color: "#1f9d61", whiteSpace: "nowrap" }}>
          {P.price ?? ""}
          <div style={{ position: "absolute", left: -10, top: "50%", height: 12, width: `${kCross * 105}%`, background: "#e03131", borderRadius: 6, transform: "rotate(-8deg)" }} />
        </div>
      </div>
      {/* the receipt dropping in with the real cost */}
      <div style={{ position: "absolute", left: w * 0.1, right: w * 0.1, top: h * 0.07, transform: `translateY(${(1 - kBill) * -h * 0.4}px) rotate(-2deg)`, opacity: clamp(kBill * 4),
        background: "#fffdf5", borderRadius: 14, padding: "18px 24px 26px", textAlign: "center", fontFamily: FONT, boxShadow: "0 24px 50px rgba(0,0,0,0.55)", border: "5px solid #e03131" }}>
        <div style={{ fontWeight: 700, fontSize: 54, color: "#495057" }}>{P.totalLabel ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 150, color: "#e03131", lineHeight: 1.05 }}>{P.total ?? ""}</div>
      </div>
      {t > tCost && <AbsoluteFill style={{ background: `rgba(224,49,49,${0.28 * Math.exp(-(t - tCost) * 5)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
