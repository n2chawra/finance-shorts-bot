/**
 * The payoff: "So the rich pick a small interest bill over a big tax bill. Cash borrowed, never
 * sold." A balance: the tax man's sack (the tax bill) and one small coin (a year's interest). On
 * "small" the coin drops in, on "big" the sack slams down, then a stamp lands on "borrowed".
 *
 * params: { tax: "{tax_tax}", interest: "{loan_per_year_total}", stamp: "Borrowed, never sold" }, events: small, big, borrowed
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Taxman = props.taxman!;

const Tag: React.FC<{ x: number; y: number; label: string; value: string; color: string; k: number }> = ({ x, y, label, value, color, k }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), textAlign: "center",
    background: "#fff", border: `6px solid ${color}`, borderRadius: 22, padding: "8px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#3f4656", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { tax?: string; interest?: string; stamp?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tSmall = at(p, "small", 0.5), tBig = at(p, "big", 1.5), tStamp = at(p, "borrowed", 2.8);
  const kCoin = sp(tSmall), kSack = sp(tBig, 8), kStamp = sp(tStamp, 9);
  // the beam tips toward the heavy sack once it lands
  const tilt = -14 * kSack + 4 * kCoin * (1 - kSack);
  const cx = w * 0.5, cy = h * 0.5, arm = w * 0.27;
  const rad = (tilt * Math.PI) / 180;
  const L: [number, number] = [cx - Math.cos(rad) * arm, cy - Math.sin(rad) * arm], R: [number, number] = [cx + Math.cos(rad) * arm, cy + Math.sin(rad) * arm];
  const pan = (x: number, y: number, node: React.ReactNode, key: string) => (
    <g key={key}>
      <line x1={x} y1={y} x2={x - 90} y2={y + 170} stroke={INK} strokeWidth={6} />
      <line x1={x} y1={y} x2={x + 90} y2={y + 170} stroke={INK} strokeWidth={6} />
      <path d={`M${x - 130},${y + 170} Q${x},${y + 250} ${x + 130},${y + 170} Z`} fill="#c9ced8" stroke={INK} strokeWidth={6} />
      <g transform={`translate(${x},${y + 175})`}>{node}</g>
    </g>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <World kind="bank" w={w} h={h} t={t} seed="payoff-bank" props={props} horizon={[{ prop: "yacht", x: 0.18, size: 0.1 }, { prop: "mansion", x: 0.84, size: 0.11 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <rect x={cx - 14} y={cy} width={28} height={h * 0.3} fill="#8a5a2b" stroke={INK} strokeWidth={6} />
        <path d={`M${cx - 120},${cy + h * 0.3} h240 l-30,-40 h-180 z`} fill="#8a5a2b" stroke={INK} strokeWidth={6} />
        <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={22} fill="#ffd34d" stroke={INK} strokeWidth={6} />
        {pan(L[0], L[1], kCoin > 0 ? <g transform={`translate(0,${(1 - kCoin) * -500}) scale(${0.6 + 0.4 * kCoin})`}>
          <circle cx={0} cy={-34} r={34} fill="#f2b631" stroke={INK} strokeWidth={6} /></g> : null, "L")}
        {pan(R[0], R[1], kSack > 0 ? <g transform={`translate(0,${(1 - kSack) * -700})`}><Taxman s={h * 0.13} t={t} state="full" /></g> : null, "R")}
        <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 1.2, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "borrowed", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.98} index={0} />
      </svg>
      {P.interest && <Tag x={L[0]} y={L[1] - h * 0.2} label="Interest" value={P.interest} color="#1f8f55" k={kCoin} />}
      {P.tax && <Tag x={R[0]} y={R[1] - h * 0.2} label="Tax" value={P.tax} color="#c92a2a" k={kSack} />}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.6, textAlign: "center", padding: "0 60px" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: "#fff", background: "#1f8f55", padding: "8px 30px", whiteSpace: "nowrap",
            borderRadius: 24, border: "8px solid #fff", transform: `scale(${2.2 - 1.2 * kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 3), textTransform: "uppercase",
            boxShadow: "0 14px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
