/**
 * The payoff: "So the dealer can earn twice: once on the car, and again on your loan. That
 * extra interest comes out of the buyer's pocket, a little every month."
 * The dealer stands in the middle with his commission envelope. On "car" coins stream from the
 * hatchback on the left into the envelope; on "loan" a second stream starts from the loan paper on
 * the right while the view pushes in; a TWICE stamp slams on "twice"; on "comes" the extra-interest card lands over the dealer; on "pocket" and "month" bill
 * stubs drift up from the bottom into the loan paper, one by one.
 *
 * params: { total, label, carLabel, loanLabel }, events: twice, car, again, loan, comes, pocket, little, month
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Dealer = props.dealer!, Car = props.hatchback!, Paper = props.loanpaper!, Env = props.commission!, Stub = props.billstub!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { total?: string; label?: string; carLabel?: string; loanLabel?: string; stamp?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tTwice = at(p, "twice", 0.8), tCar = at(p, "car", 1.6), tLoan = at(p, "loan", 3.0), tComes = at(p, "comes", 4.4), tPocket = at(p, "pocket", 5.6);
  const kTwice = sp(tTwice, 9), kTotal = sp(tComes, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const g = h * 0.66;
  const car: [number, number] = [w * 0.3, h * 0.46], loan: [number, number] = [w * 0.78, h * 0.46], env: [number, number] = [w * 0.5, g - h * 0.02];
  const stream = (from: [number, number], start: number, key: string) => t < start ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - start) * 0.8 + i / 5) % 1;
    const x = from[0] + (env[0] - from[0]) * f, y = from[1] - h * 0.04 + (env[1] - h * 0.06 - from[1] + h * 0.04) * f - Math.sin(f * Math.PI) * h * 0.06;
    return <circle key={`${key}${i}`} cx={x} cy={y} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  const stubs = t < tPocket ? [] : Array.from({ length: 3 }, (_, i) => {
    const f = ((t - tPocket) * 0.6 + i / 3) % 1;
    return <g key={i} transform={`translate(${loan[0] + (i - 1) * w * 0.04},${h * 0.62 - f * h * 0.16})`} opacity={clamp((1 - f) * 3) * clamp(f * 5)}><Stub s={h * 0.06} t={t + i} /></g>;
  });
  const lab = (text: string) => Math.max(min, fitLine(text.toUpperCase(), 50, w * 0.3, { upper: true }));
  const total = P.total ?? "", label = (P.label ?? "").toUpperCase();
  const big = Math.max(min, fitLine(total, 104, box.x1 - box.x0 - 160));
  const small = Math.max(min, fitLine(label, 46, box.x1 - box.x0 - 160, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.0 + 0.005 * t + 0.04 * clamp((t - tLoan) / 1.2)}) translate(0px,${-kTotal * h * 0.01}px)`, transformOrigin: "50% 55%" }}>
      <World kind="city" tint="#2fb37a" w={w} h={h} t={t} seed="payoff-office" props={props} horizon={[{ prop: "lender", x: 0.9, size: 0.06 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${car[0]},${car[1]}) scale(${1 + 0.08 * clamp((t - tCar) * 3) * Math.abs(Math.sin(t * 4))})`}><Car s={h * 0.12} t={t} /></g>
        <g transform={`translate(${loan[0]},${loan[1]}) scale(${1 + 0.08 * clamp((t - tLoan) * 3) * Math.abs(Math.sin(t * 4))})`}><Paper s={h * 0.2} t={t} state="approved" /></g>
        {P.carLabel && <text x={car[0]} y={car[1] - h * 0.13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.carLabel)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.carLabel.toUpperCase()}</text>}
        {P.loanLabel && <text x={loan[0]} y={loan[1] - h * 0.23} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.loanLabel)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.loanLabel.toUpperCase()}</text>}
        {stream(car, tCar, "c")}
        {stream(loan, tLoan, "l")}
        <g transform={`translate(${w * 0.5},${g})`}><Dealer s={h * 0.34} t={t} /></g>
        <g transform={`translate(${env[0] + w * 0.17},${env[1]}) scale(${1 + 0.1 * kTwice * Math.abs(Math.sin(t * 5)) + 0.25 * clamp((t - tPocket) / 1.5)})`}><Env s={h * 0.17} t={t} /></g>
        {stubs}
      </svg>
      </AbsoluteFill>
      {P.stamp && kTwice > 0 && kTotal < 0.5 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.15, textAlign: "center", transform: `scale(${2 - kTwice}) rotate(-6deg)`, opacity: clamp(kTwice * 2) * (1 - kTotal * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.stamp.toUpperCase(), 120, box.x1 - box.x0 - 120, { upper: true })), color: "#e5484d", border: "12px solid #e5484d", borderRadius: 24, padding: "0 30px", background: "rgba(255,246,214,0.94)", lineHeight: 1.15 }}>{P.stamp.toUpperCase()}</span>
        </div>
      )}
      {total && kTotal > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.14, transform: `translate(-50%,0) scale(${kTotal})`, textAlign: "center",
          background: "#fff", border: "6px solid #e5484d", borderRadius: 22, padding: "8px 30px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)", maxWidth: box.x1 - box.x0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: small, color: "#3f4656", whiteSpace: "nowrap" }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: big, color: "#e5484d", lineHeight: 1.05, whiteSpace: "nowrap" }}>{total}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
