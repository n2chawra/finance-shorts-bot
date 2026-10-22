/**
 * Custom hook for the Dhanteras making charge: a jeweller's counter in a night market, a gold
 * necklace glowing on a velvet bust, a festive banner swinging overhead. On "gold" the necklace's
 * price tag flips in; on "bill" a long receipt shoots out with the bigger figure stamped in red
 * while Rohan recoils. Built only from the studio kit (motion-direction skill).
 *
 * params: { goldLabel, gold, billLabel, bill, sign }, events: gold, bill
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Necklace: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {/* velvet bust */}
    <path d="M -150 170 Q -150 -10 -60 -60 L -40 -150 Q 0 -175 40 -150 L 60 -60 Q 150 -10 150 170 Z" fill="#7b1e3a" stroke="#4a0f22" strokeWidth={6} />
    {/* the chain and the beads */}
    <path d="M -70 -60 Q 0 90 70 -60" fill="none" stroke="#f2c14e" strokeWidth={10} />
    {Array.from({ length: 9 }, (_, i) => {
      const f = (i + 1) / 10, bx = -70 + 140 * f, by = -60 + 600 * f * (1 - f) * 0.5;
      return <circle key={i} cx={bx} cy={by} r={13} fill="#ffd43b" stroke="#b8860b" strokeWidth={3} />;
    })}
    <path d="M 0 60 L 30 100 L 0 150 L -30 100 Z" fill="#ffd43b" stroke="#b8860b" strokeWidth={5} />
    {/* sparkles */}
    {[0, 1, 2, 3].map((i) => {
      const f = ((t * 0.9 + i * 0.27) % 1), a = Math.sin(f * Math.PI);
      const sx = [-90, 80, -30, 50][i]!, sy = [-30, 10, 120, -100][i]!;
      return <path key={i} d={`M ${sx} ${sy - 30 * a} L ${sx + 8 * a} ${sy} L ${sx} ${sy + 30 * a} L ${sx - 8 * a} ${sy} Z`} fill="#fff" opacity={a} />;
    })}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { goldLabel?: string; gold?: string; billLabel?: string; bill?: string; sign?: string };
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tGold = at(p, "gold", 0.3), tBill = at(p, "bill", 1.8);
  const kTag = sp(-0.4, 12), kBill = sp(tBill, 11), kStamp = sp(tBill + 0.35, 8);
  const Market = SETS.market!;
  const ground = h * 0.92;
  const glow = 0.6 + 0.4 * Math.sin(t * 4);
  const swing = Math.sin(t * 1.7) * 3;
  const shake = t > tBill ? Math.sin((t - tBill) * 40) * 10 * Math.exp(-(t - tBill) * 5) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${shake}px) scale(${1.2 + 0.03 * t})`, transformOrigin: "50% 60%" }}>
        <Market.back w={w} h={h} t={t} seed={`${p.beat.id}m`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 28% 38%, rgba(255,200,80,0.35), rgba(10,5,30,0.45) 60%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the counter */}
        <rect x={-20} y={h * 0.58} width={w * 0.62} height={h * 0.5} rx={18} fill="#5c3d1e" stroke="#2e1c0b" strokeWidth={8} />
        <rect x={-20} y={h * 0.58} width={w * 0.62} height={24} fill="#d4a24c" />
        <g style={{ filter: `drop-shadow(0 0 ${30 * glow}px rgba(255,210,90,0.9))` }}>
          <Necklace x={w * 0.27} y={h * 0.47} s={1.25} t={t} />
        </g>
        <Actor p={p} spec={{ who: "rohan", x: 0.74, scale: 2.0, turn: -0.3, acting: [
          { sec: 0, pose: "point", expression: "happy" }, { at: "bill", pose: "shrug", expression: "shock" } ] }} ground={ground} index={0} />
      </svg>
      {/* the festive banner */}
      <div style={{ position: "absolute", left: w * 0.16, right: w * 0.06, top: h * 0.07, transform: `rotate(${swing}deg)`, transformOrigin: "50% -100px", textAlign: "center",
        background: "linear-gradient(90deg,#e8590c,#f59f00,#e8590c)", border: "6px solid #fff3bf", borderRadius: 20, padding: "8px 0 12px",
        fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", textShadow: "0 4px 0 rgba(120,40,0,0.5)" }}>{P.sign ?? ""}</div>
      {/* the gold's price tag */}
      <div style={{ position: "absolute", left: w * 0.06, top: h * 0.2, width: 500, transform: `rotateY(${(1 - kTag) * 90}deg) rotate(-4deg)`,
        background: "#fff9db", borderRadius: 22, border: "7px solid #b8860b", textAlign: "center", padding: "8px 8px 12px", fontFamily: FONT, boxShadow: "0 16px 30px rgba(0,0,0,0.4)" }}>
        <div style={{ fontWeight: 800, fontSize: 52, color: "#8a6d00" }}>{P.goldLabel ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 84, color: "#2b2f3a" }}>{P.gold ?? ""}</div>
      </div>
      {/* the bill shooting out */}
      <div style={{ position: "absolute", left: w * 0.52, top: h * 0.2, width: 470, transform: `translateY(${(1 - kBill) * -h * 0.5}px) rotate(5deg)`, opacity: clamp(kBill * 4),
        background: "#fff", borderRadius: 14, border: "6px solid #343a40", textAlign: "center", padding: "10px 8px 16px", fontFamily: FONT, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ fontWeight: 800, fontSize: 52, color: "#495057" }}>{P.billLabel ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 100, color: "#e03131", transform: `scale(${1.8 - 0.8 * kStamp})`, opacity: clamp(kStamp * 3) }}>{P.bill ?? ""}</div>
      </div>
      {t > tGold && t < tGold + 0.6 && <AbsoluteFill style={{ background: `rgba(255,220,120,${0.25 * (1 - (t - tGold) / 0.6)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
