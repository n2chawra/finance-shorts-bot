/**
 * Hook: "Rohan just paid {seat_amount} for this flight. The airline's profit on his seat? About
 * {seat_per_period}. The real money went somewhere else: through his card, and into a bank."
 * Dusk at the airport: a big jet across the frame, Rohan holding his airline card. The ticket tag
 * lands on "paid"; on "profit" the jet dims and a tiny profit tag drops under it; on "real" a gold
 * stream of miles coins pours out of his card, past the plane, and on "bank" a glowing bank hall
 * rises at the far end where the stream lands. FOLLOW THE CARD stamps last.
 *
 * params: { ticket: "{seat_amount}", profit: "{seat_per_period}", stamp: "Follow the card" }
 * events: paid, profit, real, card, bank
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Jet = props.jet!, Coin = props.milescoin!, Bank = props.bankhall!, Card = props.wingcard!;

const Tag: React.FC<{ x: number; y: number; label: string; value: string; color: string; k: number; size?: number }> = ({ x, y, label, value, color, k, size = 70 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), textAlign: "center",
    background: "#fff", border: `6px solid ${color}`, borderRadius: 22, padding: "6px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#3f4656", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { ticket?: string; profit?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPaid = at(p, "paid", 0.6), tProfit = at(p, "profit", 2.2), tReal = at(p, "real", 4.4), tCard = at(p, "card", 6.0), tBank = at(p, "bank", 7.0);
  const kPaid = sp(tPaid), kProfit = sp(tProfit, 9), kReal = clamp((t - tReal) / 0.8), kCard = sp(tCard), kBank = sp(tBank, 10), kStamp = sp(tBank + 0.5, 9);
  const ground = h * 0.86;
  const dim = 1 - 0.45 * clamp((t - tProfit) / 0.6);
  // the jet taxis slowly to the right the whole time
  const jetX = w * (0.46 + 0.02 * t);
  // miles coins pour from the card (left) along an arc to the bank (right)
  const coins = kReal > 0 ? Array.from({ length: 9 }, (_, i) => {
    const d = ((t - tReal) * 0.55 + i / 9) % 1;
    if (t - tReal < i * 0.08) return null;
    const x = w * (0.2 + 0.66 * d), y = h * (0.62 - Math.sin(d * Math.PI) * 0.36);
    return <g key={i} transform={`translate(${x},${y}) rotate(${d * 360})`}><Coin s={h * 0.07} t={t + i} /></g>;
  }) : null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${1.03 + 0.01 * t})` }}>
      <World kind="city" tint={kBank > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="hook-airport" props={props} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g opacity={dim} transform={`translate(${jetX},${h * 0.6})`}><Jet s={h * 0.36} t={t} /></g>
        {kBank > 0 && <g transform={`translate(${w * 0.88},${ground}) scale(${kBank})`}><Bank s={h * 0.36} t={t} k={kBank} /></g>}
        {coins}
        <g transform={`translate(${w * 0.24},${h * 0.66}) scale(${1 + 0.25 * kCard})`}><Card s={h * 0.13} t={t} state={kCard > 0.3 ? "glow" : undefined} /></g>
        <Actor p={p} spec={{ who: "rohan", x: 0.12, scale: 1.15, acting: [{ sec: 0, pose: "present", expression: "happy", prop: "card" }, { at: "profit", pose: "worried", expression: "shock" }, { at: "card", pose: "point", expression: "thinking", turn: 0.4 }, { at: "bank", pose: "facepalm", expression: "shock" }] }} ground={h * 0.99} index={0} />
      </svg>
      {P.ticket && <Tag x={w * 0.5} y={h * 0.06} label="His ticket" value={P.ticket} color="#24315e" k={kPaid} />}
      {P.profit && <Tag x={jetX} y={h * 0.44} label="Airline's profit" value={P.profit} color="#c92a2a" k={kProfit * 0.9} size={64} />}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.62, top: h * 0.3, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-4deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 76, color: "#fff", background: "#b8860b", padding: "6px 34px", whiteSpace: "nowrap",
            borderRadius: 22, border: "7px solid #fff", textTransform: "uppercase", boxShadow: "0 12px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
